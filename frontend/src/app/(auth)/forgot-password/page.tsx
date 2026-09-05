"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }
    // Mock successful request
    setSuccess(true)
  }

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="text-2xl font-bold tracking-tight mb-2">DealFlow<span className="text-accent">360</span></div>
      </div>
      
      {!success ? (
        <>
          <h1 className="text-xl font-semibold text-text-primary mb-2 text-center">Reset your password</h1>
          <p className="text-sm text-text-secondary mb-6 text-center">Enter your email address and we&apos;ll send you a link to reset your password.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email address</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@company.com" 
              />
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
            <div className="pt-2">
              <Button type="submit" className="w-full">Send Reset Link</Button>
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
          <p className="text-sm text-text-secondary mb-6">We&apos;ve sent a password reset link to <span className="font-medium text-text-primary">{email}</span>.</p>
          <Button variant="secondary" className="w-full" onClick={() => setSuccess(false)}>Try another email</Button>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/login" className="hover:text-accent transition-colors">Return to login</Link>
      </div>
    </Card>
  )
}
