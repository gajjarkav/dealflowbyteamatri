"use client"
import React, { useState, useEffect, useCallback } from "react"
import { DataTable, Column } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { apiListInvoices, apiPayInvoice, type InvoiceResponse } from "@/lib/api/billing"

export default function BillingPage() {
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiListInvoices({ size: 100 })
      setInvoices(res.items)
    } catch {
      toast({ title: "Error", description: "Failed to load invoices", type: "error" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const handleMarkPaid = async (inv: InvoiceResponse) => {
    try {
      await apiPayInvoice(inv.id)
      toast({
        title: "Invoice Settled",
        description: `${inv.invoice_number} recorded as Paid.`,
        type: "success"
      })
      load()
    } catch {
      toast({ title: "Error", description: "Failed to pay invoice", type: "error" })
    }
  }

  const totalBilled = invoices.reduce((sum, i) => sum + (i.amount || 0), 0)
  const totalCollected = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + (i.amount || 0), 0)

  const columns: Column<InvoiceResponse>[] = [
    {
      key: "invoice_number",
      header: "Invoice Reference",
      render: (i) => (
        <div>
          <span className="font-mono font-bold text-text-primary text-xs">{i.invoice_number}</span>
          <span className="text-[11px] text-text-muted font-mono block">Ref: {i.quotation_id?.slice(0, 8) || "—"}</span>
        </div>
      )
    },
    {
      key: "customer_name",
      header: "Billed Entity",
      render: (i) => <span className="font-semibold text-text-primary text-xs">{i.customer_name || "—"}</span>
    },
    {
      key: "amount",
      header: "Invoice Amount",
      render: (i) => (
        <span className="font-mono font-bold text-text-primary text-xs">
          ${(i.amount || 0).toLocaleString()}
        </span>
      )
    },
    {
      key: "due_date",
      header: "Payment Due",
      render: (i) => <span className="font-mono text-xs text-text-secondary">{i.due_date || "—"}</span>
    },
    {
      key: "payment_method",
      header: "Settlement Method",
      render: (i) => <span className="text-xs text-text-secondary">{i.payment_method || "—"}</span>
    },
    {
      key: "status",
      header: "Status",
      render: (i) => {
        const colors: Record<string, string> = {
          Draft: "border-border text-text-muted",
          Sent: "border-blue-500/50 text-blue-600 bg-blue-500/5",
          Paid: "border-emerald-500/50 text-emerald-600 bg-emerald-500/5",
          Overdue: "border-danger text-danger bg-danger/5"
        }
        
        return (
          <Badge variant="secondary" className={`font-mono text-xs ${colors[i.status] || colors.Draft}`}>
            {i.status}
          </Badge>
        )
      }
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (i) => (
        <div className="flex items-center justify-end gap-2">
          {i.status !== "Paid" && (
            <Button
              variant="ghost"
              className="h-7 px-2.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              onClick={() => handleMarkPaid(i)}
            >
              Mark Paid &check;
            </Button>
          )}
        </div>
      )
    }
  ]

  if (loading && invoices.length === 0) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Billing, Recurring Schedules & Invoices</h1>
          <p className="text-sm text-text-secondary mt-1">
            Quote-to-cash milestone disbursements, recurring SaaS schedules, and payment reconciliation.
          </p>
        </div>

        <Badge variant="secondary" className="font-mono text-xs">
          Automatic Net-30 Invoicing
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-border bg-surface">
          <div className="text-xs font-mono text-text-secondary">TOTAL BILLED DISBURSEMENTS</div>
          <div className="font-mono text-2xl font-bold text-text-primary mt-1">
            ${totalBilled.toLocaleString()}
          </div>
        </Card>

        <Card className="p-4 border-border bg-surface">
          <div className="text-xs font-mono text-text-secondary">COLLECTED REVENUE</div>
          <div className="font-mono text-2xl font-bold text-emerald-600 mt-1">
            ${totalCollected.toLocaleString()}
          </div>
        </Card>

        <Card className="p-4 border-border bg-surface">
          <div className="text-xs font-mono text-text-secondary">PENDING OUTSTANDING</div>
          <div className="font-mono text-2xl font-bold text-accent mt-1">
            ${(totalBilled - totalCollected).toLocaleString()}
          </div>
        </Card>
      </div>

      <DataTable
        data={invoices}
        columns={columns}
        searchPlaceholder="Search invoices by reference or customer..."
        searchKey={(i) => `${i.invoice_number} ${i.quotation_id} ${i.customer_name}`}
        title="Disbursement Invoices"
        subtitle="Automatic invoice generation triggered upon quotation acceptance"
      />
    </div>
  )
}
