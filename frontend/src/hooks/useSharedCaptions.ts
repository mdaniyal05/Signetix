import { useCallback, useEffect, useRef, useState } from "react";
import { usePubSub } from "@videosdk.live/react-sdk";

import type { RemoteCaptionEntry, TranscriptEntry } from "@/types/recognition";

const CAPTION_TOPIC = "PSL_CAPTION";
const MAX_REMOTE_ENTRIES = 100;

/**
 * Shares recognized signs across the meeting: publishes each of this participant's
 * finalized signs and collects the other participants', so every side sees what the
 * others are signing (recognition itself is local-only). Must run inside a VideoSDK
 * <MeetingProvider>.
 */
export function useSharedCaptions(
  localLatest: TranscriptEntry | null,
  selfId: string | undefined,
) {
  const [remoteTranscript, setRemoteTranscript] = useState<RemoteCaptionEntry[]>(
    [],
  );
  const [remoteLatest, setRemoteLatest] = useState<RemoteCaptionEntry | null>(
    null,
  );

  const { publish } = usePubSub(CAPTION_TOPIC, {
    onMessageReceived: (msg) => {
      // Ignore the echo of our own publishes.
      if (selfId && msg.senderId === selfId) return;
      let word = "";
      let confidence = 0;
      try {
        const parsed = JSON.parse(msg.message) as {
          word?: string;
          confidence?: number;
        };
        word = String(parsed.word ?? "");
        confidence = Number(parsed.confidence ?? 0);
      } catch {
        return;
      }
      if (!word) return;
      const at = Date.now();
      const entry: RemoteCaptionEntry = {
        id: `${msg.senderId}-${at}-${word}`,
        word,
        confidence,
        at,
        speakerId: msg.senderId,
        speakerName: msg.senderName || "Participant",
      };
      setRemoteLatest(entry);
      setRemoteTranscript((prev) =>
        [...prev, entry].slice(-MAX_REMOTE_ENTRIES),
      );
    },
  });

  // Publish each new local prediction once (keyed by id).
  const lastPublishedId = useRef<string | null>(null);
  useEffect(() => {
    if (!localLatest || lastPublishedId.current === localLatest.id) return;
    lastPublishedId.current = localLatest.id;
    publish(
      JSON.stringify({
        word: localLatest.word,
        confidence: localLatest.confidence,
      }),
      { persist: false },
    );
  }, [localLatest, publish]);

  const clearRemote = useCallback(() => {
    setRemoteLatest(null);
    setRemoteTranscript([]);
  }, []);

  return { remoteLatest, remoteTranscript, clearRemote };
}
