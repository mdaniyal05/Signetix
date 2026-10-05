"""Landmarks -> fixed 158-dim per-frame feature: [left(78) | right(78) | left_present | right_present]."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

sys.path.append(str(Path(__file__).resolve().parent.parent))
import config  # noqa: E402
from src.landmark_extractor import DetectedHand  # noqa: E402

# Parent/child joints of the 20 bone vectors, and the 15 angle pairs between them.
_BONE_PARENT = [0, 1, 2, 3, 0, 5, 6, 7, 0,
                9, 10, 11, 0, 13, 14, 15, 0, 17, 18, 19]
_BONE_CHILD = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
               11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
_ANGLE_FIRST = [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18]
_ANGLE_SECOND = [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19]


def compute_joint_angles(landmarks: np.ndarray) -> np.ndarray:
    """Return the 15 inter-joint angles (degrees) for one hand's (21, 3) landmarks."""
    bone_vectors = landmarks[_BONE_CHILD] - landmarks[_BONE_PARENT]

    norms = np.linalg.norm(bone_vectors, axis=1, keepdims=True)
    norms = np.where(norms == 0.0, 1e-8, norms)
    unit_vectors = bone_vectors / norms

    cosines = np.einsum(
        "nt,nt->n", unit_vectors[_ANGLE_FIRST], unit_vectors[_ANGLE_SECOND]
    )
    cosines = np.clip(cosines, -1.0, 1.0)
    return np.degrees(np.arccos(cosines)).astype(np.float32)


def build_hand_feature(landmarks: np.ndarray) -> np.ndarray:
    """78-dim feature for one hand: 63 flattened coords + 15 angles."""
    coords = landmarks.reshape(-1).astype(np.float32)
    angles = compute_joint_angles(landmarks)
    return np.concatenate([coords, angles])


def build_frame_feature(hands: list[DetectedHand]) -> np.ndarray:
    """Build the 158-dim per-frame feature, placing hands in their handedness slot."""
    feature = np.zeros(config.FRAME_FEATURE_DIM, dtype=np.float32)
    presence_offset = config.PER_HAND_FEATURE_DIM * config.MAX_NUM_HANDS

    slot_filled = [False] * config.MAX_NUM_HANDS
    for hand in hands:
        slot = config.HAND_SLOTS.index(
            hand.handedness) if hand.handedness in config.HAND_SLOTS else 0
        if slot_filled[slot]:
            # Preferred slot taken: use the first free slot so no detection is lost.
            free = [i for i, filled in enumerate(slot_filled) if not filled]
            if not free:
                continue
            slot = free[0]

        start = slot * config.PER_HAND_FEATURE_DIM
        feature[start:start +
                config.PER_HAND_FEATURE_DIM] = build_hand_feature(hand.landmarks)
        feature[presence_offset + slot] = 1.0
        slot_filled[slot] = True

    return feature


def _demo(video_path: str) -> None:
    from src.landmark_extractor import HandLandmarkExtractor

    features = []
    with HandLandmarkExtractor() as extractor:
        for frame in extractor.extract_from_video(video_path):
            features.append(build_frame_feature(frame.hands))

    if not features:
        print("No frames extracted.")
        return

    matrix = np.stack(features)
    left_present = matrix[:, -2]
    right_present = matrix[:, -1]
    print(
        f"Feature matrix shape: {matrix.shape} (expected (N, {config.FRAME_FEATURE_DIM}))")
    print(f"Frames with left hand : {int(left_present.sum())}")
    print(f"Frames with right hand: {int(right_present.sum())}")
    print(
        f"Frames with both hands: {int(((left_present == 1) & (right_present == 1)).sum())}")
    print(f"Value range: min={matrix.min():.3f} max={matrix.max():.3f}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python src/feature_builder.py <video_path>")
        raise SystemExit(1)
    _demo(sys.argv[1])
