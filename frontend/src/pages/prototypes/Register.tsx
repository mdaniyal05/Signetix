import { useState } from 'react'
import { Eye, EyeOff, CheckCircle2, Sparkles, ArrowRight, Check } from 'lucide-react'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(0)

  return (
    <div className="min-h-screen bg-[hsl(220,40%,13%)] text-[hsl(38,30%,90%)] flex items-center justify-center p-4 relative overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Ambient glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[hsl(38,50%,72%)]/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[hsl(220,50%,45%)]/8 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(hsl(38,30%,90%) 1px, transparent 1px), linear-gradient(90deg, hsl(38,30%,90%) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="w-full max-w-md relative z-10">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[hsl(220,38%,16%)]/40 backdrop-blur-xl border border-[hsl(220,25%,22%)]/50 rounded-full px-4 py-2 mb-6 text-sm text-[hsl(220,15%,55%)]">
            <Sparkles size={14} className="text-[hsl(38,50%,72%)]" />
            PSL Gesture Recognition
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(38,50%,72%)] to-[hsl(220,50%,65%)]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            SIGNETIX
          </h1>
          <p className="text-[hsl(220,15%,55%)] mt-2 text-sm">Create your account</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {['Account Info', 'Verify OTP'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${i < step ? 'bg-[hsl(38,50%,72%)] text-[hsl(220,40%,13%)]' :
                  i === step ? 'bg-[hsl(38,50%,72%)] text-[hsl(220,40%,13%)]' :
                  'bg-[hsl(220,30%,20%)] text-[hsl(220,15%,55%)]'}`}>
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              <span className={`text-sm ${i === step ? 'text-[hsl(38,30%,90%)] font-medium' : 'text-[hsl(220,15%,55%)]'}`}>{s}</span>
              {i < 1 && <div className="h-px w-8 bg-[hsl(220,25%,22%)]" />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-[hsl(220,38%,16%)]/40 backdrop-blur-xl border border-[hsl(220,25%,22%)]/50 rounded-2xl p-8 shadow-[0_0_40px_-10px_hsl(38,50%,72%,0.15)]">

          {step === 0 ? (
            <>
              <h2 className="text-2xl font-bold text-[hsl(38,30%,90%)] mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Account Information</h2>
              <p className="text-sm text-[hsl(220,15%,55%)] mb-6">Fill in your details to get started</p>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[hsl(38,30%,85%)]">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Ali Hassan"
                    className="w-full h-11 px-4 rounded-xl bg-[hsl(220,30%,20%)] border border-[hsl(220,25%,22%)] text-[hsl(38,30%,90%)] text-sm focus:outline-none focus:border-[hsl(38,50%,72%)] focus:ring-1 focus:ring-[hsl(38,50%,72%)]/30 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[hsl(38,30%,85%)]">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="+92 300 1234567"
                    className="w-full h-11 px-4 rounded-xl bg-[hsl(220,30%,20%)] border border-[hsl(220,25%,22%)] text-[hsl(38,30%,90%)] text-sm focus:outline-none focus:border-[hsl(38,50%,72%)] focus:ring-1 focus:ring-[hsl(38,50%,72%)]/30 transition-colors"
                  />
                  <p className="text-xs text-[hsl(220,15%,45%)]">International format required, e.g. +923001234567</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[hsl(38,30%,85%)]">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      defaultValue="Password@123"
                      className="w-full h-11 px-4 pr-11 rounded-xl bg-[hsl(220,30%,20%)] border border-[hsl(220,25%,22%)] text-[hsl(38,30%,90%)] text-sm focus:outline-none focus:border-[hsl(38,50%,72%)] focus:ring-1 focus:ring-[hsl(38,50%,72%)]/30 transition-colors"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(220,15%,55%)] hover:text-[hsl(38,30%,90%)] transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[hsl(38,30%,85%)]">Confirm Password</label>
                  <input
                    type="password"
                    defaultValue="Password@123"
                    className="w-full h-11 px-4 rounded-xl bg-[hsl(220,30%,20%)] border border-[hsl(220,25%,22%)] text-[hsl(38,30%,90%)] text-sm focus:outline-none focus:border-[hsl(38,50%,72%)] focus:ring-1 focus:ring-[hsl(38,50%,72%)]/30 transition-colors"
                  />
                </div>

                {/* Password rules */}
                <div className="rounded-xl bg-[hsl(220,30%,20%)] p-3 border border-[hsl(220,25%,22%)]">
                  <p className="text-xs text-[hsl(38,50%,72%)] font-mono uppercase tracking-wider mb-2">Password Requirements</p>
                  <div className="space-y-1">
                    {['At least 8 characters', 'One uppercase letter', 'One number', 'One special character'].map(r => (
                      <div key={r} className="flex items-center gap-2 text-xs text-[hsl(220,15%,55%)]">
                        <CheckCircle2 size={12} className="text-[hsl(38,50%,72%)]" />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="w-full h-11 flex items-center justify-center gap-2 bg-[hsl(38,50%,72%)] text-[hsl(220,40%,13%)] rounded-xl font-semibold text-sm hover:bg-[hsl(38,50%,65%)] transition-colors shadow-[0_0_30px_-8px_hsl(38,50%,72%,0.5)] group mt-2"
                >
                  Continue
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-[hsl(38,30%,90%)] mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Verify Your Phone</h2>
              <p className="text-sm text-[hsl(220,15%,55%)] mb-6">
                We sent a 6-digit OTP to{' '}
                <span className="text-[hsl(38,30%,90%)] font-medium">+92 300 1234567</span>
              </p>

              <div className="space-y-5">
                {/* OTP boxes */}
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      defaultValue={i <= 4 ? String(i * 2 - 1) : ''}
                      className="h-14 w-12 rounded-xl bg-[hsl(220,30%,20%)] border-2 border-[hsl(220,25%,22%)] text-center text-xl font-bold text-[hsl(38,30%,90%)] focus:border-[hsl(38,50%,72%)] focus:outline-none focus:ring-1 focus:ring-[hsl(38,50%,72%)]/30 transition-colors"
                    />
                  ))}
                </div>

                <p className="text-center text-sm text-[hsl(220,15%,55%)]">
                  Didn't receive it?{' '}
                  <button className="text-[hsl(38,50%,72%)] font-medium hover:text-[hsl(38,50%,60%)] transition-colors">Resend OTP</button>
                </p>

                <button className="w-full h-11 flex items-center justify-center gap-2 bg-[hsl(38,50%,72%)] text-[hsl(220,40%,13%)] rounded-xl font-semibold text-sm hover:bg-[hsl(38,50%,65%)] transition-colors shadow-[0_0_30px_-8px_hsl(38,50%,72%,0.5)]">
                  Verify & Continue
                </button>

                <button onClick={() => setStep(0)} className="w-full text-sm text-[hsl(220,15%,55%)] hover:text-[hsl(38,30%,90%)] transition-colors py-1">
                  ← Back
                </button>
              </div>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-[hsl(220,25%,22%)]/50 text-center">
            <p className="text-sm text-[hsl(220,15%,55%)]">
              Already have an account?{' '}
              <button onClick={() => setStep(0)} className="text-[hsl(38,50%,72%)] font-medium hover:text-[hsl(38,50%,60%)] transition-colors">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
