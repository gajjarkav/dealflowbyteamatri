import { mockResolve } from "./mock";

export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000/api/v1";

const TOKEN_KEY = "dealflow.access_token";
const REFRESH_KEY = "dealflow.refresh_token";
const USER_KEY = "dealflow.user";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, access);
  if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      q.set(k, String(v));
    }
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const tokenStore = {
  get access() {
    return getAccessToken();
  },
  get refresh() {
    return getRefreshToken();
  },
  set(access: string, refresh?: string) {
    setTokens(access, refresh);
  },
  clear() {
    clearTokens();
  },
  getUser<T>(): T | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  setUser(user: unknown) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/** True when the live API could not be reached and sample data is being served. */
export let usingSampleData = false;

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  /** Skip the offline sample-data fallback and surface the error instead. */
  strict?: boolean;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * CORS-friendly fetch wrapper: sends credentials, bearer token and JSON headers.
 * If the API host is unreachable, the request falls back to local sample data so
 * the UI stays fully explorable while the backend is down.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, signal, strict } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = tokenStore.access;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    signal?.addEventListener("abort", () => controller.abort());

    const response = await fetch(buildUrl(path, query), {
      method,
      headers,
      credentials: "include",
      mode: "cors",
      signal: controller.signal,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }).finally(() => clearTimeout(timeout));

    const text = await response.text();
    const payload = text ? safeJson(text) : null;

    if (!response.ok) {
      if (response.status === 401) tokenStore.clear();
      const message =
        (payload as { message?: string; detail?: string } | null)?.message ??
        (payload as { detail?: string } | null)?.detail ??
        `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status, payload);
    }

    usingSampleData = false;
    return unwrap<T>(payload);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (strict) throw error;
    const fallback = mockResolve<T>(path, method, body, query);
    if (fallback !== undefined) {
      usingSampleData = true;
      return fallback;
    }
    throw error;
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Accepts `{ data: ... }` envelopes as well as bare payloads. */
function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string, query?: RequestOptions["query"]) => apiRequest<T>(path, query ? { query } : {}),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = "API error";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // ignore
    }
    if (res.status === 401) {
      clearTokens();
    }
    throw new Error(errorDetail);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export default apiFetch;
