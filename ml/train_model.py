from sklearn.model_selection import train_test_split
import os
import sys
import io
import json
import time
import argparse
import requests
import numpy as np
import cv2

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["GLOG_minloglevel"] = "2"
os.environ["TF_GPU_ALLOCATOR"] = "cuda_malloc_async"

_saved_stderr = sys.stderr
sys.stderr = io.StringIO()

try:
    import tensorflow as tf
    import keras
    from keras import layers, callbacks
    import mediapipe as mp
    from mediapipe.tasks import python as mp_python
    from mediapipe.tasks.python import vision as mp_vision
finally:
    sys.stderr = _saved_stderr


# Configuration
DATASET_DIR = "./dataset"
VIDEO_DIR = os.path.join(DATASET_DIR, "videos")
JSON_PATH = os.path.join(DATASET_DIR, "WLASL_v0.3.json")
MODEL_OUT = "./models/model.keras"
ACTIONS_OUT = "./config/actions.txt"
MP_MODEL = "./models/hand_landmarker.task"
MP_MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/"
    "hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
)

NUM_CLASSES = 100
MIN_SAMPLES_PER_CLASS = 3

SEQUENCE_LEN = 30
FEATURE_DIM = 99

TCN_FILTERS = 64
TCN_KERNEL_SIZE = 3
TCN_DILATIONS = [1, 2, 4, 8, 16]
DROPOUT_RATE = 0.2
DENSE_UNITS = 128

BATCH_SIZE = 32
EPOCHS = 80
LEARNING_RATE = 1e-3
VAL_SPLIT = 0.15
TEST_SPLIT = 0.10
SEED = 42

# MediaPipe download


def download_mp_model():
    if os.path.exists(MP_MODEL):
        return

    os.makedirs(os.path.dirname(MP_MODEL), exist_ok=True)

    print(f"Downloading MediaPipe hand landmarker → {MP_MODEL} …")

    r = requests.get(MP_MODEL_URL, stream=True, timeout=60)
    r.raise_for_status()

    with open(MP_MODEL, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)

    print("Download complete.\n")


# MediaPipe detector
def build_detector() -> mp_vision.HandLandmarker:  # type: ignore
    base_opts = mp_python.BaseOptions(model_asset_path=MP_MODEL)

    opts = mp_vision.HandLandmarkerOptions(
        base_options=base_opts,
        running_mode=mp_vision.RunningMode.IMAGE,
        num_hands=2,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    _s = sys.stderr
    sys.stderr = io.StringIO()

    try:
        detector = mp_vision.HandLandmarker.create_from_options(opts)
    finally:
        sys.stderr = _s
    return detector


def extract_features(bgr_frame: np.ndarray,
                     detector: mp_vision.HandLandmarker  # type: ignore
                     ) -> tuple[np.ndarray, bool]:

    rgb = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2RGB)
    _s = sys.stderr
    sys.stderr = io.StringIO()

    try:
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result = detector.detect(mp_image)
    finally:
        sys.stderr = _s

    if not result.hand_landmarks:
        return np.zeros(FEATURE_DIM, dtype=np.float32), False

    hand = result.hand_landmarks[0]
    joint = np.zeros((21, 4), dtype=np.float32)

    for j, lm in enumerate(hand):
        vis = lm.visibility if lm.visibility is not None else 0.0
        joint[j] = [lm.x, lm.y, lm.z, vis]

    v1 = joint[[0, 1, 2, 3,  0, 5, 6, 7,  0, 9, 10,
                11,  0, 13, 14, 15,  0, 17, 18, 19], :3]
    v2 = joint[[1, 2, 3, 4,  5, 6, 7, 8,  9, 10,
                11, 12, 13, 14, 15, 16, 17, 18, 19, 20], :3]

    v = v2 - v1

    norms = np.linalg.norm(v, axis=1, keepdims=True)

    v /= np.where(norms == 0, 1e-6, norms)

    dot = np.einsum(
        'nt,nt->n',
        v[[0, 1, 2,  4, 5, 6,  8, 9, 10,  12, 13, 14,  16, 17, 18], :],
        v[[1, 2, 3,  5, 6, 7,  9, 10, 11, 13, 14, 15,  17, 18, 19], :],
    )

    angle = np.degrees(np.arccos(np.clip(dot, -1.0, 1.0)))

    return np.concatenate([joint.flatten(), angle]).astype(np.float32), True


