"""Sequence classifiers (Bi-LSTM default, TCN variant) with baked-in normalization."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models

sys.path.append(str(Path(__file__).resolve().parent.parent))

import config  # noqa: E402


def _make_normalization_layer(train_features: np.ndarray) -> layers.Normalization:
    """Per-feature standardization adapted on the train split only (no leakage)."""
    normalization = layers.Normalization(axis=-1)
    normalization.adapt(train_features.reshape(-1, train_features.shape[-1]))

    return normalization


def build_lstm_model(
    normalization: layers.Normalization,
    num_classes: int,
    sequence_length: int = config.SEQUENCE_LENGTH,
    feature_dim: int = config.FRAME_FEATURE_DIM,
) -> tf.keras.Model:
    """Bidirectional-LSTM classifier."""
    inputs = layers.Input(
        shape=(sequence_length, feature_dim), name="feature_sequence")

    x = normalization(inputs)
    x = layers.Bidirectional(layers.LSTM(96, return_sequences=True))(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Bidirectional(layers.LSTM(64))(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(64, activation="relu")(x)
    x = layers.Dropout(0.3)(x)

    outputs = layers.Dense(num_classes, activation="softmax", name="word")(x)

    return models.Model(inputs, outputs, name="psl_bilstm")


def build_tcn_model(
    normalization: layers.Normalization,
    num_classes: int,
    sequence_length: int = config.SEQUENCE_LENGTH,
    feature_dim: int = config.FRAME_FEATURE_DIM,
) -> tf.keras.Model:
    """Dilated 1D-CNN (TCN-style) alternative classifier."""
    inputs = layers.Input(
        shape=(sequence_length, feature_dim), name="feature_sequence")

    x = normalization(inputs)

    for filters, dilation in [(64, 1), (64, 2), (128, 4)]:
        x = layers.Conv1D(filters, kernel_size=3, padding="causal",
                          dilation_rate=dilation, activation="relu")(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.3)(x)

    x = layers.GlobalAveragePooling1D()(x)
    x = layers.Dense(64, activation="relu")(x)
    x = layers.Dropout(0.3)(x)

    outputs = layers.Dense(num_classes, activation="softmax", name="word")(x)

    return models.Model(inputs, outputs, name="psl_tcn")


def build_model(
    train_features: np.ndarray,
    num_classes: int,
    architecture: str = "lstm",
) -> tf.keras.Model:
    """Build and compile a model ("lstm" default, or "tcn")."""
    normalization = _make_normalization_layer(train_features)
    builder = {"lstm": build_lstm_model, "tcn": build_tcn_model}[architecture]
    model = builder(normalization, num_classes)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(config.LEARNING_RATE),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model
