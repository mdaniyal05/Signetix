import { useEffect, useRef } from "react";

import { signLabel, speechLangFor } from "@/lib/psl-translations";
import type { PslLanguage } from "@/types/api";
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
  language: PslLanguage = "English",
): void {
  const lastSpokenId = useRef<string | null>(null);
  const lastSpoken = useRef<{ word: string; at: number }>({ word: "", at: 0 });
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Voices load asynchronously; keep the latest list so we can pick a real one.
  useEffect(() => {
    if (!speechSupported()) return;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener?.("voiceschanged", load);
    return () =>
      window.speechSynthesis.removeEventListener?.("voiceschanged", load);
  }, []);

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

    const voices = voicesRef.current.length
      ? voicesRef.current
      : window.speechSynthesis.getVoices();
    const findVoice = (tag: string) =>
      voices.find((v) => v.lang?.toLowerCase().startsWith(tag.toLowerCase()));

    let text = signLabel(latest.word, language);
    let lang = speechLangFor(language);
    let voice = findVoice(lang.split("-")[0]);

    // Many browsers have no Urdu voice → speaking ur-PK is silent. Fall back to
    // the English label with an English voice so the sign is still read aloud.
    if (!voice && language === "Urdu") {
      text = signLabel(latest.word, "English");
      lang = "en-US";
      voice = findVoice("en");
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    if (voice) utterance.voice = voice;
    window.speechSynthesis.cancel(); // drop any queued word; speak the newest
    window.speechSynthesis.speak(utterance);
  }, [latest, enabled, language]);

  // Stop any in-progress speech when speech is turned off or the component unmounts.
  useEffect(() => {
    if (!enabled && speechSupported()) window.speechSynthesis.cancel();
    return () => {
      if (speechSupported()) window.speechSynthesis.cancel();
    };
  }, [enabled]);
}
