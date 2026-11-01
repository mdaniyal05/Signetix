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
    out_path = config.MODELS_DIR / f"confusion_matrix{config.MODEL_VARIANT}.png"
    fig.savefig(out_path, dpi=100)
    print(f"\nSaved confusion matrix -> {out_path}")


def evaluate() -> None:
    data = load_dataset()
    features, labels, groups = data["features"], data["labels"], data["groups"]

    test_mask = _mask_for_clips(groups, _load_test_split())
    x_test, y_test = features[test_mask], labels[test_mask]

    model = tf.keras.models.load_model(config.MODEL_FILE)
    probabilities = model.predict(x_test, verbose=0)
    predictions = probabilities.argmax(axis=1)
    confidences = probabilities.max(axis=1)

    lines: list[str] = []
    overall = float((predictions == y_test).mean())
    lines.append(f"PSL model{config.MODEL_VARIANT} evaluation  ({len(config.WORDS)} words)")
    lines.append(f"Held-out test samples: {len(x_test)}")
    lines.append(f"Overall test accuracy: {overall:.3f}\n")

    lines.append(f"{'word':<28} {'n':>3} {'acc':>7} {'mean_conf':>10}   top confusion")
    lines.append("-" * 78)
    issues: list[str] = []
    all_pass = True
    for index, word in enumerate(config.WORDS):
        mask = y_test == index
        count = int(mask.sum())
        if count == 0:
            lines.append(f"{word:<28} {0:>3} {'n/a':>7} {'n/a':>10}   (no test samples)")
            issues.append(f"{word}: no held-out test samples (can't verify)")
            continue
        accuracy = float((predictions[mask] == index).mean())
        mean_conf = float(confidences[mask].mean())
        wrong = predictions[mask][predictions[mask] != index]
        confusion = ""
        if wrong.size:
            target, hits = np.unique(wrong, return_counts=True)
            worst = int(target[hits.argmax()])
            confusion = f"{config.WORDS[worst]} (x{int(hits.max())})"
        passed = accuracy >= config.MIN_PER_WORD_ACCURACY
        all_pass = all_pass and passed
        flag = "" if passed else "  <-- FAIL"
        lines.append(
            f"{word:<28} {count:>3} {accuracy:>7.1%} {mean_conf:>10.2f}   {confusion}{flag}")
        if not passed:
            issues.append(f"{word}: accuracy {accuracy:.0%} below "
                          f"{config.MIN_PER_WORD_ACCURACY:.0%}; confused with {confusion or 'n/a'}")
        elif mean_conf < 0.80:
            issues.append(f"{word}: passes but low mean confidence {mean_conf:.2f} "
                          f"(may be dropped live by the 0.80 threshold)")

    lines.append("-" * 78)
    lines.append(f"Target: every word >= {config.MIN_PER_WORD_ACCURACY:.0%}  ->  "
                 f"{'ALL PASS' if all_pass else 'SOME FAILED'}\n")

    lines.append("Issues:")
    lines.extend(f"  - {item}" for item in issues) if issues else lines.append("  none")

    lines.append("\nClassification report:")
    lines.append(classification_report(y_test, predictions,
                 target_names=config.WORDS, zero_division=0))

    report = "\n".join(lines)
    print(report)
    config.LOGS_DIR.mkdir(parents=True, exist_ok=True)
    report_file = config.LOGS_DIR / f"report{config.MODEL_VARIANT}.txt"
    report_file.write_text(report, encoding="utf-8")
    print(f"Saved report -> {report_file}")

    matrix = confusion_matrix(
        y_test, predictions, labels=range(len(config.WORDS)))
    _plot_confusion(matrix, config.WORDS)


if __name__ == "__main__":
    evaluate()
