"use client"
import { useState } from "react"
import { useCurrentUser } from "@/lib/auth/context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowRight, Mail, Lock } from "lucide-react"

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
    <div className="w-full">
      <div className="mb-10 text-center lg:text-left">
        <div className="inline-flex items-center justify-center lg:justify-start gap-2 mb-6">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin-slow"></div>
          </div>
          <span className="text-2xl font-heading font-extrabold tracking-tight text-text-primary">
            DealFlow<span className="text-accent">360</span>
          </span>
        </div>
        
        <h1 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight mb-2">
          Welcome back
        </h1>
        <p className="text-sm font-medium text-text-secondary">
          Enter your credentials to access your workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Work Email
          </label>
          <div className="relative group">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              disabled={loading}
              className="h-12 pl-11 bg-surface border-border shadow-sm group-hover:border-accent/40 transition-colors"
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-accent hover:text-accent-hover transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="h-12 pl-11 bg-surface border-border shadow-sm group-hover:border-accent/40 transition-colors"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm font-medium text-red-600 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-accent/20 flex items-center justify-center gap-2 group" disabled={loading}>
          {loading ? "Authenticating..." : "Sign In to Workspace"}
          {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-border/50 text-center">
        <p className="text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-accent hover:text-accent-hover transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
