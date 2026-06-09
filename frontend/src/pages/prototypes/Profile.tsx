import { useState } from "react"
import {
  ArrowLeft,
  Camera,
  Bell,
  Moon,
  Sun,
  Globe,
  // Shield,
  LogOut,
  ChevronRight,
  Volume2,
  Check,
  // HandMetal,
  // Sparkles,
  Eye,
  EyeOff,
} from "lucide-react"

export default function ProfilePage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [notif, setNotif] = useState(true)
  const [lang, setLang] = useState<"English" | "Urdu">("English")
  const [showPwd, setShowPwd] = useState(false)

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-[hsl(220,40%,13%)] text-[hsl(38,30%,90%)]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Ambient */}
      <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-[hsl(38,50%,72%)]/5 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[hsl(220,50%,45%)]/5 blur-[150px]" />

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/80 px-6 py-4 backdrop-blur-xl">
        <button className="flex h-9 w-9 items-center justify-center rounded-xl text-[hsl(220,15%,55%)] transition-colors hover:bg-[hsl(220,30%,20%)] hover:text-[hsl(38,30%,90%)]">
          <ArrowLeft size={16} />
        </button>
        <h1
          className="text-lg font-bold text-[hsl(38,30%,90%)]"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          Profile & Settings
        </h1>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl space-y-6 px-4 py-8">
        {/* ── PROFILE HERO ── */}
        <div className="rounded-2xl border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/40 p-6 shadow-[0_0_40px_-15px_hsl(38,50%,72%,0.15)] backdrop-blur-xl">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(38,50%,72%)] to-[hsl(220,50%,45%)] text-3xl font-bold text-[hsl(220,40%,13%)] shadow-[0_0_40px_-10px_hsl(38,50%,72%,0.5)]"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                A
              </div>
              <button className="absolute -right-1.5 -bottom-1.5 flex h-7 w-7 items-center justify-center rounded-xl border-2 border-[hsl(220,38%,16%)] bg-[hsl(38,50%,72%)] transition-colors hover:bg-[hsl(38,50%,65%)]">
                <Camera size={13} className="text-[hsl(220,40%,13%)]" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-3">
                <h2
                  className="text-2xl font-bold text-[hsl(38,30%,90%)]"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  Muhammad Daniyal
                </h2>
              </div>
              <p className="mb-2 font-mono text-sm text-[hsl(220,15%,45%)]">
                +92 300 1234567
              </p>
              <p className="text-sm text-[hsl(38,30%,70%)]">
                Online
              </p>
            </div>
          </div>
        </div>

        {/* ── EDIT PROFILE ── */}
        <div className="overflow-hidden rounded-2xl border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/40 backdrop-blur-xl">
          <div className="border-b border-[hsl(220,25%,22%)]/50 px-6 pt-5 pb-3">
            <p className="font-mono text-xs tracking-wider text-[hsl(38,50%,72%)] uppercase">
              Edit Profile
            </p>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(38,30%,80%)]">
                Full Name
              </label>
              <input
                defaultValue="Muhammad Daniyal"
                className="h-11 w-full rounded-xl border border-[hsl(220,25%,22%)] bg-[hsl(220,30%,20%)] px-4 text-sm text-[hsl(38,30%,90%)] transition-colors focus:border-[hsl(38,50%,72%)] focus:ring-1 focus:ring-[hsl(38,50%,72%)]/30 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(38,30%,80%)]">
                Phone Number
              </label>
              <input
                defaultValue="+92 300 1234567"
                disabled
                className="h-11 w-full cursor-not-allowed rounded-xl border border-[hsl(220,25%,22%)] bg-[hsl(220,25%,18%)] px-4 text-sm text-[hsl(220,15%,45%)]"
              />
              <p className="font-mono text-xs text-[hsl(220,15%,38%)]">
                Phone number cannot be changed
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(38,30%,80%)]">
                Status Message
              </label>
              <input
                defaultValue="Available for calls and chats"
                className="h-11 w-full rounded-xl border border-[hsl(220,25%,22%)] bg-[hsl(220,30%,20%)] px-4 text-sm text-[hsl(38,30%,90%)] transition-colors focus:border-[hsl(38,50%,72%)] focus:ring-1 focus:ring-[hsl(38,50%,72%)]/30 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(38,30%,80%)]">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Leave blank to keep current"
                  className="h-11 w-full rounded-xl border border-[hsl(220,25%,22%)] bg-[hsl(220,30%,20%)] px-4 pr-11 text-sm text-[hsl(38,30%,90%)] transition-colors placeholder:text-[hsl(220,15%,38%)] focus:border-[hsl(38,50%,72%)] focus:ring-1 focus:ring-[hsl(38,50%,72%)]/30 focus:outline-none"
                />
                <button
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-[hsl(220,15%,45%)] transition-colors hover:text-[hsl(38,30%,90%)]"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(38,50%,72%)] text-sm font-semibold text-[hsl(220,40%,13%)] shadow-[0_0_30px_-8px_hsl(38,50%,72%,0.5)] transition-colors hover:bg-[hsl(38,50%,65%)]">
              Save Changes
            </button>
          </div>
        </div>

        {/* ── APP SETTINGS ── */}
        <div className="overflow-hidden rounded-2xl border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/40 backdrop-blur-xl">
          <div className="border-b border-[hsl(220,25%,22%)]/50 px-6 pt-5 pb-3">
            <p className="font-mono text-xs tracking-wider text-[hsl(38,50%,72%)] uppercase">
              Application Settings
            </p>
          </div>
          <div className="divide-y divide-[hsl(220,25%,22%)]/50">
            {/* Theme */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon size={16} className="text-[hsl(220,50%,65%)]" />
                ) : (
                  <Sun size={16} className="text-yellow-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-[hsl(38,30%,90%)]">
                    Theme
                  </p>
                  <p className="text-xs text-[hsl(220,15%,45%)]">
                    Choose your display theme
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {(["light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${theme === t ? "bg-[hsl(38,50%,72%)] text-[hsl(220,40%,13%)] shadow-[0_0_15px_-5px_hsl(38,50%,72%,0.5)]" : "bg-[hsl(220,30%,20%)] text-[hsl(220,15%,55%)] hover:bg-[hsl(220,25%,25%)]"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Bell size={16} className="text-[hsl(38,50%,72%)]" />
                <div>
                  <p className="text-sm font-medium text-[hsl(38,30%,90%)]">
                    Notifications
                  </p>
                  <p className="text-xs text-[hsl(220,15%,45%)]">
                    Receive message and call alerts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotif(!notif)}
                className={`relative h-6 w-11 rounded-full transition-colors ${notif ? "bg-[hsl(38,50%,72%)]" : "bg-[hsl(220,30%,20%)]"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notif ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>

            {/* TTS Language */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Volume2 size={16} className="text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-[hsl(38,30%,90%)]">
                    TTS Language
                  </p>
                  <p className="text-xs text-[hsl(220,15%,45%)]">
                    Language for gesture text-to-speech
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {(["English", "Urdu"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${lang === l ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400" : "bg-[hsl(220,30%,20%)] text-[hsl(220,15%,55%)] hover:bg-[hsl(220,25%,25%)]"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* PSL Language detail */}
            <div className="flex items-center gap-3 px-6 py-4">
              <Globe size={16} className="text-[hsl(220,50%,65%)]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(38,30%,90%)]">
                  PSL Translation Language
                </p>
                <p className="text-xs text-[hsl(220,15%,45%)]">
                  Gestures will be spoken in{" "}
                  <span className="font-medium text-[hsl(38,30%,75%)]">
                    {lang === "English"
                      ? "English (en-US)"
                      : "Urdu (ur-PK)"}
                  </span>
                </p>
              </div>
              <Check size={14} className="flex-shrink-0 text-emerald-400" />
            </div>

            {/* PSL model info */}
            {/* <div className="flex items-center gap-3 px-6 py-4">
              <HandMetal size={16} className="text-[hsl(38,50%,72%)]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(38,30%,90%)]">
                  PSL Model Info
                </p>
                <p className="text-xs text-[hsl(220,15%,45%)]">
                  Keras TCN · 11 gestures · MediaPipe Hands · 80% confidence
                  threshold
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(38,50%,72%)]/30 bg-[hsl(38,50%,72%)]/10 px-2.5 py-0.5 font-mono text-xs text-[hsl(38,50%,72%)]">
                Active
              </span>
            </div> */}
          </div>
        </div>

        {/* ── ACCOUNT ── */}
        <div className="overflow-hidden rounded-2xl border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/40 backdrop-blur-xl">
          <div className="border-b border-[hsl(220,25%,22%)]/50 px-6 pt-5 pb-3">
            <p className="font-mono text-xs tracking-wider text-[hsl(38,50%,72%)] uppercase">
              Account
            </p>
          </div>
          <div className="divide-y divide-[hsl(220,25%,22%)]/50">
            {[
              // {
              //   icon: <Shield size={15} className="text-[hsl(220,50%,65%)]" />,
              //   label: "Privacy & Security",
              //   desc: "Manage your account security settings",
              //   danger: false,
              // },
              // {
              //   icon: <Sparkles size={15} className="text-[hsl(38,50%,72%)]" />,
              //   label: "About Signetix",
              //   desc: "Version 1.0.0 · PSL gesture recognition platform",
              //   danger: false,
              // },
              {
                icon: <LogOut size={15} className="text-red-400" />,
                label: "Log Out",
                desc: "Sign out of your account",
                danger: true,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex cursor-pointer items-center gap-3 px-6 py-4 transition-colors hover:bg-[hsl(220,30%,20%)]/50"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[hsl(220,30%,20%)]">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${item.danger ? "text-red-400" : "text-[hsl(38,30%,90%)]"}`}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-[hsl(220,15%,45%)]">{item.desc}</p>
                </div>
                <ChevronRight size={14} className="text-[hsl(220,15%,35%)]" />
              </div>
            ))}
          </div>
        </div>

        <p className="pb-4 text-center font-mono text-xs text-[hsl(220,15%,30%)]">
          Signetix v1.0.0 · © 2026
        </p>
      </div>
    </div>
  )
}
