import { useState } from "react";
import {
  Check,
  CheckCheck,
  Forward,
  Heart,
  Laugh,
  MoreVertical,
  Pin,
  Reply,
  ThumbsUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/format";
import type { Message, ReactionType } from "@/types/api";

const REACTIONS: { type: ReactionType; Icon: typeof ThumbsUp; label: string }[] = [
  { type: "like", Icon: ThumbsUp, label: "Like" },
  { type: "love", Icon: Heart, label: "Love" },
  { type: "laugh", Icon: Laugh, label: "Laugh" },
];

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  myId?: string;
  onReply: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onTogglePin: (message: Message) => void;
  onForward: (message: Message) => void;
  onReact: (message: Message, type: ReactionType) => void;
  onSaveEdit: (messageId: string, newContent: string) => void;
}

export function MessageBubble({
  message,
  isOwn,
  myId,
  onReply,
  onDelete,
  onTogglePin,
  onForward,
  onReact,
  onSaveEdit,
}: MessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  if (message.isDeleted) {
    return (
      <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
        <div className="rounded-2xl bg-muted px-4 py-2 text-sm italic text-muted-foreground">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex gap-2",
        isOwn ? "justify-end" : "justify-start",
      )}
    >
      {isOwn && !editing && (
        <MessageMenu
          message={message}
          isOwn={isOwn}
          onReply={onReply}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
          onForward={onForward}
          onReact={onReact}
          onEdit={() => {
            setDraft(message.content);
            setEditing(true);
          }}
        />
      )}

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
          isOwn
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {!isOwn && (
          <p className="mb-0.5 text-xs font-medium opacity-80">
            {message.senderId?.name}
          </p>
        )}

        {message.replyToId && (
          <div
            className={cn(
              "mb-1 rounded-md border-l-2 px-2 py-1 text-xs",
              isOwn
                ? "border-primary-foreground/50 bg-black/10"
                : "border-primary/40 bg-background/60",
            )}
          >
            <span className="font-medium">
              {message.replyToId.senderId?.name ?? "Reply"}
            </span>
            <p className="line-clamp-2 opacity-80">
              {message.replyToId.content}
            </p>
          </div>
        )}

        {message.mediaUrl && <Attachment message={message} />}

        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="min-h-16 bg-background text-foreground"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const trimmed = draft.trim();
                  if (trimmed && trimmed !== message.content) {
                    onSaveEdit(message._id, trimmed);
                  }
                  setEditing(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          message.content && (
            <p className="whitespace-pre-wrap wrap-break-word">
              {message.content}
            </p>
          )
        )}

        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-[10px]",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {message.isPinned && <Pin className="size-3" />}
          {message.isEdited && <span>edited</span>}
          <span>{formatTime(message.createdAt)}</span>
          {isOwn &&
            (message.isRead ? (
              <CheckCheck className="size-3.5" aria-label="Read" />
            ) : (
              <Check className="size-3.5" aria-label="Sent" />
            ))}
        </div>

        <ReactionPills
          message={message}
          isOwn={isOwn}
          myId={myId}
          onReact={onReact}
        />
      </div>

      {!isOwn && (
        <MessageMenu
          message={message}
          isOwn={isOwn}
          onReply={onReply}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
          onForward={onForward}
          onReact={onReact}
        />
      )}
    </div>
  );
}

// Renders a chat attachment: image/video inline, anything else as a download link.
function Attachment({ message }: { message: Message }) {
  const url = message.mediaUrl!;
  const type = message.mediaType ?? "";
  const isImage = type.startsWith("image/");
  const isVideo = type.startsWith("video/");

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mb-1 block">
        <img
          src={url}
          alt="attachment"
          className="max-h-64 w-full rounded-lg object-cover"
        />
      </a>
    );
  }
  if (isVideo) {
    return <video src={url} controls className="mb-1 max-h-64 w-full rounded-lg" />;
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mb-1 block underline opacity-90"
    >
      View attachment
    </a>
  );
}

// Reaction pills under a bubble: one per type present, counts, caller's own highlighted.
function ReactionPills({
  message,
  isOwn,
  myId,
  onReact,
}: {
  message: Message;
  isOwn: boolean;
  myId?: string;
  onReact: (message: Message, type: ReactionType) => void;
}) {
  const reactions = message.reactions ?? [];
  if (reactions.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {REACTIONS.map(({ type, Icon }) => {
        const forType = reactions.filter((reaction) => reaction.type === type);
        if (forType.length === 0) return null;
        const mine = myId != null && forType.some((reaction) => reaction.userId === myId);
        return (
          <button
            key={type}
            type="button"
            onClick={() => onReact(message, type)}
            className={cn(
              "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]",
              isOwn ? "bg-black/15" : "bg-background/70",
              mine && "ring-1 ring-current",
            )}
          >
            <Icon className="size-3" />
            {forType.length}
          </button>
        );
      })}
    </div>
  );
}

function MessageMenu({
  message,
  isOwn,
  onReply,
  onDelete,
  onTogglePin,
  onForward,
  onReact,
  onEdit,
}: {
  message: Message;
  isOwn: boolean;
  onReply: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onTogglePin: (message: Message) => void;
  onForward: (message: Message) => void;
  onReact: (message: Message, type: ReactionType) => void;
  onEdit?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="size-7 self-center opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Message actions"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isOwn ? "end" : "start"}>
        <div className="flex justify-around px-1 py-0.5">
          {REACTIONS.map(({ type, Icon, label }) => (
            <Button
              key={type}
              size="icon"
              variant="ghost"
              className="size-8"
              aria-label={label}
              onClick={() => onReact(message, type)}
            >
              <Icon className="size-4" />
            </Button>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onReply(message)}>
          <Reply />
          Reply
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onForward(message)}>
          <Forward />
          Forward
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTogglePin(message)}>
          <Pin />
          {message.isPinned ? "Unpin" : "Pin"}
        </DropdownMenuItem>
        {isOwn && onEdit && (
          <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
        )}
        {isOwn && (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete(message._id)}
          >
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
