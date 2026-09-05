"use client"
import React from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { DataTable, Column } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import type { InvoiceItem } from "@/lib/data/mockStore"
import { mockStore } from "@/lib/data/mockStore"

export default function BillingPage() {
  const store = useDataStore()
  const { toast } = useToast()

  const handleMarkPaid = (inv: InvoiceItem) => {
    mockStore.invoices = store.invoices.map((i) =>
      i.id === inv.id ? { ...i, status: "Paid" } : i
    )
    mockStore.notify()
    toast({
      title: "Invoice Settled",
      description: `${inv.invoiceNumber} recorded as Paid via ${inv.paymentMethod}.`,
      type: "success"
    })
  }

  const totalBilled = store.invoices.reduce((sum, i) => sum + i.amount, 0)
  const totalCollected = store.invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + i.amount, 0)

  const columns: Column<InvoiceItem>[] = [
    {
      key: "invoiceNumber",
      header: "Invoice Reference",
      render: (i) => (
        <div>
          <span className="font-mono font-bold text-text-primary text-xs">{i.invoiceNumber}</span>
          <span className="text-[11px] text-text-muted font-mono block">Ref: {i.quotationRef}</span>
        </div>
      )
    },
    {
      key: "customerName",
      header: "Billed Entity",
      render: (i) => <span className="font-semibold text-text-primary text-xs">{i.customerName}</span>
    },
    {
      key: "amount",
      header: "Invoice Amount",
      render: (i) => (
        <span className="font-mono font-bold text-text-primary text-xs">
          ${i.amount.toLocaleString()}
        </span>
      )
    },
    {
      key: "dueDate",
      header: "Payment Due",
      render: (i) => <span className="font-mono text-xs text-text-secondary">{i.dueDate}</span>
    },
    {
      key: "paymentMethod",
      header: "Settlement Method",
      render: (i) => <span className="text-xs text-text-secondary">{i.paymentMethod}</span>
    },
    {
      key: "status",
      header: "Status",
      render: (i) => {
        const colors = {
          Draft: "border-border text-text-muted",
          Sent: "border-blue-500/50 text-blue-600 bg-blue-500/5",
          Paid: "border-emerald-500/50 text-emerald-600 bg-emerald-500/5",
          Overdue: "border-danger text-danger bg-danger/5"
        }[i.status]

        return (
          <Badge variant="secondary" className={`font-mono text-xs ${colors}`}>
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

      {/* KPI Cards */}
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
        data={store.invoices}
        columns={columns}
        searchPlaceholder="Search invoices by reference or customer..."
        searchKey={(i) => `${i.invoiceNumber} ${i.quotationRef} ${i.customerName}`}
        title="Disbursement Invoices"
        subtitle="Automatic invoice generation triggered upon quotation acceptance"
      />
    </div>
  )
}
