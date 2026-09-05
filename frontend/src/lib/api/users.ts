import apiFetch from "./client"

// ── Types ──────────────────────────────────────────────────────────────────────

export type Role = "admin" | "sales_manager" | "sales_rep" | "finance" | "customer"

export interface UserResponse {
  id: string
  full_name: string
  email: string
  mobile_number?: string
  role: Role
  is_active: boolean
  is_email_verified: boolean
  must_change_password: boolean
  is_system: boolean
  customer_id?: string
  created_at: string
  updated_at: string
}

// ── User Endpoints ─────────────────────────────────────────────────────────────

export async function apiGetMe() {
  return apiFetch<UserResponse>("/users/me")
}

export async function apiListUsers() {
  return apiFetch<UserResponse[]>("/users/")
}

export async function apiCreateUser(data: {
  full_name: string
  email: string
  password?: string
  mobile_number?: string
  role: Role
}) {
  return apiFetch<UserResponse>("/users/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiUpdateUser(
  userId: string,
  data: {
    full_name?: string
    mobile_number?: string
    role?: Role
    is_active?: boolean
  }
) {
  return apiFetch<UserResponse>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function apiDeactivateUser(userId: string) {
  return apiFetch<{ message: string }>(`/users/${userId}/deactivate`, {
    method: "POST",
  })
}

export async function apiChangePassword(old_password: string, new_password: string) {
  return apiFetch<{ message: string }>("/users/change-password", {
    method: "POST",
    body: JSON.stringify({ old_password, new_password }),
  })
}
