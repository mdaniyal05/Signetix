"""Build and cache the dataset: videos -> segments -> resampled 158-dim sequences."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from tqdm import tqdm

sys.path.append(str(Path(__file__).resolve().parent.parent))
import config  # noqa: E402
from src.feature_builder import build_frame_feature  # noqa: E402
from src.landmark_extractor import HandLandmarkExtractor  # noqa: E402
from src.segmentation import segment_frames  # noqa: E402

CACHE_FILE = config.CACHE_DIR / "dataset.npz"
METADATA_FILE = config.CACHE_DIR / "metadata.json"


def parse_signer(file_name: str) -> str:
    """Identify the signer from a noisy file name using configured aliases."""
    lowered = file_name.lower()
    for canonical, aliases in config.SIGNER_ALIASES.items():
        if any(alias in lowered for alias in aliases):
            return canonical
    return config.UNKNOWN_SIGNER


def resample_sequence(features: np.ndarray, target_length: int) -> np.ndarray:
    """Linearly resample a (n, D) sequence to (target_length, D)."""
    num_frames = len(features)
    if num_frames == target_length:
        return features.astype(np.float32)
    if num_frames == 1:
        return np.repeat(features, target_length, axis=0).astype(np.float32)

    source_positions = np.linspace(0.0, num_frames - 1, target_length)
    lower = np.floor(source_positions).astype(int)
    upper = np.ceil(source_positions).astype(int)
    weight = (source_positions - lower)[:, None]
    return ((1.0 - weight) * features[lower] + weight * features[upper]).astype(np.float32)


def _iter_videos() -> list[tuple[str, Path]]:
    videos: list[tuple[str, Path]] = []
    for word in config.WORDS:
        word_dir = config.DATASET_DIR / word
        if not word_dir.is_dir():
            print(f"WARNING: missing word folder: {word_dir}")
            continue
        videos.extend((word, path) for path in sorted(word_dir.glob("*.mp4")))
    return videos


def build_dataset() -> None:
    """Run the full extraction/segmentation pass and cache the result."""
    videos = _iter_videos()
    if not videos:
        raise RuntimeError(f"No videos found under {config.DATASET_DIR}")

    word_to_index = {word: index for index, word in enumerate(config.WORDS)}

    sequences: list[np.ndarray] = []
    labels: list[int] = []
    group_ids: list[int] = []
    signers: list[str] = []
    clip_names: list[str] = []

    with HandLandmarkExtractor() as extractor:
        for clip_index, (word, video_path) in enumerate(tqdm(videos, desc="Clips")):
            signer = parse_signer(video_path.name)
            clip_names.append(f"{word}/{video_path.name}")

            frames = list(extractor.extract_from_video(video_path))
            segments = segment_frames(frames)

            for segment in segments:
                span = frames[segment.start_index:segment.end_index + 1]
                features = np.stack(
                    [build_frame_feature(frame.hands) for frame in span])
                sequence = resample_sequence(features, config.SEQUENCE_LENGTH)

                sequences.append(sequence)
                labels.append(word_to_index[word])
                # clip id -> grouped split, no leakage
                group_ids.append(clip_index)
                signers.append(signer)

    features_array = np.stack(sequences).astype(np.float32)
    labels_array = np.asarray(labels, dtype=np.int64)
    groups_array = np.asarray(group_ids, dtype=np.int64)
    signers_array = np.asarray(signers)

    config.CACHE_DIR.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(
        CACHE_FILE,
        features=features_array,
        labels=labels_array,
        groups=groups_array,
        signers=signers_array,
    )
    METADATA_FILE.write_text(
        json.dumps(
            {
                "words": config.WORDS,
                "sequence_length": config.SEQUENCE_LENGTH,
                "frame_feature_dim": config.FRAME_FEATURE_DIM,
                "num_samples": int(len(labels_array)),
                "num_clips": len(clip_names),
                "clip_names": clip_names,
            },
            indent=2,
        )
    )
    _print_summary(labels_array, signers_array, groups_array)


def _print_summary(
    labels: np.ndarray, signers: np.ndarray, groups: np.ndarray
) -> None:
    print(f"\nCached {len(labels)} samples from {len(np.unique(groups))} clips "
          f"-> {CACHE_FILE}")
    print("\nSamples per word:")
    for index, word in enumerate(config.WORDS):
        mask = labels == index
        per_signer = ", ".join(
            f"{signer}={int(((signers == signer) & mask).sum())}"
            for signer in np.unique(signers)
        )
        print(f"  {word:<20} total={int(mask.sum()):>4}  ({per_signer})")


def load_dataset() -> dict[str, np.ndarray]:
    """Load the cached dataset arrays. Raises if the cache is missing."""
    if not CACHE_FILE.exists():
        raise FileNotFoundError(
            f"Cache not found at {CACHE_FILE}. Run: python src/dataset_builder.py"
        )
    data = np.load(CACHE_FILE, allow_pickle=True)
    return {key: data[key] for key in data.files}


if __name__ == "__main__":
    build_dataset()
