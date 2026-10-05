"""Hand-landmark extraction via the modern MediaPipe Tasks HandLandmarker (VIDEO mode)."""

from __future__ import annotations

import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Iterator

import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

sys.path.append(str(Path(__file__).resolve().parent.parent))
import config  # noqa: E402


@dataclass(frozen=True)
class DetectedHand:
    """One detected hand: handedness ("Left"/"Right") and (21, 3) landmarks."""

    handedness: str
    landmarks: np.ndarray


@dataclass(frozen=True)
class FrameDetections:
    """All hands detected in one sampled frame, with its timestamp."""

    timestamp_sec: float
    hands: list[DetectedHand]

    @property
    def has_hand(self) -> bool:
        return len(self.hands) > 0


class HandLandmarkExtractor:
    """Wraps a MediaPipe HandLandmarker. Use as a context manager."""

    def __init__(
        self,
        model_asset_path: Path | str = config.HAND_LANDMARKER_TASK,
        max_num_hands: int = config.MAX_NUM_HANDS,
        running_mode: str = "VIDEO",
    ) -> None:
        self.model_asset_path = Path(model_asset_path)
        if not self.model_asset_path.exists():
            raise FileNotFoundError(
                f"HandLandmarker model not found at {self.model_asset_path}. "
                "Download it during setup (see ml_new/README.md)."
            )

        mode = {
            "IMAGE": mp_vision.RunningMode.IMAGE,
            "VIDEO": mp_vision.RunningMode.VIDEO,
        }[running_mode]

        options = mp_vision.HandLandmarkerOptions(
            base_options=mp_python.BaseOptions(
                model_asset_path=str(self.model_asset_path)
            ),
            running_mode=mode,
            num_hands=max_num_hands,
            min_hand_detection_confidence=config.MIN_HAND_DETECTION_CONFIDENCE,
            min_hand_presence_confidence=config.MIN_HAND_PRESENCE_CONFIDENCE,
            min_tracking_confidence=config.MIN_TRACKING_CONFIDENCE,
        )
        self._running_mode = running_mode
        self._landmarker = mp_vision.HandLandmarker.create_from_options(
            options)

        # Monotonic ms clock shared across videos (VIDEO mode needs increasing timestamps).
        self._clock_ms: int = 0
        self._last_stream_sec: float | None = None

    def __enter__(self) -> "HandLandmarkExtractor":
        return self

    def __exit__(self, *exc_info) -> None:
        self.close()

    def close(self) -> None:
        self._landmarker.close()

    def detect_frame(
        self, frame_bgr: np.ndarray, timestamp_sec: float | None = None
    ) -> FrameDetections:
        """Detect hands in one streamed frame (webcam / video-call input)."""
        if self._running_mode != "VIDEO":
            raise RuntimeError("detect_frame requires running_mode='VIDEO'.")
        if timestamp_sec is None:
            timestamp_sec = time.monotonic()

        if self._last_stream_sec is not None:
            delta_ms = int(
                round((timestamp_sec - self._last_stream_sec) * 1000.0))
            self._clock_ms += max(1, delta_ms)
        else:
            self._clock_ms += 1
        self._last_stream_sec = timestamp_sec

        return self._detect(frame_bgr, timestamp_sec, self._clock_ms)

    def extract_from_video(
        self, video_path: Path | str, sampling_fps: int = config.SAMPLING_FPS
    ) -> Iterator[FrameDetections]:
        """Yield per-frame detections for a video, downsampled to sampling_fps."""
        if self._running_mode != "VIDEO":
            raise RuntimeError(
                "extract_from_video requires running_mode='VIDEO'.")

        video_path = Path(video_path)
        capture = cv2.VideoCapture(str(video_path))
        if not capture.isOpened():
            raise IOError(f"Could not open video: {video_path}")

        try:
            source_fps = capture.get(cv2.CAP_PROP_FPS) or 30.0
            sample_period_sec = 1.0 / float(sampling_fps)

            frame_index = 0
            next_sample_time = 0.0
            previous_relative_sec: float | None = None
            while True:
                grabbed, frame_bgr = capture.read()
                if not grabbed:
                    break

                relative_sec = frame_index / source_fps
                frame_index += 1

                if relative_sec + 1e-9 < next_sample_time:
                    continue
                next_sample_time += sample_period_sec

                if previous_relative_sec is None:
                    delta_ms = int(round(sample_period_sec * 1000.0))
                else:
                    delta_ms = int(
                        round((relative_sec - previous_relative_sec) * 1000.0))
                previous_relative_sec = relative_sec
                self._clock_ms += max(1, delta_ms)

                yield self._detect(frame_bgr, relative_sec, self._clock_ms)
        finally:
            capture.release()

    def _detect(
        self, frame_bgr: np.ndarray, timestamp_sec: float, detector_timestamp_ms: int
    ) -> FrameDetections:
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)

        result = self._landmarker.detect_for_video(
            mp_image, detector_timestamp_ms)

        hands: list[DetectedHand] = []
        for hand_landmarks, handedness in zip(result.hand_landmarks, result.handedness):
            coords = np.array(
                [[lm.x, lm.y, lm.z] for lm in hand_landmarks], dtype=np.float32
            )
            label = handedness[0].category_name if handedness else "Unknown"
            hands.append(DetectedHand(handedness=label, landmarks=coords))

        return FrameDetections(timestamp_sec=timestamp_sec, hands=hands)


def _demo(video_path: str) -> None:
    total = 0
    with_hand = 0
    both_hands = 0
    with HandLandmarkExtractor() as extractor:
        for frame in extractor.extract_from_video(video_path):
            total += 1
            if frame.has_hand:
                with_hand += 1
            if len(frame.hands) == 2:
                both_hands += 1
            if total <= 3:
                labels = [h.handedness for h in frame.hands]
                shapes = [h.landmarks.shape for h in frame.hands]
                print(
                    f"  frame {total}: t={frame.timestamp_sec:.2f}s hands={labels} shapes={shapes}")

    print(
        f"\nSampled frames: {total} | with >=1 hand: {with_hand} "
        f"({with_hand / max(total, 1):.0%}) | with 2 hands: {both_hands}"
    )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python src/landmark_extractor.py <video_path>")
        raise SystemExit(1)
    _demo(sys.argv[1])
