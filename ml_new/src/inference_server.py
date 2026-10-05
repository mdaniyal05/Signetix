"""FastAPI WebSocket server for real-time PSL recognition (browser -> Python)."""

from __future__ import annotations

import asyncio
import json
import sys
import time
from base64 import b64decode
from contextlib import asynccontextmanager
from pathlib import Path

import cv2
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

sys.path.append(str(Path(__file__).resolve().parent.parent))
import config  # noqa: E402
from src.realtime_recognizer import StreamingSignRecognizer  # noqa: E402

# Shared, read-only resources loaded once at startup.
_shared: dict[str, object] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading model and labels...")
    _shared["model"] = tf.keras.models.load_model(str(config.MODEL_FILE))
    _shared["labels"] = json.loads(config.LABELS_FILE.read_text())
    print(f"Ready. Words: {_shared['labels']}")
    yield
    _shared.clear()


app = FastAPI(title="PSL Real-time Inference", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "words": _shared.get("labels", [])}


def _decode_frame(data: str) -> np.ndarray | None:
    buffer = np.frombuffer(b64decode(data), dtype=np.uint8)
    return cv2.imdecode(buffer, cv2.IMREAD_COLOR)


@app.websocket("/ws")
async def recognition_socket(websocket: WebSocket) -> None:
    # Each connection gets its own recognizer state but shares the loaded model.
    await websocket.accept()
    recognizer = StreamingSignRecognizer(
        model=_shared["model"], labels=_shared["labels"]
    )
    was_signing = False
    print("Client connected.")

    try:
        while True:
            message = await websocket.receive_json()
            if message.get("type") != "frame":
                continue

            frame = _decode_frame(message["data"])
            if frame is None:
                continue

            # Use the client's capture time if given; run blocking work off the loop.
            timestamp = float(message.get("t", time.monotonic()))
            prediction = await asyncio.to_thread(
                recognizer.process_frame, frame, timestamp
            )

            if recognizer.is_signing != was_signing:
                was_signing = recognizer.is_signing
                await websocket.send_json({"type": "status", "signing": was_signing})

            if prediction is not None:
                await websocket.send_json(
                    {
                        "type": "prediction",
                        "word": prediction.word,
                        "confidence": round(prediction.confidence, 3),
                        "duration": round(prediction.duration, 2),
                    }
                )
                print(f"-> {prediction.word} ({prediction.confidence:.2f})")
    except WebSocketDisconnect:
        print("Client disconnected.")
    finally:
        recognizer.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
