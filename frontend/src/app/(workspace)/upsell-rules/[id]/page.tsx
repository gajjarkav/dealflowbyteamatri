"use client";
import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { useParams, useRouter } from "next/navigation"
import { apiGetUpsellRule, apiUpdateUpsellRule, UpsellRuleResponse } from "@/lib/api/upsell"
import { apiListProducts, ProductResponse } from "@/lib/api/catalog"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function UpsellRuleDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<Partial<UpsellRuleResponse>>({})
  const [products, setProducts] = useState<ProductResponse[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (typeof id !== "string") return
    Promise.all([
      apiGetUpsellRule(id),
      apiListProducts({ size: 100 })
    ])
    .then(([rule, prods]) => {
      setFormData(rule)
      setProducts(prods.items)
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8"><Skeleton className="h-48 w-full" /></div>
  if (error || !formData.id) return <div className="p-8">Upsell rule not found. <Link href="/plans" className="text-accent">Go back</Link></div>

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof id !== "string") return
    try {
      const updated = await apiUpdateUpsellRule(id, {
        name: formData.name,
        trigger_product_id: formData.trigger_product_id,
        suggest_product_id: formData.suggest_product_id,
        min_qty: formData.min_qty || undefined,
        is_active: formData.is_active
      })
      setFormData(updated)
      toast({ title: "Upsell Rule Updated", type: "success" })
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Error", type: "error" })
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/plans")} className="px-2">&larr; Back</Button>
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
            <Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-dashed border-border rounded-lg bg-background/50">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">IF Customer buys:</label>
              <select
                value={formData.trigger_product_id || ""}
                onChange={e => setFormData({...formData, trigger_product_id: e.target.value})}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
              >
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ""}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-accent mb-2">THEN Suggest:</label>
              <select
                value={formData.suggest_product_id || ""}
                onChange={e => setFormData({...formData, suggest_product_id: e.target.value})}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
              >
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ""}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Minimum Trigger Quantity (Optional)</label>
            <Input type="number" min="1" value={formData.min_qty || ""} onChange={e => setFormData({...formData, min_qty: parseInt(e.target.value) || 0})} placeholder="e.g. 5" />
            <span className="text-[11px] text-text-muted mt-1 block">Only suggest if they buy at least this many.</span>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="is_active" 
              checked={formData.is_active || false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <label htmlFor="is_active" className="text-sm">Rule is Active</label>
          </div>
        </form>
      </Card>
    </div>
  )
}
