"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { useParams, useRouter } from "next/navigation"

export default function UpsellRuleDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const store = useDataStore()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    id: id as string,
    name: "Hardware Support Cross-sell",
    triggerProductId: store.products[0]?.id || "",
    suggestedProductId: store.products[1]?.id || "",
    active: true,
    confidenceScore: 85
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast({ title: "Upsell Rule Updated", description: "AI suggestion rules saved.", type: "success" })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/upsell-rules")} className="px-2">&larr; Back</Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {formData.name}
            </h1>
            <p className="text-sm text-text-secondary mt-1">Rule Engine Configuration</p>
          </div>
        </div>
        <Button onClick={handleSave}>Save Rule</Button>
      </div>

      <Card className="p-6 border-border bg-surface">
        <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Rule Definition</h2>
        <p className="text-sm text-text-secondary mb-6">Define &quot;If X is bought, suggest Y&quot; behavior.</p>
        
        <form className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Rule Descriptive Name</label>
            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-dashed border-border rounded-lg bg-background/50">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">IF Customer buys:</label>
              <select
                value={formData.triggerProductId}
                onChange={e => setFormData({...formData, triggerProductId: e.target.value})}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
              >
                {store.products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-accent mb-2">THEN Suggest:</label>
              <select
                value={formData.suggestedProductId}
                onChange={e => setFormData({...formData, suggestedProductId: e.target.value})}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
              >
                {store.products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Confidence Score (0-100)</label>
            <Input type="number" min="0" max="100" value={formData.confidenceScore} onChange={e => setFormData({...formData, confidenceScore: Number(e.target.value)})} />
            <span className="text-[11px] text-text-muted mt-1 block">Higher confidence scores rank higher in the Quotation Builder suggestions panel.</span>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="active" 
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <label htmlFor="active" className="text-sm">Rule is Active</label>
          </div>
        </form>
      </Card>
    </div>
  )
}
