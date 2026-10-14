import { useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  MoreVertical,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatListTimestamp } from "@/lib/format";
import { useChats, useChatActions } from "@/hooks/useChats";
import { usePresence } from "@/realtime/PresenceContext";
import type { Chat } from "@/types/api";
import { NewChatDialog } from "./NewChatDialog";

interface ChatListProps {
  activeChatId?: string;
  onSelect: (chatId: string) => void;
}

export function ChatList({ activeChatId, onSelect }: ChatListProps) {
  const { session } = useAuth();
  const myId = session?.userId;
  const myPhone = session?.phoneNumber ?? "";
  const { isOnline } = usePresence();
  const { data: chats, isLoading } = useChats(session?.phoneNumber);
  const { pin, archive, remove } = useChatActions(myPhone);
  const [showArchived, setShowArchived] = useState(false);

  const titleFor = useMemo(
    () => (chat: Chat) =>
      chat.participants
        .filter((p) => p._id !== myId)
        .map((p) => p.name)
        .join(", ") || "Chat",
    [myId],
  );

  // Split archived from active, then sort pinned-first by recency.
  const { active, archived } = useMemo(() => {
    const byRecency = (a: Chat, b: Chat) =>
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    const isPinned = (c: Chat) => Boolean(myId && c.pinnedBy?.includes(myId));
    const all = chats ?? [];
    const archivedChats = all.filter((c) => myId && c.archivedBy?.includes(myId));
    const activeChats = all
      .filter((c) => !(myId && c.archivedBy?.includes(myId)))
      .sort((a, b) =>
        isPinned(a) === isPinned(b) ? byRecency(a, b) : isPinned(a) ? -1 : 1,
      );
    return { active: activeChats, archived: archivedChats.sort(byRecency) };
  }, [chats, myId]);

  const runAction = (promise: Promise<unknown>, failMessage: string) =>
    promise.catch((error) =>
      toast.error(failMessage, {
        description: error instanceof Error ? error.message : undefined,
      }),
    );

  const renderRow = (chat: Chat) => {
    const other = chat.participants.find((p) => p._id !== myId);
    const pinned = Boolean(myId && chat.pinnedBy?.includes(myId));
    const isArchived = Boolean(myId && chat.archivedBy?.includes(myId));
    return (
      <li key={chat._id} className="relative">
        <button
          type="button"
          onClick={() => onSelect(chat._id)}
          className={cn(
            "flex w-full items-center gap-3 border-b p-3 pr-10 text-left transition-colors hover:bg-accent",
            activeChatId === chat._id && "bg-accent",
          )}
        >
          <div className="relative shrink-0">
            <UserAvatar name={titleFor(chat)} src={other?.profilePicture} />
            {isOnline(other?.phoneNumber) && (
              <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-green-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="flex min-w-0 items-center gap-1 font-medium">
                {pinned && <Pin className="size-3 shrink-0 text-muted-foreground" />}
                <span className="truncate">{titleFor(chat)}</span>
              </p>
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

        <div className="absolute right-1 top-1/2 -translate-y-1/2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-muted-foreground"
                aria-label="Chat actions"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  runAction(
                    pin.mutateAsync({ chatId: chat._id, isPinned: !pinned }),
                    "Could not update chat",
                  )
                }
              >
                {pinned ? <PinOff /> : <Pin />}
                {pinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  runAction(
                    archive.mutateAsync({
                      chatId: chat._id,
                      isArchived: !isArchived,
                    }),
                    "Could not update chat",
                  )
                }
              >
                {isArchived ? <ArchiveRestore /> : <Archive />}
                {isArchived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() =>
                  runAction(
                    remove.mutateAsync(chat._id).then(() => {
                      if (activeChatId === chat._id) onSelect("");
                    }),
                    "Could not delete chat",
                  )
                }
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </li>
    );
  };

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
        ) : active.length === 0 && archived.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No chats yet. Start one with the + button.
          </p>
        ) : (
          <>
            <ul>{active.map(renderRow)}</ul>

            {archived.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowArchived((v) => !v)}
                  className="flex w-full items-center gap-2 border-b bg-muted/40 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  <Archive className="size-4" />
                  Archived
                  <Badge variant="secondary" className="ml-1">
                    {archived.length}
                  </Badge>
                  <ChevronDown
                    className={cn(
                      "ml-auto size-4 transition-transform",
                      showArchived && "rotate-180",
                    )}
                  />
                </button>
                {showArchived && <ul>{archived.map(renderRow)}</ul>}
              </div>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
}
