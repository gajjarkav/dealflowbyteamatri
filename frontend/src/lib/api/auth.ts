import apiFetch, { setTokens, clearTokens } from "./client"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface Login2FAResponse {
  require_2fa: true
  email: string
}

export interface RegisterResponse {
  message: string
}

// ── Auth Endpoints ─────────────────────────────────────────────────────────────

export async function apiRegister(data: {
  full_name: string
  email: string
  password: string
  mobile_number?: string
  company_name: string
}) {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiVerifyEmail(email: string, code: string) {
  const res = await apiFetch<TokenResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  })
  setTokens(res.access_token, res.refresh_token)
  return res
}

export async function apiLogin(
  email: string,
  password: string
): Promise<TokenResponse | Login2FAResponse> {
  const res = await apiFetch<TokenResponse | Login2FAResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  // If no 2FA, store tokens immediately
  if ("access_token" in res) {
    setTokens(res.access_token, res.refresh_token)
  }
  return res
}

export async function apiVerify2FA(email: string, code: string) {
  const res = await apiFetch<TokenResponse>("/auth/verify-login-2fa", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  })
  setTokens(res.access_token, res.refresh_token)
  return res
}

export async function apiRefreshToken(refresh_token: string) {
  return apiFetch<TokenResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token }),
  })
}

export async function apiLogout(refresh_token: string) {
  try {
    await apiFetch("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    })
  } finally {
    clearTokens()
  }
}

export async function apiForgotPassword(email: string) {
  return apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export async function apiResetPassword(
  email: string,
  code: string,
  new_password: string
) {
  return apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, code, new_password }),
  })
}

export async function apiResendOtp(
  email: string,
  purpose: "signup_verify" | "password_reset"
) {
  return apiFetch("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email, purpose }),
  })
}
