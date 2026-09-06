"use client";
import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowRight, Lock, CheckCircle2 } from "lucide-react"

function ResetPasswordForm() {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [timer, setTimer] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const { resetPassword, resendOtp } = useCurrentUser()

  const email =
    typeof window !== "undefined" ? sessionStorage.getItem("reset_email") || "" : ""

  useEffect(() => {
    const int = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000)
    return () => clearInterval(int)
  }, [])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
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
    setError("")
    const fullCode = code.join("")
    if (fullCode.length !== 6) {
      setError("Please enter the 6-digit reset code.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setLoading(true)
    try {
      await resetPassword(email, fullCode, password)
      setDone(true)
      sessionStorage.removeItem("reset_email")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Reset failed"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (timer > 0) return
    try {
      await resendOtp(email, "password_reset")
      setTimer(60)
    } catch {
      setError("Failed to resend OTP")
    }
  }

  if (done) {
    return (
      <div className="w-full">
        <div className="mb-10 text-center lg:text-left">
          <div className="inline-flex items-center justify-center lg:justify-start gap-2 mb-6">
            <div className="w-10 h-10 bg-success rounded-xl flex items-center justify-center shadow-lg shadow-success/20">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-heading font-extrabold tracking-tight text-text-primary">
              DealFlow<span className="text-accent">360</span>
            </span>
          </div>
          
          <h1 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight mb-2">
            Password Reset!
          </h1>
          <p className="text-sm font-medium text-text-secondary">
            Your password has been updated successfully. You can now log in with your new credentials.
          </p>
        </div>

        <Button className="w-full h-12 font-bold shadow-lg shadow-accent/20 flex items-center justify-center gap-2 group" onClick={() => router.push("/login")}>
          Go to Login
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-10 text-center lg:text-left">
        <div className="inline-flex items-center justify-center lg:justify-start gap-2 mb-6">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-heading font-extrabold tracking-tight text-text-primary">
            DealFlow<span className="text-accent">360</span>
          </span>
        </div>
        
        <h1 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight mb-2">
          Set new password
        </h1>
        <p className="text-sm font-medium text-text-secondary">
          Enter the 6-digit code from your email{email ? ` (${email})` : ""} and your new password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-3">
            Reset Code
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
                onChange={(e) => handleCodeChange(idx, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-mono font-bold bg-surface border-border shadow-sm focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                disabled={loading}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            New Password <span className="text-accent">*</span>
          </label>
          <div className="relative group">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              disabled={loading}
              className="h-12 pl-11 bg-surface border-border shadow-sm group-hover:border-accent/40 transition-colors"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Confirm Password <span className="text-accent">*</span>
          </label>
          <div className="relative group">
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="h-12 pl-11 bg-surface border-border shadow-sm group-hover:border-accent/40 transition-colors"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-danger-soft border border-danger/30 text-sm font-medium text-danger flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-accent/20 flex items-center justify-center gap-2 group" disabled={loading}>
          {loading ? "Resetting…" : "Reset Password"}
          {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </Button>
      </form>

      <div className="mt-4 text-center">
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm text-text-secondary">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
