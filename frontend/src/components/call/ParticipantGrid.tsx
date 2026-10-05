import { cn } from "@/lib/utils";
import { ParticipantTile } from "./ParticipantTile";

interface ParticipantGridProps {
  participantIds: string[];
}

export function ParticipantGrid({ participantIds }: ParticipantGridProps) {
  const count = participantIds.length;
  const columns =
    count <= 1 ? "grid-cols-1" : count <= 4 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className={cn("grid gap-3", columns)}>
      {participantIds.map((id) => (
        <ParticipantTile key={id} participantId={id} />
      ))}
    </div>
  );
}
