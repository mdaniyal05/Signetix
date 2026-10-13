import { useEffect, useMemo, useRef, useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { VIDEOSDK_TOKEN } from "@/config/env";

import { CaptionBar } from "@/components/recognition/CaptionBar";
import { RecognitionStatus } from "@/components/recognition/RecognitionStatus";
import { TranscriptPanel } from "@/components/recognition/TranscriptPanel";
import { useLocalWebcamStream } from "@/hooks/useLocalWebcamStream";
import { usePslRecognition } from "@/hooks/usePslRecognition";
import { useSignSpeech, speechSupported } from "@/hooks/useSignSpeech";
import { CallControls } from "./CallControls";
import { ParticipantGrid } from "./ParticipantGrid";

interface CallViewProps {
  meetingId: string;
  onLeave: () => void;
}

/** Seconds until the token expires (negative = already expired), or null if undecodable. */
function tokenSecondsLeft(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return typeof payload.exp === "number"
      ? payload.exp - Math.floor(Date.now() / 1000)
      : null;
  } catch {
    return null;
  }
}

const JOIN_TIMEOUT_MS = 15000;

/** Inner meeting UI; must be rendered inside a VideoSDK <MeetingProvider>. */
export function CallView({ meetingId, onLeave }: CallViewProps) {
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [recognitionOn, setRecognitionOn] = useState(true);
  const [speechOn, setSpeechOn] = useState(true);

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
    onMeetingJoined: () => {
      joinedRef.current = true;
      setJoined(true);
    },
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

  const joinedRef = useRef(false);

  // Join, retrying until actually connected. A single join() can fire before the
  // SDK socket is ready and silently no-op — fatal in a production build where
  // StrictMode doesn't double-invoke the effect. Retrying bridges that; join() is
  // idempotent once connecting/joined, so extra calls are harmless.
  useEffect(() => {
    const secondsLeft = tokenSecondsLeft(VIDEOSDK_TOKEN);
    if (secondsLeft !== null && secondsLeft <= 0) {
      setJoinError(
        "Your VideoSDK token has expired. Generate a new one and update VITE_VIDEOSDK_TOKEN, then redeploy.",
      );
      return;
    }

    join();
    const retry = window.setInterval(() => {
      if (joinedRef.current) {
        window.clearInterval(retry);
        return;
      }
      join();
    }, 2000);

    return () => window.clearInterval(retry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the meeting never connects, surface it instead of spinning forever.
  useEffect(() => {
    if (joined || joinError) return;
    const timer = window.setTimeout(() => {
      if (!joined) {
        console.error("[VideoSDK] join timed out", {
          tokenPresent: VIDEOSDK_TOKEN.trim().length > 0,
          tokenSecondsLeft: tokenSecondsLeft(VIDEOSDK_TOKEN),
          meetingId,
        });
        setJoinError(
          "Couldn't connect to the meeting. This is usually an expired or invalid VideoSDK token — check VITE_VIDEOSDK_TOKEN in Vercel, then redeploy.",
        );
      }
    }, JOIN_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [joined, joinError, meetingId]);

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

  // Speak each newly recognized sign out loud (when enabled).
  useSignSpeech(recognition.latest, speechOn && recognitionOn);

  if (joinError) {
    return (
      <div className="mx-auto flex h-[70vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-medium">Couldn't join the meeting</p>
        <p className="text-sm text-muted-foreground">{joinError}</p>
        <Button variant="outline" onClick={onLeave}>
          Go back
        </Button>
      </div>
    );
  }

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
        speechOn={speechOn}
        speechSupported={speechSupported()}
        onToggleMic={() => toggleMic()}
        onToggleWebcam={() => toggleWebcam()}
        onToggleRecognition={setRecognitionOn}
        onToggleSpeech={() => setSpeechOn((on) => !on)}
        onLeave={() => leave()}
      />
    </div>
  );
}
