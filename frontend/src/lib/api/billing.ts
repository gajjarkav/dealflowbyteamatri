import apiFetch, { buildQuery } from "./client"

export interface InvoiceResponse {
  id: string
  invoice_number: string
  quotation_id?: string
  customer_id: string
  customer_name?: string
  amount: number
  due_date?: string
  payment_method?: string
  status: string
  created_at: string
  updated_at: string
}

export interface PaginatedInvoices {
  items: InvoiceResponse[]
  total: number
  page: number
  size: number
}

export async function apiListInvoices(params?: {
  page?: number
  size?: number
}) {
  return apiFetch<PaginatedInvoices>(`/billing/invoices${buildQuery(params || {})}`)
}

export async function apiPayInvoice(id: string) {
  return apiFetch<InvoiceResponse>(`/billing/invoices/${id}/pay`, {
    method: "PATCH",
  })
}
