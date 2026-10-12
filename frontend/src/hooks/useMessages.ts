import { useMutation, useQueryClient } from "@tanstack/react-query";

import { messagesApi } from "@/api/messages";
import { chatKeys } from "@/hooks/useChats";
import { useSocket } from "@/realtime/SocketContext";

/**
 * Message mutations for an open chat. All go over REST (the source of truth) and
 * invalidate the chat history + list. After each change we emit a `chat-activity`
 * relay so the other participants refetch instantly (real-time push); polling
 * remains only as a fallback.
 */
export function useMessageActions(
  phoneNumber: string,
  chatId: string,
  targetPhones: string[] = [],
) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: chatKeys.history(chatId) });
    queryClient.invalidateQueries({ queryKey: chatKeys.list(phoneNumber) });
  };

  // Tell the recipients their chat changed so they refetch now.
  const notifyAndInvalidate = () => {
    invalidate();
    if (socket && targetPhones.length > 0) {
      socket.emit("chat-activity", {
        chatId,
        targetPhoneNumbers: targetPhones,
      });
    }
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
        chatId,
      ),
    onSuccess: notifyAndInvalidate,
  });

  const edit = useMutation({
    mutationFn: (vars: { messageId: string; newContent: string }) =>
      messagesApi.edit(phoneNumber, vars.messageId, vars.newContent),
    onSuccess: notifyAndInvalidate,
  });

  const remove = useMutation({
    mutationFn: (messageId: string) =>
      messagesApi.remove(phoneNumber, messageId),
    onSuccess: notifyAndInvalidate,
  });

  const pin = useMutation({
    mutationFn: (vars: { messageId: string; isPinned: boolean }) =>
      messagesApi.pin(phoneNumber, vars.messageId, vars.isPinned),
    onSuccess: notifyAndInvalidate,
  });

  const markRead = useMutation({
    mutationFn: (messageId: string) =>
      messagesApi.setReadStatus(phoneNumber, messageId, true),
    onSuccess: notifyAndInvalidate,
  });

  return { send, edit, remove, pin, markRead };
}
