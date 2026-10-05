import { useMemo } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";

/**
 * Returns a MediaStream for the local participant's webcam (or null when the
 * camera is off). Reuses the track VideoSDK already captured so we don't open
 * the camera a second time for recognition.
 */
export function useLocalWebcamStream(): MediaStream | null {
  const { localParticipant } = useMeeting();
  const { webcamStream, webcamOn } = useParticipant(localParticipant?.id ?? "");

  return useMemo(() => {
    const track = (
      webcamStream as unknown as { track?: MediaStreamTrack } | undefined
    )?.track;
    if (webcamOn && track) return new MediaStream([track]);
    return null;
  }, [webcamOn, webcamStream]);
}
