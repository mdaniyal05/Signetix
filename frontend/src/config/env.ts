/**
 * Centralized, typed access to build-time environment variables.
 *
 * Vite exposes only variables prefixed with `VITE_`. Copy `.env.example` to
 * `.env.local` and fill these in.
 */

/** Base URL for the backend REST API. Defaults to the dev proxy ('/api'). */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "/api";

/** Socket.io server URL (real-time chat + call signaling). */
export const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL ?? "http://localhost:8080";

/** VideoSDK auth token (from the VideoSDK dashboard). */
export const VIDEOSDK_TOKEN: string = import.meta.env.VITE_VIDEOSDK_TOKEN ?? "";

/** WebSocket URL of the Python PSL inference server. */
export const PSL_WS_URL: string =
  import.meta.env.VITE_PSL_WS_URL ?? "ws://localhost:8000/ws";

/** Frames per second sampled from the webcam and sent to the recognizer. */
export const RECOGNITION_FPS: number = Number(
  import.meta.env.VITE_RECOGNITION_FPS ?? 15,
);

/** Max width (px) frames are downscaled to before sending (saves bandwidth). */
export const RECOGNITION_FRAME_WIDTH: number = Number(
  import.meta.env.VITE_RECOGNITION_FRAME_WIDTH ?? 480,
);

/** True when a VideoSDK token is configured. */
export const hasVideoSdkToken = (): boolean => VIDEOSDK_TOKEN.trim().length > 0;
