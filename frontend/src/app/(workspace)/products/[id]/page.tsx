"use client";
import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { apiGetProduct, apiUpdateProduct, apiAddVariant, apiListCategories, ProductResponse, CategoryResponse } from "@/lib/api/catalog"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [product, setProduct] = useState<ProductResponse | null>(null)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [formData, setFormData] = useState<Partial<ProductResponse>>({})
  const [activeTab, setActiveTab] = useState<"info" | "pricing" | "variants">("info")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (typeof id !== "string") return
    Promise.all([apiGetProduct(id), apiListCategories({ size: 100 })])
      .then(([prodData, catData]) => {
        setProduct(prodData)
        setFormData(prodData)
        setCategories(catData.items)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8"><Skeleton className="h-48 w-full" /></div>
  if (error || !product) {
    return <div className="p-8">Product not found. <Link href="/products" className="text-accent">Go back</Link></div>
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof id !== "string") return
    try {
      const updated = await apiUpdateProduct(id, {
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        category_id: formData.category_id,
        list_price: formData.list_price,
        cost_price: formData.cost_price,
        is_recurring: formData.is_recurring,
      })
      setProduct(updated)
      setFormData(updated)
      toast({ title: "Product Updated", description: "Changes saved successfully.", type: "success" })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update"
      toast({ title: "Error", description: msg, type: "error" })
    }
  }

  const handleAddVariant = async () => {
    if (typeof id !== "string") return
    try {
      const newVar = await apiAddVariant(id, {
        name: `New Variant ${product.variants.length + 1}`,
        extra_price: 0
      })
      const updatedProduct = { ...product, variants: [...product.variants, newVar] }
      setProduct(updatedProduct)
      setFormData(updatedProduct)
      toast({ title: "Variant Added", type: "success" })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add variant"
      toast({ title: "Error", description: msg, type: "error" })
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/products")} className="px-2">&larr; Back</Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-3">
              {formData.name}
            </h1>
            <p className="text-sm text-text-secondary mt-1 font-mono">{formData.sku || "NO-SKU"}</p>
          </div>
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <div className="flex border-b border-border">
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'info' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          onClick={() => setActiveTab('info')}
        >Basic Info</button>
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'pricing' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          onClick={() => setActiveTab('pricing')}
        >Pricing & Margins</button>
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'variants' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          onClick={() => setActiveTab('variants')}
        >Variants ({(formData.variants || []).length})</button>
      </div>

      <Card className="p-6 border-border bg-surface">
        {activeTab === 'info' && (
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Product Name</label>
              <Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">SKU</label>
              <Input value={formData.sku || ""} onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
              <select
                value={formData.category_id || ""}
                onChange={e => setFormData({...formData, category_id: e.target.value})}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input 
                type="checkbox" 
                id="is_recurring" 
                checked={formData.is_recurring || false}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
              />
              <label htmlFor="is_recurring" className="text-sm">Is Recurring (Subscription)</label>
            </div>
          </form>
        )}

        {activeTab === 'pricing' && (
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Cost Price ($)</label>
                <Input type="number" value={formData.cost_price || 0} onChange={e => setFormData({...formData, cost_price: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Sell Price ($)</label>
                <Input type="number" value={formData.list_price || 0} onChange={e => setFormData({...formData, list_price: Number(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Calculated Margin (%)</label>
              <div className="h-9 rounded-md border border-border bg-surface px-3 py-1 text-sm flex items-center">
                {formData.margin_pct != null ? `${formData.margin_pct}%` : 'N/A'}
              </div>
            </div>
          </form>
        )}

        {activeTab === 'variants' && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary mb-4">Manage product variants (e.g., sizes, colors, capacities).</p>
            <div className="border border-border rounded-lg divide-y divide-border">
              {(formData.variants || []).map((v, i) => (
                <div key={v.id || i} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-text-secondary font-mono">{v.sku || `${formData.sku || 'SKU'}-V${i+1}`}</div>
                  </div>
                  <Badge variant="secondary">+${v.extra_price}</Badge>
                </div>
              ))}
              {(formData.variants || []).length === 0 && (
                <div className="p-4 text-center text-sm text-text-secondary">No variants configured.</div>
              )}
            </div>
            <Button variant="secondary" className="w-full mt-4" onClick={handleAddVariant}>
              + Add Variant
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
