"use client"
import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { Plus, Filter } from "lucide-react"
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
  pending_approval: "border-accent text-accent bg-accent-soft/30",
  approved: "border-blue-500/50 text-blue-600 bg-blue-500/10",
  revision_requested: "border-amber-500/50 text-amber-600 bg-amber-500/10",
  under_negotiation: "border-purple-500/50 text-purple-600 bg-purple-500/10",
  accepted: "border-emerald-500/50 text-emerald-600 bg-emerald-500/10",
  fulfilled: "border-emerald-600 text-emerald-700 bg-emerald-500/20",
  cancelled: "border-red-400/50 text-red-500 bg-red-500/10",
}

const ALL_STATUSES = Object.keys(STATUS_LABELS) as QuotationStatus[]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
}

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
        size: 50, // Get more for the kanban view
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
    } catch {
      toast({ title: "Error", description: "Failed to create", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const byStatus = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = quotations.filter((q) => q.status === s)
    return acc
  }, {} as Record<QuotationStatus, QuotationResponse[]>)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-12">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight">
            Deal Pipeline
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-medium">
            Manage live quotations through the governance flow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center px-3 py-1.5 rounded-md bg-surface border border-border shadow-sm">
            <span className="text-xs font-heading font-bold text-text-secondary uppercase tracking-wider mr-2">Total Deals:</span>
            <span className="font-mono text-sm font-bold text-accent">{loading ? <Skeleton className="h-4 w-6 inline-block" /> : total}</span>
          </div>
          <Button onClick={openCreate} className="font-heading font-bold shadow-md h-10">
            <Plus className="w-4 h-4 mr-2" /> New Deal
          </Button>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <Filter className="w-4 h-4 text-text-muted shrink-0 mr-2" />
        <button
          onClick={() => { setStatusFilter(""); setPage(1) }}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            !statusFilter ? "bg-text-primary text-surface shadow-md" : "bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border"
          }`}
        >
          All Stages
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              statusFilter === s ? "bg-accent text-white shadow-md" : "bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </motion.div>

      {/* Kanban Board vs List View */}
      <AnimatePresence mode="wait">
        {!statusFilter ? (
          <motion.div 
            key="kanban"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x"
          >
            {(["draft", "pending_approval", "approved", "accepted"] as QuotationStatus[]).map((status) => {
              const dealsInStage = byStatus[status]
              const stageTotal = dealsInStage.reduce((s, q) => s + (q.total || 0), 0)
              
              return (
                <div key={status} className="bg-surface/50 border border-border/60 rounded-xl p-4 flex flex-col min-w-[280px] w-[280px] snap-center shrink-0">
                  <div className="border-b border-border/50 pb-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide">
                        {STATUS_LABELS[status]}
                      </span>
                      <span className="font-mono text-xs text-accent font-bold px-2 py-0.5 rounded-full bg-accent-soft/30 border border-accent/20">
                        {dealsInStage.length}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-text-muted mt-2">
                      ${stageTotal.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="space-y-3 flex-1 overflow-y-auto pr-1 no-scrollbar max-h-[60vh]">
                    {loading ? (
                      <>
                        <Skeleton className="h-28 w-full rounded-xl" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                      </>
                    ) : dealsInStage.length > 0 ? (
                      dealsInStage.map((deal) => (
                        <Link href={`/quotations/${deal.id}`} key={deal.id} className="block group">
                          <Card className="premium-card p-4 hover:border-accent/50 transition-all bg-surface">
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-mono text-xs font-bold text-text-primary group-hover:text-accent transition-colors">
                                {deal.number}
                              </div>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                (deal.gross_margin_pct || 0) >= 40 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                              }`}>
                                {deal.gross_margin_pct != null ? `${deal.gross_margin_pct.toFixed(1)}%` : "—"}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-text-secondary truncate mb-3">
                              {deal.customer_name || "—"}
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-border/40">
                              <span className="font-mono text-sm font-extrabold text-text-primary">
                                ${(deal.total || 0).toLocaleString()}
                              </span>
                              <div className="h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center text-[9px] font-bold text-text-muted group-hover:bg-accent-soft group-hover:text-accent transition-colors">
                                {deal.rep_name?.charAt(0) || "?"}
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-10 text-xs font-medium text-text-muted border-2 border-dashed border-border/50 rounded-xl">
                        Empty Stage
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card overflow-hidden"
          >
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-surface-hover border-b border-border">
                  <tr className="text-xs font-heading font-bold text-text-secondary uppercase tracking-wider">
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4 text-right">Total Value</th>
                    <th className="px-6 py-4 text-right">Margin</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {loading ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b border-border/40">
                          <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-20 ml-auto" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-12 ml-auto" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-20 ml-auto" /></td>
                        </tr>
                      ))}
                    </>
                  ) : quotations.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-text-muted font-medium">No quotations found for this status.</td></tr>
                  ) : quotations.map((q) => (
                    <tr key={q.id} className="interactive-row bg-surface">
                      <td className="px-6 py-4">
                        <Link href={`/quotations/${q.id}`} className="font-mono font-bold text-text-primary hover:text-accent transition-colors">
                          {q.number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-text-secondary">{q.customer_name || "—"}</td>
                      <td className="px-6 py-4 text-right font-mono font-extrabold text-text-primary">
                        ${(q.total || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold">
                        <span className={(q.gross_margin_pct || 0) >= 40 ? "text-emerald-600" : "text-amber-600"}>
                          {q.gross_margin_pct != null ? `${q.gross_margin_pct.toFixed(1)}%` : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className={`font-mono text-[10px] uppercase tracking-wider ${STATUS_COLORS[q.status]}`}>
                          {STATUS_LABELS[q.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-text-muted font-medium">
                        {new Date(q.updated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination inside card */}
            {total > 50 && (
              <div className="border-t border-border/40 bg-surface/50 px-6 py-3 flex items-center justify-between text-xs font-medium text-text-muted">
                <span>Showing page {page} of {Math.ceil(total / 50)}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" className="h-8 px-4 text-xs font-bold" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
                  <Button variant="ghost" className="h-8 px-4 text-xs font-bold" onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total}>Next →</Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <FormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Create New Deal"
        subtitle="Start a new quotation flow"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving} className="font-bold">
              {saving ? "Creating..." : "Create Deal"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Customer <span className="text-accent">*</span></label>
            <select
              value={newQ.customer_id}
              onChange={(e) => setNewQ({ ...newQ, customer_id: e.target.value })}
              className="w-full h-11 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
              required
            >
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Notes</label>
            <Input
              value={newQ.notes}
              onChange={(e) => setNewQ({ ...newQ, notes: e.target.value })}
              placeholder="Deal notes or special conditions..."
              className="h-11 bg-surface shadow-sm text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Promised Date</label>
            <Input
              type="date"
              value={newQ.promised_date}
              onChange={(e) => setNewQ({ ...newQ, promised_date: e.target.value })}
              className="h-11 bg-surface shadow-sm text-sm"
            />
          </div>
        </form>
      </FormDrawer>
    </motion.div>
  )
}
