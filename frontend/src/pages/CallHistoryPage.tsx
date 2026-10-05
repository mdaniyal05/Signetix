import { useMemo } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  PhoneCall,
  PhoneMissed,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDuration, formatListTimestamp } from "@/lib/format";
import { useCallHistory, useDeleteCallLogs } from "@/hooks/useCallHistory";
import { useCallSignaling } from "@/realtime/CallSignalingProvider";
import type { CallHistoryLog, UserRef } from "@/types/api";

export function CallHistoryPage() {
  const { session } = useAuth();
  const phone = session?.phoneNumber;
  const myId = session?.userId;
  const { data: logs, isLoading } = useCallHistory(phone);
  const deleteLogs = useDeleteCallLogs(phone ?? "");
  const { startCall } = useCallSignaling();

  const visibleLogs = useMemo(
    () => (logs ?? []).filter((log) => !log.deletedBy?.includes(myId ?? "")),
    [logs, myId],
  );

  const otherParty = (log: CallHistoryLog): UserRef => {
    const others = log.participants.filter((p) => p._id !== myId);
    return others[0] ?? log.initiatorId;
  };

  const handleDelete = (logId: string) => {
    deleteLogs.mutate([logId], {
      onSuccess: () => toast.success("Call removed"),
      onError: (error) =>
        toast.error("Could not remove call", {
          description: error instanceof Error ? error.message : undefined,
        }),
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Call history</h1>
        <p className="text-muted-foreground">
          Your recent voice and video calls
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : visibleLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          <PhoneCall className="size-10" />
          <p className="font-medium text-foreground">No calls yet</p>
          <p className="text-sm">Your call history will appear here.</p>
        </div>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {visibleLogs.map((log) => {
            const other = otherParty(log);
            const isOutgoing = log.initiatorId._id === myId;
            const missed = log.callStatus !== "accepted";
            return (
              <li key={log._id} className="flex items-center gap-3 p-3">
                <UserAvatar name={other.name} src={other.profilePicture} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{other.name}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    {missed ? (
                      <PhoneMissed className="size-3.5 text-destructive" />
                    ) : isOutgoing ? (
                      <ArrowUpRight className="size-3.5 text-emerald-500" />
                    ) : (
                      <ArrowDownLeft className="size-3.5 text-emerald-500" />
                    )}
                    <span
                      className={cn("capitalize", missed && "text-destructive")}
                    >
                      {log.callStatus}
                    </span>
                    {log.callStatus === "accepted" && (
                      <span>· {formatDuration(log.callDurationInSeconds)}</span>
                    )}
                  </p>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {formatListTimestamp(log.initiatedAt ?? log.createdAt ?? "")}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Call again"
                  onClick={() =>
                    startCall([other.phoneNumber], log.callType === "voice")
                  }
                >
                  {log.callType === "voice" ? <PhoneCall /> : <Video />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Delete"
                  onClick={() => handleDelete(log._id)}
                >
                  <Trash2 />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
