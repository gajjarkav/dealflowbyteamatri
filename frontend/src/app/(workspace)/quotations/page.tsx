"use client"
import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Filter } from "lucide-react"
import {
  apiListQuotations,
  type QuotationResponse,
  type QuotationStatus,
} from "@/lib/api/quotations"

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
  draft: "border-border text-text-secondary bg-surface",
  pending_approval: "border-accent/40 text-accent bg-accent-soft/30",
  approved: "border-blue-500/50 text-blue-600 bg-blue-500/10",
  revision_requested: "border-amber-500/50 text-amber-600 bg-amber-500/10",
  under_negotiation: "border-purple-500/50 text-purple-600 bg-purple-500/10",
  accepted: "border-emerald-500/50 text-emerald-600 bg-emerald-500/10",
  cancelled: "border-red-400/50 text-red-500 bg-red-500/10",
  fulfilled: "border-emerald-600 text-emerald-700 bg-emerald-500/20",
}

export default function QuotationsListPage() {
  const { toast } = useToast()
  const [quotations, setQuotations] = useState<QuotationResponse[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiListQuotations({ search: search || undefined, page, size: 20 })
      setQuotations(res.items)
      setTotal(res.total)
    } catch {
      toast({ title: "Error", description: "Failed to load quotations", type: "error" })
    } finally {
      setLoading(false)
    }
  }, [search, page, toast])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Quotations</h1>
          <p className="text-sm text-text-secondary mt-1">Manage all quotations and deal histories.</p>
        </div>
        <Link href="/quotations/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> New Quotation
          </Button>
        </Link>
      </div>

      <Card className="p-4 border-border bg-surface flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input 
            placeholder="Search reference or customer..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 px-3">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>
      </Card>

      <div className="border border-border rounded-lg overflow-hidden bg-background">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-surface border-b border-border text-xs font-mono text-text-secondary">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Rep</th>
              <th className="px-4 py-3 text-right">Value</th>
              <th className="px-4 py-3 text-right">Margin</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-12 ml-auto" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20 ml-auto" /></td>
                </tr>
              ))
            ) : quotations.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-text-muted">No quotations found.</td></tr>
            ) : quotations.map((q) => (
              <tr key={q.id} className="hover:bg-surface/60 transition-colors">
                <td className="px-4 py-3 font-mono font-bold">
                  <Link href={`/quotations/${q.id}`} className="text-text-primary hover:text-accent">
                    {q.number || q.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium text-text-secondary">{q.customer_name || "—"}</td>
                <td className="px-4 py-3 text-text-muted">{q.rep_name || "—"}</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-text-primary">
                  ${(q.total || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  <span className={(q.gross_margin_pct || 0) >= 40 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                    {q.gross_margin_pct != null ? `${q.gross_margin_pct.toFixed(1)}%` : "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className={`font-mono text-[10px] uppercase tracking-wider ${STATUS_COLORS[q.status]}`}>
                    {STATUS_LABELS[q.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right text-xs text-text-muted">
                  {new Date(q.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 20 && (
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Showing page {page} of {Math.ceil(total / 20)}</span>
          <div className="flex gap-2">
            <Button variant="ghost" className="h-7 px-3 text-xs" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
            <Button variant="ghost" className="h-7 px-3 text-xs" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>Next →</Button>
          </div>
        </div>
      )}
    </div>
  )
}
