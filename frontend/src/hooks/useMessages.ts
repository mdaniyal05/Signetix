import { useMutation, useQueryClient } from "@tanstack/react-query";

import { messagesApi } from "@/api/messages";
import { chatKeys } from "@/hooks/useChats";

/**
 * Message mutations for an open chat. All go over REST (the reliable path) and
 * invalidate the chat history + list so polling/refetch reflects the change.
 */
export function useMessageActions(phoneNumber: string, chatId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: chatKeys.history(chatId) });
    queryClient.invalidateQueries({ queryKey: chatKeys.list(phoneNumber) });
  };

  const send = useMutation({
    mutationFn: (vars: {
      targetUserPhoneNumbers: string[];
      message: string;
      replyToId?: string;
    }) =>
      messagesApi.create(
        phoneNumber,
        vars.targetUserPhoneNumbers,
        vars.message,
        vars.replyToId,
      ),
    onSuccess: invalidate,
  });

  const edit = useMutation({
    mutationFn: (vars: { messageId: string; newContent: string }) =>
      messagesApi.edit(phoneNumber, vars.messageId, vars.newContent),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (messageId: string) =>
      messagesApi.remove(phoneNumber, messageId),
    onSuccess: invalidate,
  });

  const pin = useMutation({
    mutationFn: (vars: { messageId: string; isPinned: boolean }) =>
      messagesApi.pin(phoneNumber, vars.messageId, vars.isPinned),
    onSuccess: invalidate,
  });

  const markRead = useMutation({
    mutationFn: (messageId: string) =>
      messagesApi.setReadStatus(phoneNumber, messageId, true),
    onSuccess: invalidate,
  });

  return { send, edit, remove, pin, markRead };
}
