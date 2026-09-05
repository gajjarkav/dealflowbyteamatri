"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function PricelistDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const store = useDataStore()
  const { toast } = useToast()
  
  const pricelist = store.pricelists.find(p => p.id === id)
  const [formData, setFormData] = useState(pricelist || null)

  if (!pricelist || !formData) {
    return <div className="p-8">Pricelist not found. <Link href="/pricelists" className="text-accent">Go back</Link></div>
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    store.updatePricelist(pricelist.id, formData)
    toast({ title: "Pricelist Updated", description: "Changes saved successfully.", type: "success" })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/pricelists")} className="px-2">&larr; Back</Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {formData.name}
            </h1>
            <p className="text-sm text-text-secondary mt-1">Rule: {formData.ruleType}</p>
          </div>
        </div>
        <Button onClick={handleSave}>Save Pricelist</Button>
      </div>

      <Card className="p-6 border-border bg-surface">
        <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Pricelist Configuration</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Name</label>
            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Rule Type</label>
              <select
                value={formData.ruleType}
                onChange={e => setFormData({...formData, ruleType: e.target.value as "Discount" | "Markup" | "Formula"})}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
              >
                <option value="Discount">Global Discount</option>
                <option value="Markup">Global Markup</option>
                <option value="Formula">Formula-based</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Modifier Amount (%)</label>
              <Input type="number" value={formData.modifierPercent} onChange={e => setFormData({...formData, modifierPercent: Number(e.target.value)})} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="active" 
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <label htmlFor="active" className="text-sm">Active</label>
          </div>
        </form>
      </Card>
      
      <Card className="p-6 border-border bg-surface">
        <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Item Overrides</h2>
        <p className="text-sm text-text-secondary mb-4">Define specific price overrides for individual products in this list.</p>
        <div className="text-center py-8 border border-dashed border-border rounded-lg text-text-muted text-sm">
          No item overrides configured yet.
        </div>
        <Button variant="secondary" className="mt-4">Add Item Override</Button>
      </Card>
    </div>
  )
}
