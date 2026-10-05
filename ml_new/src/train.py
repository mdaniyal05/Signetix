"""Train the PSL model: load cache -> grouped per-word split -> augmented fit -> save artifacts."""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np
import tensorflow as tf

sys.path.append(str(Path(__file__).resolve().parent.parent))

import config  # noqa: E402
from src.augmentation import augment_sequence  # noqa: E402
from src.dataset_builder import load_dataset  # noqa: E402
from src.model import build_model  # noqa: E402

SPLIT_FILE = config.MODELS_DIR / "split.json"


def make_grouped_split(
    labels: np.ndarray, groups: np.ndarray, rng: np.random.Generator
) -> dict[str, np.ndarray]:
    """Assign whole clips to train/val/test per word (no clip leakage, every word present)."""
    clips_per_word: dict[int, list[int]] = defaultdict(list)

    for group_id in np.unique(groups):
        word = int(labels[groups == group_id][0])
        clips_per_word[word].append(int(group_id))

    train_clips: list[int] = []
    val_clips: list[int] = []
    test_clips: list[int] = []

    for word, clip_ids in clips_per_word.items():
        shuffled = np.array(clip_ids)
        rng.shuffle(shuffled)
        n = len(shuffled)
        n_test = max(1, round(n * config.TEST_FRACTION))
        n_val = max(1, round(n * config.VAL_FRACTION))
        test_clips.extend(shuffled[:n_test].tolist())
        val_clips.extend(shuffled[n_test:n_test + n_val].tolist())
        train_clips.extend(shuffled[n_test + n_val:].tolist())

    return {
        "train": np.array(train_clips),
        "val": np.array(val_clips),
        "test": np.array(test_clips),
    }


def _mask_for_clips(groups: np.ndarray, clip_ids: np.ndarray) -> np.ndarray:
    return np.isin(groups, clip_ids)


def _make_train_dataset(
    features: np.ndarray, labels: np.ndarray, seed: int
) -> tf.data.Dataset:
    """Augmented, shuffled, batched tf.data pipeline for training."""
    rng = np.random.default_rng(seed)

    def _augment(sequence: np.ndarray, label: np.int64):
        augmented = augment_sequence(sequence, rng)
        return augmented.astype(np.float32), label

    dataset = tf.data.Dataset.from_tensor_slices((features, labels))
    dataset = dataset.shuffle(len(features), seed=seed,
                              reshuffle_each_iteration=True)
    dataset = dataset.map(
        lambda seq, lbl: tf.numpy_function(
            _augment, [seq, lbl], (tf.float32, tf.int64)
        ),
        num_parallel_calls=tf.data.AUTOTUNE,
    )

    dataset = dataset.map(
        lambda seq, lbl: (
            tf.ensure_shape(seq, (config.SEQUENCE_LENGTH,
                            config.FRAME_FEATURE_DIM)),
            tf.ensure_shape(lbl, ()),
        )
    )

    return dataset.batch(config.BATCH_SIZE).prefetch(tf.data.AUTOTUNE)


def _class_weights(train_labels: np.ndarray, num_classes: int) -> dict[int, float]:
    counts = np.bincount(train_labels, minlength=num_classes)
    total = counts.sum()

    return {
        index: float(total / (num_classes * count)) if count > 0 else 0.0
        for index, count in enumerate(counts)
    }


def train(architecture: str = "lstm") -> None:
    tf.keras.utils.set_random_seed(config.RANDOM_SEED)
    rng = np.random.default_rng(config.RANDOM_SEED)

    data = load_dataset()
    features, labels, groups = data["features"], data["labels"], data["groups"]
    num_classes = len(config.WORDS)

    print(f"Loaded {len(features)} samples, shape {features.shape}, "
          f"{len(np.unique(groups))} clips.")

    split = make_grouped_split(labels, groups, rng)
    train_mask = _mask_for_clips(groups, split["train"])
    val_mask = _mask_for_clips(groups, split["val"])
    test_mask = _mask_for_clips(groups, split["test"])

    assert set(split["train"]).isdisjoint(split["val"])
    assert set(split["train"]).isdisjoint(split["test"])
    assert set(split["val"]).isdisjoint(split["test"])

    x_train, y_train = features[train_mask], labels[train_mask]
    x_val, y_val = features[val_mask], labels[val_mask]
    x_test, y_test = features[test_mask], labels[test_mask]

    print(
        f"Split -> train={len(x_train)}  val={len(x_val)}  test={len(x_test)}")

    train_dataset = _make_train_dataset(x_train, y_train, config.RANDOM_SEED)
    val_dataset = tf.data.Dataset.from_tensor_slices(
        (x_val, y_val)).batch(config.BATCH_SIZE)

    model = build_model(x_train, num_classes, architecture=architecture)
    model.summary()

    config.MODELS_DIR.mkdir(parents=True, exist_ok=True)

    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            str(config.MODEL_FILE), monitor="val_accuracy",
            save_best_only=True, mode="max", verbose=1,
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss", patience=config.EARLY_STOPPING_PATIENCE,
            restore_best_weights=True, verbose=1,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=8, min_lr=1e-5, verbose=1,
        ),
    ]

    model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=config.MAX_EPOCHS,
        class_weight=_class_weights(y_train, num_classes),
        callbacks=callbacks,
        verbose=2,
    )

    _save_artifacts(model, split, x_train)

    test_loss, test_accuracy = model.evaluate(
        tf.data.Dataset.from_tensor_slices(
            (x_test, y_test)).batch(config.BATCH_SIZE),
        verbose=0,
    )

    print(
        f"\nHeld-out test accuracy: {test_accuracy:.3f} (loss {test_loss:.3f})")
    print("Run `python src/evaluate.py` for the per-word report.")


def _save_artifacts(model: tf.keras.Model, split: dict, x_train: np.ndarray) -> None:
    config.LABELS_FILE.write_text(json.dumps(config.WORDS, indent=2))

    flat = x_train.reshape(-1, x_train.shape[-1])

    config.NORMALIZATION_FILE.write_text(
        json.dumps(
            {"mean": flat.mean(axis=0).tolist(),
             "std": flat.std(axis=0).tolist()},
            indent=2,
        )
    )

    SPLIT_FILE.write_text(
        json.dumps({name: ids.tolist()
                   for name, ids in split.items()}, indent=2)
    )

    print(f"Saved model -> {config.MODEL_FILE}")
    print(f"Saved labels -> {config.LABELS_FILE}")
    print(f"Saved split  -> {SPLIT_FILE}")


if __name__ == "__main__":
    architecture_arg = sys.argv[1] if len(sys.argv) > 1 else "lstm"
    train(architecture=architecture_arg)
