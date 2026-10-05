import { Loader2, Hand, Wifi, WifiOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/types/recognition";

interface RecognitionStatusProps {
  connection: ConnectionStatus;
  isSigning: boolean;
}

const CONNECTION_LABEL: Record<ConnectionStatus, string> = {
  idle: "Idle",
  connecting: "Connecting",
  open: "Connected",
  closed: "Disconnected",
  error: "Error",
};

export function RecognitionStatus({
  connection,
  isSigning,
}: RecognitionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={
          connection === "open"
            ? "success"
            : connection === "error"
              ? "destructive"
              : "secondary"
        }
        className="gap-1"
      >
        {connection === "connecting" ? (
          <Loader2 className="size-3 animate-spin" />
        ) : connection === "open" ? (
          <Wifi className="size-3" />
        ) : (
          <WifiOff className="size-3" />
        )}
        {CONNECTION_LABEL[connection]}
      </Badge>
      <Badge
        variant={isSigning ? "default" : "outline"}
        className={cn("gap-1", isSigning && "animate-pulse")}
      >
        <Hand className="size-3" />
        {isSigning ? "Signing…" : "Ready"}
      </Badge>
    </div>
  );
}
