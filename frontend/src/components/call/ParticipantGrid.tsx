import { ParticipantTile } from "./ParticipantTile";

interface ParticipantGridProps {
  participantIds: string[];
}

export function ParticipantGrid({ participantIds }: ParticipantGridProps) {
  if (participantIds.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground">
        Waiting for participants…
      </div>
    );
  }

  // auto-fit tiles: columns grow/shrink with the participant count and width.
  const minTileWidth = participantIds.length === 1 ? "100%" : "240px";

  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${minTileWidth}, 100%), 1fr))`,
      }}
    >
      {participantIds.map((id) => (
        <ParticipantTile key={id} participantId={id} />
      ))}
    </div>
  );
}
