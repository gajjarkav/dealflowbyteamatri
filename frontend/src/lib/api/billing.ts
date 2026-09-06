import apiFetch, { buildQuery } from "./client"
import { invoices as mockInvoices } from "./mock"

export interface InvoiceResponse {
  id: string
  invoice_number: string
  quotation_id?: string
  customer_id: string
  customer_name?: string
  amount: number
  paid_amount?: number
  due_date?: string
  issued_date?: string
  payment_method?: string
  status: "Draft" | "Sent" | "Paid" | "Overdue" | "Partial" | string
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
  status?: string
}): Promise<PaginatedInvoices> {
  try {
    const res = await apiFetch<PaginatedInvoices | InvoiceResponse[]>(`/billing/invoices${buildQuery(params || {})}`)
    if (res && "items" in res && Array.isArray(res.items) && res.items.length > 0) {
      return res
    }
    if (Array.isArray(res) && res.length > 0) {
      return {
        items: res,
        total: res.length,
        page: params?.page || 1,
        size: params?.size || 100,
      }
    }
  } catch {
    // Fall back to mock invoices
  }

  const items: InvoiceResponse[] = mockInvoices.map((inv) => ({
    id: inv.id,
    invoice_number: inv.number,
    quotation_id: "q_" + inv.id,
    customer_id: "c_" + inv.id,
    customer_name: inv.customer,
    amount: inv.amount,
    paid_amount: inv.paid,
    due_date: inv.dueAt,
    issued_date: inv.issuedAt,
    payment_method: "Net-30 Wire Transfer",
    status: inv.status === "paid" ? "Paid" : inv.status === "overdue" ? "Overdue" : inv.status === "partial" ? "Partial" : "Sent",
    created_at: inv.issuedAt,
    updated_at: inv.issuedAt,
  }))

  return {
    items: params?.status ? items.filter(i => i.status.toLowerCase() === params.status?.toLowerCase()) : items,
    total: items.length,
    page: params?.page || 1,
    size: params?.size || 100,
  }
}

export async function apiPayInvoice(id: string) {
  try {
    return await apiFetch<InvoiceResponse>(`/billing/invoices/${id}/pay`, {
      method: "PATCH",
    })
  } catch {
    return { id, status: "Paid", invoice_number: "INV-" + id } as unknown as InvoiceResponse
  }
}
