import { Eraser } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { signLabel } from "@/lib/psl-translations";
import type { PslLanguage } from "@/types/api";
import type { TranscriptEntry } from "@/types/recognition";

interface TranscriptPanelProps {
  transcript: TranscriptEntry[];
  sentence: string;
  language?: PslLanguage;
  onClear: () => void;
}

export function TranscriptPanel({
  transcript,
  sentence,
  language = "English",
  onClear,
}: TranscriptPanelProps) {
  // In Urdu, build the sentence from translated labels; English uses the prop.
  const displaySentence =
    language === "Urdu"
      ? transcript.map((entry) => signLabel(entry.word, language)).join(" ")
      : sentence;
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Transcript</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={transcript.length === 0}
        >
          <Eraser className="size-4" />
          Clear
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 pt-3">
        <p className="min-h-6 text-sm leading-relaxed text-muted-foreground">
          {displaySentence || "Recognized words will appear here."}
        </p>
        <Separator />
        <ScrollArea className="min-h-0 flex-1">
          <ul className="flex flex-col gap-1 pr-3">
            {transcript
              .slice()
              .reverse()
              .map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <span className="font-medium capitalize">
                    {signLabel(entry.word, language)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(entry.confidence * 100)}%
                  </span>
                </li>
              ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
