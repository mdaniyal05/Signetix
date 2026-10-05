import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, CameraOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CaptionBar } from "@/components/recognition/CaptionBar";
import { RecognitionStatus } from "@/components/recognition/RecognitionStatus";
import { TranscriptPanel } from "@/components/recognition/TranscriptPanel";
import { Button } from "@/components/ui/button";
import { usePslRecognition } from "@/hooks/usePslRecognition";
import { cn } from "@/lib/utils";

type CameraState = "idle" | "starting" | "on" | "error";

/** Standalone page to test PSL recognition on the local webcam (no VideoSDK). */
export function RecognitionTestPage() {
  const navigate = useNavigate();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const recognition = usePslRecognition({ stream });

  // Attach the stream to the (always-mounted) video element.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) {
      void video.play().catch(() => undefined);
    }
  }, [stream]);

  // Stop camera tracks only when the page unmounts.
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      const mediaStream = video?.srcObject as MediaStream | null;
      mediaStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startCamera = async () => {
    setErrorMessage("");
    setCameraState("starting");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera API unavailable. Open the app over http://localhost (not a LAN IP) so the browser treats it as a secure context.",
        );
      }
      // Fail fast if the device never starts (held by another tab/app, or an
      // in-editor browser that blocks camera access) instead of spinning forever.
      const media = await Promise.race([
        navigator.mediaDevices.getUserMedia({ video: true }),
        new Promise<MediaStream>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  "The camera didn't start within 12s. It's likely open in another tab/app, or you're using an in-editor browser. Open http://localhost:5173 in Chrome/Edge and close other apps using the camera.",
                ),
              ),
            12_000,
          ),
        ),
      ]);
      setStream(media);
      setCameraState("on");
    } catch (error) {
      let message =
        error instanceof Error ? error.message : "Could not access the camera";
      // Report how many cameras the browser can see — 0 means a privacy/driver
      // issue or the device is held by another process.
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameraCount = devices.filter(
          (d) => d.kind === "videoinput",
        ).length;
        message += ` (browser detects ${cameraCount} camera${cameraCount === 1 ? "" : "s"})`;
      } catch {
        /* ignore enumeration errors */
      }
      setErrorMessage(message);
      setCameraState("error");
      toast.error("Could not access the camera", { description: message });
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setCameraState("idle");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft />
          Back
        </Button>
        <RecognitionStatus
          connection={recognition.connection}
          isSigning={recognition.isSigning}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
          {/* Always mounted so the stream attaches reliably; hidden until on. */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn("size-full object-cover", !stream && "hidden")}
          />

          {!stream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
              <CameraOff className="size-10" />
              {cameraState === "error" && errorMessage && (
                <p className="max-w-sm text-sm text-destructive">
                  {errorMessage}
                </p>
              )}
              <Button
                onClick={startCamera}
                disabled={cameraState === "starting"}
              >
                {cameraState === "starting" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Camera />
                )}
                {cameraState === "error" ? "Try again" : "Start camera"}
              </Button>
            </div>
          )}

          {stream && (
            <CaptionBar
              latest={recognition.latest}
              isSigning={recognition.isSigning}
              className="absolute inset-x-0 bottom-4"
            />
          )}
        </div>

        <div className="flex h-[60vh] flex-col gap-3 lg:h-auto">
          <TranscriptPanel
            transcript={recognition.transcript}
            sentence={recognition.sentence}
            onClear={recognition.clearTranscript}
          />
          {stream && (
            <Button variant="outline" onClick={stopCamera}>
              <CameraOff />
              Stop camera
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
