"use client"
import { useState } from "react"
import { useCurrentUser } from "@/lib/auth/context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useCurrentUser()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.requires2FA) {
        // Store email in session for 2FA step
        sessionStorage.setItem("2fa_email", result.email || email)
        router.push("/verify-otp?purpose=login_2fa")
      } else {
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="text-2xl font-bold tracking-tight mb-2">
          DealFlow<span className="text-accent">360</span>
        </div>
        <div className="flex gap-4 mt-2">
          <span className="text-sm font-medium text-accent">Sign In</span>
          <Link
            href="/signup"
            className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            Register
          </Link>
        </div>
      </div>

      <h1 className="text-xl font-semibold text-text-primary mb-6 text-center">
        Sign in to your account
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Password
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex items-center justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-accent hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <div className="pt-1">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/signup" className="hover:text-accent transition-colors">
          Don&apos;t have an account? Register
        </Link>
      </div>
    </Card>
  )
}
