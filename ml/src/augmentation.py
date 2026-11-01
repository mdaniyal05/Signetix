"""On-the-fly augmentation for (T, 158) feature sequences (mirror, scale, translate, warp, noise)."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

sys.path.append(str(Path(__file__).resolve().parent.parent))
import config  # noqa: E402

_PER_HAND = config.PER_HAND_FEATURE_DIM
_COORDS = config.NUM_HAND_LANDMARKS * config.COORDS_PER_LANDMARK

_HAND_BASES = [slot * _PER_HAND for slot in range(config.MAX_NUM_HANDS)]
PRESENCE_INDICES = [
    _PER_HAND * config.MAX_NUM_HANDS + slot for slot in range(config.MAX_NUM_HANDS)
]

# Coordinate indices within the full vector, split by axis.
X_INDICES = np.array(
    [base + i for base in _HAND_BASES for i in range(0, _COORDS, 3)])
Y_INDICES = np.array(
    [base + i for base in _HAND_BASES for i in range(1, _COORDS, 3)])
Z_INDICES = np.array(
    [base + i for base in _HAND_BASES for i in range(2, _COORDS, 3)])
COORD_INDICES = np.sort(np.concatenate([X_INDICES, Y_INDICES, Z_INDICES]))

_LEFT_BLOCK = slice(0, _PER_HAND)
_RIGHT_BLOCK = slice(_PER_HAND, 2 * _PER_HAND)


def _zero_absent_hands(sequence: np.ndarray) -> np.ndarray:
    """Re-zero a hand's block wherever its presence flag is 0."""
    for slot, presence_index in enumerate(PRESENCE_INDICES):
        block = slice(slot * _PER_HAND, (slot + 1) * _PER_HAND)
        absent = sequence[:, presence_index] == 0.0
        sequence[absent, block] = 0.0
    return sequence


def mirror_sequence(sequence: np.ndarray) -> np.ndarray:
    """Horizontal mirror: reflect x coords and swap left/right hand blocks + presence."""
    out = sequence.copy()
    out[:, X_INDICES] = 1.0 - out[:, X_INDICES]

    left = out[:, _LEFT_BLOCK].copy()
    right = out[:, _RIGHT_BLOCK].copy()
    out[:, _LEFT_BLOCK] = right
    out[:, _RIGHT_BLOCK] = left

    left_present = out[:, PRESENCE_INDICES[0]].copy()
    out[:, PRESENCE_INDICES[0]] = out[:, PRESENCE_INDICES[1]]
    out[:, PRESENCE_INDICES[1]] = left_present

    return _zero_absent_hands(out)


def add_coordinate_noise(
    sequence: np.ndarray, rng: np.random.Generator, std: float = 0.01
) -> np.ndarray:
    """Add small Gaussian jitter to coordinate features only."""
    out = sequence.copy()
    noise = rng.normal(0.0, std, size=(sequence.shape[0], COORD_INDICES.size))
    out[:, COORD_INDICES] += noise.astype(np.float32)
    return _zero_absent_hands(out)


def random_scale(
    sequence: np.ndarray, rng: np.random.Generator, low: float = 0.9, high: float = 1.1
) -> np.ndarray:
    """Scale coordinates about their centroid (hand-size variation)."""
    out = sequence.copy()
    factor = float(rng.uniform(low, high))
    for axis_indices in (X_INDICES, Y_INDICES, Z_INDICES):
        values = out[:, axis_indices]
        center = values[values != 0.0].mean() if np.any(values != 0.0) else 0.0
        out[:, axis_indices] = center + (values - center) * factor
    return _zero_absent_hands(out)


def random_translation(
    sequence: np.ndarray, rng: np.random.Generator, max_shift: float = 0.05
) -> np.ndarray:
    """Shift x and y coordinates by a small random offset (position variation)."""
    out = sequence.copy()
    out[:, X_INDICES] += float(rng.uniform(-max_shift, max_shift))
    out[:, Y_INDICES] += float(rng.uniform(-max_shift, max_shift))
    return _zero_absent_hands(out)


def random_time_warp(sequence: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """Resample onto a slightly non-uniform time grid (speed jitter)."""
    length = sequence.shape[0]
    jitter = rng.uniform(0.85, 1.15, size=length)
    warped_positions = np.cumsum(jitter)
    warped_positions = (warped_positions - warped_positions[0]) / (
        warped_positions[-1] - warped_positions[0]
    ) * (length - 1)

    lower = np.floor(warped_positions).astype(int)
    upper = np.clip(lower + 1, 0, length - 1)
    weight = (warped_positions - lower)[:, None]
    return ((1.0 - weight) * sequence[lower] + weight * sequence[upper]).astype(np.float32)


def augment_sequence(sequence: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """Randomly apply a composition of augmentations to one sequence."""
    out = sequence
    if rng.random() < 0.5:
        out = mirror_sequence(out)
    if rng.random() < 0.7:
        out = random_scale(out, rng)
    if rng.random() < 0.7:
        out = random_translation(out, rng)
    if rng.random() < 0.5:
        out = random_time_warp(out, rng)
    if rng.random() < 0.7:
        out = add_coordinate_noise(out, rng)
    return out.astype(np.float32)
