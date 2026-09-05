"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Suspense } from "react"

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!token) {
      setError("Invalid or expired reset token.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    // Mock successful reset
    router.push("/login?reset=success")
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-text-primary mb-2 text-center">Set new password</h1>
      <p className="text-sm text-text-secondary mb-6 text-center">Please enter your new password below.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">New Password</label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Confirm New Password</label>
          <Input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            placeholder="••••••••" 
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="pt-2">
          <Button type="submit" className="w-full">Reset Password</Button>
        </div>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="text-2xl font-bold tracking-tight mb-2">DealFlow<span className="text-accent">360</span></div>
      </div>
      
      <Suspense fallback={<div className="text-center text-sm text-text-secondary">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>

      <div className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/login" className="hover:text-accent transition-colors">Return to login</Link>
      </div>
    </Card>
  )
}
