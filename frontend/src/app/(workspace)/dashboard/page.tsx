"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiListQuotations, type QuotationResponse } from "@/lib/api/quotations"
import { apiListWarehouses } from "@/lib/api/warehouses"
import { apiListApprovals } from "@/lib/api/approvals"

const statusColors: Record<string, string> = {
  draft: "border-border text-text-secondary",
  pending_approval: "border-accent text-accent bg-accent/5",
  approved: "border-blue-500/50 text-blue-600 bg-blue-500/5",
  revision_requested: "border-amber-500/50 text-amber-600 bg-amber-500/5",
  under_negotiation: "border-purple-500/50 text-purple-600 bg-purple-500/5",
  accepted: "border-emerald-500/50 text-emerald-600 bg-emerald-500/5",
  fulfilled: "border-emerald-600 text-emerald-700 bg-emerald-500/10",
  cancelled: "border-red-400/50 text-red-500 bg-red-500/5",
}

export default function DashboardPage() {
  const [quotations, setQuotations] = useState<QuotationResponse[]>([])
  const [warehouseCount, setWarehouseCount] = useState(0)
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [qRes, wRes, aRes] = await Promise.allSettled([
          apiListQuotations({ page: 1, size: 10 }),
          apiListWarehouses({ page: 1, size: 1 }),
          apiListApprovals({ status: "pending", page: 1, size: 1 }),
        ])
        if (qRes.status === "fulfilled") setQuotations(qRes.value.items)
        if (wRes.status === "fulfilled") setWarehouseCount(wRes.value.total)
        if (aRes.status === "fulfilled") setPendingApprovalsCount(aRes.value.total)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalPipeline = quotations.reduce((s, q) => s + (q.total || 0), 0)
  const avgMargin =
    quotations.length > 0
      ? (
          quotations.reduce((s, q) => s + (q.gross_margin_pct || 0), 0) /
          quotations.length
        ).toFixed(1)
      : "—"

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-accent/10 text-accent mb-2">
            AUTONOMOUS SALES ENGINE • LIVE DATA
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Executive Sales &amp; Operations Command
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Real-time pipeline visibility, autonomous discount governance, and multi-warehouse fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/pipeline">
            <Button variant="primary">View Deal Pipeline</Button>
          </Link>
          <Link href="/approvals">
            <Button variant="secondary">Approvals ({pendingApprovalsCount})</Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-border bg-surface flex flex-col justify-between">
          <div className="text-xs font-mono text-text-secondary">TOTAL PIPELINE VALUE</div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-text-primary mt-2">
            {loading ? "…" : `$${totalPipeline.toLocaleString()}`}
          </div>
          <div className="text-[11px] text-emerald-600 font-mono mt-3 flex items-center gap-1">
            <span>↑ Live Data</span>
            <span className="text-text-muted">from backend</span>
          </div>
        </Card>

        <Card className="p-5 border-border bg-surface flex flex-col justify-between">
          <div className="text-xs font-mono text-text-secondary">PENDING APPROVALS</div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-accent mt-2">
            {loading ? "…" : pendingApprovalsCount}{" "}
            <span className="text-sm font-normal text-text-secondary">deals</span>
          </div>
          <div className="text-[11px] text-text-muted font-mono mt-3">
            Escalation SLA: &lt; 24h
          </div>
        </Card>

        <Card className="p-5 border-border bg-surface flex flex-col justify-between">
          <div className="text-xs font-mono text-text-secondary">AVERAGE GROSS MARGIN</div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
            {loading ? "…" : `${avgMargin}%`}
          </div>
          <div className="text-[11px] text-text-muted font-mono mt-3">
            Computed from live quotations
          </div>
        </Card>

        <Card className="p-5 border-border bg-surface flex flex-col justify-between">
          <div className="text-xs font-mono text-text-secondary">ACTIVE HUBS &amp; STOCK</div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-text-primary mt-2">
            {loading ? "…" : warehouseCount}{" "}
            <span className="text-sm font-normal text-text-secondary">hubs</span>
          </div>
          <div className="text-[11px] text-text-muted font-mono mt-3">
            Backend Sync: Live Connected
          </div>
        </Card>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Quotations Table Card */}
        <Card className="p-6 border-border bg-surface lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Recent Active Quotations</h2>
              <p className="text-xs text-text-secondary">Live deals flowing through the governance matrix</p>
            </div>
            <Link href="/pipeline" className="text-xs text-accent hover:underline font-medium">
              Open Full Pipeline →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-text-muted text-sm">Loading quotations…</div>
          ) : quotations.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm">No quotations yet. Create your first deal!</div>
          ) : (
            <div className="border border-border rounded overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-background/80 border-b border-border font-mono text-text-secondary">
                  <tr>
                    <th className="p-3">Deal Reference</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Value</th>
                    <th className="p-3">Margin</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {quotations.slice(0, 5).map((q) => (
                    <tr key={q.id} className="hover:bg-background/40 transition-colors">
                      <td className="p-3">
                        <Link href={`/quotations/${q.id}`}>
                          <div className="font-mono font-bold text-text-primary hover:text-accent transition-colors">
                            {q.number}
                          </div>
                        </Link>
                        <div className="text-[11px] text-text-muted">{q.customer_name || "—"}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-text-primary">{q.customer_name || "—"}</div>
                        <div className="text-[10px] text-text-secondary font-mono">{q.rep_name || "—"}</div>
                      </td>
                      <td className="p-3 font-mono font-semibold text-text-primary">
                        ${(q.total || 0).toLocaleString()}
                      </td>
                      <td className="p-3 font-mono">
                        <span
                          className={
                            (q.gross_margin_pct || 0) >= 40
                              ? "text-emerald-600 font-bold"
                              : "text-amber-600 font-bold"
                          }
                        >
                          {q.gross_margin_pct != null ? `${q.gross_margin_pct.toFixed(1)}%` : "—"}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="secondary"
                          className={`font-mono text-[10px] ${statusColors[q.status] || ""}`}
                        >
                          {q.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Quick Governance Links */}
        <Card className="p-6 border-border bg-surface space-y-4">
          <h2 className="text-base font-semibold text-text-primary">Governance Modules</h2>
          <p className="text-xs text-text-secondary">Direct shortcuts for administrative rules &amp; catalogs</p>

          <div className="space-y-2.5">
            {[
              { href: "/discount-tiers", label: "Discount Tiers & Ceilings", desc: "Tier limits & category discount caps" },
              { href: "/approval-rules", label: "Approval Chains", desc: "Margin thresholds & risk escalation" },
              { href: "/warehouses", label: "Inventory & Stock", desc: "Multi-hub stock levels & adjust tool" },
              { href: "/customers", label: "Customer Ledger", desc: "Accounts, tiers, credit approvals" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block p-3 rounded border border-border bg-background hover:border-accent/60 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary group-hover:text-accent">
                    {item.label}
                  </span>
                  <span className="font-mono text-xs text-accent">→</span>
                </div>
                <div className="text-[11px] text-text-muted mt-0.5">{item.desc}</div>
              </Link>
            ))}

            <Link
              href="/portal"
              className="block p-3 rounded border border-accent/40 bg-accent/5 hover:border-accent transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-accent">Customer Negotiation Portal</span>
                <span className="font-mono text-xs text-accent">→</span>
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">Simulate buyer view and counter-offers</div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
