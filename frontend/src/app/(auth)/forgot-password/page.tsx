"use client"
import { useState } from "react"
import { useCurrentUser } from "@/lib/auth/context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { forgotPassword } = useCurrentUser()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }
    setLoading(true)
    try {
      await forgotPassword(email)
      sessionStorage.setItem("reset_email", email)
      setSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset code"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    router.push("/reset-password")
  }

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="text-2xl font-bold tracking-tight mb-2">
          DealFlow<span className="text-accent">360</span>
        </div>
      </div>

      {!success ? (
        <>
          <h1 className="text-xl font-semibold text-text-primary mb-2 text-center">
            Reset your password
          </h1>
          <p className="text-sm text-text-secondary mb-6 text-center">
            Enter your email address and we&apos;ll send you a reset code.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                disabled={loading}
              />
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending…" : "Send Reset Code"}
              </Button>
            </div>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-text-primary mb-2">Check your email</h1>
          <p className="text-sm text-text-secondary mb-6">
            We&apos;ve sent a password reset code to{" "}
            <span className="font-medium text-text-primary">{email}</span>.
          </p>
          <Button className="w-full" onClick={handleContinue}>
            Enter Reset Code →
          </Button>
          <div className="mt-3">
            <Button variant="ghost" className="w-full text-text-muted" onClick={() => setSuccess(false)}>
              Try another email
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/login" className="hover:text-accent transition-colors">
          Return to login
        </Link>
      </div>
    </Card>
  )
}
