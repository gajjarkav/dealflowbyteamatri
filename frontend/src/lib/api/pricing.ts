import apiFetch, { buildQuery } from "./client"
import type { Paginated } from "./customers"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PriceListResponse {
  id: string
  name: string
  currency: string
  tier?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PriceListItemResponse {
  id: string
  price_list_id: string
  product_id: string
  variant_id?: string
  fixed_price?: number
  discount_pct?: number
  min_qty: number
  created_at: string
}

export interface PriceResolutionResponse {
  unit_price: number
  cost_price: number
  source: "pricelist" | "list_price"
  currency: string
  margin_pct?: number
}

// ── Price List Endpoints ───────────────────────────────────────────────────────

export async function apiListPricelists(params?: { page?: number; size?: number }) {
  return apiFetch<Paginated<PriceListResponse>>(
    `/pricelists${buildQuery(params || {})}`
  )
}

export async function apiCreatePricelist(data: {
  name: string
  currency: string
  tier?: string
  is_active?: boolean
}) {
  return apiFetch<PriceListResponse>("/pricelists", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiGetPricelist(pricelistId: string) {
  return apiFetch<PriceListResponse>(`/pricelists/${pricelistId}`)
}

export async function apiUpdatePricelist(
  pricelistId: string,
  data: { name?: string; currency?: string; tier?: string; is_active?: boolean }
) {
  return apiFetch<PriceListResponse>(`/pricelists/${pricelistId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function apiDeletePricelist(pricelistId: string) {
  return apiFetch<{ message: string }>(`/pricelists/${pricelistId}`, {
    method: "DELETE",
  })
}

// ── Pricelist Item Endpoints ───────────────────────────────────────────────────

export async function apiListPricelistItems(
  pricelistId: string,
  params?: { page?: number; size?: number }
) {
  return apiFetch<Paginated<PriceListItemResponse>>(
    `/pricelists/${pricelistId}/items${buildQuery(params || {})}`
  )
}

export async function apiAddPricelistItem(
  pricelistId: string,
  data: {
    product_id: string
    variant_id?: string
    fixed_price?: number
    discount_pct?: number
    min_qty?: number
  }
) {
  return apiFetch<PriceListItemResponse>(`/pricelists/${pricelistId}/items`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiUpdatePricelistItem(
  itemId: string,
  data: { fixed_price?: number; discount_pct?: number; min_qty?: number }
) {
  return apiFetch<PriceListItemResponse>(`/pricelist-items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function apiDeletePricelistItem(itemId: string) {
  return apiFetch<{ message: string }>(`/pricelist-items/${itemId}`, {
    method: "DELETE",
  })
}

// ── Price Resolution ───────────────────────────────────────────────────────────

export async function apiResolvePrice(params: {
  product_id: string
  customer_id?: string
  variant_id?: string
  qty?: number
}) {
  return apiFetch<PriceResolutionResponse>(
    `/pricing/resolve${buildQuery(params)}`
  )
}
