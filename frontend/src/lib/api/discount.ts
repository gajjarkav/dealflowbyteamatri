import apiFetch, { buildQuery } from "./client"
import type { Paginated } from "./customers"

// ── Types ──────────────────────────────────────────────────────────────────────

export type TierEnum = "bronze" | "silver" | "gold" | "platinum"

export interface DiscountTierResponse {
  id: string
  tier: TierEnum
  max_discount_pct: number
}

export interface CategoryCeilingResponse {
  id: string
  tier: TierEnum
  category_id: string
  max_discount_pct: number
  created_at: string
}

export type ApprovalTrigger =
  | "rep_confirm"
  | "manager_escalate"
  | "finance_escalate"
  | "auto"

export interface ApprovalRuleResponse {
  id: string
  name: string
  trigger: ApprovalTrigger
  min_amount?: number
  max_discount_pct?: number
  min_margin_pct?: number
  steps: { role: string; seq: number }[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AppSettingResponse {
  key: string
  value: string
  updated_at: string
}

export interface EffectiveDiscountResponse {
  allowed_pct: number
  tier_ceiling: number
  category_ceiling?: number
  binding_source: "tier" | "category"
}

// ── Discount Tier Endpoints ────────────────────────────────────────────────────

export async function apiListDiscountTiers() {
  return apiFetch<DiscountTierResponse[]>("/discount-tiers")
}

export async function apiUpsertDiscountTiers(
  data: Array<{ tier: TierEnum; max_discount_pct: number }>
) {
  return apiFetch<DiscountTierResponse[]>("/discount-tiers", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// ── Category Ceiling Endpoints ─────────────────────────────────────────────────

export async function apiListCeilings(params?: { page?: number; size?: number }) {
  return apiFetch<Paginated<CategoryCeilingResponse>>(
    `/category-ceilings${buildQuery(params || {})}`
  )
}

export async function apiCreateCeiling(data: {
  tier: TierEnum
  category_id: string
  max_discount_pct: number
}) {
  return apiFetch<CategoryCeilingResponse>("/category-ceilings", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiUpdateCeiling(
  ceilingId: string,
  data: { max_discount_pct?: number }
) {
  return apiFetch<CategoryCeilingResponse>(`/category-ceilings/${ceilingId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function apiDeleteCeiling(ceilingId: string) {
  return apiFetch<{ message: string }>(`/category-ceilings/${ceilingId}`, {
    method: "DELETE",
  })
}

// ── Approval Rule Endpoints ────────────────────────────────────────────────────

export async function apiListApprovalRules(params?: { page?: number; size?: number }) {
  return apiFetch<Paginated<ApprovalRuleResponse>>(
    `/approval-rules${buildQuery(params || {})}`
  )
}

export async function apiCreateApprovalRule(data: {
  name: string
  trigger: ApprovalTrigger
  min_amount?: number
  max_discount_pct?: number
  min_margin_pct?: number
  steps?: { role: string; seq: number }[]
  is_active?: boolean
}) {
  return apiFetch<ApprovalRuleResponse>("/approval-rules", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiUpdateApprovalRule(
  ruleId: string,
  data: {
    name?: string
    trigger?: ApprovalTrigger
    min_amount?: number
    max_discount_pct?: number
    min_margin_pct?: number
    is_active?: boolean
  }
) {
  return apiFetch<ApprovalRuleResponse>(`/approval-rules/${ruleId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function apiDeleteApprovalRule(ruleId: string) {
  return apiFetch<{ message: string }>(`/approval-rules/${ruleId}`, {
    method: "DELETE",
  })
}

// ── Settings Endpoints ─────────────────────────────────────────────────────────

export async function apiListSettings() {
  return apiFetch<AppSettingResponse[]>("/settings")
}

export async function apiUpdateSetting(key: string, value: string) {
  return apiFetch<AppSettingResponse>(`/settings/${key}`, {
    method: "PATCH",
    body: JSON.stringify({ value }),
  })
}

// ── Effective Discount ─────────────────────────────────────────────────────────

export async function apiGetEffectiveDiscount(
  customer_id: string,
  category_id: string
) {
  return apiFetch<EffectiveDiscountResponse>(
    `/discount-policy/effective${buildQuery({ customer_id, category_id })}`
  )
}
