import apiFetch, { buildQuery } from "./client"
import type { Paginated } from "./customers"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PlanResponse {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  billing_interval: "monthly" | "yearly" | "one_time"
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── Plan Endpoints ─────────────────────────────────────────────────────────────

export async function apiListPlans(params?: { page?: number; size?: number }) {
  return apiFetch<Paginated<PlanResponse>>(
    `/plans${buildQuery(params || {})}`
  )
}

export async function apiCreatePlan(data: {
  name: string
  description?: string
  price: number
  currency?: string
  billing_interval: "monthly" | "yearly" | "one_time"
}) {
  return apiFetch<PlanResponse>("/plans", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiGetPlan(planId: string) {
  return apiFetch<PlanResponse>(`/plans/${planId}`)
}

export async function apiUpdatePlan(
  planId: string,
  data: {
    name?: string
    description?: string
    price?: number
    currency?: string
    billing_interval?: "monthly" | "yearly" | "one_time"
    is_active?: boolean
  }
) {
  return apiFetch<PlanResponse>(`/plans/${planId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function apiDeletePlan(planId: string) {
  return apiFetch<{ message: string }>(`/plans/${planId}`, {
    method: "DELETE",
  })
}
