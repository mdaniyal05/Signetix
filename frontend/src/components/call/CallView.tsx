import { useEffect, useMemo, useRef, useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CaptionBar } from "@/components/recognition/CaptionBar";
import { RecognitionStatus } from "@/components/recognition/RecognitionStatus";
import { TranscriptPanel } from "@/components/recognition/TranscriptPanel";
import { useLocalWebcamStream } from "@/hooks/useLocalWebcamStream";
import { usePslRecognition } from "@/hooks/usePslRecognition";
import { CallControls } from "./CallControls";
import { ParticipantGrid } from "./ParticipantGrid";

interface CallViewProps {
  meetingId: string;
  onLeave: () => void;
}

/** Inner meeting UI; must be rendered inside a VideoSDK <MeetingProvider>. */
export function CallView({ meetingId, onLeave }: CallViewProps) {
  const [joined, setJoined] = useState(false);
  const [recognitionOn, setRecognitionOn] = useState(true);

  const {
    join,
    leave,
    toggleMic,
    toggleWebcam,
    participants,
    localParticipant,
    localMicOn,
    localWebcamOn,
  } = useMeeting({
    onMeetingJoined: () => setJoined(true),
    onMeetingLeft: onLeave,
    // Surface the real reason the camera/mic fails instead of failing silently.
    onError: (error) => {
      console.error("[VideoSDK error]", error);
      toast.error("Video call error", {
        description:
          (error as { message?: string })?.message ?? JSON.stringify(error),
      });
    },
  });

  // Join exactly once (the ref guards against StrictMode's double-invoke in dev,
  // which would otherwise join twice and duplicate participant tiles).
  const hasJoinedRef = useRef(false);
  useEffect(() => {
    if (hasJoinedRef.current) return;
    hasJoinedRef.current = true;
    join();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One unique tile per present participant; your own tile first. VideoSDK's
  // `participants` map excludes the local user and drops anyone who leaves, so the
  // grid self-updates on join/leave.
  const participantIds = useMemo(() => {
    const ids = new Set<string>();
    if (localParticipant?.id) ids.add(localParticipant.id);
    for (const id of participants.keys()) ids.add(id);
    return [...ids];
  }, [participants, localParticipant]);

  const localStream = useLocalWebcamStream();
  const recognition = usePslRecognition({
    stream: localStream,
    enabled: recognitionOn && localWebcamOn,
  });

  if (!joined) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
        <p>Joining meeting…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Meeting <span className="font-mono text-foreground">{meetingId}</span>
        </div>
        <RecognitionStatus
          connection={recognition.connection}
          isSigning={recognition.isSigning}
        />
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_320px]">
        <ParticipantGrid participantIds={participantIds} />

        {/* Matches the grid's height: fills it via an overlay on lg (so a long
            transcript scrolls inside instead of stretching the row), fixed height
            when stacked on mobile. */}
        <div className="relative h-[50vh] min-h-0 lg:h-auto">
          <div className="inset-0 h-full lg:absolute">
            <TranscriptPanel
              transcript={recognition.transcript}
              sentence={recognition.sentence}
              onClear={recognition.clearTranscript}
            />
          </div>
        </div>
      </div>

      {recognitionOn && (
        <CaptionBar
          latest={recognition.latest}
          isSigning={recognition.isSigning}
        />
      )}

      <CallControls
        micOn={localMicOn}
        webcamOn={localWebcamOn}
        recognitionOn={recognitionOn}
        onToggleMic={() => toggleMic()}
        onToggleWebcam={() => toggleWebcam()}
        onToggleRecognition={setRecognitionOn}
        onLeave={() => leave()}
      />
    </div>
  );
}
