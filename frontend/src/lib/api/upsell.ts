import apiFetch, { buildQuery } from "./client"
import type { Paginated } from "./customers"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface UpsellRuleResponse {
  id: string
  name: string
  trigger_product_id: string
  suggest_product_id: string
  min_qty?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── Upsell Endpoints ───────────────────────────────────────────────────────────

export async function apiListUpsellRules(params?: { page?: number; size?: number }) {
  return apiFetch<Paginated<UpsellRuleResponse>>(
    `/upsell-rules${buildQuery(params || {})}`
  )
}

export async function apiCreateUpsellRule(data: {
  name: string
  trigger_product_id: string
  suggest_product_id: string
  min_qty?: number
}) {
  return apiFetch<UpsellRuleResponse>("/upsell-rules", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiGetUpsellRule(ruleId: string) {
  return apiFetch<UpsellRuleResponse>(`/upsell-rules/${ruleId}`)
}

export async function apiUpdateUpsellRule(
  ruleId: string,
  data: {
    name?: string
    trigger_product_id?: string
    suggest_product_id?: string
    min_qty?: number
    is_active?: boolean
  }
) {
  return apiFetch<UpsellRuleResponse>(`/upsell-rules/${ruleId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function apiDeleteUpsellRule(ruleId: string) {
  return apiFetch<{ message: string }>(`/upsell-rules/${ruleId}`, {
    method: "DELETE",
  })
}
