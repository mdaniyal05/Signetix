"""Real-time streaming recognizer: feed frames, get one prediction per rest gap (mirrors training)."""

from __future__ import annotations

import json
import sys
import time
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import tensorflow as tf

sys.path.append(str(Path(__file__).resolve().parent.parent))

import config  # noqa: E402
from src.dataset_builder import resample_sequence  # noqa: E402
from src.feature_builder import build_frame_feature  # noqa: E402
from src.landmark_extractor import HandLandmarkExtractor  # noqa: E402


def _last_true_index(flags: list[bool]) -> int | None:
    for index in range(len(flags) - 1, -1, -1):
        if flags[index]:
            return index

    return None


@dataclass(frozen=True)
class Prediction:
    """A finalized sign prediction."""

    word: str
    confidence: float
    duration: float
    num_frames: int


class StreamingSignRecognizer:
    """Classifies signs from a live frame stream, one sign per rest gap. Transport-agnostic."""

    def __init__(
        self,
        model_path: Path | str = config.MODEL_FILE,
        labels_path: Path | str = config.LABELS_FILE,
        confidence_threshold: float = config.INFERENCE_CONFIDENCE_THRESHOLD,
        model: tf.keras.Model | None = None,
        labels: list[str] | None = None,
    ) -> None:
        # A server can pass a preloaded model/labels so connections share one model.
        self.model = model if model is not None else tf.keras.models.load_model(
            str(model_path))
        self.labels = labels if labels is not None else json.loads(
            Path(labels_path).read_text())
        self.confidence_threshold = confidence_threshold

        self._extractor = HandLandmarkExtractor(running_mode="VIDEO")

        self._features: list[np.ndarray] = []
        self._timestamps: list[float] = []
        self._hand_flags: list[bool] = []
        self._rest_started_at: float | None = None

    def __enter__(self) -> "StreamingSignRecognizer":
        return self

    def __exit__(self, *exc_info) -> None:
        self.close()

    def close(self) -> None:
        self._extractor.close()

    @property
    def is_signing(self) -> bool:
        return len(self._features) > 0

    def process_frame(
        self, frame_bgr: np.ndarray, timestamp_sec: float | None = None
    ) -> Prediction | None:
        """Process one frame; return a Prediction when a sign finalizes, else None."""
        if timestamp_sec is None:
            timestamp_sec = time.monotonic()

        detection = self._extractor.detect_frame(frame_bgr, timestamp_sec)
        feature = build_frame_feature(detection.hands)

        if detection.has_hand:
            self._append(feature, timestamp_sec, has_hand=True)
            self._rest_started_at = None
            # Cut a no-rest (continuous) span at max length.
            if self._span_duration() >= config.MAX_SIGN_DURATION_SEC:
                return self._finalize()
            return None

        if not self.is_signing:
            return None  # idle between signs

        if self._rest_started_at is None:
            self._rest_started_at = timestamp_sec

        self._append(feature, timestamp_sec, has_hand=False)

        if timestamp_sec - self._rest_started_at >= config.INFERENCE_REST_MIN_DURATION_SEC:
            return self._finalize()

        return None

    def _append(self, feature: np.ndarray, timestamp_sec: float, has_hand: bool) -> None:
        self._features.append(feature)
        self._timestamps.append(timestamp_sec)
        self._hand_flags.append(has_hand)

    def _span_duration(self) -> float:
        if len(self._timestamps) < 2:
            return 0.0
        return self._timestamps[-1] - self._timestamps[0]

    def _reset(self) -> None:
        # Rebind to fresh lists; a finalize() may still hold the current span.
        self._features = []
        self._timestamps = []
        self._hand_flags = []
        self._rest_started_at = None

    def _finalize(self) -> Prediction | None:
        features = self._features
        timestamps = self._timestamps
        hand_flags = self._hand_flags
        self._reset()

        # Trim trailing rest frames so the span ends on the last hand frame (like training).
        last_hand = _last_true_index(hand_flags)

        if last_hand is None:
            return None

        features = features[:last_hand + 1]
        hand_flags = hand_flags[:last_hand + 1]

        duration = timestamps[last_hand] - timestamps[0]
        num_frames = sum(hand_flags)
        hands_fraction = num_frames / max(len(hand_flags), 1)

        if (
            num_frames < config.INFERENCE_MIN_SIGN_FRAMES
            or duration < config.MIN_SIGN_DURATION_SEC
            or hands_fraction < config.MIN_HANDS_FRACTION
        ):
            return None

        sequence = resample_sequence(
            np.stack(features), config.SEQUENCE_LENGTH)

        probabilities = self.model.predict(sequence[None, ...], verbose=0)[0]
        best_index = int(np.argmax(probabilities))
        confidence = float(probabilities[best_index])

        if confidence < self.confidence_threshold:
            return None

        return Prediction(
            word=self.labels[best_index],
            confidence=confidence,
            duration=duration,
            num_frames=num_frames,
        )
