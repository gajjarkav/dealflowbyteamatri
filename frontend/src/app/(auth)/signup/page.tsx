"use client"
import { useState } from "react"
import { useCurrentUser } from "@/lib/auth/context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

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
    <Card className="p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="text-2xl font-bold tracking-tight mb-2">
          DealFlow<span className="text-accent">360</span>
        </div>
        <div className="flex gap-4 mt-2">
          <Link
            href="/login"
            className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            Sign In
          </Link>
          <span className="text-sm font-medium text-accent">Register</span>
        </div>
      </div>

      <h1 className="text-xl font-semibold text-text-primary mb-6 text-center">
        Create an account
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Full Name
          </label>
          <Input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Jane Smith"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Company Name
          </label>
          <Input
            type="text"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            placeholder="Acme Corp"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Work Email
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@company.com"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Mobile Number <span className="text-text-muted">(optional)</span>
          </label>
          <Input
            type="tel"
            value={formData.mobile_number}
            onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
            placeholder="+1 (555) 000-0000"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Password
          </label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Min. 8 characters"
            disabled={loading}
          />
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Register"}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/login" className="hover:text-accent transition-colors">
          Already have an account? Sign in
        </Link>
      </div>
    </Card>
  )
}
