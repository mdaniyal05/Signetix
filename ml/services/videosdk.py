import asyncio
from videosdk import Meeting
import numpy as np
from time import time
from typing import Optional, Set
import os
import dotenv
from fastapi import WebSocket
from collections import deque
import time

dotenv.load_dotenv()

VIDEOSDK_TOKEN = os.environ.get('VIDEOSDK_TOKEN')
FRAME_INTERVAL = float(os.environ.get(
    'FRAME_INTERVAL', 1/30))  # Default 30 FPS
BROADCAST_INTERVAL = float(os.environ.get(
    'BROADCAST_INTERVAL', 0.05))  # Default 20 updates/sec


class VideoProcessor:
    def __init__(self, videosdk_service) -> None:

        self.videosdk_service = videosdk_service
        self.last_process_time = 0
        self.frame_interval = FRAME_INTERVAL
        self.current_frame = None
        self.frame_ready = asyncio.Event()
        self.is_processing = False
        self.processing_task = None

        # Adaptive frame rate control
        self.min_interval = float(os.environ.get(
            'MIN_FRAME_INTERVAL', 1/45))  # Max ~45 FPS
        self.max_interval = float(os.environ.get(
            'MAX_FRAME_INTERVAL', 1/15))  # Min ~15 FPS

        # Will be adjusted based on observed performance
        self.device_performance_factor = 1.0

        # Frame rate tracking
        self.frame_times = deque(maxlen=100)  # Store last 100 frame timestamps
        self.frame_intervals = deque(maxlen=30)  # Store recent intervals
        self.average_fps = 0
        self.fps_update_interval = 3.0  # Update FPS every 3 seconds
        self.last_fps_update_time = time.time()
        self.device_speed_assessed = False

        # Frame drop monitoring
        self.dropped_frames = 0
        self.total_frames = 0

        # Recording properties
        self.recording = False
        self.video_writer = None
        self.record_start_time = None
        self.record_duration = None
        self.record_filename = None
        self.recorded_frames = []        # List to store captured frames
        self.recorded_timestamps = []    # List to store precise timestamps


class VideoSDKService:
    def __init__(self):
        self.meeting: Optional[Meeting] = None
        self.meeting_id: Optional[str] = None
        self.react_clients: Set[WebSocket] = set()
        self.active_processors = set()
        self.last_predictions = []
        self.last_broadcast_time = 0
        self.broadcast_interval = BROADCAST_INTERVAL
        self.ml_websocket: Optional[WebSocket] = None
        self.ml_queue = asyncio.Queue()
        self.is_running = False
        self.monitor_task = None
        self.processor_task = None
