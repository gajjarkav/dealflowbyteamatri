"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCurrentUser } from "@/lib/auth/context"
import { Playfair_Display } from 'next/font/google'
import { cn } from "@/lib/utils"

const playfair = Playfair_Display({ subsets: ['latin'] })

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { login, signup } = useCurrentUser()
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  
  // Signup form state
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", phone: "" })
  const [signupError, setSignupError] = useState("")

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
      await login(loginEmail)
    } catch {
      setLoginError("Failed to sign in. Please try again.")
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError("")
    if (!signupData.name) return setSignupError("Name is required.")
    if (!/^\S+@\S+\.\S+$/.test(signupData.email)) return setSignupError("Invalid email address.")
    if (signupData.password.length < 6) return setSignupError("Password must be at least 6 characters.")
    if (!/^\+?[0-9\s\-()]{7,15}$/.test(signupData.phone)) return setSignupError("Invalid phone number format.")
    
    try {
      await signup(signupData)
    } catch {
      setSignupError("Registration failed. Please try again.")
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
            <Button variant="secondary" onClick={() => setIsLogin(true)} className="w-40">Sign In</Button>
          </div>

          {/* Right Background (Register prompt) */}
          <div className="hidden md:flex w-1/2 p-8 flex-col justify-center items-center text-center">
            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Hello, Friend!</h2>
            <p className="text-sm text-text-secondary mb-8">Enter your personal details and start your journey with us</p>
            <Button variant="secondary" onClick={() => setIsLogin(false)} className="w-40">Register</Button>
          </div>

          {/* Sliding Overlay Container */}
          <div className={cn(
            "absolute top-0 left-0 h-full w-full md:w-1/2 bg-background border-x border-border flex flex-col justify-center p-8 transition-transform duration-500 ease-in-out",
            isLogin ? "translate-x-0" : "md:translate-x-full"
          )}>
            
            <div className="flex flex-col items-center mb-8">
              <div className="text-2xl font-bold tracking-tight mb-2">DealFlow<span className="text-accent">360</span></div>
              <div className="flex gap-4 mt-2">
                <button onClick={() => setIsLogin(true)} className={cn("text-sm font-medium transition-colors", isLogin ? "text-accent" : "text-text-muted hover:text-text-primary")}>Sign In</button>
                <button onClick={() => setIsLogin(false)} className={cn("text-sm font-medium transition-colors", !isLogin ? "text-accent" : "text-text-muted hover:text-text-primary")}>Register</button>
              </div>
            </div>

            {isLogin ? (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <h3 className="text-xl font-semibold mb-6 text-center">Sign in to your account</h3>
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <Input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                  <Input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                  {loginError && <p className="text-xs text-danger">{loginError}</p>}
                  <div className="flex justify-end">
                    <span className="text-xs text-text-secondary hover:text-text-primary cursor-pointer">Forgot your password?</span>
                  </div>
                  <Button type="submit" className="w-full mt-4">Sign In</Button>
                </form>
                <div className="mt-6 md:hidden text-center text-sm text-text-secondary">
                  <span className="cursor-pointer hover:text-accent" onClick={() => setIsLogin(false)}>Don&apos;t have an account? Register</span>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <h3 className="text-xl font-semibold mb-6 text-center">Create an account</h3>
                <form className="space-y-4" onSubmit={handleSignupSubmit}>
                  <Input type="text" placeholder="Name" value={signupData.name} onChange={e => setSignupData({...signupData, name: e.target.value})} required />
                  <Input type="email" placeholder="Email" value={signupData.email} onChange={e => setSignupData({...signupData, email: e.target.value})} required />
                  <Input type="password" placeholder="Password" value={signupData.password} onChange={e => setSignupData({...signupData, password: e.target.value})} required />
                  <Input type="tel" placeholder="Phone Number" value={signupData.phone} onChange={e => setSignupData({...signupData, phone: e.target.value})} required />
                  {signupError && <p className="text-xs text-danger">{signupError}</p>}
                  <Button type="submit" className="w-full mt-4">Register</Button>
                </form>
                <div className="mt-6 md:hidden text-center text-sm text-text-secondary">
                  <span className="cursor-pointer hover:text-accent" onClick={() => setIsLogin(true)}>Already have an account? Sign In</span>
                </div>
              </div>
            )}
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
