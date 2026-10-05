import { useEffect, useMemo, useRef } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";
import { MicOff, VideoOff } from "lucide-react";

interface ParticipantTileProps {
  participantId: string;
}

function streamTrack(stream: unknown): MediaStreamTrack | undefined {
  return (stream as { track?: MediaStreamTrack } | undefined)?.track;
}

export function ParticipantTile({ participantId }: ParticipantTileProps) {
  const { webcamStream, micStream, webcamOn, micOn, displayName, isLocal } =
    useParticipant(participantId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const webcamMediaStream = useMemo(() => {
    const track = streamTrack(webcamStream);
    return webcamOn && track ? new MediaStream([track]) : null;
  }, [webcamOn, webcamStream]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = webcamMediaStream;
    if (webcamMediaStream) void video.play().catch(() => undefined);
  }, [webcamMediaStream]);

  // Play remote audio only (never the local mic, to avoid echo).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isLocal) return;
    const track = streamTrack(micStream);
    audio.srcObject = micOn && track ? new MediaStream([track]) : null;
    if (micOn && track) void audio.play().catch(() => undefined);
  }, [micStream, micOn, isLocal]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
      {webcamMediaStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="size-full object-cover"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <VideoOff className="size-8" />
          <span className="text-sm">Camera off</span>
        </div>
      )}

      {!isLocal && <audio ref={audioRef} autoPlay />}

      <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
        {!micOn && <MicOff className="size-3.5 text-red-400" />}
        <span>
          {displayName || "Guest"}
          {isLocal ? " (You)" : ""}
        </span>
      </div>
    </div>
  );
}
