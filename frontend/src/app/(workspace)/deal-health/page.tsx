"use client"
import React from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DealHealthPage() {
  const store = useDataStore()

  const highRiskDeals = store.quotations.filter((q) => q.riskLevel === "High")
  const healthyDeals = store.quotations.filter((q) => q.grossMarginPercent >= store.settings.targetGrossMarginPercent)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Deal Health, Risk Scoring & Warranty</h1>
        <p className="text-sm text-text-secondary mt-1">
          Predictive margin erosion diagnostics, warranty attach rates, and stalled quotation alerts.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-border bg-surface">
          <div className="text-xs font-mono text-text-secondary">HEALTHY HIGH-MARGIN DEALS</div>
          <div className="font-mono text-3xl font-extrabold text-emerald-600 mt-2">
            {healthyDeals.length} <span className="text-sm font-normal text-text-secondary">deals</span>
          </div>
          <div className="text-[11px] text-text-muted mt-2 font-mono">
            &ge; {store.settings.targetGrossMarginPercent}% Target Margin Floor
          </div>
        </Card>

        <Card className="p-5 border-border bg-surface">
          <div className="text-xs font-mono text-text-secondary">HIGH RISK / MARGIN DEGRADED</div>
          <div className="font-mono text-3xl font-extrabold text-accent mt-2">
            {highRiskDeals.length} <span className="text-sm font-normal text-text-secondary">deals</span>
          </div>
          <div className="text-[11px] text-text-muted mt-2 font-mono">
            Requires Manager + Finance Intervention
          </div>
        </Card>

        <Card className="p-5 border-border bg-surface">
          <div className="text-xs font-mono text-text-secondary">ENTERPRISE SLA ATTACH RATE</div>
          <div className="font-mono text-3xl font-extrabold text-text-primary mt-2">
            78.4%
          </div>
          <div className="text-[11px] text-emerald-600 mt-2 font-mono">
            +6.2% attach through Upsell Engine
          </div>
        </Card>
      </div>

      {/* Risk Alert Deals Section */}
      <Card className="p-6 border-border bg-surface space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Active Risk Diagnostic Ledger</h2>
            <p className="text-xs text-text-secondary">Deals flagged for variance, discount escalation, or stalled timeline</p>
          </div>
          <Badge variant="secondary" className="font-mono text-xs border-accent text-accent">
            {highRiskDeals.length} Flagged
          </Badge>
        </div>

        <div className="border border-border rounded overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background/80 border-b border-border font-mono text-text-secondary">
              <tr>
                <th className="p-3">Quotation</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Deal Value</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Gross Margin</th>
                <th className="p-3">Risk Assessment Factor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {store.quotations.map((q) => (
                <tr key={q.id} className="hover:bg-background/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-text-primary">{q.dealRef}</td>
                  <td className="p-3 font-medium text-text-primary">{q.customerName}</td>
                  <td className="p-3 font-mono font-bold text-text-primary">${q.totalAmount.toLocaleString()}</td>
                  <td className="p-3 font-mono text-accent font-semibold">{q.discountPercent}%</td>
                  <td className="p-3 font-mono">
                    <span className={q.grossMarginPercent >= 40 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                      {q.grossMarginPercent}%
                    </span>
                  </td>
                  <td className="p-3">
                    {q.riskLevel === "High" ? (
                      <span className="text-accent font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        Discount exceeds tier cap &amp; margin &lt; 35%
                      </span>
                    ) : (
                      <span className="text-text-muted flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        Within acceptable variance
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
