"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function Verify2FAPage() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code.")
      return
    }
    // Mock successful 2FA
    router.push("/dashboard")
  }

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="text-2xl font-bold tracking-tight mb-2">DealFlow<span className="text-accent">360</span></div>
      </div>
      <h1 className="text-xl font-semibold text-text-primary mb-2 text-center">Two-Factor Authentication</h1>
      <p className="text-sm text-text-secondary mb-6 text-center">Enter the 6-digit code from your authenticator app.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Authentication Code</label>
          <Input 
            type="text" 
            value={code} 
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
            placeholder="123456" 
            className="text-center text-xl tracking-[0.5em] font-mono"
          />
        </div>
        {error && <p className="text-xs text-danger text-center">{error}</p>}
        <div className="pt-2">
          <Button type="submit" className="w-full">Verify Code</Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/login" className="hover:text-accent transition-colors">Back to login</Link>
      </div>
    </Card>
  )
}
