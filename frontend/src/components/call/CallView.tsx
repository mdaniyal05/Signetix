import { useEffect, useMemo, useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { Loader2 } from "lucide-react";

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
    localMicOn,
    localWebcamOn,
  } = useMeeting({
    onMeetingJoined: () => setJoined(true),
    onMeetingLeft: onLeave,
  });

  // Join once when the provider is ready.
  useEffect(() => {
    join();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const participantIds = useMemo(
    () => [...participants.keys()],
    [participants],
  );

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

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="relative">
          <ParticipantGrid participantIds={participantIds} />
          {recognitionOn && (
            <CaptionBar
              latest={recognition.latest}
              isSigning={recognition.isSigning}
              className="absolute inset-x-0 bottom-4"
            />
          )}
        </div>

        <div className="h-[60vh] lg:h-auto">
          <TranscriptPanel
            transcript={recognition.transcript}
            sentence={recognition.sentence}
            onClear={recognition.clearTranscript}
          />
        </div>
      </div>

      <CallControls
        micOn={localMicOn}
        webcamOn={localWebcamOn}
        recognitionOn={recognitionOn}
        onToggleMic={toggleMic}
        onToggleWebcam={toggleWebcam}
        onToggleRecognition={setRecognitionOn}
        onLeave={leave}
      />
    </div>
  );
}
