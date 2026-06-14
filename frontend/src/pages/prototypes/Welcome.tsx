import {
  ArrowRight,
  Sparkles,
  MessageSquare,
  Video,
  Brain,
  Volume2,
  Shield,
  Zap,
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI Gesture Recognition",
    desc: "MediaPipe + Keras TCN powered PSL recognition with real-time accuracy up to 95%.",
  },
  {
    icon: Video,
    title: "Live Video Calls",
    desc: "WebRTC-powered video calling with subtitle overlays directly on the video stream.",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Chat",
    desc: "Socket.io based instant messaging with replies, pins, and message editing.",
  },
  {
    icon: Volume2,
    title: "Text to Speech",
    desc: "Converts recognized gestures to spoken words automatically for hearing participants.",
  },
  {
    icon: Shield,
    title: "Secure Auth",
    desc: "JWT + OTP-based authentication keeping your conversations private and encrypted.",
  },
  {
    icon: Zap,
    title: "Low Latency",
    desc: "Optimised pipeline for near real-time gesture to subtitle conversion at 15–45 FPS.",
  },
]

const steps = [
  {
    num: "01",
    title: "Sign In & Connect",
    desc: "Create your account with phone number and OTP verification.",
  },
  {
    num: "02",
    title: "Start a Video Call",
    desc: "Launch a WebRTC-powered call with gesture recognition enabled.",
  },
  {
    num: "03",
    title: "Sign Naturally",
    desc: "Use Pakistan Sign Language — the AI captures and processes your gestures.",
  },
  {
    num: "04",
    title: "See & Hear Translations",
    desc: "Live subtitles appear on screen and text-to-speech reads them aloud.",
  },
]

const tech = [
  {
    label: "Frontend",
    items: ["React", "TypeScript", "Tailwind CSS", "ShadCN UI", "Redux"],
  },
  {
    label: "Backend",
    items: ["Node.js", "Express", "MongoDB", "Socket.io"],
  },
  {
    label: "AI / ML",
    items: ["TensorFlow", "MediaPipe", "Keras", "Python", "FastAPI"],
  },
  { label: "Real-Time", items: ["WebRTC", "VideoSDK", "WebSockets"] },
]

