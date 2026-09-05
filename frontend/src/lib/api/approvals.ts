import apiFetch, { buildQuery } from "./client"
import type { Paginated } from "./customers"

// ── Types ──────────────────────────────────────────────────────────────────────

export type ApprovalStatus = "pending" | "approved" | "rejected" | "returned"

export interface ApprovalStepResponse {
  id: string
  seq: number
  required_role: string
  status: ApprovalStatus
  actor_id?: string
  actor_name?: string
  comment?: string
  acted_at?: string
}

export interface QuotationSummary {
  id: string
  number: string
  customer_name?: string
  total: number
  status: string
  lines: Array<{
    product_name: string
    qty: number
    line_total: number
  }>
}

export interface ApprovalRequestResponse {
  id: string
  quotation_id: string
  quotation: QuotationSummary
  trigger: string
  status: ApprovalStatus
  current_step_seq: number
  steps: ApprovalStepResponse[]
  created_at: string
  updated_at: string
}

// ── Approval Endpoints ─────────────────────────────────────────────────────────

export async function apiListApprovals(params?: {
  status?: ApprovalStatus
  page?: number
  size?: number
}) {
  return apiFetch<Paginated<ApprovalRequestResponse>>(
    `/approvals${buildQuery(params || {})}`
  )
}

export async function apiGetApproval(requestId: string) {
  return apiFetch<ApprovalRequestResponse>(`/approvals/${requestId}`)
}

export async function apiApproveStep(stepId: string, comment?: string) {
  return apiFetch<ApprovalRequestResponse>(`/approvals/steps/${stepId}/approve`, {
    method: "POST",
    body: JSON.stringify({ comment: comment || "" }),
  })
}

export async function apiRejectStep(stepId: string, comment?: string) {
  return apiFetch<ApprovalRequestResponse>(`/approvals/steps/${stepId}/reject`, {
    method: "POST",
    body: JSON.stringify({ comment: comment || "" }),
  })
}

export async function apiReturnStep(stepId: string, comment?: string) {
  return apiFetch<ApprovalRequestResponse>(`/approvals/steps/${stepId}/return`, {
    method: "POST",
    body: JSON.stringify({ comment: comment || "" }),
  })
}
