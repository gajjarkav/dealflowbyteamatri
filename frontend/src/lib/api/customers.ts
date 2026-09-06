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

import { customers } from "./mock";

export async function apiGetCustomer(customerId: string) {
  try {
    return await apiFetch<CustomerResponse>(`/customers/${customerId}`)
  } catch (err) {
    const mock = customers.find(c => c.id === customerId);
    if (mock) {
      return {
        id: mock.id,
        company_name: mock.name,
        tier: (mock.tier.toLowerCase() as Tier) || "bronze",
        currency: "USD",
        billing_address: mock.country,
        tax_id: "",
        is_active: mock.status !== "on_hold",
        users: [{ id: "u1", full_name: mock.contact, email: mock.email, role: "customer", is_active: true }],
        created_at: mock.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as CustomerResponse;
    }
    throw err;
  }
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
  try {
    return await apiFetch<CustomerResponse>(`/customers/${customerId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  } catch (err) {
    const mock = customers.find(c => c.id === customerId);
    if (mock) {
      if (data.company_name) mock.name = data.company_name;
      if (data.tier) mock.tier = data.tier.charAt(0).toUpperCase() + data.tier.slice(1);
      if (data.billing_address) mock.country = data.billing_address;
      
      return {
        id: mock.id,
        company_name: mock.name,
        tier: (mock.tier.toLowerCase() as Tier) || "bronze",
        currency: data.currency || "USD",
        billing_address: mock.country,
        tax_id: data.tax_id || "",
        is_active: data.is_active ?? (mock.status !== "on_hold"),
        users: [{ id: "u1", full_name: mock.contact, email: mock.email, role: "customer", is_active: true }],
        created_at: mock.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as CustomerResponse;
    }
    throw err;
  }
}
