import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/auth/AuthContext";
import { useSocket } from "@/realtime/SocketContext";
import { chatKeys } from "@/hooks/useChats";

/**
 * Subscribes to the backend's `chat-activity` relay and refetches the affected
 * chat the instant a message is sent/edited/deleted/pinned by someone else.
 * Mounted once in the app shell. REST stays the source of truth; this is the
 * real-time "refetch now" signal that replaces waiting for the poll.
 */
export function useChatRealtime(): void {
  const { socket } = useSocket();
  const { session } = useAuth();
  const myPhone = session?.phoneNumber;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const onActivity = (data: { chatId?: string }) => {
      if (data?.chatId) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.history(data.chatId),
        });
      }
      if (myPhone) {
        queryClient.invalidateQueries({ queryKey: chatKeys.list(myPhone) });
      }
    };

    socket.on("chat-activity", onActivity);
    return () => {
      socket.off("chat-activity", onActivity);
    };
  }, [socket, myPhone, queryClient]);
}