def video_to_sequence(video_path: str,
                      detector: mp_vision.HandLandmarker,  # type: ignore
                      frame_start: int = 1,
                      frame_end:   int = -1) -> np.ndarray | None:
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        return None

    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if total == 0:
        cap.release()
        return None

    fs = max(0, frame_start - 1)
    fe = total if frame_end == -1 else min(frame_end, total)
    fe = max(fs + 1, fe)

    indices = np.linspace(fs, fe - 1, SEQUENCE_LEN, dtype=int)
    sequence = []
    prev = np.zeros(FEATURE_DIM, dtype=np.float32)

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
        ret, frame = cap.read()

        if not ret:
            sequence.append(prev.copy())
            continue

        feat, detected = extract_features(frame, detector)

        if detected:
            prev = feat

        sequence.append(prev.copy())

    cap.release()

    while len(sequence) < SEQUENCE_LEN:
        sequence.append(np.zeros(FEATURE_DIM, dtype=np.float32))

    return np.array(sequence[:SEQUENCE_LEN], dtype=np.float32)


# Data augmentation
def augment_sequence(seq: np.ndarray, rng: np.random.Generator) -> list[np.ndarray]:
    augmented = []

    # 1. Jitter
    jitter = seq + rng.normal(0, 0.01, seq.shape).astype(np.float32)
    augmented.append(jitter)

    # 2. Time-warp: sample from a slightly irregular time grid
    t_orig = np.linspace(0, 1, SEQUENCE_LEN)
    warp_knot = np.sort(rng.uniform(0.05, 0.95, 3))  # 3 interior knot points
    t_warped = np.interp(
        np.linspace(0, 1, SEQUENCE_LEN),
        np.array([0, *warp_knot, 1]),
        np.array([0, *rng.uniform(0.1, 0.9, 3), 1]),
    )

    t_warped = np.clip(t_warped, 0, 1) * (SEQUENCE_LEN - 1)

    warped = np.array([
        seq[min(int(t), SEQUENCE_LEN - 1)] * (1 - t % 1) +
        seq[min(int(t) + 1, SEQUENCE_LEN - 1)] * (t % 1)
        for t in t_warped
    ], dtype=np.float32)

    augmented.append(warped)

    # 3. Jitter + time-warp
    augmented.append(
        (warped + rng.normal(0, 0.01, warped.shape)).astype(np.float32))

    return augmented


