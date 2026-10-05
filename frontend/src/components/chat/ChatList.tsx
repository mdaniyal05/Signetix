import { useMemo } from "react";

import { useAuth } from "@/auth/AuthContext";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatListTimestamp } from "@/lib/format";
import { useChats } from "@/hooks/useChats";
import type { Chat } from "@/types/api";
import { NewChatDialog } from "./NewChatDialog";

interface ChatListProps {
  activeChatId?: string;
  onSelect: (chatId: string) => void;
}

export function ChatList({ activeChatId, onSelect }: ChatListProps) {
  const { session } = useAuth();
  const myId = session?.userId;
  const { data: chats, isLoading } = useChats(session?.phoneNumber);

  const titleFor = useMemo(
    () => (chat: Chat) =>
      chat.participants
        .filter((p) => p._id !== myId)
        .map((p) => p.name)
        .join(", ") || "Chat",
    [myId],
  );

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex items-center justify-between border-b p-3">
        <h2 className="text-lg font-semibold">Chats</h2>
        <NewChatDialog onCreated={onSelect} />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !chats || chats.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No chats yet. Start one with the + button.
          </p>
        ) : (
          <ul>
            {chats.map((chat) => {
              const other = chat.participants.find((p) => p._id !== myId);
              return (
                <li key={chat._id}>
                  <button
                    type="button"
                    onClick={() => onSelect(chat._id)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b p-3 text-left transition-colors hover:bg-accent",
                      activeChatId === chat._id && "bg-accent",
                    )}
                  >
                    <UserAvatar
                      name={titleFor(chat)}
                      src={other?.profilePicture}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium">{titleFor(chat)}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatListTimestamp(chat.lastActivity)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm text-muted-foreground">
                          {chat.lastMessage}
                        </p>
                        {Boolean(chat.unreadCount) && (
                          <Badge className="shrink-0">{chat.unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
