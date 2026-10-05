import { Mic, MicOff, PhoneOff, Video, VideoOff, Captions } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CallControlsProps {
  micOn: boolean;
  webcamOn: boolean;
  recognitionOn: boolean;
  onToggleMic: () => void;
  onToggleWebcam: () => void;
  onToggleRecognition: (value: boolean) => void;
  onLeave: () => void;
}

export function CallControls({
  micOn,
  webcamOn,
  recognitionOn,
  onToggleMic,
  onToggleWebcam,
  onToggleRecognition,
  onLeave,
}: CallControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border bg-card p-3">
      <Button
        variant={micOn ? "secondary" : "outline"}
        size="icon"
        onClick={onToggleMic}
        aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
      >
        {micOn ? <Mic /> : <MicOff />}
      </Button>
      <Button
        variant={webcamOn ? "secondary" : "outline"}
        size="icon"
        onClick={onToggleWebcam}
        aria-label={webcamOn ? "Turn camera off" : "Turn camera on"}
      >
        {webcamOn ? <Video /> : <VideoOff />}
      </Button>

      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
        <Captions className="size-4" />
        <Label htmlFor="recognition-toggle" className="cursor-pointer">
          PSL
        </Label>
        <Switch
          id="recognition-toggle"
          checked={recognitionOn}
          onCheckedChange={onToggleRecognition}
        />
      </div>

      <Button variant="destructive" onClick={onLeave}>
        <PhoneOff />
        Leave
      </Button>
    </div>
  );
}
