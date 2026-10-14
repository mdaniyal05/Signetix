import { api } from "./client";
import type { Reaction, ReactionType } from "@/types/api";

export const reactionsApi = {
  toggle: (userPhoneNumber: string, messageId: string, type: ReactionType) =>
    api.post<{ messageId: string; reactions: Reaction[] }>("/reactions/toggle", {
      userPhoneNumber,
      messageId,
      type,
    }),
};
