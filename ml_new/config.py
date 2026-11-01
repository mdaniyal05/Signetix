"""Central configuration for the PSL training pipeline."""

from __future__ import annotations

import os
from pathlib import Path

# Paths
PROJECT_DIR: Path = Path(__file__).resolve().parent
DATASET_DIR: Path = PROJECT_DIR / "dataset"
CACHE_DIR: Path = PROJECT_DIR / "features_cache"
MODELS_DIR: Path = PROJECT_DIR / "models"
HAND_LANDMARKER_TASK: Path = PROJECT_DIR / "hand_landmarker.task"

# Model variant suffix: "" = original model (kept as a backup). A non-empty suffix
# like "_v2" trains and runs a separate model, leaving the original files intact.
# Flip back to "" to restore the previous model everywhere (training + inference).
MODEL_VARIANT: str = os.environ.get("PSL_MODEL_VARIANT", "")

MODEL_FILE: Path = MODELS_DIR / f"psl_model{MODEL_VARIANT}.keras"
LABELS_FILE: Path = MODELS_DIR / f"labels{MODEL_VARIANT}.json"
NORMALIZATION_FILE: Path = MODELS_DIR / f"normalization{MODEL_VARIANT}.json"

# Vocabulary (must match the dataset sub-folder names, which are the clean labels).
WORDS: list[str] = [
    "congratulations",
    "excuse_me",
    "good_bye",
    "good_morning",
    "hello",
    "how_are_you",
    "how_can_i_help_you",
    "yes",
    "thank_you",
    "welcome",
]

SIGNER_ALIASES: dict[str, tuple[str, ...]] = {
    "malaika": ("malaika",),
    "musfira": ("musfira", "musfir"),
    "rhn": ("rhn",),
}

UNKNOWN_SIGNER: str = "unknown"

# Hand landmark / feature geometry (Tasks API has no visibility channel, so x,y,z only).
NUM_HAND_LANDMARKS: int = 21
COORDS_PER_LANDMARK: int = 3
NUM_JOINT_ANGLES: int = 15
MAX_NUM_HANDS: int = 2

# Per-hand = 63 coords + 15 angles = 78; frame = 78*2 + 2 presence flags = 158.
PER_HAND_FEATURE_DIM: int = NUM_HAND_LANDMARKS * \
    COORDS_PER_LANDMARK + NUM_JOINT_ANGLES
FRAME_FEATURE_DIM: int = PER_HAND_FEATURE_DIM * MAX_NUM_HANDS + MAX_NUM_HANDS
HAND_SLOTS: tuple[str, ...] = ("Left", "Right")

# Sequence settings
SEQUENCE_LENGTH: int = 30
SAMPLING_FPS: int = 15

# HandLandmarker detector thresholds
MIN_HAND_DETECTION_CONFIDENCE: float = 0.5
MIN_HAND_PRESENCE_CONFIDENCE: float = 0.5
MIN_TRACKING_CONFIDENCE: float = 0.5

# Clip segmentation (a "rest" frame = no hand; a long-enough rest run splits signs).
REST_MIN_DURATION_SEC: float = 0.5
MIN_SIGN_DURATION_SEC: float = 0.4
MAX_SIGN_DURATION_SEC: float = 5.0
MIN_HANDS_FRACTION: float = 0.3

# Training
RANDOM_SEED: int = 42
VAL_FRACTION: float = 0.15
TEST_FRACTION: float = 0.15
BATCH_SIZE: int = 32
MAX_EPOCHS: int = 150
LEARNING_RATE: float = 1e-3
EARLY_STOPPING_PATIENCE: int = 20
# Inverse-frequency class weighting. Off by default: it over-predicted the minority
# class (how_can_i_help_you) live; disabling it raised held-out 94.7%->98.0% (v3).
USE_CLASS_WEIGHTS: bool = os.environ.get("PSL_USE_CLASS_WEIGHTS", "0") != "0"

# Acceptance criterion for the phase.
MIN_PER_WORD_ACCURACY: float = 0.60

# Real-time inference (segment-on-rest, mirrors training).
INFERENCE_CONFIDENCE_THRESHOLD: float = 0.80
# Rest gap before a sign finalizes: lower = faster caption after you stop signing,
# but too low can split one sign into two on brief hand-tracking dropouts.
INFERENCE_REST_MIN_DURATION_SEC: float = 0.5
# Floor on hand frames per sign; kept low because the effective live FPS over the tunnel can
# fall well below the capture rate (esp. multi-party), and too high a floor drops real signs.
INFERENCE_MIN_SIGN_FRAMES: int = 4
# Inference-only minimum span duration (separate from training's MIN_SIGN_DURATION_SEC).
INFERENCE_MIN_SIGN_DURATION_SEC: float = 0.4
# Log top-3 softmax + span stats per finalized span to the server console, to tune the
# thresholds from real live data. Enable with PSL_INFERENCE_DEBUG=1.
INFERENCE_DEBUG_LOG: bool = os.environ.get("PSL_INFERENCE_DEBUG", "0") != "0"
# Finalize on motion-settle: once the hands have moved and then go still for
# SETTLE_DURATION, the sign is treated as finished and the FULL span is classified at once
# (so multi-movement signs run to completion, not cut short on a prefix). This fires sooner
# than the hand-absence rest gap without requiring the hand to leave the frame. Falls back
# to the rest gap when the hand just disappears. Disable with the flag.
INFERENCE_SETTLE_ENABLE: bool = True
# Per-frame wrist displacement (fraction of frame): above = moving, below = still.
INFERENCE_MOVING_THRESHOLD: float = 0.025
INFERENCE_SETTLE_THRESHOLD: float = 0.012
# How long the hands must stay still (after having moved) before finalizing. Higher = more
# delay before the caption; 1.1 felt unresponsive live, so kept at 0.8.
INFERENCE_SETTLE_DURATION_SEC: float = 0.8
# Collapse a repeat of the same word finalized within this window, so a compound sign that
# still splits into back-to-back finalizes is captioned once instead of spamming the word.
INFERENCE_DUP_SUPPRESS_SEC: float = 1.5
