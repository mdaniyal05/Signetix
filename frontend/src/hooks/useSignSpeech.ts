import { useEffect, useRef } from "react";

import { signLabel, speechLangFor } from "@/lib/psl-translations";
import type { PslLanguage } from "@/types/api";
import type { TranscriptEntry } from "@/types/recognition";

/** True when the browser supports the Web Speech synthesis API. */
export const speechSupported = (): boolean =>
  typeof window !== "undefined" && "speechSynthesis" in window;

// Ignore a repeat of the same word within this window (coalesces duplicates).
const SAME_WORD_COOLDOWN_MS = 1500;

/** Speaks each newly predicted sign once (Web Speech API); no-op if disabled/unsupported. */
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

    // No Urdu voice in many browsers → fall back to the English label/voice.
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
