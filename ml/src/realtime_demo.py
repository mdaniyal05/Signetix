"""Run the streaming recognizer on a video file (--video), all words (--selftest), or webcam (--webcam)."""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

import cv2

sys.path.append(str(Path(__file__).resolve().parent.parent))

import config  # noqa: E402
from src.realtime_recognizer import Prediction, StreamingSignRecognizer  # noqa: E402


def _run_on_video(recognizer: StreamingSignRecognizer, video_path: Path) -> list[Prediction]:
    """Feed a video to the recognizer at the training sampling rate."""
    capture = cv2.VideoCapture(str(video_path))

    if not capture.isOpened():
        raise IOError(f"Could not open video: {video_path}")

    source_fps = capture.get(cv2.CAP_PROP_FPS) or 30.0
    sample_period = 1.0 / config.SAMPLING_FPS
    predictions: list[Prediction] = []

    frame_index = 0
    next_sample_time = 0.0

    try:
        while True:
            grabbed, frame = capture.read()

            if not grabbed:
                break

            timestamp = frame_index / source_fps
            frame_index += 1

            if timestamp + 1e-9 < next_sample_time:
                continue

            next_sample_time += sample_period

            prediction = recognizer.process_frame(frame, timestamp)

            if prediction is not None:
                predictions.append(prediction)
    finally:
        capture.release()
    return predictions


def _video_mode(video_path: Path) -> None:
    with StreamingSignRecognizer() as recognizer:
        predictions = _run_on_video(recognizer, video_path)

    print(f"\n{video_path.name}: {len(predictions)} sign(s) detected")

    for i, prediction in enumerate(predictions, start=1):
        print(f"  {i}. {prediction.word:<18} conf={prediction.confidence:.2f} "
              f"dur={prediction.duration:.1f}s frames={prediction.num_frames}")


def _selftest_mode() -> None:
    """Stream one clip per word and report streaming recognition accuracy."""
    correct = 0
    total = 0

    with StreamingSignRecognizer() as recognizer:
        for word in config.WORDS:
            clips = sorted((config.DATASET_DIR / word).glob("*.mp4"))

            if not clips:
                continue

            predictions = _run_on_video(recognizer, clips[0])
            words = [p.word for p in predictions]
            hits = sum(w == word for w in words)
            total += len(words)
            correct += hits
            majority = max(set(words), key=words.count) if words else "(none)"
            flag = "OK " if majority == word else "XX "

            print(f"{flag}{word:<18} detected={len(words):>2} correct={hits:>2} "
                  f"majority={majority}")
    if total:
        print(
            f"\nStreaming per-detection accuracy: {correct}/{total} = {correct / total:.1%}")


def _webcam_mode() -> None:
    capture = cv2.VideoCapture(0)

    if not capture.isOpened():
        raise IOError("Could not open webcam (device 0).")

    sample_period = 1.0 / config.SAMPLING_FPS
    last_sample = 0.0
    current_label = ""
    label_shown_at = 0.0

    print("Webcam mode: sign, then rest (drop hands) to commit. Press 'q' to quit.")

    with StreamingSignRecognizer() as recognizer:
        while True:
            grabbed, frame = capture.read()

            if not grabbed:
                break

            now = time.monotonic()

            if now - last_sample >= sample_period:
                last_sample = now
                prediction = recognizer.process_frame(frame, now)
                if prediction is not None:
                    current_label = f"{prediction.word}  ({prediction.confidence:.0%})"
                    label_shown_at = now

            status = "signing..." if recognizer.is_signing else "ready"

            cv2.putText(frame, status, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8,
                        (0, 200, 0), 2)

            if current_label and now - label_shown_at < 3.0:
                cv2.putText(frame, current_label, (20, 90), cv2.FONT_HERSHEY_SIMPLEX,
                            1.2, (0, 0, 255), 3)

            cv2.imshow("PSL real-time recognizer", frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    capture.release()
    cv2.destroyAllWindows()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Streaming sign recognizer demo.")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--video", type=Path, help="run on a single video file")
    group.add_argument("--selftest", action="store_true",
                       help="stream one clip per word")
    group.add_argument("--webcam", action="store_true",
                       help="live webcam with overlay")
    args = parser.parse_args()

    if args.video:
        _video_mode(args.video)
    elif args.selftest:
        _selftest_mode()
    else:
        _webcam_mode()


if __name__ == "__main__":
    main()
