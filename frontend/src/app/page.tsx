"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/lib/auth/context"
import { Playfair_Display } from 'next/font/google'
import { cn } from "@/lib/utils"

const playfair = Playfair_Display({ subsets: ['latin'] })

export default function LandingPage() {
  const router = useRouter()
  const { login } = useCurrentUser()
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    if (!loginEmail || !/^\S+@\S+\.\S+$/.test(loginEmail)) {
      setLoginError("Please enter a valid email address.")
      return
    }
    if (loginPassword.length < 6) {
      setLoginError("Password must be at least 6 characters.")
      return
    }
    try {
      const result = await login(loginEmail, loginPassword)
      if (result.requires2FA) {
        sessionStorage.setItem("2fa_email", result.email || loginEmail)
        router.push("/verify-otp?purpose=login_2fa")
      } else {
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in. Please try again."
      setLoginError(msg)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar placeholder */}
      <header className="h-14 border-b border-border flex items-center px-8">
        <div className="text-xl font-bold tracking-tight">DealFlow<span className="text-accent">360</span></div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className={cn("text-3xl md:text-5xl font-bold text-text-primary mb-6 leading-tight", playfair.className)}>
            DealFlow360 — The Self-Governing Sales Engine
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Quotations to cash. Discounts that route themselves. Stock that splits itself. Customers that negotiate in real time.
          </p>
        </div>

        {/* Sliding Auth Panel */}
        <div className="relative w-full max-w-4xl bg-surface border border-border rounded-md shadow-lg overflow-hidden flex min-h-[500px]">
          
          {/* Left Background (Sign In prompt) */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center text-center">
            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Welcome Back!</h2>
            <p className="text-sm text-text-secondary mb-8">To keep connected with us please login with your personal info</p>
            <Button variant="secondary" className="w-40">Sign In</Button>
          </div>

          {/* Right Background (Register prompt) */}
          <div className="hidden md:flex w-1/2 p-8 flex-col justify-center items-center text-center">
            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Hello, Friend!</h2>
            <p className="text-sm text-text-secondary mb-8">Enter your personal details and start your journey with us</p>
            <Button variant="secondary" onClick={() => router.push("/signup")} className="w-40">Register</Button>
          </div>

          <div className={cn(
            "absolute top-0 left-0 h-full w-full md:w-1/2 bg-background border-x border-border flex flex-col justify-center p-8 transition-transform duration-500 ease-in-out",
            "translate-x-0"
          )}>
            
            <div className="flex flex-col items-center mb-8">
              <div className="text-2xl font-bold tracking-tight mb-2">DealFlow<span className="text-accent">360</span></div>
              <div className="flex gap-4 mt-2">
                <button className="text-sm font-medium transition-colors text-accent">Sign In</button>
                <button onClick={() => router.push("/signup")} className="text-sm font-medium transition-colors text-text-muted hover:text-text-primary">Register</button>
              </div>
            </div>

              <div className="animate-in fade-in zoom-in-95 duration-300">
                <h3 className="text-xl font-semibold mb-6 text-center">Sign in to your account</h3>
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <Input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                  <Input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                  {loginError && <p className="text-xs text-danger">{loginError}</p>}
                  <div className="flex justify-end">
                    <span className="text-xs text-text-secondary hover:text-text-primary cursor-pointer" onClick={() => router.push("/forgot-password")}>Forgot your password?</span>
                  </div>
                  <Button type="submit" className="w-full mt-4">Sign In</Button>
                </form>
                <div className="mt-6 md:hidden text-center text-sm text-text-secondary">
                  <span className="cursor-pointer hover:text-accent" onClick={() => router.push("/signup")}>Don&apos;t have an account? Register</span>
                </div>
              </div>
          </div>
        </div>

        {/* Feature Strips */}
        <div className="w-full max-w-4xl mt-24 space-y-12">
          <div className="border-t border-border pt-8 text-center">
            <h3 className="text-xl font-medium text-text-primary mb-2 max-w-2xl mx-auto">Automated Deal Desk Routing</h3>
            <p className="text-sm text-text-secondary">Skip the email chain. DealFlow360 automatically loops in the right approvers based on discount thresholds.</p>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <h3 className="text-xl font-medium text-text-primary mb-2 max-w-2xl mx-auto">Real-time Negotiation Portal</h3>
            <p className="text-sm text-text-secondary">Customers view, accept, or counter-offer directly in a secure portal linked right to your CRM.</p>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <h3 className="text-xl font-medium text-text-primary mb-2 max-w-2xl mx-auto">Instant Inventory Sync</h3>
            <p className="text-sm text-text-secondary">Odoo integration ensures what you sell is what you have. No more manual stock checks.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-surface py-12 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="text-xl font-bold tracking-tight mb-4">DealFlow<span className="text-accent">360</span></div>
            <p className="text-sm text-text-secondary max-w-sm mb-6">
              The self-governing sales engine for high-velocity B2B teams. Streamline approvals, stock checks, and negotiations.
            </p>
            <p className="text-xs text-text-muted">Built for Odoo Hackathon 2026</p>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-accent transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
