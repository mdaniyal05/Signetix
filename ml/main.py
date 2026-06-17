import asyncio
import os
from typing import Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

from services.inference import KerasInferenceService
from services.videosdk import VideoSDKService

load_dotenv()

TEST_MODE = os.environ.get('TEST_MODE', 'false').lower() == 'true'

SERVER_HOST = os.environ.get('SERVER_HOST', '0.0.0.0')
SERVER_PORT = int(os.environ.get('SERVER_PORT', 8070))

CURRENT_MEETING_ID = None

app = FastAPI(title="Sign Language Detection System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MockInferenceService:
    async def initialize(self):
        print("[MOCK] Inference service initialized (no model loaded).")

    async def handle_client(self, websocket: WebSocket):
        print("[MOCK] New inference client connected.")
        try:
            while True:
                await asyncio.sleep(1)
        except WebSocketDisconnect:
            print("[MOCK] Inference client disconnected.")

    async def cleanup(self):
        print("[MOCK] Inference service cleaned up.")


class MockVideoSDKService:
    def __init__(self):
        self.react_clients: Set[WebSocket] = set()
        self.active_processors = set()
        self.active_processors.add(MockVideoProcessor())

    async def update_meeting_id(self, meeting_id: str):
        print(f"[MOCK] Meeting ID updated to: {meeting_id}")

    async def start_monitoring(self):
        print("[MOCK] VideoSDK monitoring started (no real monitoring).")

    def add_react_client(self, websocket: WebSocket):
        self.react_clients.add(websocket)
        print("[MOCK] React client added.")

    def remove_react_client(self, websocket: WebSocket):
        if websocket in self.react_clients:
            self.react_clients.remove(websocket)
        print("[MOCK] React client removed.")

    async def cleanup(self):
        for client in self.react_clients:
            try:
                await client.close()
            except:
                pass
        self.react_clients.clear()
        self.active_processors.clear()
        print("[MOCK] VideoSDK service cleaned up.")


class MockVideoProcessor:
    def start_recording(self, file_path: str, duration: int):
        print(
            f"[MOCK] Recording would start: {file_path} for {duration} seconds.")
        with open(file_path, 'w') as f:
            f.write("MOCK RECORDING FILE")
        print(
            f"[MOCK] Recording simulation finished. File created at {file_path}")


if TEST_MODE:
    inference_service = MockInferenceService()
    videosdk_service = MockVideoSDKService()
    print("*** RUNNING IN TEST MODE (VideoSDK and Inference are mocked) ***")
else:
    inference_service = KerasInferenceService()
    videosdk_service = VideoSDKService()
    print("*** RUNNING IN NORMAL MODE ***")


class MeetingIDPayload(BaseModel):
    meetingId: str


@app.get("/")
async def root():
    return {"message": "Welcome to the Sign Language Detection System API!"}


@app.post("/meeting-id")
async def post_meeting_id(payload: MeetingIDPayload):
    global CURRENT_MEETING_ID
    CURRENT_MEETING_ID = payload.meetingId

    print(f"Received Meeting ID: {payload.meetingId}")

    await videosdk_service.update_meeting_id(payload.meetingId)

    return {"status": "success"}


@app.get("/meeting-id")
async def get_meeting_id():
    if CURRENT_MEETING_ID:
        return {"meetingId": CURRENT_MEETING_ID}
    else:
        return {"error": "No meeting ID available"}, 404


@app.post("/trigger-recording")
async def trigger_recording():
    if CURRENT_MEETING_ID is None:
        raise HTTPException(status_code=400, detail="No meeting ID available.")

    if not videosdk_service.active_processors:
        raise HTTPException(
            status_code=400, detail="No active video stream available for recording.")

    os.makedirs("dataset", exist_ok=True)
    file_name = f"{CURRENT_MEETING_ID}_input.mp4"
    file_path = os.path.join("dataset", file_name)

    processor = next(iter(videosdk_service.active_processors))
    processor.start_recording(file_path, 30)

    return {"status": "success", "message": f"Recording started. Saving to {file_path}."}


@app.websocket("/ws/inference")
async def inference_websocket(websocket: WebSocket):
    await websocket.accept()
    await inference_service.handle_client(websocket)


@app.websocket("/ws/react")
async def react_websocket(websocket: WebSocket):
    await websocket.accept()

    try:
        videosdk_service.add_react_client(websocket)
        await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        videosdk_service.remove_react_client(websocket)


@app.on_event("startup")
async def startup_event():
    if not TEST_MODE:
        asyncio.create_task(videosdk_service.start_monitoring())

    await inference_service.initialize()

    print(f"Server running on http://{SERVER_HOST}:{SERVER_PORT}")


@app.on_event("shutdown")
async def shutdown_event():
    await videosdk_service.cleanup()
    await inference_service.cleanup()

if __name__ == "__main__":
    import uvicorn
    import threading
    import requests

    def wait_for_recording():
        while True:
            input("Press Enter to start video recording for 30 seconds...")
            try:
                response = requests.post(
                    f"http://localhost:{SERVER_PORT}/trigger-recording")
                if response.status_code == 200:
                    data = response.json()
                    print(data["message"])
                else:
                    print("Recording trigger failed:",
                          response.json().get("detail", "Unknown error"))
            except Exception as e:
                print("Error triggering recording:", e)

    input_thread = threading.Thread(target=wait_for_recording, daemon=True)
    input_thread.start()

    uvicorn.run("main:app", host=SERVER_HOST, port=SERVER_PORT, reload=True)
