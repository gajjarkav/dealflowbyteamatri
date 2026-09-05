"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { DataTable, Column } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import type { ProductItem, CategoryCeilingItem } from "@/lib/data/mockStore"

export default function ProductsPage() {
  const store = useDataStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "Hardware" as ProductItem["category"],
    costPrice: 5000,
    sellPrice: 9000,
    minMarginPercent: 35,
    promoted: false,
    variantsCount: 1,
    stockTotal: 10
  })

  const calculatedMargin = formData.sellPrice > 0
    ? (((formData.sellPrice - formData.costPrice) / formData.sellPrice) * 100).toFixed(1)
    : "0.0"

  const openCreateDrawer = () => {
    setEditingProduct(null)
    setFormData({
      sku: "",
      name: "",
      category: "Hardware",
      costPrice: 5000,
      sellPrice: 9000,
      minMarginPercent: 35,
      promoted: false,
      variantsCount: 1,
      stockTotal: 10
    })
    setDrawerOpen(true)
  }

  const openEditDrawer = (prod: ProductItem) => {
    setEditingProduct(prod)
    setFormData({
      sku: prod.sku,
      name: prod.name,
      category: prod.category,
      costPrice: prod.costPrice,
      sellPrice: prod.sellPrice,
      minMarginPercent: prod.minMarginPercent,
      promoted: prod.promoted,
      variantsCount: prod.variantsCount,
      stockTotal: prod.stockTotal
    })
    setDrawerOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.sku) {
      toast({ title: "Validation Error", description: "SKU and product name are required.", type: "error" })
      return
    }

    if (editingProduct) {
      store.updateProduct(editingProduct.id, formData)
      toast({ title: "Product Updated", description: `${formData.name} catalog record saved.` })
    } else {
      store.addProduct(formData)
      toast({ title: "Product Listed", description: `${formData.name} added to catalog.` })
    }
    setDrawerOpen(false)
  }

  const handleTogglePromoted = (prod: ProductItem) => {
    store.togglePromoted(prod.id)
    toast({
      title: prod.promoted ? "Promotion Removed" : "Product Promoted",
      description: `${prod.name} highlighted status updated.`
    })
  }

  const productColumns: Column<ProductItem>[] = [
    {
      key: "sku",
      header: "SKU Code",
      render: (p) => <span className="font-mono text-xs font-semibold text-text-primary">{p.sku}</span>
    },
    {
      key: "name",
      header: "Product Title",
      render: (p) => (
        <div>
          <div className="font-medium text-text-primary flex items-center gap-2">
            {p.name}
            {p.promoted && (
              <span className="text-[10px] bg-accent/10 text-accent font-mono px-1.5 py-0.5 rounded">
                PROMOTED
              </span>
            )}
          </div>
          <div className="text-xs text-text-secondary">{p.variantsCount} variant(s) configured</div>
        </div>
      )
    },
    {
      key: "category",
      header: "Category",
      render: (p) => (
        <Badge variant="secondary" className="text-xs font-mono">
          {p.category}
        </Badge>
      )
    },
    {
      key: "pricing",
      header: "Cost / List Price",
      render: (p) => (
        <div className="font-mono text-xs">
          <div className="text-text-primary font-medium">${p.sellPrice.toLocaleString()}</div>
          <div className="text-text-muted text-[11px]">Cost: ${p.costPrice.toLocaleString()}</div>
        </div>
      )
    },
    {
      key: "margin",
      header: "Base Margin",
      render: (p) => {
        const marginVal = (((p.sellPrice - p.costPrice) / p.sellPrice) * 100).toFixed(1)
        const isHealthy = Number(marginVal) >= p.minMarginPercent
        return (
          <div className="font-mono text-xs">
            <span className={`font-semibold ${isHealthy ? "text-emerald-600" : "text-amber-600"}`}>
              {marginVal}%
            </span>
            <span className="text-text-muted text-[10px] block">Floor: {p.minMarginPercent}%</span>
          </div>
        )
      }
    },
    {
      key: "stockTotal",
      header: "Inventory",
      render: (p) => (
        <span className="font-mono text-xs">
          {p.category === "Software" ? "Unlimited (Cloud)" : `${p.stockTotal} in stock`}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => handleTogglePromoted(p)}
          >
            {p.promoted ? "Unstar" : "Promote"}
          </Button>
          <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => openEditDrawer(p)}>
            Edit
          </Button>
        </div>
      )
    }
  ]

  const categoryColumns: Column<CategoryCeilingItem>[] = [
    {
      key: "category",
      header: "Product Category",
      render: (c) => <span className="font-semibold text-text-primary">{c.category}</span>
    },
    {
      key: "bronze",
      header: "Bronze Max Disc",
      render: (c) => <span className="font-mono text-xs">{c.bronzeMaxDisc}%</span>
    },
    {
      key: "silver",
      header: "Silver Max Disc",
      render: (c) => <span className="font-mono text-xs">{c.silverMaxDisc}%</span>
    },
    {
      key: "gold",
      header: "Gold Max Disc",
      render: (c) => <span className="font-mono text-xs font-semibold text-accent">{c.goldMaxDisc}%</span>
    },
    {
      key: "platinum",
      header: "Platinum Max Disc",
      render: (c) => <span className="font-mono text-xs font-semibold text-purple-600">{c.platinumMaxDisc}%</span>
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Catalog & Category Margins</h1>
          <p className="text-sm text-text-secondary mt-1">
            Product master catalog, pricing floors, stock units, and category discount ceilings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-surface border border-border rounded p-0.5">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === "products" ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Products List ({store.products.length})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === "categories" ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Category Ceilings ({store.categoryCeilings.length})
            </button>
          </div>

          {activeTab === "products" && (
            <Button onClick={openCreateDrawer}>
              + Add Product
            </Button>
          )}
        </div>
      </div>

      {activeTab === "products" ? (
        <DataTable
          data={store.products}
          columns={productColumns}
          searchPlaceholder="Filter catalog by SKU, name, or category..."
          searchKey={(p) => `${p.sku} ${p.name} ${p.category}`}
          title="Master Product Catalog"
          subtitle="Real-time margin floors calculated against base cost"
        />
      ) : (
        <DataTable
          data={store.categoryCeilings}
          columns={categoryColumns}
          title="Category Discount Ceilings Matrix"
          subtitle="Maximum autonomous discount allowances by customer tier"
        />
      )}

      {/* Product Drawer */}
      <FormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingProduct ? "Edit Catalog Item" : "Create Product SKU"}
        subtitle="Specify cost structures, margin floor, and category tagging"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingProduct ? "Save Product" : "Publish to Catalog"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">SKU Identifier</label>
            <Input
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              placeholder="e.g. HW-GPU-A100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Product Title</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. NVIDIA A100 Tensor Core Node"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductItem["category"] })}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="Hardware">Hardware (Servers, Blades, Racks)</option>
              <option value="Software">Software (Licenses, SaaS, Modules)</option>
              <option value="Services">Services (Architecture, Migration)</option>
              <option value="Add-ons">Add-ons (Support, Care Packs)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Cost Price ($)</label>
              <Input
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Sell Price ($)</label>
              <Input
                type="number"
                value={formData.sellPrice}
                onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                min={0}
              />
            </div>
          </div>

          <div className="p-3 bg-background border border-border rounded text-xs flex items-center justify-between">
            <span className="text-text-secondary">Resulting Gross Margin:</span>
            <span className="font-mono font-bold text-accent">{calculatedMargin}%</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Min Floor Margin (%)</label>
              <Input
                type="number"
                value={formData.minMarginPercent}
                onChange={(e) => setFormData({ ...formData, minMarginPercent: Number(e.target.value) })}
                min={0}
                max={100}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Initial Stock Units</label>
              <Input
                type="number"
                value={formData.stockTotal}
                onChange={(e) => setFormData({ ...formData, stockTotal: Number(e.target.value) })}
                min={0}
              />
            </div>
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
