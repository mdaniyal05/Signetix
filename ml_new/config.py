"""Central configuration for the PSL training pipeline."""

from __future__ import annotations

from pathlib import Path

# Paths
PROJECT_DIR: Path = Path(__file__).resolve().parent
DATASET_DIR: Path = PROJECT_DIR / "dataset"
CACHE_DIR: Path = PROJECT_DIR / "features_cache"
MODELS_DIR: Path = PROJECT_DIR / "models"
HAND_LANDMARKER_TASK: Path = PROJECT_DIR / "hand_landmarker.task"

MODEL_FILE: Path = MODELS_DIR / "psl_model.keras"
LABELS_FILE: Path = MODELS_DIR / "labels.json"
NORMALIZATION_FILE: Path = MODELS_DIR / "normalization.json"

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
    "musfira": ("musfira",),
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

# Acceptance criterion for the phase.
MIN_PER_WORD_ACCURACY: float = 0.60

# Real-time inference (segment-on-rest, mirrors training).
INFERENCE_CONFIDENCE_THRESHOLD: float = 0.60
INFERENCE_REST_MIN_DURATION_SEC: float = 0.4
INFERENCE_MIN_SIGN_FRAMES: int = 5
