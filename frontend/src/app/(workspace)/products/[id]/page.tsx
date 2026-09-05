"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const store = useDataStore()
  const { toast } = useToast()
  
  const product = store.products.find(p => p.id === id)
  const [activeTab, setActiveTab] = useState<"info" | "variants" | "pricing">("info")
  const [formData, setFormData] = useState(product || null)

  if (!product || !formData) {
    return <div className="p-8">Product not found. <Link href="/products" className="text-accent">Go back</Link></div>
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    store.updateProduct(product.id, formData)
    toast({ title: "Product Updated", description: "Changes saved successfully.", type: "success" })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/products")} className="px-2">&larr; Back</Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-3">
              {formData.name}
              {formData.promoted && <Badge className="text-xs bg-accent text-white">Promoted</Badge>}
            </h1>
            <p className="text-sm text-text-secondary mt-1 font-mono">{formData.sku}</p>
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
        >Variants ({formData.variantsCount})</button>
      </div>

      <Card className="p-6 border-border bg-surface">
        {activeTab === 'info' && (
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Product Name</label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">SKU</label>
              <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as "Hardware" | "Software" | "Services" | "Add-ons"})}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Services">Services</option>
                <option value="Add-ons">Add-ons</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input 
                type="checkbox" 
                id="promoted" 
                checked={formData.promoted}
                onChange={(e) => setFormData({ ...formData, promoted: e.target.checked })}
              />
              <label htmlFor="promoted" className="text-sm">Promoted (Highlight in Catalog)</label>
            </div>
          </form>
        )}

        {activeTab === 'pricing' && (
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Cost Price ($)</label>
                <Input type="number" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Sell Price ($)</label>
                <Input type="number" value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: Number(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Minimum Margin Floor (%)</label>
              <Input type="number" value={formData.minMarginPercent} onChange={e => setFormData({...formData, minMarginPercent: Number(e.target.value)})} />
            </div>
          </form>
        )}

        {activeTab === 'variants' && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary mb-4">Manage product variants (e.g., sizes, colors, capacities).</p>
            <div className="border border-border rounded-lg divide-y divide-border">
              {Array.from({ length: formData.variantsCount }).map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">Variant {i + 1}</div>
                    <div className="text-xs text-text-secondary font-mono">{formData.sku}-V{i+1}</div>
                  </div>
                  <Button variant="ghost" className="text-xs h-8">Edit</Button>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-4" onClick={() => setFormData({...formData, variantsCount: formData.variantsCount + 1})}>
              + Add Variant
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