# Dataset loading
def load_dataset(num_classes: int, min_samples: int):
    with open(JSON_PATH, "r") as f:
        wlasl = json.load(f)

    wlasl = wlasl[:num_classes]
    class_names_raw = [e["gloss"] for e in wlasl]
    raw: dict[int, list[np.ndarray]] = {}

    detector = build_detector()
    total = sum(len(e["instances"]) for e in wlasl)
    done = skipped = 0
    t0 = time.time()

    print(
        f"\nExtracting features — {num_classes} glosses, {total} video instances …")
    print(f"(Missing Kaggle videos are skipped automatically)\n")

    for cls_idx, entry in enumerate(wlasl):
        raw[cls_idx] = []
        for inst in entry["instances"]:
            vid = inst["video_id"]
            fs = inst.get("frame_start", 1)
            fe = inst.get("frame_end",   -1)
            path = os.path.join(VIDEO_DIR, f"{vid}.mp4")
            done += 1

            if not os.path.exists(path):
                skipped += 1
                continue

            seq = video_to_sequence(path, detector, fs, fe)
            if seq is None:
                skipped += 1
                continue

            raw[cls_idx].append(seq)

            if done % 100 == 0:
                elapsed = time.time() - t0
                eta = (total - done) / max(done / elapsed, 1e-6)
                print(f"  [{done:>4}/{total}]  {elapsed:.0f}s  "
                      f"ETA {eta:.0f}s  "
                      f"skipped {skipped} ({100*skipped/done:.0f}%)  "
                      f"class '{entry['gloss']}'")

    detector.close()

    # Drop under-represented classes, re-index
    kept_names, X, y = [], [], []
    new_idx = dropped = 0

    for cls_idx, seqs in raw.items():
        if len(seqs) < min_samples:
            dropped += 1
            continue
        kept_names.append(class_names_raw[cls_idx])
        for seq in seqs:
            X.append(seq)
            y.append(new_idx)
        new_idx += 1

    print(f"\nDone.  {len(X)} sequences  |  {skipped} videos skipped  "
          f"|  {dropped} classes dropped (< {min_samples} samples)")
    print(f"Kept {new_idx} classes.\n")

    return (np.array(X, dtype=np.float32),
            np.array(y, dtype=np.int32),
            kept_names)


# TCN model
def residual_block(x, filters, kernel_size, dilation_rate, dropout_rate):
    skip = x
    if x.shape[-1] != filters:
        skip = layers.Conv1D(filters, 1, padding="same")(x)
    for _ in range(2):
        x = layers.Conv1D(filters, kernel_size, padding="causal",
                          dilation_rate=dilation_rate,
                          kernel_initializer="he_normal")(x)
        x = layers.LayerNormalization()(x)
        x = layers.Activation("relu")(x)
        x = layers.SpatialDropout1D(dropout_rate)(x)
    return layers.Add()([x, skip])


def build_tcn_model(num_classes: int) -> keras.Model:
    inp = keras.Input(shape=(SEQUENCE_LEN, FEATURE_DIM), name="keypoints")
    x = inp
    for d in TCN_DILATIONS:
        x = residual_block(x, TCN_FILTERS, TCN_KERNEL_SIZE, d, DROPOUT_RATE)
    x = layers.GlobalAveragePooling1D()(x)
    x = layers.Dense(DENSE_UNITS, activation="relu")(x)
    x = layers.Dropout(DROPOUT_RATE)(x)
    out = layers.Dense(num_classes, activation="softmax",
                       name="predictions")(x)
    return keras.Model(inp, out, name="TCN_SignLanguage")


