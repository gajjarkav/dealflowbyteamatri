"use client"
import { useState } from "react"
import { useCurrentUser } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" })
  const [error, setError] = useState("")
  const { signup } = useCurrentUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!formData.name) return setError("Name is required.")
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return setError("Invalid email address.")
    if (formData.password.length < 6) return setError("Password must be at least 6 characters.")
    if (!/^\+?[0-9\s\-()]{7,15}$/.test(formData.phone)) return setError("Invalid phone number format.")

    try {
      await signup(formData)
    } catch {
      setError("Failed to create account")
    }
  }

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="text-2xl font-bold tracking-tight mb-2">DealFlow<span className="text-accent">360</span></div>
        <div className="flex gap-4 mt-2">
          <Link href="/login" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors">Sign In</Link>
          <span className="text-sm font-medium text-accent">Register</span>
        </div>
      </div>
      <h1 className="text-xl font-semibold text-text-primary mb-6 text-center">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
          <Input 
            type="text" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            placeholder="John Doe" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
          <Input 
            type="email" 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            placeholder="you@company.com" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Phone Number</label>
          <Input 
            type="tel" 
            value={formData.phone} 
            onChange={(e) => setFormData({...formData, phone: e.target.value})} 
            placeholder="+1 (555) 000-0000" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
          <Input 
            type="password" 
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            placeholder="••••••••" 
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="pt-2">
          <Button type="submit" className="w-full">Register</Button>
        </div>
      </form>
      
      <div className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/login" className="hover:text-accent transition-colors">Already have an account? Sign in</Link>
      </div>
    </Card>
  )
}
