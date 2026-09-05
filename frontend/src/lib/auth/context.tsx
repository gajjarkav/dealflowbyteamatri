"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  apiLogin,
  apiLogout,
  apiRegister,
  apiVerifyEmail,
  apiVerify2FA,
  apiForgotPassword,
  apiResetPassword,
  apiResendOtp,
} from "@/lib/api/auth"
import { apiGetMe } from "@/lib/api/users"
import { getAccessToken, getRefreshToken, clearTokens } from "@/lib/api/client"
import type { UserResponse } from "@/lib/api/users"

// ── Context Types ──────────────────────────────────────────────────────────────

export type { UserResponse as User }

export interface SignupData {
  full_name: string
  email: string
  password: string
  mobile_number?: string
  company_name: string
}

interface AuthContextType {
  user: UserResponse | null
  isLoading: boolean
  // Auth flows
  login: (email: string, password: string) => Promise<{ requires2FA: boolean; email?: string; user?: UserResponse | null }>
  logout: () => Promise<void>
  signup: (data: SignupData) => Promise<void>
  verifyEmail: (email: string, code: string) => Promise<UserResponse | null>
  verify2FA: (email: string, code: string) => Promise<UserResponse | null>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>
  resendOtp: (email: string, purpose: "signup_verify" | "password_reset") => Promise<void>
  refreshUser: () => Promise<UserResponse | null>
}

// ── Context ────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = useCallback(async () => {
    try {
      const me = await apiGetMe()
      setUser(me)
      return me
    } catch {
      setUser(null)
      clearTokens()
      return null
    }
  }, [])

  // On mount: try to load current user using stored access token
  useEffect(() => {
    const init = async () => {
      if (!getAccessToken()) {
        setIsLoading(false)
        return
      }
      await refreshUser()
      setIsLoading(false)
    }
    init()
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password)
    if ("require_2fa" in res && res.require_2fa) {
      return { requires2FA: true, email: res.email }
    }
    // Tokens already stored by apiLogin
    const me = await refreshUser()
    return { requires2FA: false, user: me }
  }

  const signup = async (data: SignupData) => {
    await apiRegister(data)
    // After register, user needs to verify email OTP — navigate handled by page
  }

  const verifyEmail = async (email: string, code: string) => {
    await apiVerifyEmail(email, code)
    return await refreshUser()
  }

  const verify2FA = async (email: string, code: string) => {
    await apiVerify2FA(email, code)
    return await refreshUser()
  }

  const logout = async () => {
    const refresh = getRefreshToken()
    if (refresh) {
      await apiLogout(refresh).catch(() => {
        clearTokens()
      })
    } else {
      clearTokens()
    }
    setUser(null)
    router.push("/login")
  }

  const forgotPassword = async (email: string) => {
    await apiForgotPassword(email)
  }

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    await apiResetPassword(email, code, newPassword)
  }

  const resendOtp = async (
    email: string,
    purpose: "signup_verify" | "password_reset"
  ) => {
    await apiResendOtp(email, purpose)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        signup,
        verifyEmail,
        verify2FA,
        forgotPassword,
        resetPassword,
        resendOtp,
        refreshUser,
      }}
    >
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
