import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import {
  PSL_WS_URL,
  RECOGNITION_FPS,
  RECOGNITION_FRAME_WIDTH,
} from "@/config/env";
import { captureJpegBase64 } from "@/lib/frame-capture";
import {
  initialRecognitionState,
  parseServerMessage,
  recognitionReducer,
  transcriptToSentence,
} from "@/lib/recognition-state";

interface UsePslRecognitionOptions {
  /** The webcam stream to classify. Recognition is inactive while null. */
  stream: MediaStream | null;
  /** Enable/disable recognition (e.g. a toggle in the UI). */
  enabled?: boolean;
  serverUrl?: string;
  fps?: number;
  frameWidth?: number;
}

/**
 * Streams downscaled webcam frames to the Python inference server over a
 * WebSocket and exposes the recognition state (connection, signing status,
 * latest word, running transcript).
 *
 * The heavy/pure logic lives in `recognition-state.ts`; this hook only wires up
 * the WebSocket, a hidden <video>/<canvas>, and a sampling interval.
 */
export function usePslRecognition({
  stream,
  enabled = true,
  serverUrl = PSL_WS_URL,
  fps = RECOGNITION_FPS,
  frameWidth = RECOGNITION_FRAME_WIDTH,
}: UsePslRecognitionOptions) {
  const [state, dispatch] = useReducer(
    recognitionReducer,
    initialRecognitionState,
  );

  const socketRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  const active = enabled && stream !== null;

  useEffect(() => {
    if (!active || !stream) return;

    // Hidden elements used only to grab frames from the stream.
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    void video.play().catch(() => undefined);
    videoRef.current = video;
    canvasRef.current = document.createElement("canvas");

    const sampleIntervalMs = Math.max(1, Math.round(1000 / fps));
    // Skip sending while the socket is backed up so latency can't accumulate.
    const MAX_BUFFERED_BYTES = 64 * 1024;

    let cleanedUp = false;
    let reconnectTimer: number | null = null;
    let attempts = 0;

    const sendFrame = () => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      if (socket.bufferedAmount > MAX_BUFFERED_BYTES) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const data = captureJpegBase64(video, canvas, frameWidth);
      if (!data) return;
      socket.send(
        JSON.stringify({ type: "frame", data, t: performance.now() / 1000 }),
      );
    };

    const connect = () => {
      dispatch({ type: "connection", status: "connecting" });
      const socket = new WebSocket(serverUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        attempts = 0;
        dispatch({ type: "connection", status: "open" });
        if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(sendFrame, sampleIntervalMs);
      };
      socket.onmessage = (event: MessageEvent<string>) => {
        const message = parseServerMessage(event.data);
        if (message) dispatch({ type: "message", message, at: Date.now() });
      };
      socket.onerror = () => dispatch({ type: "connection", status: "error" });
      socket.onclose = () => {
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (cleanedUp) return;
        // Auto-reconnect with capped backoff (survives a dropped tunnel/server blip).
        dispatch({ type: "connection", status: "connecting" });
        const delay = Math.min(500 * 2 ** attempts, 5000);
        attempts += 1;
        reconnectTimer = window.setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      cleanedUp = true;
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const socket = socketRef.current;
      if (socket) {
        socket.onopen = socket.onmessage = socket.onerror = socket.onclose = null;
        socket.close();
      }
      socketRef.current = null;
      video.srcObject = null;
      videoRef.current = null;
      canvasRef.current = null;
    };
  }, [active, stream, serverUrl, fps, frameWidth]);

  const clearTranscript = useCallback(() => dispatch({ type: "clear" }), []);

  const sentence = useMemo(
    () => transcriptToSentence(state.transcript),
    [state.transcript],
  );

  return { ...state, sentence, clearTranscript };
}
