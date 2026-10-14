import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { UserAvatar } from "@/components/common/UserAvatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContacts } from "@/hooks/useContacts";
import type { Message } from "@/types/api";

interface ForwardDialogProps {
  message: Message | null;
  onClose: () => void;
  onForward: (targetPhone: string) => Promise<void>;
}

/** Pick a contact to forward the selected message to (one 1:1 chat). */
export function ForwardDialog({ message, onClose, onForward }: ForwardDialogProps) {
  const { session } = useAuth();
  const { data: contacts, isLoading } = useContacts(session?.phoneNumber);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  const handlePick = async (phone: string) => {
    setPendingPhone(phone);
    try {
      await onForward(phone);
      toast.success("Message forwarded");
      onClose();
    } catch (error) {
      toast.error("Could not forward message", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setPendingPhone(null);
    }
  };

  return (
    <Dialog open={message !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Forward message</DialogTitle>
          <DialogDescription>Choose a contact to forward to.</DialogDescription>
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
                    onClick={() => handlePick(contact.contactUserId.phoneNumber)}
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
