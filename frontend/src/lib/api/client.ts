/**
 * Base API client for DealFlow360
 * Connects to FastAPI backend on Render: https://dealflowbyteamatri.onrender.com/api/v1
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://dealflowbyteamatri.onrender.com/api/v1"

// ── Token Storage ──────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("refresh_token")
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access)
  localStorage.setItem("refresh_token", refresh)
}

export function clearTokens() {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
}

// ── Refresh ────────────────────────────────────────────────────────────────────

let isRefreshing = false
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

async function performRefresh(): Promise<string> {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error("No refresh token")

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  })

  if (!res.ok) {
    clearTokens()
    throw new Error("Session expired. Please log in again.")
  }

  const data = await res.json()
  setTokens(data.access_token, data.refresh_token)
  return data.access_token
}

// ── Core Fetch ─────────────────────────────────────────────────────────────────

export interface ApiError {
  status: number
  message: string
  detail?: unknown
}

export class ApiRequestError extends Error {
  status: number
  detail?: unknown

  constructor(message: string, status: number, detail?: unknown) {
    super(message)
    this.name = "ApiRequestError"
    this.status = status
    this.detail = detail
  }
}

async function apiFetchInner(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  const isAuthEndpoint = path.startsWith("/auth/login") || path.startsWith("/auth/refresh")
  if (res.status === 401 && retry && !isAuthEndpoint) {
    // Attempt token refresh
    if (isRefreshing) {
      // Queue behind the in-flight refresh
      const newToken = await new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      })
      headers["Authorization"] = `Bearer ${newToken}`
      return fetch(`${BASE_URL}${path}`, { ...options, headers })
    }

    isRefreshing = true
    try {
      const newToken = await performRefresh()
      pendingQueue.forEach((p) => p.resolve(newToken))
      pendingQueue = []
      headers["Authorization"] = `Bearer ${newToken}`
      return fetch(`${BASE_URL}${path}`, { ...options, headers })
    } catch (err) {
      pendingQueue.forEach((p) => p.reject(err))
      pendingQueue = []
      throw err
    } finally {
      isRefreshing = false
    }
  }

  return res
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await apiFetchInner(path, options)

  if (!res.ok) {
    let detail: unknown
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body
      message = body?.detail || body?.message || message
    } catch {
      // ignore parse errors
    }
    throw new ApiRequestError(message, res.status, detail)
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function buildQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ""
}

export default apiFetch
