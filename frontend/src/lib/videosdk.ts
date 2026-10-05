/** Thin client for the VideoSDK REST API (room create / validate). */
import { VIDEOSDK_TOKEN } from "@/config/env";

const API_BASE = "https://api.videosdk.live/v2";

/** Create a new meeting room and return its id. */
export async function createMeeting(token = VIDEOSDK_TOKEN): Promise<string> {
  const response = await fetch(`${API_BASE}/rooms`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Failed to create meeting (${response.status})`);
  }
  const data = (await response.json()) as { roomId?: string };
  if (!data.roomId) throw new Error("VideoSDK did not return a roomId");
  return data.roomId;
}

/** Return true if a meeting id exists and is valid. */
export async function validateMeeting(
  meetingId: string,
  token = VIDEOSDK_TOKEN,
): Promise<boolean> {
  const response = await fetch(
    `${API_BASE}/rooms/validate/${encodeURIComponent(meetingId)}`,
    { headers: { Authorization: token } },
  );
  return response.ok;
}
