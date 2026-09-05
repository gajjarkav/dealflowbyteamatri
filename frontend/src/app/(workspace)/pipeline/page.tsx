"use client"
import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import {
  apiListQuotations,
  apiCreateQuotation,
  type QuotationResponse,
  type QuotationStatus,
} from "@/lib/api/quotations"
import { apiListCustomers, type CustomerResponse } from "@/lib/api/customers"

const STATUS_LABELS: Record<QuotationStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  revision_requested: "Revision Req.",
  under_negotiation: "Negotiation",
  accepted: "Accepted",
  cancelled: "Cancelled",
  fulfilled: "Fulfilled",
}

const STATUS_COLORS: Record<QuotationStatus, string> = {
  draft: "border-border text-text-secondary",
  pending_approval: "border-accent text-accent bg-accent/5",
  approved: "border-blue-500/50 text-blue-600 bg-blue-500/5",
  revision_requested: "border-amber-500/50 text-amber-600 bg-amber-500/5",
  under_negotiation: "border-purple-500/50 text-purple-600 bg-purple-500/5",
  accepted: "border-emerald-500/50 text-emerald-600 bg-emerald-500/5",
  cancelled: "border-red-400/50 text-red-500 bg-red-500/5",
  fulfilled: "border-emerald-600 text-emerald-700 bg-emerald-500/10",
}

const ALL_STATUSES = Object.keys(STATUS_LABELS) as QuotationStatus[]

export default function PipelinePage() {
  const { toast } = useToast()
  const [quotations, setQuotations] = useState<QuotationResponse[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | "">("")
  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [customers, setCustomers] = useState<CustomerResponse[]>([])
  const [newQ, setNewQ] = useState({ customer_id: "", notes: "", promised_date: "" })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiListQuotations({
        status: statusFilter || undefined,
        page,
        size: 20,
      })
      setQuotations(res.items)
      setTotal(res.total)
    } catch {
      toast({ title: "Error", description: "Failed to load quotations", type: "error" })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const openCreate = async () => {
    const cRes = await apiListCustomers({ size: 100 }).catch(() => null)
    setCustomers(cRes?.items || [])
    setNewQ({ customer_id: "", notes: "", promised_date: "" })
    setDrawerOpen(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQ.customer_id) {
      toast({ title: "Validation", description: "Select a customer", type: "error" })
      return
    }
    setSaving(true)
    try {
      await apiCreateQuotation({
        customer_id: newQ.customer_id,
        notes: newQ.notes || undefined,
        promised_date: newQ.promised_date || undefined,
      })
      toast({ title: "Quotation Created", description: "New deal added to pipeline." })
      setDrawerOpen(false)
      load()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Create failed"
      toast({ title: "Error", description: msg, type: "error" })
    } finally {
      setSaving(false)
    }
  }

  // Group by status for Kanban
  const byStatus = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = quotations.filter((q) => q.status === s)
    return acc
  }, {} as Record<QuotationStatus, QuotationResponse[]>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Quotations &amp; Deal Pipeline
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time pipeline with discount approvals, negotiations, and closed bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="font-mono text-xs">
            {total} Deals
          </Badge>
          <Button onClick={openCreate}>+ New Quotation</Button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => { setStatusFilter(""); setPage(1) }}
          className={`px-3 py-1 rounded text-xs font-mono transition-colors ${!statusFilter ? "bg-accent text-white" : "bg-surface border border-border text-text-secondary hover:border-accent/50"}`}
        >
          All ({total})
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${statusFilter === s ? "bg-accent text-white" : "bg-surface border border-border text-text-secondary hover:border-accent/50"}`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      {!statusFilter ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3 overflow-x-auto pb-4">
          {(["draft", "pending_approval", "approved", "accepted"] as QuotationStatus[]).map((status) => {
            const dealsInStage = byStatus[status]
            const stageTotal = dealsInStage.reduce((s, q) => s + (q.total || 0), 0)
            return (
              <div key={status} className="bg-surface border border-border rounded-md p-3 flex flex-col min-w-[200px]">
                <div className="border-b border-border pb-2.5 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-text-primary uppercase font-mono tracking-wider">
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="font-mono text-xs text-accent font-semibold px-1.5 py-0.5 rounded bg-accent/10">
                      {dealsInStage.length}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-text-muted mt-1">
                    ${stageTotal.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-2.5 flex-1">
                  {dealsInStage.length > 0 ? (
                    dealsInStage.slice(0, 8).map((deal) => (
                      <Link href={`/quotations/${deal.id}`} key={deal.id}>
                        <Card className="p-3 border-border hover:border-accent/80 transition-all cursor-pointer bg-background">
                          <div className="font-mono text-xs font-bold text-text-primary mb-1">
                            {deal.number}
                          </div>
                          <div className="text-xs text-text-secondary truncate mb-2">
                            {deal.customer_name || "—"}
                          </div>
                          <div className="flex items-baseline justify-between font-mono text-xs pt-2 border-t border-border/60">
                            <span className="font-bold text-text-primary">
                              ${(deal.total || 0).toLocaleString()}
                            </span>
                            <span className={`text-[11px] font-semibold ${(deal.gross_margin_pct || 0) >= 40 ? "text-emerald-600" : "text-amber-600"}`}>
                              {deal.gross_margin_pct != null ? `${deal.gross_margin_pct.toFixed(1)}%` : "—"}
                            </span>
                          </div>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[11px] text-text-muted border border-dashed border-border rounded">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List view when filtered */
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface border-b border-border">
              <tr className="text-xs font-mono text-text-secondary">
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Margin</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-text-muted text-sm">Loading…</td>
                </tr>
              ) : quotations.map((q) => (
                <tr key={q.id} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/quotations/${q.id}`} className="font-mono font-bold text-text-primary hover:text-accent transition-colors">
                      {q.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{q.customer_name || "—"}</td>
                  <td className="px-4 py-3 font-mono font-semibold">${(q.total || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono">
                    <span className={(q.gross_margin_pct || 0) >= 40 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                      {q.gross_margin_pct != null ? `${q.gross_margin_pct.toFixed(1)}%` : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={`font-mono text-[10px] ${STATUS_COLORS[q.status]}`}>
                      {STATUS_LABELS[q.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {new Date(q.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Page {page} of {Math.ceil(total / 20)}</span>
          <div className="flex gap-2">
            <Button variant="ghost" className="h-7 px-3 text-xs" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
            <Button variant="ghost" className="h-7 px-3 text-xs" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>Next →</Button>
          </div>
        </div>
      )}

      {/* Create Quotation Drawer */}
      <FormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Create New Quotation"
        subtitle="Start a new deal for a customer"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Creating…" : "Create Quotation"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Customer *</label>
            <select
              value={newQ.customer_id}
              onChange={(e) => setNewQ({ ...newQ, customer_id: e.target.value })}
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:border-accent"
              required
            >
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Notes</label>
            <Input
              value={newQ.notes}
              onChange={(e) => setNewQ({ ...newQ, notes: e.target.value })}
              placeholder="Deal notes or special conditions…"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Promised Date</label>
            <Input
              type="date"
              value={newQ.promised_date}
              onChange={(e) => setNewQ({ ...newQ, promised_date: e.target.value })}
            />
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
