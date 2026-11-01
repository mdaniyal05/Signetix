"""Split a long multi-repetition clip into individual sign segments on rest gaps."""

from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

import config  # noqa: E402
from src.landmark_extractor import FrameDetections  # noqa: E402


@dataclass(frozen=True)
class Segment:
    """One detected sign repetition as an inclusive index range into the frames."""

    start_index: int
    end_index: int
    start_time: float
    end_time: float
    hands_fraction: float

    @property
    def duration(self) -> float:
        return self.end_time - self.start_time

    @property
    def num_frames(self) -> int:
        return self.end_index - self.start_index + 1


def segment_frames(
    frames: list[FrameDetections],
    rest_min_duration: float = config.REST_MIN_DURATION_SEC,
    min_sign_duration: float = config.MIN_SIGN_DURATION_SEC,
    max_sign_duration: float = config.MAX_SIGN_DURATION_SEC,
    min_hands_fraction: float = config.MIN_HANDS_FRACTION,
) -> list[Segment]:
    """Segment frame detections into individual signs, filtered by duration and hand presence."""
    if not frames:
        return []

    active = [frame.has_hand for frame in frames]
    times = [frame.timestamp_sec for frame in frames]

    raw_spans = _find_active_spans(active, times, rest_min_duration)

    return [
        segment
        for segment in (_build_segment(start, end, frames) for start, end in raw_spans)
        if min_sign_duration <= segment.duration <= max_sign_duration
        and segment.hands_fraction >= min_hands_fraction
    ]


def _find_active_spans(
    active: list[bool], times: list[float], rest_min_duration: float
) -> list[tuple[int, int]]:
    """Inclusive (start, end) ranges of active content; a sign closes on a long rest run."""
    spans: list[tuple[int, int]] = []
    in_sign = False
    sign_start = 0
    last_active_index = 0
    rest_run_start: int | None = None

    for index, is_active in enumerate(active):
        if is_active:
            if not in_sign:
                in_sign = True
                sign_start = index

            last_active_index = index
            rest_run_start = None
        else:
            if not in_sign:
                continue
            if rest_run_start is None:
                rest_run_start = index
            if times[index] - times[rest_run_start] >= rest_min_duration:
                spans.append((sign_start, last_active_index))
                in_sign = False
                rest_run_start = None

    if in_sign:
        spans.append((sign_start, last_active_index))
    return spans


def _build_segment(start: int, end: int, frames: list[FrameDetections]) -> Segment:
    span = frames[start:end + 1]
    hands_fraction = sum(frame.has_hand for frame in span) / max(len(span), 1)

    return Segment(
        start_index=start,
        end_index=end,
        start_time=frames[start].timestamp_sec,
        end_time=frames[end].timestamp_sec,
        hands_fraction=hands_fraction,
    )
