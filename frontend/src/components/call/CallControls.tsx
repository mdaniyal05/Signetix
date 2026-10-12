import {
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
  Captions,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CallControlsProps {
  micOn: boolean;
  webcamOn: boolean;
  recognitionOn: boolean;
  speechOn: boolean;
  speechSupported: boolean;
  onToggleMic: () => void;
  onToggleWebcam: () => void;
  onToggleRecognition: (value: boolean) => void;
  onToggleSpeech: () => void;
  onLeave: () => void;
}

export function CallControls({
  micOn,
  webcamOn,
  recognitionOn,
  speechOn,
  speechSupported,
  onToggleMic,
  onToggleWebcam,
  onToggleRecognition,
  onToggleSpeech,
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

      <Button
        variant={speechOn ? "secondary" : "outline"}
        size="icon"
        onClick={onToggleSpeech}
        disabled={!speechSupported}
        aria-label={speechOn ? "Mute spoken signs" : "Speak signs aloud"}
        title={
          speechSupported
            ? speechOn
              ? "Mute spoken signs"
              : "Speak signs aloud"
            : "Text-to-speech not supported in this browser"
        }
      >
        {speechOn ? <Volume2 /> : <VolumeX />}
      </Button>

      <Button variant="destructive" onClick={onLeave}>
        <PhoneOff />
        Leave
      </Button>
    </div>
  );
}