export default function WelcomePage() {
  return (
    <div
      className="min-h-screen bg-[hsl(220,40%,13%)] text-[hsl(38,30%,90%)]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 right-0 left-0 z-50 border-b border-[hsl(220,25%,22%)]/50 bg-[hsl(220,40%,13%)]/80 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <span
            className="bg-gradient-to-r from-[hsl(38,50%,72%)] to-[hsl(220,50%,65%)] bg-clip-text text-xl font-bold text-transparent"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Signetix
          </span>
          <div className="hidden items-center gap-8 md:flex">
            {["Features", "How It Works", "Tech", "Team"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-sm text-[hsl(220,15%,55%)] transition-colors hover:text-[hsl(38,30%,90%)]"
              >
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-[hsl(220,25%,22%)] px-4 py-2 text-sm text-[hsl(38,30%,90%)] transition-colors hover:bg-[hsl(220,30%,20%)]">
              Log In
            </button>
            <button className="rounded-xl bg-[hsl(38,50%,72%)] px-4 py-2 text-sm font-semibold text-[hsl(220,40%,13%)] shadow-[0_0_30px_-8px_hsl(38,50%,72%,0.4)] transition-colors hover:bg-[hsl(38,50%,65%)]">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[hsl(38,50%,72%)]/8 blur-[120px]" />
        <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-[hsl(220,50%,45%)]/8 blur-[120px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(38,30%,90%) 1px, transparent 1px), linear-gradient(90deg, hsl(38,30%,90%) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/40 px-4 py-2 text-sm text-[hsl(220,15%,55%)] backdrop-blur-xl">
            <Sparkles size={14} className="text-[hsl(38,50%,72%)]" />
            Breaking Communication Barriers with AI
          </div>

          <h1
            className="mb-6 text-6xl leading-[0.95] font-bold tracking-tight md:text-8xl"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            <span className="text-[hsl(38,30%,90%)]">Sign.</span>
            <br />
            <span className="bg-gradient-to-r from-[hsl(38,50%,72%)] to-[hsl(220,50%,65%)] bg-clip-text text-transparent">
              Translate.
            </span>
            <br />
            <span className="text-[hsl(38,30%,90%)]">Connect.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[hsl(220,15%,55%)] md:text-xl">
            Real-time Pakistan Sign Language recognition powered by AI. Seamless
            video calls with live subtitle overlays and text-to-speech.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="group flex items-center gap-2 rounded-xl bg-[hsl(38,50%,72%)] px-8 py-4 text-base font-semibold text-[hsl(220,40%,13%)] shadow-[0_0_40px_-10px_hsl(38,50%,72%,0.4)] transition-colors hover:bg-[hsl(38,50%,65%)]">
              Start Signing
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
            <button className="rounded-xl border border-[hsl(220,25%,22%)]/50 px-8 py-4 text-base font-medium text-[hsl(38,30%,90%)] transition-colors hover:bg-[hsl(220,30%,20%)]">
              Watch Demo
            </button>
          </div>

          {/* Floating gesture card */}
          <div className="mt-16 flex justify-center">
            <div
              className="w-full max-w-sm rounded-2xl border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/40 p-8 shadow-[0_0_40px_-10px_hsl(38,50%,72%,0.3)] backdrop-blur-xl"
              style={{ animation: "float 6s ease-in-out infinite" }}
            >
              <div className="mb-3 text-5xl">🤟</div>
              <p className="font-mono text-sm text-[hsl(220,15%,55%)]">
                <span className="text-[hsl(38,50%,72%)]">→</span> Detected:{" "}
                <span className="font-medium text-[hsl(38,30%,90%)]">
                  "WELCOME"
                </span>
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[hsl(220,30%,20%)]">
                <div
                  className="h-full rounded-full bg-[hsl(38,50%,72%)]"
                  style={{ width: "95%" }}
                />
              </div>
              <p className="mt-1 text-xs text-[hsl(220,15%,55%)]">
                Confidence: 95%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 font-mono text-sm tracking-widest text-[hsl(38,50%,72%)] uppercase">
              Features
            </p>
            <h2
              className="text-4xl font-bold text-[hsl(38,30%,90%)] md:text-5xl"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-[hsl(38,50%,72%)] to-[hsl(220,50%,65%)] bg-clip-text text-transparent">
                communicate
              </span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/40 p-8 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_40px_-10px_hsl(38,50%,72%,0.3)]"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(38,50%,72%)]/10 transition-colors group-hover:bg-[hsl(38,50%,72%)]/20">
                    <Icon size={22} className="text-[hsl(38,50%,72%)]" />
                  </div>
                  <h3
                    className="mb-2 font-semibold text-[hsl(38,30%,90%)]"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[hsl(220,15%,55%)]">
                    {f.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative py-32">
        <div className="pointer-events-none absolute top-1/2 right-0 h-96 w-96 rounded-full bg-[hsl(220,50%,45%)]/5 blur-[150px]" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-20 text-center">
            <p className="mb-3 font-mono text-sm tracking-widest text-[hsl(220,50%,65%)] uppercase">
              Process
            </p>
            <h2
              className="text-4xl font-bold text-[hsl(38,30%,90%)] md:text-5xl"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              How it{" "}
              <span className="bg-gradient-to-r from-[hsl(38,50%,72%)] to-[hsl(220,50%,65%)] bg-clip-text text-transparent">
                works
              </span>
            </h2>
          </div>
          <div className="relative mx-auto max-w-3xl">
            <div className="absolute top-0 bottom-0 left-8 w-px bg-gradient-to-b from-[hsl(38,50%,72%)]/50 via-[hsl(220,50%,45%)]/50 to-transparent md:left-12" />
            <div className="space-y-16">
              {steps.map((s) => (
                <div key={s.num} className="flex items-start gap-8">
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/40 shadow-[0_0_40px_-10px_hsl(38,50%,72%,0.3)] backdrop-blur-xl md:h-24 md:w-24">
                    <span
                      className="bg-gradient-to-r from-[hsl(38,50%,72%)] to-[hsl(220,50%,65%)] bg-clip-text text-2xl font-bold text-transparent md:text-3xl"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {s.num}
                    </span>
                  </div>
                  <div className="pt-2 md:pt-4">
                    <h3
                      className="mb-2 text-xl font-semibold text-[hsl(38,30%,90%)] md:text-2xl"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {s.title}
                    </h3>
                    <p className="leading-relaxed text-[hsl(220,15%,55%)]">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 font-mono text-sm tracking-widest text-[hsl(38,50%,72%)] uppercase">
              Stack
            </p>
            <h2
              className="text-4xl font-bold text-[hsl(38,30%,90%)] md:text-5xl"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Built with{" "}
              <span className="bg-gradient-to-r from-[hsl(38,50%,72%)] to-[hsl(220,50%,65%)] bg-clip-text text-transparent">
                modern tech
              </span>
            </h2>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tech.map((cat) => (
              <div
                key={cat.label}
                className="rounded-2xl border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/40 p-6 backdrop-blur-xl"
              >
                <h3 className="mb-4 font-mono text-sm font-semibold tracking-wider text-[hsl(38,50%,72%)] uppercase">
                  {cat.label}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg bg-[hsl(220,30%,20%)] px-3 py-1.5 font-mono text-xs text-[hsl(220,15%,55%)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="relative py-32">
        <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[hsl(38,50%,72%)]/5 blur-[150px]" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 font-mono text-sm tracking-widest text-[hsl(220,50%,65%)] uppercase">
              Team
            </p>
            <h2
              className="text-4xl font-bold text-[hsl(38,30%,90%)] md:text-5xl"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Meet the{" "}
              <span className="bg-gradient-to-r from-[hsl(38,50%,72%)] to-[hsl(220,50%,65%)] bg-clip-text text-transparent">
                builders
              </span>
            </h2>
          </div>
          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-8">
            {[
              { name: "Muhammed Daniyal", role: "Project Lead, Backend & ML" },
              { name: "Malaika Nadeem", role: "Frontend & UI Design" },
              { name: "Musfira Hamid", role: "Frontend & UI Design" },
              { name: "Syed Rohan Abbas", role: "Frontend & UI Design" },
            ].map((m) => (
              <div
                key={m.name}
                className="w-52 rounded-2xl border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/40 p-8 text-center backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_40px_-10px_hsl(220,50%,45%,0.3)]"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(38,50%,72%)] to-[hsl(220,50%,45%)]">
                  <span
                    className="text-xl font-bold text-[hsl(220,40%,13%)]"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    {m.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <h3
                  className="text-sm font-semibold text-[hsl(38,30%,90%)]"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {m.name}
                </h3>
                <p className="mt-1 text-xs text-[hsl(220,15%,55%)]">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[hsl(220,25%,22%)]/30 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <span
            className="bg-gradient-to-r from-[hsl(38,50%,72%)] to-[hsl(220,50%,65%)] bg-clip-text text-xl font-bold text-transparent"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Signetix
          </span>
          <p className="text-sm text-[hsl(220,15%,55%)]">
            © 2025 Signetix. Bridging communication gaps with AI.
          </p>
          <div className="flex gap-6">
            {["Features", "How It Works", "Tech", "Team"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-xs text-[hsl(220,15%,55%)] transition-colors hover:text-[hsl(38,30%,90%)]"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}
