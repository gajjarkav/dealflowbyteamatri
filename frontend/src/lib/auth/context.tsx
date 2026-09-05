"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface SignupData {
  name: string;
  email: string;
  password?: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check session on mount
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    if (res.ok) {
      // Don't set user yet. Login API checks credentials, we must verify OTP.
      router.push('/verify-otp')
    } else {
      throw new Error("Invalid credentials")
    }
  }

  const signup = async (data: SignupData) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (res.ok) {
      // Send OTP after signup
      router.push('/verify-otp')
    } else {
      throw new Error("Signup failed")
    }
  }

  const sendOtp = async (email: string) => {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    if (!res.ok) throw new Error("Failed to send OTP")
  }

  const verifyOtp = async (code: string) => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })
    if (res.ok) {
      const data = await res.json()
      setUser(data.user)
      router.push('/dashboard')
    } else {
      throw new Error("Invalid OTP")
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signup, verifyOtp, sendOtp }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useCurrentUser() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useCurrentUser must be used within an AuthProvider")
  }
  return context
}
