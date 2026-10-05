"""Evaluate the trained model on the held-out test split: per-word accuracy + confusion matrix."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix

sys.path.append(str(Path(__file__).resolve().parent.parent))
import config  # noqa: E402
from src.dataset_builder import load_dataset  # noqa: E402
from src.train import SPLIT_FILE, _mask_for_clips  # noqa: E402


def _load_test_split() -> np.ndarray:
    if not SPLIT_FILE.exists():
        raise FileNotFoundError(
            f"Split file not found at {SPLIT_FILE}. Train first.")
    return np.array(json.loads(SPLIT_FILE.read_text())["test"])


def _plot_confusion(matrix: np.ndarray, words: list[str]) -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    normalized = matrix / matrix.sum(axis=1, keepdims=True).clip(min=1)
    fig, axis = plt.subplots(figsize=(9, 8))
    image = axis.imshow(normalized, cmap="Blues", vmin=0, vmax=1)
    axis.set_xticks(range(len(words)), words,
                    rotation=45, ha="right", fontsize=8)
    axis.set_yticks(range(len(words)), words, fontsize=8)
    axis.set_xlabel("predicted")
    axis.set_ylabel("true")
    axis.set_title("Confusion matrix (row-normalized)")
    for i in range(len(words)):
        for j in range(len(words)):
            axis.text(j, i, str(matrix[i, j]), ha="center", va="center", fontsize=7,
                      color="white" if normalized[i, j] > 0.5 else "black")
    fig.colorbar(image, ax=axis, fraction=0.046, pad=0.04)
    fig.tight_layout()
    out_path = config.MODELS_DIR / "confusion_matrix.png"
    fig.savefig(out_path, dpi=100)
    print(f"\nSaved confusion matrix -> {out_path}")


def evaluate() -> None:
    data = load_dataset()
    features, labels, groups = data["features"], data["labels"], data["groups"]

    test_mask = _mask_for_clips(groups, _load_test_split())
    x_test, y_test = features[test_mask], labels[test_mask]
    print(f"Evaluating on {len(x_test)} held-out test samples.")

    model = tf.keras.models.load_model(config.MODEL_FILE)
    probabilities = model.predict(x_test, verbose=0)
    predictions = probabilities.argmax(axis=1)

    overall = float((predictions == y_test).mean())
    print(f"\nOverall test accuracy: {overall:.3f}\n")

    print(f"{'word':<20} {'n':>4} {'accuracy':>9}   result")
    print("-" * 48)
    all_pass = True
    for index, word in enumerate(config.WORDS):
        mask = y_test == index
        count = int(mask.sum())
        if count == 0:
            print(f"{word:<20} {0:>4} {'n/a':>9}   (no test samples)")
            continue
        accuracy = float((predictions[mask] == index).mean())
        passed = accuracy >= config.MIN_PER_WORD_ACCURACY
        all_pass = all_pass and passed
        print(
            f"{word:<20} {count:>4} {accuracy:>9.1%}   {'PASS' if passed else 'FAIL'}")

    print("-" * 48)
    print(f"Target: every word >= {config.MIN_PER_WORD_ACCURACY:.0%}  ->  "
          f"{'ALL PASS' if all_pass else 'SOME FAILED'}")

    print("\nClassification report:")
    print(classification_report(y_test, predictions,
          target_names=config.WORDS, zero_division=0))

    matrix = confusion_matrix(
        y_test, predictions, labels=range(len(config.WORDS)))
    _plot_confusion(matrix, config.WORDS)


if __name__ == "__main__":
    evaluate()
