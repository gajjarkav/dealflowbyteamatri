"use client";
import { useState } from "react"
import { useCurrentUser } from "@/lib/auth/context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowRight, Mail, Lock, User, Building2, Phone } from "lucide-react"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    mobile_number: "",
    company_name: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signup } = useCurrentUser()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.full_name) return setError("Full name is required.")
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return setError("Invalid email address.")
    if (formData.password.length < 8) return setError("Password must be at least 8 characters.")
    if (!formData.company_name) return setError("Company name is required.")

    setLoading(true)
    try {
      await signup(formData)
      // Store email so verify-otp page knows the email
      sessionStorage.setItem("pending_email", formData.email)
      router.push("/verify-otp?purpose=signup")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account"
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
          Create an account
        </h1>
        <p className="text-sm font-medium text-text-secondary">
          Join thousands of sales teams accelerating their deals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Full Name <span className="text-accent">*</span>
          </label>
          <div className="relative group">
            <Input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Jane Smith"
              disabled={loading}
              className="h-11 pl-10 bg-surface border-border shadow-sm group-hover:border-accent/40 transition-colors"
            />
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Company Name <span className="text-accent">*</span>
          </label>
          <div className="relative group">
            <Input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Acme Corp"
              disabled={loading}
              className="h-11 pl-10 bg-surface border-border shadow-sm group-hover:border-accent/40 transition-colors"
            />
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Work Email <span className="text-accent">*</span>
          </label>
          <div className="relative group">
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@company.com"
              disabled={loading}
              className="h-11 pl-10 bg-surface border-border shadow-sm group-hover:border-accent/40 transition-colors"
            />
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Password <span className="text-accent">*</span>
            </label>
            <div className="relative group">
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 8 chars"
                disabled={loading}
                className="h-11 pl-10 bg-surface border-border shadow-sm group-hover:border-accent/40 transition-colors"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Mobile <span className="text-text-muted/50 font-normal lowercase">(Optional)</span>
            </label>
            <div className="relative group">
              <Input
                type="tel"
                value={formData.mobile_number}
                onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                placeholder="+1 555 000"
                disabled={loading}
                className="h-11 pl-10 bg-surface border-border shadow-sm group-hover:border-accent/40 transition-colors"
              />
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 mt-2 rounded-lg bg-danger-soft border border-danger/30 text-sm font-medium text-danger flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            {error}
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-accent/20 flex items-center justify-center gap-2 group" disabled={loading}>
            {loading ? "Creating account..." : "Start your free trial"}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-border/50 text-center">
        <p className="text-sm font-medium text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-accent hover:text-accent-hover transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
