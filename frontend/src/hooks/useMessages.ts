import { useMutation, useQueryClient } from "@tanstack/react-query";

import { messagesApi } from "@/api/messages";
import { reactionsApi } from "@/api/reactions";
import { chatKeys } from "@/hooks/useChats";
import { useSocket } from "@/realtime/SocketContext";
import type { ReactionType } from "@/types/api";

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
      media?: { mediaUrl: string; mediaType: string };
    }) =>
      messagesApi.create(
        phoneNumber,
        vars.targetUserPhoneNumbers,
        vars.message,
        vars.replyToId,
        chatId,
        vars.media,
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

  const react = useMutation({
    mutationFn: (vars: { messageId: string; type: ReactionType }) =>
      reactionsApi.toggle(phoneNumber, vars.messageId, vars.type),
    onSuccess: notifyAndInvalidate,
  });

  // Forwarding goes to a different chat; invalidate my list and ping those recipients.
  const forward = useMutation({
    mutationFn: (vars: { messageId: string; targetUserPhoneNumbers: string[] }) =>
      messagesApi.forward(phoneNumber, vars.messageId, vars.targetUserPhoneNumbers),
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.list(phoneNumber) });
      if (socket && data?.chatId && vars.targetUserPhoneNumbers.length > 0) {
        socket.emit("chat-activity", {
          chatId: data.chatId,
          targetPhoneNumbers: vars.targetUserPhoneNumbers,
        });
      }
    },
  });

  return { send, edit, remove, pin, markRead, forward, react };
}
