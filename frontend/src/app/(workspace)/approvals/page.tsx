"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import type { QuotationItem } from "@/lib/data/mockStore"

export default function ApprovalsPage() {
  const store = useDataStore()
  const { toast } = useToast()
  const [selectedQuote, setSelectedQuote] = useState<QuotationItem | null>(null)

  const pendingApprovals = store.quotations.filter(
    (q) => q.stage === "Pending Approval" || q.discountPercent > 10
  )

  const handleApprove = (quote: QuotationItem) => {
    store.updateQuotationStage(quote.id, "Approved")
    toast({
      title: "Quotation Approved",
      description: `${quote.dealRef} has been authorized for client presentation.`,
      type: "success"
    })
    setSelectedQuote(null)
  }

  const handleReject = (quote: QuotationItem) => {
    store.updateQuotationStage(quote.id, "Draft")
    toast({
      title: "Quotation Returned to Rep",
      description: `${quote.dealRef} returned to Draft with margin revision request.`,
      type: "warning"
    })
    setSelectedQuote(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Deal Desk Approvals Queue</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manager and finance review queue for quotations exceeding tier discount caps or margin floors.
          </p>
        </div>

        <Badge variant="outline" className="font-mono text-xs border-accent text-accent">
          {pendingApprovals.length} Deals in Review
        </Badge>
      </div>

      {/* Approvals Table */}
      <Card className="p-6 border-border bg-surface">
        <div className="border border-border rounded overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background/80 border-b border-border font-mono text-text-secondary">
              <tr>
                <th className="p-3">Deal Reference</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total Value</th>
                <th className="p-3">Requested Disc %</th>
                <th className="p-3">Gross Margin</th>
                <th className="p-3">Risk Assessment</th>
                <th className="p-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {pendingApprovals.map((quote) => (
                <tr key={quote.id} className="hover:bg-background/40 transition-colors">
                  <td className="p-3">
                    <span className="font-mono font-bold text-text-primary">{quote.dealRef}</span>
                    <span className="text-[11px] text-text-muted block truncate max-w-[160px]">{quote.title}</span>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-text-primary">{quote.customerName}</div>
                    <div className="text-[10px] text-text-secondary font-mono">{quote.customerTier} Tier</div>
                  </td>
                  <td className="p-3 font-mono font-bold text-text-primary">
                    ${quote.totalAmount.toLocaleString()}
                  </td>
                  <td className="p-3 font-mono text-accent font-bold">
                    {quote.discountPercent}%
                  </td>
                  <td className="p-3 font-mono">
                    <span className={quote.grossMarginPercent >= 40 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                      {quote.grossMarginPercent}%
                    </span>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${
                        quote.riskLevel === "High" ? "border-accent text-accent bg-accent/5" : "border-slate-400 text-slate-600"
                      }`}
                    >
                      {quote.riskLevel} Risk
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="secondary"
                      className="h-7 px-2.5 text-xs"
                      onClick={() => setSelectedQuote(quote)}
                    >
                      Inspect & Decide
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail & Decision Panel */}
      {selectedQuote && (
        <Card className="p-6 border-border bg-surface mt-6 animate-in fade-in space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold font-mono text-text-primary">
                  Approval Protocol // {selectedQuote.dealRef}
                </h2>
                <Badge variant="outline" className="font-mono text-xs border-accent text-accent">
                  Stage: {selectedQuote.stage}
                </Badge>
              </div>
              <p className="text-xs text-text-secondary mt-1">{selectedQuote.title}</p>
            </div>

            <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => setSelectedQuote(null)}>
              Close Protocol
            </Button>
          </div>

          {/* Workflow Timeline */}
          <div className="p-4 bg-background border border-border rounded-md">
            <div className="text-xs font-mono text-text-secondary mb-3 uppercase tracking-wider">
              Governance Multi-Stage Approval Chain
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  &#10003;
                </span>
                <div>
                  <div className="font-bold text-text-primary">1. Sales Rep Submit</div>
                  <div className="text-[10px] text-text-muted">{selectedQuote.repName}</div>
                </div>
              </div>

              <span className="hidden sm:inline text-text-muted">&rarr;</span>

              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] animate-pulse">
                  2
                </span>
                <div>
                  <div className="font-bold text-accent">2. Manager Review</div>
                  <div className="text-[10px] text-text-muted">Sarah Chen (Pending)</div>
                </div>
              </div>

              <span className="hidden sm:inline text-text-muted">&rarr;</span>

              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-surface border border-border text-text-muted flex items-center justify-center text-[10px]">
                  3
                </span>
                <div>
                  <div className="font-bold text-text-muted">3. Finance Release</div>
                  <div className="text-[10px] text-text-muted">Marcus Vance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Decision Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" className="text-danger hover:text-danger" onClick={() => handleReject(selectedQuote)}>
              Reject / Return to Rep
            </Button>
            <Button onClick={() => handleApprove(selectedQuote)}>
              Approve Quotation Release
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
