"""Central configuration for the PSL training pipeline."""

from __future__ import annotations

import os
from pathlib import Path

# Paths
PROJECT_DIR: Path = Path(__file__).resolve().parent
DATASET_DIR: Path = PROJECT_DIR / "dataset"
CACHE_DIR: Path = PROJECT_DIR / "features_cache"
MODELS_DIR: Path = PROJECT_DIR / "models"
LOGS_DIR: Path = PROJECT_DIR / "logs"
HAND_LANDMARKER_TASK: Path = PROJECT_DIR / "hand_landmarker.task"

# "_v2" = 20-word model (default); "" = v1 10-word rollback.
MODEL_VARIANT: str = os.environ.get("PSL_MODEL_VARIANT", "_v2")

MODEL_FILE: Path = MODELS_DIR / f"psl_model{MODEL_VARIANT}.keras"
LABELS_FILE: Path = MODELS_DIR / f"labels{MODEL_VARIANT}.json"
NORMALIZATION_FILE: Path = MODELS_DIR / f"normalization{MODEL_VARIANT}.json"

# Vocabulary; must match the dataset sub-folder names. First 10 = v1, next 10 added for v2.
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
    "doesnt_matter",
    "dont_touch",
    "have_a_nice_day",
    "have_you_eaten",
    "how_do_you_feel",
    "how_long",
    "i_am_learning_sign_language",
    "lets_go_to_a_restaurant",
    "see_you_later",
    "what",
]

SIGNER_ALIASES: dict[str, tuple[str, ...]] = {
    "malaika": ("malaika",),
    "musfira": ("musfira", "musfir"),
    "rhn": ("rhn",),
}

# Signers dropped at dataset-build time (quality issues).
EXCLUDE_SIGNERS: tuple[str, ...] = ("rhn",)

UNKNOWN_SIGNER: str = "unknown"

# Hand landmark / feature geometry (x,y,z only; Tasks API has no visibility channel).
NUM_HAND_LANDMARKS: int = 21
COORDS_PER_LANDMARK: int = 3
NUM_JOINT_ANGLES: int = 15
MAX_NUM_HANDS: int = 2

# Per-hand 78; full frame 158 (78*2 + 2 presence flags).
PER_HAND_FEATURE_DIM: int = NUM_HAND_LANDMARKS * \
    COORDS_PER_LANDMARK + NUM_JOINT_ANGLES
FRAME_FEATURE_DIM: int = PER_HAND_FEATURE_DIM * MAX_NUM_HANDS + MAX_NUM_HANDS
HAND_SLOTS: tuple[str, ...] = ("Left", "Right")

# Sequence
SEQUENCE_LENGTH: int = 30
SAMPLING_FPS: int = 15

# HandLandmarker detector thresholds
MIN_HAND_DETECTION_CONFIDENCE: float = 0.5
MIN_HAND_PRESENCE_CONFIDENCE: float = 0.5
MIN_TRACKING_CONFIDENCE: float = 0.5

# Clip segmentation (a long-enough no-hand run splits signs)
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
USE_CLASS_WEIGHTS: bool = os.environ.get("PSL_USE_CLASS_WEIGHTS", "0") != "0"

MIN_PER_WORD_ACCURACY: float = 0.60

# Real-time inference knobs.
INFERENCE_CONFIDENCE_THRESHOLD: float = 0.80
INFERENCE_CLASS_THRESHOLDS: dict[str, float] = {"yes": 0.95}
INFERENCE_REST_MIN_DURATION_SEC: float = 0.5
INFERENCE_MIN_SIGN_FRAMES: int = 4
INFERENCE_MIN_SIGN_DURATION_SEC: float = 0.4
INFERENCE_DEBUG_LOG: bool = os.environ.get("PSL_INFERENCE_DEBUG", "1") != "0"
INFERENCE_SETTLE_ENABLE: bool = True
INFERENCE_MOVING_THRESHOLD: float = 0.025
INFERENCE_SETTLE_THRESHOLD: float = 0.012
INFERENCE_SETTLE_DURATION_SEC: float = 1.2
INFERENCE_DUP_SUPPRESS_SEC: float = 1.5
