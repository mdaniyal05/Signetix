import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { chatsApi } from "@/api/chats";
import type { Chat } from "@/types/api";

export const chatKeys = {
  list: (phoneNumber: string) => ["chats", phoneNumber] as const,
  history: (chatId: string) => ["chat-history", chatId] as const,
};

// One entry per conversation: collapse chats that share the same member set,
// keeping the most recently active one (guards against any legacy duplicate docs).
function dedupeChatsByMembers(chats: Chat[]): Chat[] {
  const byMembers = new Map<string, Chat>();

  for (const chat of chats) {
    const key = [...new Set((chat.participants ?? []).map((p) => p._id))]
      .sort()
      .join("|");
    const existing = byMembers.get(key);

    if (
      !existing ||
      new Date(chat.lastActivity).getTime() >
        new Date(existing.lastActivity).getTime()
    ) {
      byMembers.set(key, chat);
    }
  }

  return [...byMembers.values()];
}

// Real-time updates arrive via the `chat-activity` socket relay (useChatRealtime).
// These polls are only a fallback for a dropped/unregistered socket.
const CHAT_LIST_POLL_MS = 20_000;
const CHAT_HISTORY_POLL_MS = 15_000;

export function useChats(phoneNumber?: string) {
  return useQuery({
    queryKey: chatKeys.list(phoneNumber ?? ""),
    queryFn: () => chatsApi.listByPhone(phoneNumber!),
    enabled: Boolean(phoneNumber),
    refetchInterval: CHAT_LIST_POLL_MS,
    select: dedupeChatsByMembers,
  });
}

export function useChatHistory(chatId?: string, phoneNumber?: string) {
  return useQuery({
    queryKey: chatKeys.history(chatId ?? ""),
    queryFn: () => chatsApi.history(chatId!, phoneNumber),
    enabled: Boolean(chatId),
    refetchInterval: CHAT_HISTORY_POLL_MS,
  });
}

export function useCreateChat(phoneNumber: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (participants: string[]) =>
      chatsApi.create(phoneNumber, participants),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: chatKeys.list(phoneNumber) }),
  });
}

export function useChatActions(phoneNumber: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: chatKeys.list(phoneNumber) });

  const pin = useMutation({
    mutationFn: ({ chatId, isPinned }: { chatId: string; isPinned: boolean }) =>
      chatsApi.pin(phoneNumber, chatId, isPinned),
    onSuccess: invalidate,
  });
  const archive = useMutation({
    mutationFn: ({
      chatId,
      isArchived,
    }: {
      chatId: string;
      isArchived: boolean;
    }) => chatsApi.archive(phoneNumber, chatId, isArchived),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (chatId: string) => chatsApi.remove(phoneNumber, chatId),
    onSuccess: invalidate,
  });

  return { pin, archive, remove };
}
