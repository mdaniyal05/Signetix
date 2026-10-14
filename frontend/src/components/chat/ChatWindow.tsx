import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  ArrowLeft,
  Ban,
  Flag,
  Loader2,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { cloudinaryApi } from "@/api/cloudinary";
import { UserAvatar } from "@/components/common/UserAvatar";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ForwardDialog } from "@/components/chat/ForwardDialog";
import { ReportDialog } from "@/components/chat/ReportDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useChatHistory } from "@/hooks/useChats";
import { useMessageActions } from "@/hooks/useMessages";
import {
  useBlockedUsers,
  useReportUser,
  useToggleBlock,
} from "@/hooks/useModeration";
import { useCallSignaling } from "@/realtime/CallSignalingProvider";
import { usePresence } from "@/realtime/PresenceContext";
import type { Chat, Message, UserRef } from "@/types/api";

interface ChatWindowProps {
  chatId: string;
  chat?: Chat;
  onBack?: () => void;
}

export function ChatWindow({ chatId, chat, onBack }: ChatWindowProps) {
  const { session } = useAuth();
  const myId = session?.userId;
  const myPhone = session?.phoneNumber ?? "";
  const { data: history, isLoading } = useChatHistory(chatId, myPhone);
  const { startCall } = useCallSignaling();
  const { isOnline } = usePresence();

  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [forwarding, setForwarding] = useState<Message | null>(null);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const markedRef = useRef<Set<string>>(new Set());
  const attachInputRef = useRef<HTMLInputElement>(null);

  const messages = useMemo(() => history?.messages ?? [], [history]);

  // Other participants (for titles and call/message targets).
  const others = useMemo<UserRef[]>(() => {
    const fromChat = (chat?.participants ?? []).filter((p) => p._id !== myId);
    if (fromChat.length > 0) return fromChat;
    const map = new Map<string, UserRef>();
    for (const message of messages) {
      if (message.senderId && message.senderId._id !== myId) {
        map.set(message.senderId._id, message.senderId);
      }
      for (const receiver of message.receiverIds ?? []) {
        if (receiver._id !== myId) map.set(receiver._id, receiver);
      }
    }
    return [...map.values()];
  }, [chat, messages, myId]);

  const title = others.map((p) => p.name).join(", ") || "Chat";
  const targetPhones = others.map((p) => p.phoneNumber);
  const actions = useMessageActions(myPhone, chatId, targetPhones);
  const anyOnline = others.some((p) => isOnline(p.phoneNumber));

  // Moderation applies to a 1:1 chat's other participant.
  const otherUser = others.length === 1 ? others[0] : null;
  const { data: blocked } = useBlockedUsers(otherUser ? myPhone : undefined);
  const toggleBlock = useToggleBlock(myPhone);
  const reportUser = useReportUser(myPhone);
  const [reporting, setReporting] = useState(false);
  const isBlocked = Boolean(
    otherUser && blocked?.some((user) => user._id === otherUser._id),
  );

  const handleToggleBlock = () => {
    if (!otherUser) return;
    toggleBlock.mutate(
      { targetPhoneNumber: otherUser.phoneNumber, block: !isBlocked },
      {
        onSuccess: () =>
          toast.success(isBlocked ? "User unblocked" : "User blocked"),
        onError: (error) =>
          toast.error("Could not update block", {
            description: error instanceof Error ? error.message : undefined,
          }),
      },
    );
  };

  // Auto-scroll on new messages.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Mark incoming unread messages as read (once each).
  useEffect(() => {
    for (const message of messages) {
      const isIncoming = message.senderId?._id !== myId;
      if (
        isIncoming &&
        !message.isRead &&
        !message.isDeleted &&
        !markedRef.current.has(message._id)
      ) {
        markedRef.current.add(message._id);
        actions.markRead.mutate(message._id);
      }
    }
  }, [messages, myId, actions.markRead]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    if (targetPhones.length === 0) {
      toast.error("No recipients found for this chat");
      return;
    }
    actions.send.mutate(
      {
        targetUserPhoneNumbers: targetPhones,
        message: text,
        replyToId: replyTo?._id,
      },
      {
        onError: (error) =>
          toast.error("Message failed to send", {
            description: error instanceof Error ? error.message : undefined,
          }),
      },
    );
    setDraft("");
    setReplyTo(null);
  };

  const handleAttach = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (targetPhones.length === 0) {
      toast.error("No recipients found for this chat");
      return;
    }
    setUploading(true);
    try {
      const mediaUrl = await cloudinaryApi.uploadMedia(myPhone, file);
      actions.send.mutate({
        targetUserPhoneNumbers: targetPhones,
        message: draft.trim(),
        media: { mediaUrl, mediaType: file.type },
      });
      setDraft("");
    } catch (error) {
      toast.error("Attachment failed to send", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b bg-background p-3">
        {onBack && (
          <Button
            size="icon"
            variant="ghost"
            className="sm:hidden"
            onClick={onBack}
          >
            <ArrowLeft />
          </Button>
        )}
        <UserAvatar
          name={title}
          src={others[0]?.profilePicture}
          className="size-9"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {anyOnline ? (
              <span className="text-green-600 dark:text-green-500">Online</span>
            ) : (
              others.map((p) => p.phoneNumber).join(", ")
            )}
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Voice call"
          disabled={targetPhones.length === 0}
          onClick={() => startCall(targetPhones, true)}
        >
          <Phone />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Video call"
          disabled={targetPhones.length === 0}
          onClick={() => startCall(targetPhones, false)}
        >
          <Video />
        </Button>
        {otherUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Chat options">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setReporting(true)}>
                <Flag />
                Report
              </DropdownMenuItem>
              <DropdownMenuItem
                variant={isBlocked ? "default" : "destructive"}
                onClick={handleToggleBlock}
              >
                <Ban />
                {isBlocked ? "Unblock" : "Block"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      <ScrollArea className="min-h-0 flex-1 bg-muted/20">
        <div className="flex flex-col gap-3 p-4">
          {isLoading ? (
            <div className="flex justify-center py-8 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No messages yet. Say hello!
            </p>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.senderId?._id === myId}
                myId={myId}
                onReply={setReplyTo}
                onForward={setForwarding}
                onReact={(m, type) =>
                  actions.react.mutate({ messageId: m._id, type })
                }
                onDelete={(id) => actions.remove.mutate(id)}
                onTogglePin={(m) =>
                  actions.pin.mutate({
                    messageId: m._id,
                    isPinned: !m.isPinned,
                  })
                }
                onSaveEdit={(id, newContent) =>
                  actions.edit.mutate({ messageId: id, newContent })
                }
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {replyTo && (
        <div className="flex items-center gap-2 border-t bg-background px-4 py-2 text-sm">
          <div className="min-w-0 flex-1">
            <p className="font-medium">Replying to {replyTo.senderId?.name}</p>
            <p className="truncate text-muted-foreground">{replyTo.content}</p>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setReplyTo(null)}>
            <X />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2 border-t bg-background p-3">
        <input
          ref={attachInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleAttach}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => attachInputRef.current?.click()}
          disabled={uploading || targetPhones.length === 0}
          aria-label="Attach file"
        >
          {uploading ? <Loader2 className="animate-spin" /> : <Paperclip />}
        </Button>
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          className="max-h-32 min-h-10 flex-1 resize-none"
          rows={1}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!draft.trim() || actions.send.isPending}
          aria-label="Send"
        >
          {actions.send.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Send />
          )}
        </Button>
      </div>

      <ForwardDialog
        message={forwarding}
        onClose={() => setForwarding(null)}
        onForward={async (targetPhone) => {
          await actions.forward.mutateAsync({
            messageId: forwarding!._id,
            targetUserPhoneNumbers: [targetPhone],
          });
        }}
      />

      {otherUser && (
        <ReportDialog
          open={reporting}
          name={otherUser.name}
          onOpenChange={setReporting}
          onSubmit={async (reason) => {
            await reportUser.mutateAsync({
              targetPhoneNumber: otherUser.phoneNumber,
              reason,
            });
          }}
        />
      )}
    </div>
  );
}
