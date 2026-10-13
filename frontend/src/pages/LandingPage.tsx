import { Link } from "react-router-dom";
import {
  ArrowRight,
  Captions,
  Hand,
  MessageSquare,
  ShieldCheck,
  Sparkles,
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
    tint: "from-amber-400 to-orange-500",
  },
  {
    icon: Video,
    title: "Built-in video calls",
    description:
      "One-to-one video calling with a clean, adaptive grid that fits however many people join.",
    tint: "from-orange-400 to-rose-500",
  },
  {
    icon: Volume2,
    title: "Spoken captions",
    description:
      "Each recognized sign is read aloud with text-to-speech, so hearing participants follow along.",
    tint: "from-rose-400 to-red-500",
  },
  {
    icon: MessageSquare,
    title: "Messaging built in",
    description:
      "Real-time chat with your contacts — send text and media, with read and online status.",
    tint: "from-amber-400 to-rose-500",
  },
];

const STEPS = [
  { step: "1", title: "Create an account", text: "Sign up with your phone and email in seconds." },
  { step: "2", title: "Start a call", text: "Invite a contact or share a meeting link." },
  { step: "3", title: "Sign naturally", text: "Sign to the camera — captions and speech appear live." },
];

// Floating sign chips near the hero mockup: [label, position classes, float delay].
const FLOATING_SIGNS: [string, string, string][] = [
  ["Hello 👋", "-left-4 top-6 sm:-left-10", "0s"],
  ["Thank you 🙏", "-right-4 top-16 sm:-right-12", "1.2s"],
  ["Yes 👍", "-left-2 bottom-10 sm:-left-8", "2.1s"],
];

