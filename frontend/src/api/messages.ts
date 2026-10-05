import { api } from "./client";
import type { Message } from "@/types/api";

const enc = encodeURIComponent;

export const messagesApi = {
  create: (
    mainUserPhoneNumber: string,
    targetUserPhoneNumbers: string[],
    message: string,
    replyToId?: string,
  ) =>
    api.post<Message & { chatId: string }>("/messages/create", {
      mainUserPhoneNumber,
      targetUserPhoneNumbers,
      message,
      replyToId,
    }),

  edit: (senderPhoneNumber: string, messageId: string, newContent: string) =>
    api.put("/messages/edit", { senderPhoneNumber, messageId, newContent }),

  remove: (senderPhoneNumber: string, messageId: string) =>
    api.del("/messages/delete", { senderPhoneNumber, messageId }),

  pin: (userPhoneNumber: string, messageId: string, isPinned: boolean) =>
    api.post("/messages/pin", { userPhoneNumber, messageId, isPinned }),

  setReadStatus: (
    userPhoneNumber: string,
    messageId: string,
    isRead: boolean,
  ) =>
    api.post("/messages/read-status", {
      userPhoneNumber,
      messageId,
      isRead,
    }),

  unreadCount: (phoneNumber: string, chatId?: string) =>
    api.get<{ unreadCount: number } | number>(
      `/messages/unread-count/${enc(phoneNumber)}` +
        (chatId ? `/${enc(chatId)}` : ""),
    ),
};