# Training
def train(args):
    num_classes = args.num_classes
    min_samples = args.min_samples
    do_augment = args.augment

    # 1. Features
    cache = os.path.join(DATASET_DIR, f"features_top{num_classes}.npz")

    if args.use_cache and os.path.exists(cache):
        print(f"Loading cached features from {cache} …")
        data = np.load(cache, allow_pickle=True)
        X = data["X"]
        y = data["y"]
        class_names = list(data["class_names"])
        print(f"  {len(X)} sequences, {len(class_names)} classes.\n")

        # Re-apply min_samples filter in case it differs from cache time
        if min_samples > MIN_SAMPLES_PER_CLASS:
            counts = np.bincount(y)
            keep_classes = np.where(counts >= min_samples)[0]
            if len(keep_classes) < len(class_names):
                mask = np.isin(y, keep_classes)
                # Re-index
                remap = {old: new for new, old in enumerate(keep_classes)}
                X = X[mask]
                y = np.array([remap[yi] for yi in y[mask]], dtype=np.int32)
                class_names = [class_names[i] for i in keep_classes]
                print(f"  After --min_samples {min_samples} filter: "
                      f"{len(X)} sequences, {len(class_names)} classes.\n")
    else:
        X, y, class_names = load_dataset(num_classes, min_samples)
        print(f"Saving feature cache → {cache}")
        np.savez_compressed(cache, X=X, y=y,
                            class_names=np.array(class_names))

    actual_classes = len(class_names)

    print(
        f"Classes: {actual_classes}  |  Sequences before augmentation: {len(X)}\n")

    # 2. Augmentation
    if do_augment:
        rng = np.random.default_rng(SEED)
        X_aug, y_aug = [], []
        for seq, label in zip(X, y):
            for aug_seq in augment_sequence(seq, rng):
                X_aug.append(aug_seq)
                y_aug.append(label)
        X = np.concatenate([X, np.array(X_aug, dtype=np.float32)], axis=0)
        y = np.concatenate([y, np.array(y_aug, dtype=np.int32)],   axis=0)
        print(f"After augmentation (3× copies): {len(X)} sequences\n")

    # 3. Split
    X_tmp,  X_test,  y_tmp,  y_test = train_test_split(
        X, y, test_size=TEST_SPLIT, stratify=y, random_state=SEED)
    X_train, X_val, y_train, y_val = train_test_split(
        X_tmp, y_tmp,
        test_size=VAL_SPLIT / (1 - TEST_SPLIT),
        stratify=y_tmp, random_state=SEED)

    print(f"Train {len(X_train)} | Val {len(X_val)} | Test {len(X_test)}\n")

    # 4. Model
    model = build_tcn_model(actual_classes)
    model.summary()

    model.compile(
        optimizer=keras.optimizers.Adam(LEARNING_RATE),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    # 5. Callbacks
    os.makedirs(os.path.dirname(MODEL_OUT),   exist_ok=True)
    os.makedirs(os.path.dirname(ACTIONS_OUT), exist_ok=True)
    os.makedirs("./logs", exist_ok=True)

    cbs = [
        callbacks.ModelCheckpoint(
            MODEL_OUT, monitor="val_accuracy",
            save_best_only=True, verbose=1),
        callbacks.EarlyStopping(
            monitor="val_accuracy", patience=15,
            restore_best_weights=True, verbose=1),
        callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.5,
            patience=6, min_lr=1e-5, verbose=1),
        callbacks.CSVLogger(f"./logs/training_{int(time.time())}.csv"),
    ]

    # 6. Train
    print("\nTraining................................................\n")
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        batch_size=BATCH_SIZE,
        epochs=EPOCHS,
        callbacks=cbs,
    )

    # 7. Evaluate
    print("\nTest evaluation.........................................\n")
    loss, acc = model.evaluate(X_test, y_test, verbose=1)
    print(f"\nTest accuracy: {acc * 100:.2f}%")

    # 8. Save outputs
    with open(ACTIONS_OUT, "w") as f:
        f.write("\n".join(class_names))

    print(f"\nClass names → {ACTIONS_OUT}  ({actual_classes} classes)")
    print(f"Model       → {MODEL_OUT}")
    print("\nDrop models/model.keras into your inference server and restart.")


# CLI
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train WLASL TCN model")
    parser.add_argument(
        "--num_classes", type=int, default=NUM_CLASSES,
        choices=[50, 100, 300, 1000, 2000],
        help="WLASL subset to use (default 100)")
    parser.add_argument(
        "--use_cache", action="store_true",
        help="Load pre-extracted .npz cache instead of re-extracting features")
    parser.add_argument(
        "--augment", action="store_true",
        help="Apply jitter + time-warp augmentation (3× more data, recommended)")
    parser.add_argument(
        "--min_samples", type=int, default=MIN_SAMPLES_PER_CLASS,
        help="Drop classes with fewer usable videos than this (default 3)")
    parser.add_argument(
        "--dataset_dir", type=str, default=DATASET_DIR,
        help="Directory containing videos/ and WLASL_v0.3.json")
    args = parser.parse_args()

    DATASET_DIR = args.dataset_dir
    VIDEO_DIR = os.path.join(DATASET_DIR, "videos")
    JSON_PATH = os.path.join(DATASET_DIR, "WLASL_v0.3.json")

    download_mp_model()
    train(args)