const CURRENT_YEAR = new Date().getFullYear();

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <LandingStyles />

      {/* Warm animated backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-orange-50/40 to-transparent dark:from-amber-500/10 dark:via-orange-500/5 dark:to-transparent" />
        <div className="landing-blob absolute -left-24 top-10 size-96 rounded-full bg-amber-400/30 blur-3xl dark:bg-amber-500/20" />
        <div className="landing-blob absolute -right-20 top-40 size-96 rounded-full bg-rose-400/25 blur-3xl dark:bg-rose-500/15" style={{ animationDelay: "-6s" }} />
        <div className="landing-blob absolute left-1/3 top-[32rem] size-96 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/10" style={{ animationDelay: "-12s" }} />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-amber-100/60 bg-background/70 backdrop-blur dark:border-white/5">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Signetix"
              className="size-9 object-contain dark:brightness-0 dark:invert"
            />
            <span className="text-lg font-semibold">Signetix</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button
              asChild
              className="border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25 hover:from-amber-600 hover:to-orange-700"
            >
              <Link to="/signup">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <div className="fade-up inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              <Sparkles className="size-3.5" />
              Pakistan Sign Language, recognized live
            </div>
            <h1
              className="fade-up mt-5 text-balance text-4xl font-bold tracking-tight sm:text-6xl"
              style={{ animationDelay: "0.08s" }}
            >
              Video calls that understand{" "}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                sign language
              </span>
            </h1>
            <p
              className="fade-up mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground lg:mx-0"
              style={{ animationDelay: "0.16s" }}
            >
              Signetix turns Pakistan Sign Language into live captions and speech
              during a video call — making conversations accessible for everyone.
            </p>
            <div
              className="fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
              style={{ animationDelay: "0.24s" }}
            >
              <Button
                asChild
                size="lg"
                className="border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 transition-transform hover:translate-y-[-2px] hover:from-amber-600 hover:to-orange-700"
              >
                <Link to="/signup">
                  Get started free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-amber-200 hover:bg-amber-50 dark:border-amber-500/20 dark:hover:bg-amber-500/10"
              >
                <Link to="/recognition-test">Try the live demo</Link>
              </Button>
            </div>
          </div>

          {/* Hero graphic */}
          <div className="fade-up relative" style={{ animationDelay: "0.2s" }}>
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Everything in one place
          </h2>
          <p className="mt-3 text-muted-foreground">
            Accessibility-first calling, with the messaging you already expect.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description, tint }) => (
            <div
              key={title}
              className="group rounded-2xl border bg-card/80 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10"
            >
              <div
                className={`mb-4 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-white shadow-md transition-transform group-hover:scale-110`}
              >
                <Icon className="size-5" />
              </div>
              <h3 className="font-medium">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative border-y border-amber-100/60 bg-amber-50/40 dark:border-white/5 dark:bg-amber-500/5">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              How it works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Up and running in three steps.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map(({ step, title, text }) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-semibold text-white shadow-lg shadow-orange-500/30">
                  {step}
                </div>
                <h3 className="font-medium">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-6 py-14 text-center text-white shadow-xl shadow-orange-500/20">
          <div aria-hidden className="landing-blob absolute -right-10 -top-10 size-48 rounded-full bg-white/15 blur-2xl" />
          <div aria-hidden className="landing-blob absolute -bottom-12 -left-8 size-56 rounded-full bg-white/10 blur-2xl" style={{ animationDelay: "-8s" }} />
          <ShieldCheck className="mx-auto mb-4 size-9" />
          <h2 className="text-balance text-3xl font-semibold tracking-tight">
            Start signing today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">
            Free to try. Create an account and make your first accessible call
            in minutes.
          </p>
          <div className="mt-7 flex justify-center">
            <Button
              asChild
              size="lg"
              className="border-0 bg-white text-orange-600 shadow-lg transition-transform hover:translate-y-[-2px] hover:bg-white/90"
            >
              <Link to="/signup">
                Create your account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-100/60 dark:border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Signetix"
              className="size-6 object-contain dark:brightness-0 dark:invert"
            />
            <span className="font-medium text-foreground">Signetix</span>
          </div>
          <span>© {CURRENT_YEAR} Signetix. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

/** Stylized video-call card with a signing figure, a live caption bar, and floating sign chips. */
function HeroMockup() {
  return (
    <div className="relative mx-auto max-w-md">
      {FLOATING_SIGNS.map(([label, position, delay]) => (
        <div
          key={label}
          className={`landing-float absolute z-10 rounded-full border border-amber-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-amber-800 shadow-md backdrop-blur dark:border-amber-500/20 dark:bg-zinc-900/80 dark:text-amber-200 ${position}`}
          style={{ animationDelay: delay }}
        >
          {label}
        </div>
      ))}

      <div className="rounded-3xl bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-rose-500/30 p-1.5 shadow-2xl shadow-orange-500/20">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-zinc-900 to-zinc-800">
          {/* signing figure */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="landing-float flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-5xl shadow-xl shadow-orange-900/40">
              🤟
            </div>
          </div>

          {/* top status row */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <span className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              <Captions className="size-3" />
              Live captions
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-red-500" />
              </span>
              REC
            </span>
          </div>

          {/* caption bar */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center p-4">
            <div className="flex items-center gap-3 rounded-full bg-white/95 px-5 py-2.5 shadow-lg backdrop-blur dark:bg-zinc-900/90">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-green-500" />
              </span>
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text font-semibold text-transparent">
                Thank you
              </span>
              <span className="text-sm text-muted-foreground">98%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Keyframes for the landing animations (respects reduced-motion). */
function LandingStyles() {
  return (
    <style>{`
      @keyframes landingBlob {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(24px, -28px) scale(1.08); }
        66% { transform: translate(-20px, 22px) scale(0.95); }
      }
      @keyframes landingFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-12px); }
      }
      @keyframes landingFadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .landing-blob { animation: landingBlob 20s ease-in-out infinite; }
      .landing-float { animation: landingFloat 5s ease-in-out infinite; }
      .fade-up { opacity: 0; animation: landingFadeUp 0.7s ease-out forwards; }
      @media (prefers-reduced-motion: reduce) {
        .landing-blob, .landing-float { animation: none; }
        .fade-up { opacity: 1; animation: none; }
      }
    `}</style>
  );
}
