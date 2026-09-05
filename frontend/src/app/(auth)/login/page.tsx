"use client"
import { useState } from "react"
import { useCurrentUser } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useCurrentUser()

  const handleDemoLogin = async () => {
    try {
      await login("demo@dealflow360.com")
    } catch {
      setError("Failed to login as demo user")
    }
  }

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
    try {
      await login(email)
    } catch {
      setError("Incorrect email or password")
    }
  }

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="text-2xl font-bold tracking-tight mb-2">DealFlow<span className="text-accent">360</span></div>
        <div className="flex gap-4 mt-2">
          <span className="text-sm font-medium text-accent">Sign In</span>
          <Link href="/signup" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors">Register</Link>
        </div>
      </div>
      <h1 className="text-xl font-semibold text-text-primary mb-6 text-center">Sign in to your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="you@company.com" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••" 
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="pt-2">
          <Button type="submit" className="w-full">Sign In</Button>
        </div>
      </form>
      
      <div className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/signup" className="hover:text-accent transition-colors">Don&apos;t have an account? Register</Link>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <Button variant="ghost" className="w-full text-text-muted hover:text-text-primary" onClick={handleDemoLogin}>
          Continue as demo user
        </Button>
      </div>
    </Card>
  )
}
