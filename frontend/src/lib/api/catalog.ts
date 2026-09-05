import apiFetch, { buildQuery } from "./client"
import type { Paginated } from "./customers"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CategoryResponse {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface VariantResponse {
  id: string
  product_id: string
  name: string
  sku?: string
  extra_price: number
  is_active: boolean
  created_at: string
}

export interface ProductResponse {
  id: string
  name: string
  sku?: string
  description?: string
  category_id: string
  list_price: number
  cost_price: number
  margin_pct?: number
  is_recurring: boolean
  is_active: boolean
  variants: VariantResponse[]
  created_at: string
  updated_at: string
}

// ── Category Endpoints ─────────────────────────────────────────────────────────

export async function apiListCategories(params?: { page?: number; size?: number }) {
  return apiFetch<Paginated<CategoryResponse>>(
    `/categories${buildQuery(params || {})}`
  )
}

export async function apiCreateCategory(data: { name: string; description?: string }) {
  return apiFetch<CategoryResponse>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiUpdateCategory(
  categoryId: string,
  data: { name?: string; description?: string }
) {
  return apiFetch<CategoryResponse>(`/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

// ── Product Endpoints ──────────────────────────────────────────────────────────

export async function apiListProducts(params?: {
  category_id?: string
  search?: string
  is_recurring?: boolean
  is_active?: boolean
  page?: number
  size?: number
}) {
  return apiFetch<Paginated<ProductResponse>>(
    `/products${buildQuery(params || {})}`
  )
}

export async function apiCreateProduct(data: {
  name: string
  sku?: string
  description?: string
  category_id: string
  list_price: number
  cost_price: number
  is_recurring?: boolean
}) {
  return apiFetch<ProductResponse>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiGetProduct(productId: string) {
  return apiFetch<ProductResponse>(`/products/${productId}`)
}

export async function apiUpdateProduct(
  productId: string,
  data: {
    name?: string
    sku?: string
    description?: string
    category_id?: string
    list_price?: number
    cost_price?: number
    is_recurring?: boolean
    is_active?: boolean
  }
) {
  return apiFetch<ProductResponse>(`/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function apiDeleteProduct(productId: string) {
  return apiFetch<ProductResponse>(`/products/${productId}`, {
    method: "DELETE",
  })
}

// ── Variant Endpoints ──────────────────────────────────────────────────────────

export async function apiAddVariant(
  productId: string,
  data: { name: string; sku?: string; extra_price?: number }
) {
  return apiFetch<VariantResponse>(`/products/${productId}/variants`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiUpdateVariant(
  variantId: string,
  data: { name?: string; sku?: string; extra_price?: number; is_active?: boolean }
) {
  return apiFetch<VariantResponse>(`/variants/${variantId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function apiDeleteVariant(variantId: string) {
  return apiFetch<{ message: string }>(`/variants/${variantId}`, {
    method: "DELETE",
  })
}
