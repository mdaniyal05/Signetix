import { api } from "./client";
import type { Chat, ChatHistory } from "@/types/api";

const enc = encodeURIComponent;

export const chatsApi = {
  listByPhone: (phoneNumber: string) =>
    api.get<Chat[]>(`/chats/${enc(phoneNumber)}`),

  history: (chatId: string, userPhoneNumber?: string) =>
    api.get<ChatHistory>(
      `/chats/custom/id/${enc(chatId)}` +
        (userPhoneNumber ? `?userPhoneNumber=${enc(userPhoneNumber)}` : ""),
    ),

  create: (mainUserPhoneNumber: string, participants: string[]) =>
    api.post<Chat | Chat[]>("/chats/create", {
      mainUserPhoneNumber,
      participants,
    }),

  pin: (userPhoneNumber: string, chatId: string, isPinned: boolean) =>
    api.post("/chats/pin", { userPhoneNumber, chatId, isPinned }),

  archive: (userPhoneNumber: string, chatId: string, isArchived: boolean) =>
    api.post("/chats/archive", { userPhoneNumber, chatId, isArchived }),

  remove: (userPhoneNumber: string, chatId: string) =>
    api.del("/chats/delete", { userPhoneNumber, chatId }),
};
