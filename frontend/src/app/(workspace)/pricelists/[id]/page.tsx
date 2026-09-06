"use client";
import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { apiGetPricelist, apiUpdatePricelist, apiListPricelistItems, apiAddPricelistItem, apiDeletePricelistItem, apiResolvePrice, PriceListResponse, PriceListItemResponse, PriceResolutionResponse } from "@/lib/api/pricing"
import { apiListProducts, ProductResponse } from "@/lib/api/catalog"
import { apiListCustomers, CustomerResponse } from "@/lib/api/customers"
import { Skeleton } from "@/components/ui/skeleton"

export default function PricelistDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [pricelist, setPricelist] = useState<PriceListResponse | null>(null)
  const [items, setItems] = useState<PriceListItemResponse[]>([])
  const [formData, setFormData] = useState<Partial<PriceListResponse>>({})
  const [loading, setLoading] = useState(true)
  
  // For dropdowns
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [customers, setCustomers] = useState<CustomerResponse[]>([])

  // For Adding Item
  const [newItem, setNewItem] = useState({ product_id: "", fixed_price: "", discount_pct: "", min_qty: 1 })
  const [addingItem, setAddingItem] = useState(false)

  // For Price Resolution
  const [resolveForm, setResolveForm] = useState({ product_id: "", customer_id: "", qty: 1 })
  const [resolvedPrice, setResolvedPrice] = useState<PriceResolutionResponse | null>(null)
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    if (typeof id !== "string") return
    Promise.all([
      apiGetPricelist(id),
      apiListPricelistItems(id, { size: 100 }),
      apiListProducts({ size: 100 }),
      apiListCustomers({ size: 100 })
    ])
    .then(([pl, pItems, prods, custs]) => {
      setPricelist(pl)
      setFormData(pl)
      setItems(pItems.items)
      setProducts(prods.items)
      setCustomers(custs.items)
    })
    .catch(err => {
      toast({ title: "Error", description: err.message, type: "error" })
    })
    .finally(() => setLoading(false))
  }, [id, toast])

  if (loading) return <div className="p-8"><Skeleton className="h-48 w-full" /></div>
  if (!pricelist) return <div className="p-8">Pricelist not found. <Link href="/pricelists" className="text-accent">Go back</Link></div>

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof id !== "string") return
    try {
      const updated = await apiUpdatePricelist(id, {
        name: formData.name,
        currency: formData.currency,
        tier: formData.tier || undefined,
        is_active: formData.is_active
      })
      setPricelist(updated)
      setFormData(updated)
      toast({ title: "Pricelist Updated", type: "success" })
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Error", type: "error" })
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof id !== "string" || !newItem.product_id) return
    setAddingItem(true)
    try {
      await apiAddPricelistItem(id, {
        product_id: newItem.product_id,
        fixed_price: newItem.fixed_price ? parseFloat(newItem.fixed_price) : undefined,
        discount_pct: newItem.discount_pct ? parseFloat(newItem.discount_pct) : undefined,
        min_qty: newItem.min_qty
      })
      const pItems = await apiListPricelistItems(id, { size: 100 })
      setItems(pItems.items)
      setNewItem({ product_id: "", fixed_price: "", discount_pct: "", min_qty: 1 })
      toast({ title: "Item override added" })
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Error", type: "error" })
    } finally {
      setAddingItem(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Remove this override?")) return
    if (typeof id !== "string") return
    try {
      await apiDeletePricelistItem(itemId)
      const pItems = await apiListPricelistItems(id, { size: 100 })
      setItems(pItems.items)
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Error", type: "error" })
    }
  }

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolveForm.product_id) return
    setResolving(true)
    try {
      const res = await apiResolvePrice({
        product_id: resolveForm.product_id,
        customer_id: resolveForm.customer_id || undefined,
        qty: resolveForm.qty
      })
      setResolvedPrice(res)
    } catch (err: unknown) {
      toast({ title: "Error resolving price", description: err instanceof Error ? err.message : "Error", type: "error" })
    } finally {
      setResolving(false)
    }
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
            <p className="text-sm text-text-secondary mt-1">Tier: {formData.tier || "Global"}</p>
          </div>
        </div>
        <Button onClick={handleSave}>Save Pricelist</Button>
      </div>

      <Card className="p-6 border-border bg-surface">
        <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Pricelist Configuration</h2>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Name</label>
              <Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Currency</label>
              <select
                value={formData.currency || "USD"}
                onChange={e => setFormData({...formData, currency: e.target.value})}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Target Tier (Optional)</label>
              <select
                value={formData.tier || ""}
                onChange={e => setFormData({...formData, tier: e.target.value})}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
              >
                <option value="">(None - Specific Customers)</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input 
                type="checkbox" 
                id="active" 
                checked={formData.is_active || false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <label htmlFor="active" className="text-sm">Active</label>
            </div>
          </div>
        </form>
      </Card>
      
      <Card className="p-6 border-border bg-surface">
        <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Item Overrides</h2>
        <p className="text-sm text-text-secondary mb-4">Define specific price overrides for individual products in this list.</p>
        
        {items.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-lg text-text-muted text-sm">
            No item overrides configured yet.
          </div>
        ) : (
          <div className="space-y-2 mb-6">
            {items.map(it => (
              <div key={it.id} className="flex items-center justify-between bg-surface-hover p-2 rounded border border-border/50">
                <div>
                  <div className="font-medium text-sm">{products.find(p => p.id === it.product_id)?.name || "Unknown"}</div>
                  <div className="text-xs text-text-muted">Min Qty: {it.min_qty}</div>
                </div>
                <div className="flex items-center gap-4">
                  {it.fixed_price != null && <div className="text-sm font-bold">Fixed: ${it.fixed_price}</div>}
                  {it.discount_pct != null && <div className="text-sm font-bold text-emerald-400">-{it.discount_pct}%</div>}
                  <Button variant="ghost" className="h-7 text-xs text-danger" onClick={() => handleDeleteItem(it.id)}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddItem} className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase">Product</label>
            <select
              value={newItem.product_id}
              onChange={e => setNewItem({...newItem, product_id: e.target.value})}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
              required
            >
              <option value="">Select Product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase">Fixed ($)</label>
            <Input type="number" step="0.01" value={newItem.fixed_price} onChange={e => setNewItem({...newItem, fixed_price: e.target.value, discount_pct: ""})} placeholder="Or..." />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase">Discount (%)</label>
            <Input type="number" step="0.1" value={newItem.discount_pct} onChange={e => setNewItem({...newItem, discount_pct: e.target.value, fixed_price: ""})} placeholder="Or..." />
          </div>
          <Button disabled={addingItem || !newItem.product_id}>Add Item</Button>
        </form>
      </Card>

      <Card className="p-6 border-border bg-surface">
        <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Test Price Resolution</h2>
        <p className="text-sm text-text-secondary mb-4">Simulate the API endpoint <code>/pricing/resolve</code> to see what price a customer would get.</p>
        <form onSubmit={handleResolve} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase">Customer (Opt)</label>
            <select
              value={resolveForm.customer_id}
              onChange={e => setResolveForm({...resolveForm, customer_id: e.target.value})}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
            >
              <option value="">None</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-text-secondary uppercase">Product</label>
            <select
              value={resolveForm.product_id}
              onChange={e => setResolveForm({...resolveForm, product_id: e.target.value})}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
              required
            >
              <option value="">Select Product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <Button disabled={resolving || !resolveForm.product_id}>Simulate</Button>
        </form>

        {resolvedPrice && (
          <div className="bg-surface-hover p-4 rounded-lg border border-border">
            <div className="text-sm text-text-secondary mb-2 uppercase font-bold tracking-wider">Result</div>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs text-text-muted">Unit Price</div>
                <div className="text-xl font-bold">${resolvedPrice.unit_price} {resolvedPrice.currency}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Source</div>
                <Badge variant="secondary">{resolvedPrice.source}</Badge>
              </div>
              {resolvedPrice.margin_pct != null && (
                <div>
                  <div className="text-xs text-text-muted">Est. Margin</div>
                  <div className={`text-lg font-bold ${resolvedPrice.margin_pct > 30 ? 'text-emerald-400' : 'text-amber-400'}`}>{resolvedPrice.margin_pct}%</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
