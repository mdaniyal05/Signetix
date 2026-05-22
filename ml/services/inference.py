import asyncio
import json
import cv2
import numpy as np
from base64 import b64decode
import tensorflow as tf
from typing import List, Dict, Any, Deque
import mediapipe as mp
import dotenv
import os
from fastapi import WebSocket
from collections import deque
import time

dotenv.load_dotenv()


class KerasInferenceService:
    def __init__(self, model_path=None):
      # Initialize the Keras inference service
        self.model_path = model_path or os.environ.get(
            'ML_MODEL_PATH', './models/model.keras')

        self.sequence_length = int(os.environ.get('ML_SEQUENCE_LENGTH', 30))

        self.confidence_threshold = float(
            os.environ.get('ML_CONFIDENCE_THRESHOLD', 0.95))

        self.sequence_buffer = []
        self.action_seq = []

        # Frame interpolation parameters
        self.target_fps = int(os.environ.get('ML_TARGET_FPS', 15))

        # Maximum age of frames to keep (in seconds)
        self.max_frame_age = float(os.environ.get('ML_MAX_FRAME_AGE', 0.5))

        # Time based sliding window instead of frame count
        self.sliding_window_duration = float(os.environ.get(
            'ML_WINDOW_DURATION', 1.0))  # Window duration in seconds

        # Enhanced buffers for time-based interpolation
        # Store more frames than needed to handle variable rate
        self.frame_buffer = deque(maxlen=60)
        self.time_buffer = deque(maxlen=60)   # Corresponding timestamps

        # Store extracted features with timestamps
        self.feature_buffer = deque(maxlen=60)

        # For interpolation
        self.last_interpolation_time = 0
        self.interpolation_interval = 1.0 / self.target_fps

        # Hand state tracking
        self.no_hand_counter = 0
        self.no_hand_threshold = 3
        self.hand_present = False
        self.last_prediction = None

        # Performance monitoring
        self.processing_times = deque(maxlen=100)
        self.actual_fps = 0

        # Active clients
        self.active_clients = set()
