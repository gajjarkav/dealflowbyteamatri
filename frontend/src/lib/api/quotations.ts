import apiFetch, { buildQuery } from "./client"
import type { Paginated } from "./customers"

// ── Types ──────────────────────────────────────────────────────────────────────

export type QuotationStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "revision_requested"
  | "under_negotiation"
  | "accepted"
  | "cancelled"
  | "fulfilled"

export interface QuotationLine {
  id: string
  product_id: string
  variant_id?: string
  product_name: string
  qty: number
  unit_price: number
  discount_pct: number
  line_total: number
  margin_pct?: number
}

export interface ApprovalStep {
  id: string
  seq: number
  required_role: string
  status: string
  actor_id?: string
  comment?: string
  acted_at?: string
}

export interface ApprovalRequest {
  id: string
  quotation_id: string
  trigger: string
  status: string
  current_step_seq: number
  steps: ApprovalStep[]
  created_at: string
}

export interface QuotationEvent {
  id: string
  actor_id?: string
  actor_name?: string
  event_type: string
  description?: string
  created_at: string
}

export interface QuotationResponse {
  id: string
  number: string
  customer_id: string
  customer_name?: string
  rep_id: string
  rep_name?: string
  status: QuotationStatus
  notes?: string
  promised_date?: string
  order_discount_pct: number
  subtotal: number
  order_discount_amount: number
  total: number
  gross_margin_pct?: number
  risk_score?: number
  lines: QuotationLine[]
  approval_requests: ApprovalRequest[]
  events: QuotationEvent[]
  created_at: string
  updated_at: string
}

export interface RiskPreviewResponse {
  risk_score: number
  risk_level: "low" | "medium" | "high" | "critical"
  flags: string[]
}

export interface SuggestionResponse {
  product_id: string
  product_name: string
  reason: string
  suggested_qty?: number
}

// ── Quotation Endpoints ────────────────────────────────────────────────────────

export async function apiListQuotations(params?: {
  status?: QuotationStatus
  customer_id?: string
  rep_id?: string
  search?: string
  page?: number
  size?: number
}) {
  return apiFetch<Paginated<QuotationResponse>>(
    `/quotations${buildQuery(params || {})}`
  )
}

export async function apiCreateQuotation(data: {
  customer_id: string
  notes?: string
  promised_date?: string
}) {
  return apiFetch<QuotationResponse>("/quotations", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiGetQuotation(id: string) {
  return apiFetch<QuotationResponse>(`/quotations/${id}`)
}

export async function apiUpdateQuotation(
  id: string,
  data: {
    notes?: string
    promised_date?: string
    order_discount_pct?: number
  }
) {
  return apiFetch<QuotationResponse>(`/quotations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function apiAddQuotationLine(
  id: string,
  data: {
    product_id: string
    variant_id?: string
    qty: number
    discount_pct?: number
  }
) {
  return apiFetch<QuotationResponse>(`/quotations/${id}/lines`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiUpdateQuotationLine(
  id: string,
  lineId: string,
  data: { qty?: number; discount_pct?: number }
) {
  return apiFetch<QuotationResponse>(`/quotations/${id}/lines/${lineId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function apiRemoveQuotationLine(id: string, lineId: string) {
  return apiFetch<QuotationResponse>(`/quotations/${id}/lines/${lineId}`, {
    method: "DELETE",
  })
}

export async function apiGetRiskPreview(id: string) {
  return apiFetch<RiskPreviewResponse>(`/quotations/${id}/risk-preview`)
}

export async function apiConfirmQuotation(id: string) {
  return apiFetch<QuotationResponse>(`/quotations/${id}/confirm`, {
    method: "POST",
  })
}

export async function apiCancelQuotation(id: string) {
  return apiFetch<QuotationResponse>(`/quotations/${id}/cancel`, {
    method: "POST",
  })
}

export async function apiGetSuggestions(id: string) {
  return apiFetch<SuggestionResponse[]>(`/quotations/${id}/suggestions`)
}

export async function apiApplySuggestion(id: string, productId: string) {
  return apiFetch<QuotationResponse>(
    `/quotations/${id}/suggestions/${productId}/add`,
    { method: "POST" }
  )
}

export async function apiDismissSuggestion(id: string, productId: string) {
  return apiFetch<QuotationResponse>(
    `/quotations/${id}/suggestions/${productId}/dismiss`,
    { method: "POST" }
  )
}

export async function apiGetTimeline(id: string) {
  return apiFetch<QuotationEvent[]>(`/quotations/${id}/timeline`)
}
