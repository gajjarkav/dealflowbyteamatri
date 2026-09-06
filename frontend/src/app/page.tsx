"use client"
import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCurrentUser } from "@/lib/auth/context"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, LogIn, UserPlus, ShieldCheck, Zap, TrendingUp, KeyRound, Briefcase } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const { login, signup } = useCurrentUser()
  
  // Form states
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", phone: "", company: "" })
  const [signupError, setSignupError] = useState("")
  const [isSigningUp, setIsSigningUp] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    if (!loginEmail || loginPassword.length < 6) {
      setLoginError("Invalid email or password too short.")
      return
    }
    setIsLoggingIn(true)
    try {
      const result = await login(loginEmail, loginPassword)
      // Login context returns a result or handles it internally. Since we are merging remote logic:
      if (result && result.requires2FA) {
        sessionStorage.setItem("2fa_email", result.email || loginEmail)
        router.push("/verify-otp?purpose=login_2fa")
      } else if (result && result.user?.role === "customer") {
        router.push("/portal")
      } else if (result) {
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Access denied. Please check your credentials."
      setLoginError(msg)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError("")
    if (!signupData.name || !signupData.company) return setSignupError("Name and Company are required.")
    if (!/^\S+@\S+\.\S+$/.test(signupData.email)) return setSignupError("Invalid email address.")
    if (signupData.password.length < 6) return setSignupError("Password must be at least 6 characters.")
    
    setIsSigningUp(true)
    try {
      await signup({
        email: signupData.email,
        password: signupData.password,
        mobile_number: signupData.phone || "0000000000",
        full_name: signupData.name,
        company_name: signupData.company
      })
      // If success, it goes to OTP screen internally.
    } catch {
      setSignupError("Registration failed. Email might be in use.")
    } finally {
      setIsSigningUp(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-accent-soft selection:text-accent">
      {/* Header */}
      <header className="h-20 border-b border-border/40 bg-surface/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-glow">
            <Zap className="text-white h-4 w-4" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-text-primary">
            DealFlow<span className="text-accent">360</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setAuthMode("login")} className="hidden sm:inline-flex font-medium">
            Sign In
          </Button>
          <Button onClick={() => setAuthMode("signup")} className="font-heading font-medium bg-white text-black hover:bg-gray-200 rounded-full px-6">
            Get Started
          </Button>
        </div>
      </header>

      {/* Main Hero & Auth Split */}
      <main className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Side: Value Proposition */}
        <div className="flex-1 p-8 lg:p-20 flex flex-col justify-center relative overflow-hidden bg-surface">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-accent-soft/40 blur-3xl opacity-50" />
            <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-amber-500/15/40 blur-3xl opacity-50" />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft/50 text-accent text-xs font-semibold uppercase tracking-wider mb-6 border border-accent/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Hackathon Edition 2026
            </div>
            
            <h1 className="font-heading text-5xl lg:text-7xl font-extrabold text-text-primary leading-[1.1] tracking-tight mb-6">
              The Self-Governing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-600">Sales Engine.</span>
            </h1>
            
            <p className="text-lg text-text-secondary leading-relaxed mb-10 font-medium">
              Eliminate deal friction. DealFlow360 combines autonomous discount governance, multi-hub inventory routing, and AI-driven upselling into one powerhouse B2B platform.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-surface-hover flex items-center justify-center shrink-0 border border-border">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-text-primary">Smart Governance</h3>
                  <p className="text-sm text-text-muted mt-1">Automated approval chains based on gross margins.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-surface-hover flex items-center justify-center shrink-0 border border-border">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-text-primary">Live Inventory</h3>
                  <p className="text-sm text-text-muted mt-1">Real-time stock ledger across multiple hubs.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full lg:w-[480px] shrink-0 bg-background border-l border-border/40 p-8 lg:p-12 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            {authMode === "login" ? (
              <motion.div 
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-sm mx-auto space-y-8"
              >
                <div>
                  <h2 className="font-heading text-3xl font-bold text-text-primary">Welcome Back</h2>
                  <p className="text-text-secondary mt-2 text-sm">Enter your credentials to access the command center.</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginError && (
                    <div className="p-3 rounded-lg bg-danger-soft text-danger text-sm font-medium border border-danger/20">
                      {loginError}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Input 
                        type="email" 
                        value={loginEmail} 
                        onChange={(e) => setLoginEmail(e.target.value)} 
                        placeholder="executive@company.com" 
                        required 
                        className="pl-10 h-12 bg-surface text-base"
                      />
                      <LogIn className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Password</label>
                      <Link href="/forgot-password" className="text-xs font-medium text-accent hover:underline">Forgot?</Link>
                    </div>
                    <div className="relative">
                      <Input 
                        type="password" 
                        value={loginPassword} 
                        onChange={(e) => setLoginPassword(e.target.value)} 
                        placeholder="••••••••" 
                        required 
                        className="pl-10 h-12 bg-surface text-base"
                      />
                      <KeyRound className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted" />
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isLoggingIn} className="w-full h-12 font-heading font-bold text-base mt-2 shadow-sm">
                    {isLoggingIn ? "Authenticating..." : "Sign In securely"}
                    {!isLoggingIn && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
                
                <div className="text-center">
                  <p className="text-sm text-text-secondary">
                    Don&apos;t have an account?{" "}
                    <button onClick={() => setAuthMode("signup")} className="font-bold text-text-primary hover:text-accent transition-colors">
                      Create one
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-sm mx-auto space-y-8"
              >
                <div>
                  <h2 className="font-heading text-3xl font-bold text-text-primary">Join DealFlow360</h2>
                  <p className="text-text-secondary mt-2 text-sm">Deploy the ultimate B2B sales engine for your team.</p>
                </div>
                
                <form onSubmit={handleSignup} className="space-y-4">
                  {signupError && (
                    <div className="p-3 rounded-lg bg-danger-soft text-danger text-sm font-medium border border-danger/20">
                      {signupError}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Full Name</label>
                      <Input 
                        value={signupData.name} 
                        onChange={(e) => setSignupData({...signupData, name: e.target.value})} 
                        placeholder="John Doe" 
                        required 
                        className="h-11 bg-surface text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Company</label>
                      <Input 
                        value={signupData.company} 
                        onChange={(e) => setSignupData({...signupData, company: e.target.value})} 
                        placeholder="Acme Corp" 
                        required 
                        className="h-11 bg-surface text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Work Email</label>
                    <Input 
                      type="email" 
                      value={signupData.email} 
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})} 
                      placeholder="john@acme.com" 
                      required 
                      className="h-11 bg-surface text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Password</label>
                    <Input 
                      type="password" 
                      value={signupData.password} 
                      onChange={(e) => setSignupData({...signupData, password: e.target.value})} 
                      placeholder="Min 6 characters" 
                      required 
                      className="h-11 bg-surface text-sm"
                    />
                  </div>
                  
                  <Button type="submit" disabled={isSigningUp} className="w-full h-12 font-heading font-bold text-base mt-2 shadow-sm">
                    {isSigningUp ? "Creating Space..." : "Create Workspace"}
                    {!isSigningUp && <UserPlus className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
                
                <div className="text-center">
                  <p className="text-sm text-text-secondary">
                    Already have an account?{" "}
                    <button onClick={() => setAuthMode("login")} className="font-bold text-text-primary hover:text-accent transition-colors">
                      Sign In
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-6 px-6 lg:px-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-text-muted font-medium">
          &copy; {new Date().getFullYear()} DealFlow360 by Team Atri. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
          <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-text-primary transition-colors">Terms of Service</a>
          <div className="flex items-center gap-1 text-accent ml-2">
            <Briefcase className="h-3 w-3" />
            Odoo Hackathon Entry
          </div>
        </div>
      </footer>
    </div>
  )
}
