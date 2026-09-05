"use client"
import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useCurrentUser } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

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
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (timer > 0) return
    try {
      await resendOtp(email, purpose === "signup" ? "signup_verify" : "password_reset")
      setTimer(60)
    } catch {
      setError("Failed to resend OTP")
    }
  }

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="text-2xl font-bold tracking-tight mb-2">
          DealFlow<span className="text-accent">360</span>
        </div>
      </div>

      <h1 className="text-2xl font-semibold text-text-primary mb-2 text-center">
        Verify Identity
      </h1>
      <p className="text-sm text-text-secondary text-center mb-6">
        {purpose === "signup"
          ? "We've sent a 6-digit verification code to your email."
          : "Enter the 2FA code we sent to your email."}
        {email && (
          <span className="block mt-1 font-medium text-text-primary">{email}</span>
        )}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {code.map((digit, idx) => (
            <Input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-12 text-center text-lg font-medium p-0"
              disabled={loading}
            />
          ))}
        </div>

        {error && <p className="text-xs text-danger text-center">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying…" : "Verify & Continue"}
        </Button>
      </form>

      {purpose !== "login_2fa" && (
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
      )}

      <div className="mt-4 text-center text-sm text-text-secondary">
        <Link href="/login" className="hover:text-accent transition-colors">
          Back to login
        </Link>
      </div>
    </Card>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpContent />
    </Suspense>
  )
}
