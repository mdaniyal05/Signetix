import { useEffect, useMemo, useRef, useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { VIDEOSDK_TOKEN } from "@/config/env";
import { useAuth } from "@/auth/AuthContext";
import { useSettings } from "@/hooks/useSettings";

import { CaptionBar } from "@/components/recognition/CaptionBar";
import { RecognitionStatus } from "@/components/recognition/RecognitionStatus";
import { TranscriptPanel } from "@/components/recognition/TranscriptPanel";
import { useLocalWebcamStream } from "@/hooks/useLocalWebcamStream";
import { usePslRecognition } from "@/hooks/usePslRecognition";
import { useSignSpeech, speechSupported } from "@/hooks/useSignSpeech";
import { useSharedCaptions } from "@/hooks/useSharedCaptions";
import { transcriptToSentence } from "@/lib/recognition-state";
import type { DisplayEntry } from "@/types/recognition";
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

  // Caption/transcript/speech language follows the user's PSL preference.
  const { session } = useAuth();
  const { data: settings } = useSettings(session?.phoneNumber);
  const language = settings?.pslTranslationLanguage ?? "English";

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
  // When join() last actually fired, to debounce rapid re-calls.
  const lastJoinAtRef = useRef(0);

  // Join, retrying only if join() silently no-ops before the SDK socket is ready. Each
  // join() gets a fresh server-assigned id, so firing it twice while an attempt is still
  // connecting spawns a GHOST of you in the grid. safeJoin() debounces calls (2.5s): it
  // absorbs StrictMode's double-invoke and lets a normal connect (1-3s) finish before any
  // retry fires, while still recovering a genuine no-op. Stops once connected.
  useEffect(() => {
    const secondsLeft = tokenSecondsLeft(VIDEOSDK_TOKEN);
    if (secondsLeft !== null && secondsLeft <= 0) {
      setJoinError(
        "Your VideoSDK token has expired. Generate a new one and update VITE_VIDEOSDK_TOKEN, then redeploy.",
      );
      return;
    }

    const safeJoin = () => {
      if (joinedRef.current) return;
      if (Date.now() - lastJoinAtRef.current < 2500) return;
      lastJoinAtRef.current = Date.now();
      join();
    };

    safeJoin();
    const retry = window.setInterval(() => {
      if (joinedRef.current) {
        window.clearInterval(retry);
        return;
      }
      safeJoin();
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

  // Broadcast my signs to the meeting and receive the others', so each side sees
  // what the other is signing (recognition itself only reads the local camera).
  const shared = useSharedCaptions(recognition.latest, localParticipant?.id);

  // Merge my transcript ("You") with the remote participants', oldest first.
  const transcript = useMemo<DisplayEntry[]>(() => {
    const mine: DisplayEntry[] = recognition.transcript.map((entry) => ({
      ...entry,
      speaker: "You",
    }));
    const theirs: DisplayEntry[] = shared.remoteTranscript.map((entry) => ({
      ...entry,
      speaker: entry.speakerName,
    }));
    return [...mine, ...theirs].sort((a, b) => a.at - b.at).slice(-100);
  }, [recognition.transcript, shared.remoteTranscript]);
  const sentence = useMemo(() => transcriptToSentence(transcript), [transcript]);

  // Caption bar shows the most recent sign from anyone, tagged with who signed it.
  const caption = useMemo(() => {
    const mine = recognition.latest
      ? { entry: recognition.latest, speaker: "You" }
      : null;
    const theirs = shared.remoteLatest
      ? { entry: shared.remoteLatest, speaker: shared.remoteLatest.speakerName }
      : null;
    if (mine && theirs) return mine.entry.at >= theirs.entry.at ? mine : theirs;
    return mine ?? theirs;
  }, [recognition.latest, shared.remoteLatest]);

  // Speak only the OTHER person's signs (you read your own on-screen; avoids the mic
  // echoing your device's own speech back into the call).
  useSignSpeech(shared.remoteLatest, speechOn && recognitionOn, language);

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
              transcript={transcript}
              sentence={sentence}
              language={language}
              onClear={() => {
                recognition.clearTranscript();
                shared.clearRemote();
              }}
            />
          </div>
        </div>
      </div>

      {recognitionOn && (
        <CaptionBar
          latest={caption?.entry ?? null}
          speaker={caption?.speaker}
          isSigning={recognition.isSigning}
          language={language}
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
