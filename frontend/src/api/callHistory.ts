import { api } from "./client";
import type { CallHistoryLog } from "@/types/api";

const enc = encodeURIComponent;

export const callHistoryApi = {
  listByPhone: (phoneNumber: string) =>
    api.get<CallHistoryLog[]>(`/callHistory/${enc(phoneNumber)}`),

  remove: (phoneNumber: string, callHistoryLogIds: string[]) =>
    api.del("/callHistory/delete", { phoneNumber, callHistoryLogIds }),
};
