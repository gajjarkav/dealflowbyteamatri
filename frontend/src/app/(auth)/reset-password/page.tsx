"use client"
import { useState, Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

function ResetPasswordForm() {
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [timer, setTimer] = useState(60)
  const router = useRouter()
  const { resetPassword, resendOtp } = useCurrentUser()

  const email =
    typeof window !== "undefined" ? sessionStorage.getItem("reset_email") || "" : ""

  useEffect(() => {
    const int = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000)
    return () => clearInterval(int)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!code || code.length !== 6) {
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
      await resetPassword(email, code, password)
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
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">Password Reset!</h1>
        <p className="text-sm text-text-secondary mb-6">
          Your password has been updated. You can now log in.
        </p>
        <Button className="w-full" onClick={() => router.push("/login")}>
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-text-primary mb-2 text-center">
        Set new password
      </h1>
      <p className="text-sm text-text-secondary mb-6 text-center">
        Enter the 6-digit code from your email{email ? ` (${email})` : ""} and your new password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Reset Code (6 digits)
          </label>
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            maxLength={6}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            New Password
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Confirm New Password
          </label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Resetting…" : "Reset Password"}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm">
        <button
          onClick={handleResend}
          disabled={timer > 0}
          className={`font-medium transition-colors ${
            timer > 0
              ? "text-text-muted cursor-not-allowed"
              : "text-accent hover:text-accent-hover"
          }`}
        >
          {timer > 0 ? `Didn't receive? Resend in ${timer}s` : "Resend code"}
        </button>
      </div>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="text-2xl font-bold tracking-tight mb-2">
          DealFlow<span className="text-accent">360</span>
        </div>
      </div>

      <Suspense fallback={<div className="text-center text-sm text-text-secondary">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>

      <div className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/login" className="hover:text-accent transition-colors">
          Return to login
        </Link>
      </div>
    </Card>
  )
}
