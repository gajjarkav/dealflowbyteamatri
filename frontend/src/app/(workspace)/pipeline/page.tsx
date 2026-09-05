"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import type { QuotationItem } from "@/lib/data/mockStore"

const STAGES: QuotationItem["stage"][] = [
  "Draft",
  "Pending Approval",
  "Approved",
  "Customer Review",
  "Accepted",
  "Done"
]

export default function PipelinePage() {
  const store = useDataStore()
  const { toast } = useToast()
  const [selectedDeal, setSelectedDeal] = useState<QuotationItem | null>(null)

  const advanceStage = (deal: QuotationItem, nextStage: QuotationItem["stage"]) => {
    store.updateQuotationStage(deal.id, nextStage)
    toast({
      title: "Stage Updated",
      description: `${deal.dealRef} transitioned to "${nextStage}".`,
      type: "success"
    })
    if (selectedDeal && selectedDeal.id === deal.id) {
      setSelectedDeal({ ...selectedDeal, stage: nextStage })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Quotations & Deal Pipeline</h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time Kanban view of deal velocity, discount approvals, client negotiations, and closed bookings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            {store.quotations.length} Active Deals
          </Badge>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const dealsInStage = store.quotations.filter((q) => q.stage === stage)
          const stageTotal = dealsInStage.reduce((sum, q) => sum + q.totalAmount, 0)

          return (
            <div key={stage} className="bg-surface border border-border rounded-md p-3 flex flex-col min-w-[210px]">
              {/* Column Header */}
              <div className="border-b border-border pb-2.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-text-primary uppercase font-mono tracking-wider">
                    {stage}
                  </span>
                  <span className="font-mono text-xs text-accent font-semibold px-1.5 py-0.5 rounded bg-accent/10">
                    {dealsInStage.length}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-text-muted mt-1">
                  ${stageTotal.toLocaleString()}
                </div>
              </div>

              {/* Deals Cards */}
              <div className="space-y-2.5 flex-1">
                {dealsInStage.length > 0 ? (
                  dealsInStage.map((deal) => {
                    return (
                      <Card
                        key={deal.id}
                        onClick={() => setSelectedDeal(deal)}
                        className={`p-3 border-border hover:border-accent/80 transition-all cursor-pointer bg-background ${
                          selectedDeal?.id === deal.id ? "border-accent ring-1 ring-accent" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="font-mono text-xs font-bold text-text-primary">{deal.dealRef}</span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-mono py-0 ${
                              deal.riskLevel === "High" ? "text-accent border-accent" : "text-text-muted"
                            }`}
                          >
                            {deal.riskLevel}
                          </Badge>
                        </div>

                        <div className="text-xs font-semibold text-text-primary truncate mb-1">
                          {deal.customerName}
                        </div>

                        <div className="flex items-baseline justify-between font-mono text-xs mt-2 pt-2 border-t border-border/60">
                          <span className="font-bold text-text-primary">
                            ${deal.totalAmount.toLocaleString()}
                          </span>
                          <span className={`text-[11px] font-semibold ${deal.grossMarginPercent >= 40 ? "text-emerald-600" : "text-amber-600"}`}>
                            {deal.grossMarginPercent}% mg
                          </span>
                        </div>
                      </Card>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-[11px] text-text-muted border border-dashed border-border rounded">
                    No deals in {stage}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Deal Detail Drawer / Panel */}
      {selectedDeal && (
        <Card className="p-6 border-border bg-surface mt-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold font-mono text-text-primary">{selectedDeal.dealRef}</h2>
                <Badge variant="outline" className="font-mono text-xs border-accent text-accent">
                  {selectedDeal.stage}
                </Badge>
              </div>
              <p className="text-xs text-text-secondary mt-1">{selectedDeal.title}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" className="h-8 px-2.5 text-xs" onClick={() => setSelectedDeal(null)}>
                Close Preview
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 font-mono text-xs">
            <div className="p-3 bg-background border border-border rounded">
              <span className="text-text-secondary block">Customer:</span>
              <span className="font-bold text-text-primary text-sm font-sans">{selectedDeal.customerName}</span>
              <span className="text-[10px] text-text-muted block mt-0.5">{selectedDeal.customerTier} Tier</span>
            </div>

            <div className="p-3 bg-background border border-border rounded">
              <span className="text-text-secondary block">Deal Total:</span>
              <span className="font-extrabold text-accent text-base">${selectedDeal.totalAmount.toLocaleString()}</span>
              <span className="text-[10px] text-text-muted block mt-0.5">Discount: {selectedDeal.discountPercent}%</span>
            </div>

            <div className="p-3 bg-background border border-border rounded">
              <span className="text-text-secondary block">Gross Margin:</span>
              <span className="font-extrabold text-emerald-600 text-base">{selectedDeal.grossMarginPercent}%</span>
              <span className="text-[10px] text-text-muted block mt-0.5">Items: {selectedDeal.itemsCount} SKUs</span>
            </div>

            <div className="p-3 bg-background border border-border rounded">
              <span className="text-text-secondary block">Assigned Rep:</span>
              <span className="font-semibold text-text-primary font-sans text-sm">{selectedDeal.repName}</span>
              <span className="text-[10px] text-text-muted block mt-0.5">Expires: {selectedDeal.expiryDate}</span>
            </div>
          </div>

          {/* Action to advance stage */}
          <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-text-secondary font-mono">
              TRANSITION STAGE:
            </span>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <Button
                  key={s}
                  variant={selectedDeal.stage === s ? "primary" : "secondary"}
                  className="h-7 px-2.5 text-xs font-mono"
                  onClick={() => advanceStage(selectedDeal, s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
