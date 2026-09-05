"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"

export default function DiscountTiersPage() {
  const store = useDataStore()
  const { toast } = useToast()
  const [editingMatrix, setEditingMatrix] = useState(false)
  const [ceilings, setCeilings] = useState([...store.categoryCeilings])

  const handleCellChange = (id: string, field: "bronzeMaxDisc" | "silverMaxDisc" | "goldMaxDisc" | "platinumMaxDisc", val: number) => {
    setCeilings((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    )
  }

  const handleSaveMatrix = () => {
    ceilings.forEach((c) => store.updateCeiling(c.id, c))
    setEditingMatrix(false)
    toast({
      title: "Discount Ceilings Saved",
      description: "Autonomous discount routing matrix updated successfully."
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Discount Tiers & Category Ceilings</h1>
        <p className="text-sm text-text-secondary mt-1">
          Self-governing discount rules: sets the maximum autonomous discount before manager or finance approval is triggered.
        </p>
      </div>

      {/* Grid: Tiers Summary + Ceilings Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Baselines Card */}
        <Card className="p-6 border-border bg-surface lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-text-primary">Customer Tier Baselines</h2>
              <Badge variant="outline" className="font-mono text-xs">Standard SLA</Badge>
            </div>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              Default maximum discount allowable without requiring manual deal desk escalation.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded bg-background border border-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                  <span className="text-sm font-medium">Bronze Tier</span>
                </div>
                <span className="font-mono text-xs font-bold text-text-primary">5.0% Max Disc</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-background border border-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-sm font-medium">Silver Tier</span>
                </div>
                <span className="font-mono text-xs font-bold text-text-primary">10.0% Max Disc</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-background border border-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium">Gold Tier</span>
                </div>
                <span className="font-mono text-xs font-bold text-accent">15.0% Max Disc</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-background border border-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-sm font-medium">Platinum Tier</span>
                </div>
                <span className="font-mono text-xs font-bold text-purple-600">20.0% Max Disc</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border text-[11px] text-text-muted">
            Discounts exceeding tier caps automatically route to Sales Manager approval queue.
          </div>
        </Card>

        {/* Category Ceilings Matrix Card */}
        <Card className="p-6 border-border bg-surface lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Category Ceilings Matrix</h2>
              <p className="text-xs text-text-secondary">Granular tier x category maximum discount percentage limits</p>
            </div>

            {editingMatrix ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => setEditingMatrix(false)}>
                  Cancel
                </Button>
                <Button className="h-8 px-3 text-xs" onClick={handleSaveMatrix}>
                  Save Matrix
                </Button>
              </div>
            ) : (
              <Button variant="secondary" className="h-8 px-3 text-xs" onClick={() => setEditingMatrix(true)}>
                Edit Ceilings
              </Button>
            )}
          </div>

          <div className="border border-border rounded overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background/80 border-b border-border font-mono text-text-secondary">
                <tr>
                  <th className="p-3">Product Category</th>
                  <th className="p-3 text-center">Bronze (%)</th>
                  <th className="p-3 text-center">Silver (%)</th>
                  <th className="p-3 text-center">Gold (%)</th>
                  <th className="p-3 text-center">Platinum (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ceilings.map((c) => (
                  <tr key={c.id} className="hover:bg-background/40 transition-colors">
                    <td className="p-3 font-semibold text-text-primary">{c.category}</td>
                    
                    <td className="p-2 text-center">
                      {editingMatrix ? (
                        <Input
                          type="number"
                          value={c.bronzeMaxDisc}
                          onChange={(e) => handleCellChange(c.id, "bronzeMaxDisc", Number(e.target.value))}
                          className="w-16 h-7 text-center mx-auto text-xs"
                          min={0}
                          max={100}
                        />
                      ) : (
                        <span className="font-mono">{c.bronzeMaxDisc}%</span>
                      )}
                    </td>

                    <td className="p-2 text-center">
                      {editingMatrix ? (
                        <Input
                          type="number"
                          value={c.silverMaxDisc}
                          onChange={(e) => handleCellChange(c.id, "silverMaxDisc", Number(e.target.value))}
                          className="w-16 h-7 text-center mx-auto text-xs"
                          min={0}
                          max={100}
                        />
                      ) : (
                        <span className="font-mono">{c.silverMaxDisc}%</span>
                      )}
                    </td>

                    <td className="p-2 text-center">
                      {editingMatrix ? (
                        <Input
                          type="number"
                          value={c.goldMaxDisc}
                          onChange={(e) => handleCellChange(c.id, "goldMaxDisc", Number(e.target.value))}
                          className="w-16 h-7 text-center mx-auto text-xs font-bold text-accent"
                          min={0}
                          max={100}
                        />
                      ) : (
                        <span className="font-mono font-bold text-accent">{c.goldMaxDisc}%</span>
                      )}
                    </td>

                    <td className="p-2 text-center">
                      {editingMatrix ? (
                        <Input
                          type="number"
                          value={c.platinumMaxDisc}
                          onChange={(e) => handleCellChange(c.id, "platinumMaxDisc", Number(e.target.value))}
                          className="w-16 h-7 text-center mx-auto text-xs font-bold text-purple-600"
                          min={0}
                          max={100}
                        />
                      ) : (
                        <span className="font-mono font-bold text-purple-600">{c.platinumMaxDisc}%</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Autonomous Escalation Matrix */}
      <Card className="p-6 border-border bg-surface">
        <h2 className="text-base font-semibold text-text-primary mb-1">Deal Desk Autonomous Routing Rules</h2>
        <p className="text-xs text-text-secondary mb-4">How quotation requests route through the governance pipeline</p>

        <div className="border border-border rounded overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-background/80 border-b border-border font-mono text-text-secondary">
              <tr>
                <th className="p-3">Discount Threshold Condition</th>
                <th className="p-3">Gross Margin Floor</th>
                <th className="p-3">Required Approver</th>
                <th className="p-3">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              <tr>
                <td className="p-3 text-text-primary">Within Category Ceiling Limit</td>
                <td className="p-3">&ge; 40.0%</td>
                <td className="p-3 text-emerald-600 font-semibold">No Approval Needed (Instant Lock)</td>
                <td className="p-3"><Badge variant="outline" className="border-emerald-500/50 text-emerald-600">LOW</Badge></td>
              </tr>
              <tr>
                <td className="p-3 text-text-primary">Over Ceiling &le; 25.0%</td>
                <td className="p-3">&ge; 32.0%</td>
                <td className="p-3 text-blue-600 font-semibold">Sales Manager Sign-off</td>
                <td className="p-3"><Badge variant="outline" className="border-blue-500/50 text-blue-600">MEDIUM</Badge></td>
              </tr>
              <tr>
                <td className="p-3 text-text-primary">Over Ceiling &gt; 25.0% or Margin &lt; 32%</td>
                <td className="p-3">&ge; 25.0%</td>
                <td className="p-3 text-accent font-semibold">Sales Manager + Finance Dual Approval</td>
                <td className="p-3"><Badge variant="outline" className="border-accent text-accent">HIGH</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
