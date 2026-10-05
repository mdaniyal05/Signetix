import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContacts } from "@/hooks/useContacts";
import { useCreateChat } from "@/hooks/useChats";
import type { Chat } from "@/types/api";

interface NewChatDialogProps {
  onCreated: (chatId: string) => void;
}

function extractChatId(result: Chat | Chat[]): string | undefined {
  const chat = Array.isArray(result) ? result[0] : result;
  return chat?._id;
}

export function NewChatDialog({ onCreated }: NewChatDialogProps) {
  const { session } = useAuth();
  const phone = session?.phoneNumber ?? "";
  const { data: contacts, isLoading } = useContacts(phone);
  const createChat = useCreateChat(phone);
  const [open, setOpen] = useState(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  const start = async (contactPhone: string) => {
    setPendingPhone(contactPhone);
    try {
      const result = await createChat.mutateAsync([contactPhone]);
      const chatId = extractChatId(result);
      setOpen(false);
      if (chatId) onCreated(chatId);
    } catch {
      // Likely "chat already exists" — close and let the refreshed list show it.
      setOpen(false);
      toast.info("Opening existing chat");
    } finally {
      setPendingPhone(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="New chat">
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New chat</DialogTitle>
          <DialogDescription>Choose a contact to message.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-80">
          {isLoading ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : !contacts || contacts.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No contacts yet. Add one from the Contacts page.
            </p>
          ) : (
            <ul className="space-y-1">
              {contacts.map((contact) => (
                <li key={contact._id}>
                  <button
                    type="button"
                    disabled={pendingPhone !== null}
                    onClick={() => start(contact.contactUserId.phoneNumber)}
                    className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent disabled:opacity-50"
                  >
                    <UserAvatar
                      name={contact.contactUserId.name}
                      src={contact.contactUserId.profilePicture}
                      className="size-9"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {contact.contactUserId.name}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {contact.contactUserId.phoneNumber}
                      </p>
                    </div>
                    {pendingPhone === contact.contactUserId.phoneNumber && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
