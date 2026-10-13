import { Link } from "react-router-dom";
import {
  ArrowRight,
  Captions,
  Hand,
  MessageSquare,
  ShieldCheck,
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
  },
  {
    icon: Video,
    title: "Built-in video calls",
    description:
      "One-to-one video calling with a clean, adaptive grid that fits however many people join.",
  },
  {
    icon: Volume2,
    title: "Spoken captions",
    description:
      "Each recognized sign is read aloud with text-to-speech, so hearing participants follow along.",
  },
  {
    icon: MessageSquare,
    title: "Messaging built in",
    description:
      "Real-time chat with your contacts — send text and media, with read and online status.",
  },
];

const STEPS = [
  { step: "1", title: "Create an account", text: "Sign up with your phone and email in seconds." },
  { step: "2", title: "Start a call", text: "Invite a contact or share a meeting link." },
  { step: "3", title: "Sign naturally", text: "Sign to the camera — captions and speech appear live." },
];

const CURRENT_YEAR = new Date().getFullYear();

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Hand className="size-5" />
            </div>
            <span className="text-lg font-semibold">Signetix</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 -top-40 -z-10 size-144 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Captions className="size-3.5" />
            Pakistan Sign Language, recognized live
          </div>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Video calls that understand{" "}
            <span className="text-primary">sign language</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
            Signetix turns Pakistan Sign Language into live captions and speech
            during a video call — making conversations accessible for everyone.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/signup">
                Get started free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/recognition-test">Try the live demo</Link>
            </Button>
          </div>

          {/* Caption preview */}
          <div className="mx-auto mt-14 max-w-2xl">
            <div className="relative aspect-video overflow-hidden rounded-2xl border bg-muted shadow-sm">
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <Video className="size-10 opacity-40" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex justify-center p-4">
                <div className="flex items-center gap-3 rounded-full bg-black/70 px-5 py-2.5 text-white backdrop-blur-sm">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                  </span>
                  <span className="font-medium">Thank you</span>
                  <span className="text-sm text-white/60">98%</span>
                </div>
              </div>
            </div>
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
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border bg-card p-5 transition-colors hover:bg-accent/40"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
      <section className="border-y bg-muted/30">
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
                <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
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
        <div className="relative overflow-hidden rounded-2xl border bg-card px-6 py-14 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-primary/5"
          />
          <ShieldCheck className="mx-auto mb-4 size-8 text-primary" />
          <h2 className="text-balance text-3xl font-semibold tracking-tight">
            Start signing today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Free to try. Create an account and make your first accessible call
            in minutes.
          </p>
          <div className="mt-7 flex justify-center">
            <Button asChild size="lg">
              <Link to="/signup">
                Create your account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Hand className="size-4" />
            <span>Signetix</span>
          </div>
          <span>© {CURRENT_YEAR} Signetix. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
