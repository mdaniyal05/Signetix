import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ban,
  Flag,
  Loader2,
  MessageSquare,
  MoreVertical,
  Phone,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { usersApi } from "@/api/users";
import { ApiError } from "@/api/client";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ReportDialog } from "@/components/chat/ReportDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useContacts,
  useRemoveContact,
  useSetContacts,
} from "@/hooks/useContacts";
import { useBlockedUsers, useReportUser, useToggleBlock } from "@/hooks/useModeration";
import { useCreateChat } from "@/hooks/useChats";
import { useCallSignaling } from "@/realtime/CallSignalingProvider";
import { usePresence } from "@/realtime/PresenceContext";

export function ContactsPage() {
  const { session } = useAuth();
  const phone = session?.phoneNumber;
  const navigate = useNavigate();
  const { data: contacts, isLoading } = useContacts(phone);
  const { data: blocked } = useBlockedUsers(phone);
  const removeContact = useRemoveContact(phone ?? "");
  const toggleBlock = useToggleBlock(phone ?? "");
  const reportUser = useReportUser(phone ?? "");
  const createChat = useCreateChat(phone ?? "");
  const { startCall } = useCallSignaling();
  const { isOnline } = usePresence();
  const [reportTarget, setReportTarget] = useState<{
    name: string;
    phoneNumber: string;
  } | null>(null);

  const existingPhones = useMemo(
    () => (contacts ?? []).map((c) => c.contactUserId.phoneNumber),
    [contacts],
  );

  const blockedIds = useMemo(
    () => new Set((blocked ?? []).map((user) => user._id)),
    [blocked],
  );
  const visibleContacts = useMemo(
    () => (contacts ?? []).filter((c) => !blockedIds.has(c.contactUserId._id)),
    [contacts, blockedIds],
  );

  const setBlocked = (targetPhoneNumber: string, block: boolean) =>
    toggleBlock.mutate(
      { targetPhoneNumber, block },
      {
        onSuccess: () => toast.success(block ? "User blocked" : "User unblocked"),
        onError: (error) =>
          toast.error("Could not update block", {
            description: error instanceof Error ? error.message : undefined,
          }),
      },
    );

  const openChat = async (contactPhone: string) => {
    try {
      await createChat.mutateAsync([contactPhone]);
    } catch {
      /* a 400 means the chat already exists — fine, it's in the list */
    }
    navigate("/chats");
  };

  const handleRemove = (targetUserId: string) => {
    if (!session) return;
    removeContact.mutate(
      { userId: session.userId, targetUserId },
      {
        onSuccess: () => toast.success("Contact removed"),
        onError: (error) =>
          toast.error("Could not remove contact", {
            description: error instanceof Error ? error.message : undefined,
          }),
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <p className="text-muted-foreground">
            People you can call and message
          </p>
        </div>
        <AddContactDialog
          existingPhones={existingPhones}
          ownPhone={phone ?? ""}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : visibleContacts.length === 0 && (blocked?.length ?? 0) === 0 ? (
        <EmptyContacts />
      ) : (
        <>
          <ul className="divide-y rounded-xl border bg-card">
            {visibleContacts.map((contact) => (
              <li key={contact._id} className="flex items-center gap-3 p-3">
                <div className="relative shrink-0">
                  <UserAvatar
                    name={contact.contactUserId.name}
                    src={contact.contactUserId.profilePicture}
                  />
                  {isOnline(contact.contactUserId.phoneNumber) && (
                    <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-green-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {contact.contactUserId.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {contact.contactUserId.phoneNumber}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Message"
                    onClick={() => openChat(contact.contactUserId.phoneNumber)}
                  >
                    <MessageSquare />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Voice call"
                    onClick={() =>
                      startCall([contact.contactUserId.phoneNumber], true)
                    }
                  >
                    <Phone />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Video call"
                    onClick={() =>
                      startCall([contact.contactUserId.phoneNumber], false)
                    }
                  >
                    <Video />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" aria-label="More">
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          setReportTarget({
                            name: contact.contactUserId.name,
                            phoneNumber: contact.contactUserId.phoneNumber,
                          })
                        }
                      >
                        <Flag />
                        Report
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setBlocked(contact.contactUserId.phoneNumber, true)
                        }
                      >
                        <Ban />
                        Block
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleRemove(contact.contactUserId._id)}
                      >
                        <X />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            ))}
          </ul>

          {(blocked?.length ?? 0) > 0 && (
            <div className="space-y-2">
              <h2 className="px-1 text-sm font-medium text-muted-foreground">
                Blocked
              </h2>
              <ul className="divide-y rounded-xl border bg-card">
                {blocked!.map((user) => (
                  <li key={user._id} className="flex items-center gap-3 p-3">
                    <UserAvatar name={user.name} src={user.profilePicture} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{user.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {user.phoneNumber}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBlocked(user.phoneNumber, false)}
                    >
                      Unblock
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <ReportDialog
        open={reportTarget !== null}
        name={reportTarget?.name ?? ""}
        onOpenChange={(open) => !open && setReportTarget(null)}
        onSubmit={async (reason) => {
          await reportUser.mutateAsync({
            targetPhoneNumber: reportTarget!.phoneNumber,
            reason,
          });
        }}
      />
    </div>
  );
}

function EmptyContacts() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-12 text-center text-muted-foreground">
      <Users className="size-10" />
      <p className="font-medium text-foreground">No contacts yet</p>
      <p className="text-sm">
        Add a contact by their phone number to get started.
      </p>
    </div>
  );
}

function AddContactDialog({
  existingPhones,
  ownPhone,
}: {
  existingPhones: string[];
  ownPhone: string;
}) {
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const setContacts = useSetContacts(ownPhone);

  const handleAdd = async () => {
    const target = phoneNumber.trim();
    if (!target) return;
    if (target === ownPhone) {
      toast.error("You can't add yourself");
      return;
    }
    if (existingPhones.includes(target)) {
      toast.info("This contact is already added");
      return;
    }
    setSubmitting(true);
    try {
      await usersApi.getByPhone(target); // throws if the user doesn't exist
      await setContacts.mutateAsync([...existingPhones, target]);
      toast.success("Contact added");
      setPhoneNumber("");
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? "No Signetix user has that phone number"
          : error instanceof Error
            ? error.message
            : "Could not add contact";
      toast.error("Could not add contact", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus />
          Add contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add a contact</DialogTitle>
          <DialogDescription>
            Enter the phone number of an existing Signetix user.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="contact-phone">Phone number</Label>
          <Input
            id="contact-phone"
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleAdd()}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleAdd}
            disabled={submitting || !phoneNumber.trim()}
          >
            {submitting && <Loader2 className="animate-spin" />}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
