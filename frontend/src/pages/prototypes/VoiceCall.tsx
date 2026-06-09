import { useState } from "react"
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Phone,
  Clock,
} from "lucide-react"

export default function VoiceCallPrototypePage() {
  const [micOn, setMicOn] = useState(true)
  const [speakerOn, setSpeakerOn] = useState(true)

  return (
    <div
      className="relative flex h-screen flex-col items-center justify-between overflow-hidden bg-[hsl(220,40%,13%)] px-6 py-16 text-[hsl(38,30%,90%)]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[hsl(38,50%,72%)]/5 blur-[150px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-64 bg-gradient-to-t from-[hsl(220,40%,8%)] to-transparent" />
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(38,30%,90%) 1px, transparent 1px), linear-gradient(90deg, hsl(38,30%,90%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Status pill */}
      <div className="relative z-10 flex items-center gap-2 rounded-full border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/60 px-5 py-2 backdrop-blur-xl">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        <span className="font-mono text-sm text-[hsl(220,15%,55%)]">
          Voice Call
        </span>
      </div>

      {/* Caller info */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Pulsing avatar ring */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute h-40 w-40 animate-ping rounded-full bg-[hsl(38,50%,72%)]/8"
            style={{ animationDuration: "2s" }}
          />
          <div
            className="absolute h-32 w-32 animate-ping rounded-full bg-[hsl(38,50%,72%)]/12"
            style={{ animationDuration: "2s", animationDelay: "0.4s" }}
          />
          <div
            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(38,50%,72%)] to-[hsl(220,50%,45%)] text-3xl font-bold text-[hsl(220,40%,13%)] shadow-[0_0_60px_-10px_hsl(38,50%,72%,0.5)]"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            S
          </div>
        </div>

        <div className="text-center">
          <h2
            className="text-3xl font-bold text-[hsl(38,30%,90%)]"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Saad Ahmed
          </h2>
          <p className="mt-1 font-mono text-sm text-[hsl(220,15%,45%)]">
            +92 301 9876543
          </p>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 rounded-full border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/60 px-6 py-2.5 backdrop-blur-xl">
          <Clock size={14} className="text-[hsl(38,50%,72%)]" />
          <span className="font-mono text-lg tracking-widest text-[hsl(38,30%,90%)]">
            00:04:32
          </span>
        </div>

        {/* Audio waveform (decorative) */}
        <div className="flex h-10 items-center gap-1">
          {[3, 6, 10, 7, 12, 8, 5, 14, 9, 11, 6, 13, 7, 4, 10, 8, 6].map(
            (h, i) => (
              <div
                key={i}
                className="w-1.5 animate-pulse rounded-full bg-[hsl(38,50%,72%)]/60"
                style={{
                  height: `${h * 2.5}px`,
                  animationDelay: `${i * 0.07}s`,
                  animationDuration: "1.2s",
                }}
              />
            )
          )}
        </div>

        {/* Call quality */}
        {/* <div className="flex items-center gap-4 font-mono text-xs text-[hsl(220,15%,45%)]">
          <span>
            Quality: <span className="text-emerald-400">Excellent</span>
          </span>
          <span>·</span>
          <span>Codec: Opus</span>
          <span>·</span>
          <span>Latency: 42ms</span>
        </div> */}
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center gap-8">
        {/* Speaker */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setSpeakerOn(!speakerOn)}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 ${
              speakerOn
                ? "border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/60 text-[hsl(38,30%,90%)] hover:border-[hsl(38,50%,72%)]/30"
                : "border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/60 text-[hsl(220,15%,45%)]"
            }`}
          >
            {speakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>
          <span className="font-mono text-xs text-[hsl(220,15%,45%)]">
            Speaker
          </span>
        </div>

        {/* End call */}
        <div className="flex flex-col items-center gap-2">
          <button className="flex h-16 h-18 w-16 w-18 items-center justify-center rounded-full bg-red-600 shadow-[0_0_40px_-5px_rgba(220,38,38,0.5)] transition-all duration-200 hover:bg-red-500">
            <PhoneOff size={26} className="text-white" />
          </button>
          <span className="font-mono text-xs text-[hsl(220,15%,45%)]">
            End Call
          </span>
        </div>

        {/* Mic */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 ${
              micOn
                ? "border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/60 text-[hsl(38,30%,90%)] hover:border-[hsl(38,50%,72%)]/30"
                : "border border-red-500/30 bg-red-600/20 text-red-400"
            }`}
          >
            {micOn ? <Mic size={22} /> : <MicOff size={22} />}
          </button>
          <span className="font-mono text-xs text-[hsl(220,15%,45%)]">
            {micOn ? "Mute" : "Unmuted"}
          </span>
        </div>
      </div>

      {/* Note: no PSL AI on voice calls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs text-[hsl(220,15%,35%)]">
        PSL gesture recognition available on video calls only
      </div>
    </div>
  )
}
