import apiFetch, { buildQuery } from "./client"
import type { Paginated } from "./customers"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WarehouseResponse {
  id: string
  name: string
  location?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StockLevelResponse {
  id: string
  warehouse_id: string
  product_id: string
  qty_on_hand: number
  qty_reserved: number
  reorder_point: number
  updated_at: string
}

export interface StockAvailabilityItem {
  warehouse_id: string
  warehouse_name: string
  qty_available: number
}

export interface StockAvailabilityResponse {
  product_id: string
  availability: StockAvailabilityItem[]
}

// ── Warehouse Endpoints ────────────────────────────────────────────────────────

export async function apiListWarehouses(params?: { page?: number; size?: number }) {
  return apiFetch<Paginated<WarehouseResponse>>(
    `/warehouses${buildQuery(params || {})}`
  )
}

export async function apiCreateWarehouse(data: {
  name: string
  location?: string
}) {
  return apiFetch<WarehouseResponse>("/warehouses", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiGetWarehouse(warehouseId: string) {
  return apiFetch<WarehouseResponse>(`/warehouses/${warehouseId}`)
}

export async function apiUpdateWarehouse(
  warehouseId: string,
  data: { name?: string; location?: string; is_active?: boolean }
) {
  return apiFetch<WarehouseResponse>(`/warehouses/${warehouseId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function apiDeactivateWarehouse(warehouseId: string) {
  return apiFetch<{ message: string }>(`/warehouses/${warehouseId}`, {
    method: "DELETE",
  })
}

// ── Stock Endpoints ────────────────────────────────────────────────────────────

export async function apiGetWarehouseStock(warehouseId: string) {
  return apiFetch<StockLevelResponse[]>(`/warehouses/${warehouseId}/stock`)
}

export async function apiAdjustStock(
  warehouseId: string,
  data: {
    product_id: string
    delta: number
    reason?: string
    note?: string
  }
) {
  return apiFetch<StockLevelResponse>(
    `/warehouses/${warehouseId}/stock/adjust`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  )
}

export async function apiGetStockAvailability(productId: string) {
  return apiFetch<StockAvailabilityResponse>(
    `/stock/availability${buildQuery({ product_id: productId })}`
  )
}
