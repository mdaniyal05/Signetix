import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { chatsApi } from "@/api/chats";

export const chatKeys = {
  list: (phoneNumber: string) => ["chats", phoneNumber] as const,
  history: (chatId: string) => ["chat-history", chatId] as const,
};

// The backend's socket message path is inert (its queue is never initialized),
// so we poll for near-real-time updates instead.
const CHAT_LIST_POLL_MS = 10_000;
const CHAT_HISTORY_POLL_MS = 4_000;

export function useChats(phoneNumber?: string) {
  return useQuery({
    queryKey: chatKeys.list(phoneNumber ?? ""),
    queryFn: () => chatsApi.listByPhone(phoneNumber!),
    enabled: Boolean(phoneNumber),
    refetchInterval: CHAT_LIST_POLL_MS,
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
