import { api } from "./client";
import type { PslLanguage, Settings, Theme } from "@/types/api";

const enc = encodeURIComponent;

export interface UpdateSettingsPayload {
  phoneNumber: string;
  theme?: Theme;
  autoDownload?: boolean;
  notificationEnabled?: boolean;
  pslTranslationLanguage?: PslLanguage;
}

export const settingsApi = {
  /** The backend returns an array; callers typically use the first element. */
  getByPhone: (phoneNumber: string) =>
    api.get<Settings[]>(`/settings/${enc(phoneNumber)}`),

  update: (payload: UpdateSettingsPayload) =>
    api.put<Settings>("/settings/update", payload),
};
