import { Link } from "react-router-dom";
import {
  ArrowRight,
  Captions,
  Hand,
  MessageSquare,
  Mic,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  Volume2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Hand,
    title: "Real-time PSL recognition",
    description:
      "Your webcam signs are recognized live and shown as captions during the call — no extra hardware.",
    tint: "linear-gradient(135deg,#7b2cbf,#9d4edd)",
  },
  {
    icon: Video,
    title: "Built-in video calls",
    description:
      "One-to-one video calling with a clean, adaptive grid that fits however many people join.",
    tint: "linear-gradient(135deg,#9d4edd,#c77dff)",
  },
  {
    icon: Volume2,
    title: "Spoken captions",
    description:
      "Each recognized sign is read aloud with text-to-speech, so hearing participants follow along.",
    tint: "linear-gradient(135deg,#5a189a,#7b2cbf)",
  },
  {
    icon: MessageSquare,
    title: "Messaging built in",
    description:
      "Real-time chat with your contacts — send text and media, with read and online status.",
    tint: "linear-gradient(135deg,#c77dff,#e0aaff)",
  },
];

const STEPS = [
  { step: "1", title: "Create an account", text: "Sign up with your phone and email in seconds." },
  { step: "2", title: "Start a call", text: "Invite a contact or share a meeting link." },
  { step: "3", title: "Sign naturally", text: "Sign to the camera — captions and speech appear live." },
];

// Floating caption chips near the hero mockup: [label, position, delay].
const FLOATING_SIGNS: [string, string, string][] = [
  ["Hello", "-left-3 top-8 sm:-left-8", "0s"],
  ["Thank you", "-right-3 top-20 sm:-right-10", "1.2s"],
  ["Yes", "-left-1 bottom-12 sm:-left-6", "2.1s"],
];

