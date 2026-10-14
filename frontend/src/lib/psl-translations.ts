import type { PslLanguage } from "@/types/api";

/** Urdu translations of the recognized PSL vocabulary (keys = model labels). */
const URDU_BY_LABEL: Record<string, string> = {
  congratulations: "مبارک ہو",
  excuse_me: "معاف کیجیے",
  good_bye: "خدا حافظ",
  good_morning: "صبح بخیر",
  hello: "سلام",
  how_are_you: "آپ کیسے ہیں؟",
  how_can_i_help_you: "میں آپ کی کیسے مدد کروں؟",
  yes: "جی ہاں",
  thank_you: "شکریہ",
  welcome: "خوش آمدید",
};

/** English label (model uses snake_case) → readable words. */
function englishLabel(word: string): string {
  return word.replace(/_/g, " ");
}

/** Display a recognized sign in the user's chosen language (falls back to English). */
export function signLabel(word: string, language: PslLanguage = "English"): string {
  if (language === "Urdu") return URDU_BY_LABEL[word.toLowerCase()] ?? englishLabel(word);
  return englishLabel(word);
}

/** BCP-47 tag for speech synthesis of the chosen language. */
export function speechLangFor(language: PslLanguage): string {
  return language === "Urdu" ? "ur-PK" : "en-US";
}
