"use client"
import React from "react"
import Link from "next/link"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const store = useDataStore()

  const totalPipeline = store.quotations.reduce((sum, q) => sum + q.totalAmount, 0)
  const pendingApprovalsCount = store.quotations.filter((q) => q.stage === "Pending Approval").length
  const avgMargin = (
    store.quotations.reduce((sum, q) => sum + q.grossMarginPercent, 0) / (store.quotations.length || 1)
  ).toFixed(1)

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-accent/10 text-accent mb-2">
            AUTONOMOUS SALES ENGINE &bull; {store.currentRole.toUpperCase()} CONSOLE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Executive Sales & Operations Command
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Real-time pipeline visibility, autonomous discount governance, and multi-warehouse fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/pipeline">
            <Button variant="primary">
              View Deal Pipeline
            </Button>
          </Link>
          <Link href="/approvals">
            <Button variant="secondary">
              Approvals ({pendingApprovalsCount})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-border bg-surface flex flex-col justify-between">
          <div className="text-xs font-mono text-text-secondary">TOTAL PIPELINE VALUE</div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-text-primary mt-2">
            ${totalPipeline.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-mono mt-3 flex items-center gap-1">
            <span>&uarr; 14.8%</span>
            <span className="text-text-muted">vs last cycle</span>
          </div>
        </Card>

        <Card className="p-5 border-border bg-surface flex flex-col justify-between">
          <div className="text-xs font-mono text-text-secondary">PENDING APPROVALS</div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-accent mt-2">
            {pendingApprovalsCount} <span className="text-sm font-normal text-text-secondary">deals</span>
          </div>
          <div className="text-[11px] text-text-muted font-mono mt-3">
            Escalation SLA: &lt; 24h
          </div>
        </Card>

        <Card className="p-5 border-border bg-surface flex flex-col justify-between">
          <div className="text-xs font-mono text-text-secondary">AVERAGE GROSS MARGIN</div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
            {avgMargin}%
          </div>
          <div className="text-[11px] text-text-muted font-mono mt-3">
            Floor Policy: &ge; {store.settings.minimumGrossMarginPercent}%
          </div>
        </Card>

        <Card className="p-5 border-border bg-surface flex flex-col justify-between">
          <div className="text-xs font-mono text-text-secondary">ACTIVE HUBS & STOCK</div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-text-primary mt-2">
            {store.warehouses.length} <span className="text-sm font-normal text-text-secondary">hubs</span>
          </div>
          <div className="text-[11px] text-text-muted font-mono mt-3">
            Odoo Sync: Live Connected
          </div>
        </Card>
      </div>

      {/* Main Sections: Recent Pipeline + Fast Action Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Quotations Table Card */}
        <Card className="p-6 border-border bg-surface lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Recent Active Quotations</h2>
              <p className="text-xs text-text-secondary">Live deals flowing through the governance matrix</p>
            </div>
            <Link href="/pipeline" className="text-xs text-accent hover:underline font-medium">
              Open Full Pipeline &rarr;
            </Link>
          </div>

          <div className="border border-border rounded overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background/80 border-b border-border font-mono text-text-secondary">
                <tr>
                  <th className="p-3">Deal Reference</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Margin</th>
                  <th className="p-3">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {store.quotations.slice(0, 5).map((q) => {
                  const stageColors: Record<string, string> = {
                    "Draft": "border-border text-text-secondary",
                    "Pending Approval": "border-accent text-accent bg-accent/5",
                    "Approved": "border-blue-500/50 text-blue-600 bg-blue-500/5",
                    "Customer Review": "border-purple-500/50 text-purple-600 bg-purple-500/5",
                    "Accepted": "border-emerald-500/50 text-emerald-600 bg-emerald-500/5",
                    "Done": "border-emerald-600 text-emerald-700 bg-emerald-500/10"
                  }

                  return (
                    <tr key={q.id} className="hover:bg-background/40 transition-colors">
                      <td className="p-3">
                        <div className="font-mono font-bold text-text-primary">{q.dealRef}</div>
                        <div className="text-[11px] text-text-muted truncate max-w-[140px]">{q.title}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-text-primary">{q.customerName}</div>
                        <div className="text-[10px] text-text-secondary font-mono">{q.customerTier} Tier</div>
                      </td>
                      <td className="p-3 font-mono font-semibold text-text-primary">
                        ${q.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono">
                        <span className={q.grossMarginPercent >= 40 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                          {q.grossMarginPercent}%
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className={`font-mono text-[10px] ${stageColors[q.stage]}`}>
                          {q.stage}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Governance Links */}
        <Card className="p-6 border-border bg-surface space-y-4">
          <h2 className="text-base font-semibold text-text-primary">Governance Modules</h2>
          <p className="text-xs text-text-secondary">Direct shortcuts for administrative rules & catalogs</p>

          <div className="space-y-2.5">
            <Link href="/discount-tiers" className="block p-3 rounded border border-border bg-background hover:border-accent/60 transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary group-hover:text-accent">Discount Tiers & Ceilings</span>
                <span className="font-mono text-xs text-accent">&rarr;</span>
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">Tier limits & category discount caps</div>
            </Link>

            <Link href="/approval-rules" className="block p-3 rounded border border-border bg-background hover:border-accent/60 transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary group-hover:text-accent">Approval Chains</span>
                <span className="font-mono text-xs text-accent">&rarr;</span>
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">Margin thresholds & risk escalation</div>
            </Link>

            <Link href="/warehouses" className="block p-3 rounded border border-border bg-background hover:border-accent/60 transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary group-hover:text-accent">Inventory & Stock</span>
                <span className="font-mono text-xs text-accent">&rarr;</span>
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">Multi-hub stock levels & adjust tool</div>
            </Link>

            <Link href="/portal" className="block p-3 rounded border border-accent/40 bg-accent/5 hover:border-accent transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-accent">Customer Negotiation Portal</span>
                <span className="font-mono text-xs text-accent">&rarr;</span>
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">Simulate buyer view and counter-offers</div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
