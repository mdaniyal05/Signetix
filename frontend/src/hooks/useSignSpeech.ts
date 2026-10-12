import { useEffect, useRef } from "react";

import type { TranscriptEntry } from "@/types/recognition";

/** True when the browser supports the Web Speech synthesis API. */
export const speechSupported = (): boolean =>
  typeof window !== "undefined" && "speechSynthesis" in window;

/**
 * Speaks each newly predicted sign out loud (Web Speech API). Tracks the last
 * spoken entry id so a word is read exactly once, and never replays the backlog
 * when speech is toggled on. No-ops when disabled or unsupported.
 */
export function useSignSpeech(
  latest: TranscriptEntry | null,
  enabled: boolean,
): void {
  const lastSpokenId = useRef<string | null>(null);

  useEffect(() => {
    if (!latest) return;

    const isNewWord = lastSpokenId.current !== latest.id;
    lastSpokenId.current = latest.id; // mark seen even when muted, so toggling on won't replay

    if (!enabled || !isNewWord || !speechSupported()) return;

    const utterance = new SpeechSynthesisUtterance(
      latest.word.replace(/_/g, " "),
    );
    utterance.lang = "en-US";
    window.speechSynthesis.cancel(); // drop any queued word; speak the newest
    window.speechSynthesis.speak(utterance);
  }, [latest, enabled]);

  // Stop any in-progress speech when speech is turned off or the component unmounts.
  useEffect(() => {
    if (!enabled && speechSupported()) window.speechSynthesis.cancel();
    return () => {
      if (speechSupported()) window.speechSynthesis.cancel();
    };
  }, [enabled]);
}
