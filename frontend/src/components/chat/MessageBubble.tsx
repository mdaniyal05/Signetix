import { useState } from "react";
import { MoreVertical, Pin, Reply } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/format";
import type { Message } from "@/types/api";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onTogglePin: (message: Message) => void;
  onSaveEdit: (messageId: string, newContent: string) => void;
}

export function MessageBubble({
  message,
  isOwn,
  onReply,
  onDelete,
  onTogglePin,
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
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
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
        </div>
      </div>

      {!isOwn && (
        <MessageMenu
          message={message}
          isOwn={isOwn}
          onReply={onReply}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
        />
      )}
    </div>
  );
}

function MessageMenu({
  message,
  isOwn,
  onReply,
  onDelete,
  onTogglePin,
  onEdit,
}: {
  message: Message;
  isOwn: boolean;
  onReply: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onTogglePin: (message: Message) => void;
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
        <DropdownMenuItem onClick={() => onReply(message)}>
          <Reply />
          Reply
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
