import { useState } from "react"
import { Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(220,40%,13%)] p-4 text-[hsl(38,30%,90%)]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
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

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/40 px-4 py-2 text-sm text-[hsl(220,15%,55%)] backdrop-blur-xl">
            <Sparkles size={14} className="text-[hsl(38,50%,72%)]" />
            PSL Gesture Recognition
          </div>
          <h1
            className="bg-gradient-to-r from-[hsl(38,50%,72%)] to-[hsl(220,50%,65%)] bg-clip-text text-4xl font-bold text-transparent"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            SIGNETIX
          </h1>
          <p className="mt-2 text-sm text-[hsl(220,15%,55%)]">
            Sign in to continue
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/40 p-8 shadow-[0_0_40px_-10px_hsl(38,50%,72%,0.15)] backdrop-blur-xl">
          <h2
            className="mb-1 text-2xl font-bold text-[hsl(38,30%,90%)]"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Welcome back
          </h2>
          <p className="mb-6 text-sm text-[hsl(220,15%,55%)]">
            Enter your credentials to continue
          </p>

          <div className="space-y-5">
            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(38,30%,85%)]">
                Phone Number
              </label>
              <input
                type="tel"
                defaultValue="+92 300 1234567"
                className="h-11 w-full rounded-xl border border-[hsl(220,25%,22%)] bg-[hsl(220,30%,20%)] px-4 text-sm text-[hsl(38,30%,90%)] transition-colors placeholder:text-[hsl(220,15%,40%)] focus:border-[hsl(38,50%,72%)] focus:ring-1 focus:ring-[hsl(38,50%,72%)]/30 focus:outline-none"
                placeholder="+92 300 1234567"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[hsl(38,30%,85%)]">
                  Password
                </label>
                <button className="text-xs text-[hsl(38,50%,72%)] transition-colors hover:text-[hsl(38,50%,60%)]">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  defaultValue="Password@123"
                  className="h-11 w-full rounded-xl border border-[hsl(220,25%,22%)] bg-[hsl(220,30%,20%)] px-4 pr-11 text-sm text-[hsl(38,30%,90%)] transition-colors placeholder:text-[hsl(220,15%,40%)] focus:border-[hsl(38,50%,72%)] focus:ring-1 focus:ring-[hsl(38,50%,72%)]/30 focus:outline-none"
                  placeholder="Your password"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-[hsl(220,15%,55%)] transition-colors hover:text-[hsl(38,30%,90%)]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button className="group mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(38,50%,72%)] text-sm font-semibold text-[hsl(220,40%,13%)] shadow-[0_0_30px_-8px_hsl(38,50%,72%,0.5)] transition-colors hover:bg-[hsl(38,50%,65%)]">
              Sign In
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>

          <div className="mt-6 border-t border-[hsl(220,25%,22%)]/50 pt-6 text-center">
            <p className="text-sm text-[hsl(220,15%,55%)]">
              Don't have an account?{" "}
              <button className="font-medium text-[hsl(38,50%,72%)] transition-colors hover:text-[hsl(38,50%,60%)]">
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
