import { useState } from "react"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Captions,
  Volume2,
  Maximize2,
  HandMetal,
  Brain,
  Zap,
} from "lucide-react"

const predictions = [
  { gesture: "WELCOME", confidence: 97.4 },
  { gesture: "HAPPY", confidence: 84.1 },
  { gesture: "TODAY", confidence: 71.8 },
]

export default function VideoCallPrototypePage() {
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [subtitles, setSubtitles] = useState(true)
  const [tts, setTts] = useState(true)

  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden bg-[hsl(220,40%,8%)]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ── TOP BAR ── */}
      <div className="absolute top-0 right-0 left-0 z-40 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-5 py-3">
        {/* Left: PSL badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-[hsl(38,50%,72%)]/30 bg-[hsl(38,50%,72%)]/15 px-3 py-1.5">
            <Brain size={13} className="text-[hsl(38,50%,72%)]" />
            <span className="font-mono text-xs font-semibold text-[hsl(38,50%,72%)]">
              PSL AI Active
            </span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          </div>
          {tts && (
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5">
              <Volume2 size={13} className="animate-pulse text-emerald-400" />
              <span className="font-mono text-xs text-emerald-400">
                Speaking: "WELCOME"
              </span>
            </div>
          )}
        </div>

        {/* Centre: call info */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 backdrop-blur-xl">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="font-mono text-xs text-white/60">00:12:34</span>
          <span className="text-xs text-white/20">·</span>
          <span className="font-mono text-xs text-white/40">
            End-to-end encrypted
          </span>
        </div>

        {/* Right: model fps */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-sm">
          <Zap size={11} className="text-[hsl(220,50%,65%)]" />
          <span className="font-mono text-xs text-white/40">
            30 FPS · 95% conf.
          </span>
        </div>
      </div>

      {/* ── MAIN VIDEO (remote — fullscreen) ── */}
      <div className="relative flex-1 bg-[hsl(220,40%,10%)]">
        {/* Simulated video bg */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[hsl(220,38%,12%)] via-[hsl(220,38%,10%)] to-[hsl(220,40%,8%)]">
          <div
            className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(38,50%,72%)] to-[hsl(220,50%,45%)] text-4xl font-bold text-[hsl(220,40%,13%)] opacity-25"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            S
          </div>
        </div>

        {/* Name tag */}
        <div className="absolute bottom-4 left-4 z-20">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-sm font-medium text-white">Sara Ahmed</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* ── GESTURE OVERLAY ── */}
        {subtitles && (
          <>
            {/* Prediction badges — top right */}
            <div className="absolute top-16 right-4 z-30 flex flex-col gap-2">
              <div className="mb-1">
                <p className="mb-1 text-right font-mono text-xs tracking-wider text-white/30 uppercase">
                  PSL Detected
                </p>
              </div>
              {predictions.map((p, i) => (
                <div
                  key={p.gesture}
                  className="flex min-w-[190px] items-center justify-between gap-5 rounded-xl border border-white/10 px-4 py-2.5 backdrop-blur-sm"
                  style={{
                    backgroundColor: `hsla(38, 50%, ${35 - i * 5}%, ${0.85 - i * 0.2})`,
                  }}
                >
                  <span
                    className="font-mono text-sm font-bold tracking-wide"
                    style={{ color: `hsl(38, 30%, ${95 - i * 10}%)` }}
                  >
                    {p.gesture}
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className="font-mono text-xs"
                      style={{ color: `hsl(38, 30%, ${80 - i * 10}%)` }}
                    >
                      {p.confidence.toFixed(1)}%
                    </span>
                    <div className="h-1 w-16 overflow-hidden rounded-full bg-black/20">
                      <div
                        className="h-full rounded-full bg-white/50"
                        style={{ width: `${p.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtitle bar — bottom centre */}
            <div className="absolute bottom-16 left-1/2 z-30 w-full max-w-2xl -translate-x-1/2 px-6">
              <div className="rounded-2xl border border-white/10 bg-black/75 px-6 py-4 text-center backdrop-blur-md">
                <div className="mb-1 flex items-center justify-center gap-2">
                  <Captions size={14} className="text-[hsl(38,50%,72%)]" />
                  <span className="font-mono text-xs tracking-wider text-[hsl(38,50%,72%)] uppercase">
                    Live Subtitle
                  </span>
                </div>
                <p className="font-mono text-2xl font-bold tracking-widest text-white">
                  WELCOME
                </p>
                <p className="mt-1 font-mono text-xs text-white/40">
                  PSL Gesture · 97.4% confidence · Speaking aloud
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── PiP (local) ── */}
      <div
        className="absolute z-30"
        style={{ top: subtitles ? "200px" : "64px", right: "16px" }}
      >
        <div className="relative h-28 w-40 overflow-hidden rounded-2xl border-2 border-white/15 bg-[hsl(220,38%,16%)] shadow-2xl">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[hsl(220,38%,18%)] to-[hsl(220,38%,12%)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(220,50%,55%)] to-[hsl(220,50%,38%)] text-sm font-bold text-white opacity-50">
              A
            </div>
          </div>
          <div className="absolute bottom-2 left-2.5">
            <span className="text-xs font-medium text-white">You</span>
          </div>
          {!micOn && (
            <div className="absolute top-2 right-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600/80">
                <MicOff size={10} className="text-white" />
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-[hsl(38,50%,72%)]/20" />
        </div>
      </div>

      {/* ── CONTROLS BAR ── */}
      <div className="absolute right-0 bottom-0 left-0 z-40 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-8 py-5">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          {/* Left toggles */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubtitles(!subtitles)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
                subtitles
                  ? "border-[hsl(38,50%,72%)]/30 bg-[hsl(38,50%,72%)]/20 text-[hsl(38,50%,72%)]"
                  : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              <Captions size={14} />
              Subtitles
            </button>
            <button
              onClick={() => setTts(!tts)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
                tts
                  ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                  : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              <Volume2 size={14} />
              TTS
            </button>
          </div>

          {/* Centre */}
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => setCamOn(!camOn)}
                className={`flex h-12 h-13 w-12 w-13 items-center justify-center rounded-full border transition-all ${
                  camOn
                    ? "border-white/15 bg-white/10 text-white hover:bg-white/20"
                    : "border-white/10 bg-white/5 text-white/30"
                }`}
              >
                {camOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              <span className="font-mono text-xs text-white/30">Cam</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all ${
                  micOn
                    ? "border-white/15 bg-white/10 text-white hover:bg-white/20"
                    : "border-red-500/30 bg-red-600/30 text-red-400"
                }`}
              >
                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <span className="font-mono text-xs text-white/30">
                {micOn ? "Mic" : "Muted"}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <button className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-[0_0_40px_-5px_rgba(220,38,38,0.6)] transition-all hover:bg-red-500">
                <PhoneOff size={24} className="text-white" />
              </button>
              <span className="font-mono text-xs text-white/30">End</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white/40 transition-all hover:bg-white/10">
              <Maximize2 size={14} />
              Fullscreen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
