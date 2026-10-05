import { cn } from "@/lib/utils";
import type { TranscriptEntry } from "@/types/recognition";

interface CaptionBarProps {
  latest: TranscriptEntry | null;
  isSigning: boolean;
  className?: string;
}

/** Large overlay caption showing the most recently recognized word. */
export function CaptionBar({ latest, isSigning, className }: CaptionBarProps) {
  return (
    <div
      className={cn(
        "pointer-events-none flex items-center justify-center",
        className,
      )}
    >
      {latest ? (
        <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-black/70 px-6 py-3 text-white backdrop-blur-sm">
          <span className="text-xl font-semibold capitalize">
            {latest.word.replace(/_/g, " ")}
          </span>
          <span className="text-sm text-white/70">
            {Math.round(latest.confidence * 100)}%
          </span>
        </div>
      ) : (
        <div className="pointer-events-auto rounded-full bg-black/50 px-5 py-2 text-sm text-white/80 backdrop-blur-sm">
          {isSigning ? "Reading sign…" : "Sign a word, then rest your hands"}
        </div>
      )}
    </div>
  );
}
