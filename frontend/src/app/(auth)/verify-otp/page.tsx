"use client";
import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useCurrentUser } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowRight, ShieldCheck, KeyRound } from "lucide-react"

function VerifyOtpContent() {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [timer, setTimer] = useState(60)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { verifyEmail, verify2FA, resendOtp } = useCurrentUser()
  const searchParams = useSearchParams()
  const router = useRouter()

  const purpose = (searchParams.get("purpose") || "signup") as "signup" | "login_2fa"
  const email =
    typeof window !== "undefined"
      ? sessionStorage.getItem(purpose === "login_2fa" ? "2fa_email" : "pending_email") || ""
      : ""

  useEffect(() => {
    const int = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000)
    return () => clearInterval(int)
  }, [])

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(""))
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join("")
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }
    setLoading(true)
    setError("")
    try {
      let verifiedUser = null
      if (purpose === "signup") {
        verifiedUser = await verifyEmail(email, fullCode)
      } else {
        verifiedUser = await verify2FA(email, fullCode)
      }
      
      if (verifiedUser?.role === "customer") {
        router.push("/portal")
      } else {
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid OTP code"
      setError(msg)
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (timer > 0) return
    try {
      await resendOtp(email, purpose === "signup" ? "signup_verify" : "password_reset")
      setTimer(60)
      setError("")
    } catch {
      setError("Failed to resend OTP")
    }
  }

  const Icon = purpose === "login_2fa" ? ShieldCheck : KeyRound

  return (
    <div className="w-full">
      <div className="mb-10 text-center lg:text-left">
        <div className="inline-flex items-center justify-center lg:justify-start gap-2 mb-6">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-heading font-extrabold tracking-tight text-text-primary">
            DealFlow<span className="text-accent">360</span>
          </span>
        </div>
        
        <h1 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight mb-2">
          {purpose === "login_2fa" ? "Two-Factor Authentication" : "Verify your email"}
        </h1>
        <p className="text-sm font-medium text-text-secondary">
          {purpose === "login_2fa"
            ? "Enter the 6-digit code we sent to your email to complete login."
            : "We've sent a 6-digit verification code to your email."}
        </p>
        {email && (
          <p className="mt-2 text-sm font-bold text-accent">{email}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-3">
            Verification Code
          </label>
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {code.map((digit, idx) => (
              <Input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-mono font-bold bg-surface border-border shadow-sm focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-danger-soft border border-danger/30 text-sm font-medium text-danger flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-accent/20 flex items-center justify-center gap-2 group" disabled={loading}>
          {loading ? "Verifying…" : "Verify & Continue"}
          {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={handleResend}
          disabled={timer > 0}
          className={`text-sm font-medium transition-colors ${
            timer > 0
              ? "text-text-muted cursor-not-allowed"
              : "text-accent hover:text-accent-hover"
          }`}
        >
          {timer > 0 ? `Didn't receive? Resend in ${timer}s` : "Resend code"}
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-border/50 text-center">
        <p className="text-sm text-text-secondary">
          <Link href="/login" className="font-bold text-accent hover:text-accent-hover transition-colors">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpContent />
    </Suspense>
  )
}