const CURRENT_YEAR = new Date().getFullYear();

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c0021] text-white">
      <LandingStyles />

      {/* Animated purple backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e0039] via-[#10002b] to-[#0c0021]" />
        <div className="landing-blob absolute -left-24 top-10 size-96 rounded-full bg-[#7b2cbf]/40 blur-[110px]" />
        <div className="landing-blob absolute -right-24 top-44 size-96 rounded-full bg-[#c77dff]/25 blur-[120px]" style={{ animationDelay: "-6s" }} />
        <div className="landing-blob absolute left-1/3 top-[34rem] size-[28rem] rounded-full bg-[#9d4edd]/20 blur-[130px]" style={{ animationDelay: "-12s" }} />
        <div className="landing-grid absolute inset-0 opacity-[0.07]" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0c0021]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Signetix" className="h-14 w-auto object-contain brightness-0 invert" />
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="brand-cta border-0 text-white">
              <Link to="/signup">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <div className="fade-up inline-flex items-center gap-2 rounded-full border border-[#9d4edd]/30 bg-[#9d4edd]/10 px-3 py-1 text-xs font-medium text-[#e0aaff]">
              <Sparkles className="size-3.5" />
              Pakistan Sign Language, recognized live
            </div>
            <h1 className="fade-up mt-5 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl" style={{ animationDelay: "0.08s" }}>
              Where conversations{" "}
              <span className="brand-text">speak every language</span>
            </h1>
            <p className="fade-up mx-auto mt-5 max-w-xl text-balance text-lg text-[#c4a1ff] lg:mx-0" style={{ animationDelay: "0.16s" }}>
              Signetix turns Pakistan Sign Language into live captions and speech
              during a video call — so everyone's in the conversation.
            </p>
            <div className="fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start" style={{ animationDelay: "0.24s" }}>
              <Button asChild size="lg" className="brand-cta border-0 text-white">
                <Link to="/signup">
                  Get started free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link to="/recognition-test">Try the live demo</Link>
              </Button>
            </div>
            <div className="fade-up mt-8 flex items-center justify-center gap-5 text-sm text-[#c4a1ff]/80 lg:justify-start" style={{ animationDelay: "0.32s" }}>
              <span className="flex items-center gap-1.5"><Users className="size-4" /> Group ready</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-4" /> Secure by default</span>
            </div>
          </div>

          <div className="fade-up relative" style={{ animationDelay: "0.2s" }}>
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Everything in one place</h2>
          <p className="mt-3 text-[#c4a1ff]">
            Accessibility-first calling, with the messaging you already expect.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description, tint }) => (
            <div key={title} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-[#9d4edd]/40 hover:bg-white/[0.06] hover:shadow-[0_20px_60px_-15px_rgba(157,78,221,0.45)]">
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110" style={{ backgroundImage: tint }}>
                <Icon className="size-5" />
              </div>
              <h3 className="font-medium">{title}</h3>
              <p className="mt-1.5 text-sm text-[#c4a1ff]/80">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative border-y border-white/5 bg-[#16002b]/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
            <p className="mt-3 text-[#c4a1ff]">Up and running in three steps.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map(({ step, title, text }) => (
              <div key={step} className="text-center">
                <div className="brand-cta mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl text-lg font-semibold text-white">
                  {step}
                </div>
                <h3 className="font-medium">{title}</h3>
                <p className="mt-1.5 text-sm text-[#c4a1ff]/80">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-16 text-center" style={{ backgroundImage: "linear-gradient(135deg,#3c096c,#5a189a,#7b2cbf)" }}>
          <div aria-hidden className="landing-blob absolute -right-12 -top-12 size-56 rounded-full bg-[#c77dff]/40 blur-3xl" />
          <div aria-hidden className="landing-blob absolute -bottom-16 -left-10 size-64 rounded-full bg-[#9d4edd]/30 blur-3xl" style={{ animationDelay: "-8s" }} />
          <div className="relative">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Start signing today</h2>
            <p className="mx-auto mt-3 max-w-xl text-[#e0aaff]">
              Free to try. Create an account and make your first accessible call in minutes.
            </p>
            <div className="mt-7 flex justify-center">
              <Button asChild size="lg" className="border-0 bg-white text-[#5a189a] shadow-xl transition-transform hover:-translate-y-0.5 hover:bg-white/90">
                <Link to="/signup">
                  Create your account
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-[#c4a1ff]/70 sm:flex-row sm:px-6">
          <img src="/logo.png" alt="Signetix" className="h-10 w-auto object-contain brightness-0 invert" />
          <span>© {CURRENT_YEAR} Signetix. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

/** Glassy app-window mock: a call tile, live caption bar, floating chat card and sign chips. */
function HeroMockup() {
  return (
    <div className="relative mx-auto max-w-md">
      {FLOATING_SIGNS.map(([label, position, delay]) => (
        <div
          key={label}
          className={`landing-float absolute z-10 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#e0aaff] shadow-lg backdrop-blur ${position}`}
          style={{ animationDelay: delay }}
        >
          {label}
        </div>
      ))}

      {/* Floating chat card */}
      <div className="landing-float absolute -right-6 bottom-6 z-10 hidden w-48 rounded-2xl border border-white/10 bg-[#1e0039]/90 p-3 shadow-2xl backdrop-blur sm:block" style={{ animationDelay: "0.8s" }}>
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full" style={{ backgroundImage: "linear-gradient(135deg,#9d4edd,#c77dff)" }}>
            <Users className="size-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-medium text-white">
              Ayesha
              <span className="size-1.5 rounded-full bg-green-400" />
            </div>
            <div className="truncate text-[11px] text-[#c4a1ff]/80">See you on the call!</div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-2 shadow-2xl backdrop-blur">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem]" style={{ backgroundImage: "linear-gradient(135deg,#240046,#3c096c)" }}>
          {/* subtle glow */}
          <div aria-hidden className="landing-blob absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9d4edd]/30 blur-3xl" />

          {/* signing figure */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="landing-float flex size-28 items-center justify-center rounded-full text-white shadow-2xl" style={{ backgroundImage: "linear-gradient(135deg,#7b2cbf,#c77dff)" }}>
              <Hand className="size-12" />
            </div>
          </div>

          {/* top row */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <span className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              <Captions className="size-3" /> Live captions
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white backdrop-blur">
              <Mic className="size-3" />
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#c77dff] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[#c77dff]" />
              </span>
            </span>
          </div>

          {/* caption bar */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center p-4">
            <div className="flex items-center gap-3 rounded-full bg-[#10002b]/90 px-5 py-2.5 shadow-lg ring-1 ring-white/10 backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-green-500" />
              </span>
              <span className="brand-text font-semibold">Thank you</span>
              <span className="text-sm text-[#c4a1ff]/70">98%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Keyframes, gradients and the grid texture for the landing (respects reduced-motion). */
function LandingStyles() {
  return (
    <style>{`
      .brand-text {
        background-image: linear-gradient(120deg,#c77dff,#e0aaff 60%,#9d4edd);
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      .brand-cta {
        background-image: linear-gradient(120deg,#7b2cbf,#9d4edd,#c77dff);
        background-size: 180% 180%;
        box-shadow: 0 10px 30px -8px rgba(157,78,221,0.6);
        transition: background-position .5s ease, transform .25s ease, box-shadow .25s ease;
      }
      .brand-cta:hover {
        background-position: 100% 50%;
        transform: translateY(-2px);
        box-shadow: 0 16px 40px -8px rgba(199,125,255,0.7);
      }
      .landing-grid {
        background-image:
          linear-gradient(to right, rgba(255,255,255,.6) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,.6) 1px, transparent 1px);
        background-size: 46px 46px;
        mask-image: radial-gradient(ellipse 70% 50% at 50% 0%, #000 40%, transparent 75%);
      }
      @keyframes landingBlob {
        0%,100% { transform: translate(0,0) scale(1); }
        33% { transform: translate(26px,-30px) scale(1.08); }
        66% { transform: translate(-22px,24px) scale(0.94); }
      }
      @keyframes landingFloat {
        0%,100% { transform: translateY(0); }
        50% { transform: translateY(-12px); }
      }
      @keyframes landingFadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .landing-blob { animation: landingBlob 20s ease-in-out infinite; }
      .landing-float { animation: landingFloat 5s ease-in-out infinite; }
      .fade-up { opacity: 0; animation: landingFadeUp .7s ease-out forwards; }
      @media (prefers-reduced-motion: reduce) {
        .landing-blob, .landing-float { animation: none; }
        .fade-up { opacity: 1; animation: none; }
        .brand-cta { transition: none; }
      }
    `}</style>
  );
}
