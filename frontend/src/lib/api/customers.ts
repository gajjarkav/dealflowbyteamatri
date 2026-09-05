import apiFetch, { buildQuery } from "./client"

// ── Types ──────────────────────────────────────────────────────────────────────

export type Tier = "bronze" | "silver" | "gold" | "platinum"

export interface CustomerUser {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
}

export interface CustomerResponse {
  id: string
  company_name: string
  tier: Tier
  currency: string
  billing_address?: string
  tax_id?: string
  is_active: boolean
  users: CustomerUser[]
  created_at: string
  updated_at: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

// ── Customer Endpoints ─────────────────────────────────────────────────────────

export async function apiListCustomers(params?: {
  search?: string
  tier?: Tier
  page?: number
  size?: number
}) {
  return apiFetch<Paginated<CustomerResponse>>(
    `/customers/${buildQuery(params || {})}`
  )
}

export async function apiCreateCustomer(data: {
  company_name: string
  tier?: Tier
  currency?: string
  billing_address?: string
  tax_id?: string
  portal_email?: string
  portal_full_name?: string
}) {
  return apiFetch<CustomerResponse>("/customers/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiGetCustomer(customerId: string) {
  return apiFetch<CustomerResponse>(`/customers/${customerId}`)
}

export async function apiUpdateCustomer(
  customerId: string,
  data: {
    company_name?: string
    tier?: Tier
    currency?: string
    billing_address?: string
    tax_id?: string
    is_active?: boolean
  }
) {
  return apiFetch<CustomerResponse>(`/customers/${customerId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}
