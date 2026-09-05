"use client"
import { useState, useRef, useEffect } from "react"
import { useCurrentUser } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function VerifyOtpPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [timer, setTimer] = useState(60)
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { verifyOtp, sendOtp } = useCurrentUser()

  useEffect(() => {
    const int = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000)
    return () => clearInterval(int)
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join("")
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }
    try {
      await verifyOtp(fullCode)
    } catch {
      setError("Invalid OTP code")
    }
  }

  const handleResend = async () => {
    if (timer > 0) return
    await sendOtp("demo@dealflow360.com") // Would pull from session state in full app
    setTimer(60)
  }

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-semibold text-text-primary mb-2 text-center">Verify Identity</h1>
      <p className="text-sm text-text-secondary text-center mb-6">We&apos;ve sent a 6-digit code to your email.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {code.map((digit, idx) => (
            <Input
              key={idx}
              ref={el => { inputRefs.current[idx] = el }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              className="w-12 h-12 text-center text-lg font-medium p-0"
            />
          ))}
        </div>
        {error && <p className="text-xs text-danger text-center">{error}</p>}
        
        <Button type="submit" className="w-full">Verify & Continue</Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <button 
          onClick={handleResend}
          disabled={timer > 0}
          className={`font-medium transition-colors ${timer > 0 ? 'text-text-muted cursor-not-allowed' : 'text-accent hover:text-accent-hover'}`}
        >
          {timer > 0 ? `Didn't receive? Resend in ${timer}s` : "Resend code"}
        </button>
      </div>
      
      <div className="mt-4 text-center text-sm text-text-secondary">
        <Link href="/login" className="hover:text-accent transition-colors">Back to login</Link>
      </div>
    </Card>
  )
}
