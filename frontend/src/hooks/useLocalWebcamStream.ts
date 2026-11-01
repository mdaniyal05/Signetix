import { useMemo } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";

/** Local webcam MediaStream (or null), reusing the track VideoSDK already captured. */
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
