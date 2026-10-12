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
/** Ignore a repeat of the same word within this window (coalesces duplicate
 *  predictions / a sign split into two so it's spoken once). */
const SAME_WORD_COOLDOWN_MS = 1500;

export function useSignSpeech(
  latest: TranscriptEntry | null,
  enabled: boolean,
): void {
  const lastSpokenId = useRef<string | null>(null);
  const lastSpoken = useRef<{ word: string; at: number }>({ word: "", at: 0 });

  useEffect(() => {
    if (!latest) return;

    const isNewEntry = lastSpokenId.current !== latest.id;
    lastSpokenId.current = latest.id; // mark seen even when muted, so toggling on won't replay

    if (!enabled || !isNewEntry || !speechSupported()) return;

    // Skip a repeat of the same word fired in quick succession.
    const now = Date.now();
    const isDuplicate =
      lastSpoken.current.word === latest.word &&
      now - lastSpoken.current.at < SAME_WORD_COOLDOWN_MS;
    if (isDuplicate) return;
    lastSpoken.current = { word: latest.word, at: now };

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
