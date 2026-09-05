"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import {
  apiListProducts,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
  apiListCategories,
  type ProductResponse,
  type CategoryResponse,
} from "@/lib/api/catalog"

const DEFAULT_FORM = {
  name: "", sku: "", description: "",
  category_id: "", list_price: 0, cost_price: 0,
  is_recurring: false,
}

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, cRes] = await Promise.all([
        apiListProducts({ search: search || undefined, page, size: 20 }),
        apiListCategories({ size: 100 }),
      ])
      setProducts(pRes.items)
      setTotal(pRes.total)
      setCategories(cRes.items)
    } catch {
      toast({ title: "Error", description: "Failed to load products", type: "error" })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const openCreate = () => {
    setEditingId(null)
    setFormData(DEFAULT_FORM)
    setDrawerOpen(true)
  }

  const openEdit = (p: ProductResponse) => {
    setEditingId(p.id)
    setFormData({
      name: p.name, sku: p.sku || "",
      description: p.description || "",
      category_id: p.category_id,
      list_price: p.list_price,
      cost_price: p.cost_price,
      is_recurring: p.is_recurring,
    })
    setDrawerOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.category_id) {
      toast({ title: "Validation", description: "Name and category are required.", type: "error" })
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await apiUpdateProduct(editingId, {
          name: formData.name, sku: formData.sku || undefined,
          description: formData.description || undefined,
          category_id: formData.category_id,
          list_price: formData.list_price,
          cost_price: formData.cost_price,
          is_recurring: formData.is_recurring,
        })
        toast({ title: "Product Updated" })
      } else {
        await apiCreateProduct({
          name: formData.name, sku: formData.sku || undefined,
          description: formData.description || undefined,
          category_id: formData.category_id,
          list_price: formData.list_price,
          cost_price: formData.cost_price,
          is_recurring: formData.is_recurring,
        })
        toast({ title: "Product Created" })
      }
      setDrawerOpen(false)
      load()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed"
      toast({ title: "Error", description: msg, type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await apiDeleteProduct(id)
      toast({ title: "Deleted", description: `${name} removed.` })
      load()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed"
      toast({ title: "Error", description: msg, type: "error" })
    }
  }

  const catName = (id: string) => categories.find((c) => c.id === id)?.name || "—"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Product Catalog</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage SKUs, variants, categories, and pricing benchmarks.
          </p>
        </div>
        <Button onClick={openCreate}>+ Add Product</Button>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
        <span className="text-xs text-text-muted">{total} SKUs</span>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface border-b border-border text-xs font-mono text-text-secondary">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">List Price</th>
              <th className="px-4 py-3">Margin %</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-text-muted">Loading…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-text-muted">No products found.</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="hover:bg-surface/60">
                <td className="px-4 py-3">
                  <div className="font-semibold text-text-primary">{p.name}</div>
                  {p.variants.length > 0 && (
                    <div className="text-xs text-text-muted">{p.variants.length} variant{p.variants.length > 1 ? "s" : ""}</div>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-text-muted">{p.sku || "—"}</td>
                <td className="px-4 py-3 text-xs text-text-secondary">{catName(p.category_id)}</td>
                <td className="px-4 py-3 font-mono font-semibold">${p.list_price.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono">
                  {p.margin_pct != null ? (
                    <span className={p.margin_pct >= 40 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                      {p.margin_pct.toFixed(1)}%
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className={`text-xs ${p.is_recurring ? "text-purple-600 border-purple-500/40" : ""}`}>
                    {p.is_recurring ? "Recurring" : "One-time"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.is_active ? "default" : "secondary"} className="text-xs">
                    {p.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" className="h-7 px-2.5 text-xs" onClick={() => openEdit(p)}>Edit</Button>
                    <Button variant="ghost" className="h-7 px-2.5 text-xs text-danger hover:text-danger" onClick={() => handleDelete(p.id, p.name)}>Del</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 20 && (
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Page {page} of {Math.ceil(total / 20)}</span>
          <div className="flex gap-2">
            <Button variant="ghost" className="h-7 px-3 text-xs" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
            <Button variant="ghost" className="h-7 px-3 text-xs" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>Next →</Button>
          </div>
        </div>
      )}

      <FormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "Edit Product" : "Add Product to Catalog"}
        subtitle="Define SKU, pricing, and category"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editingId ? "Save Changes" : "Create Product"}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Product Name *</label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enterprise SaaS Suite" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">SKU Code</label>
              <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="SaaS-ENT-001" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Category *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:border-accent"
                required
              >
                <option value="">Select…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">List Price ($)</label>
              <Input type="number" min={0} step={0.01} value={formData.list_price} onChange={(e) => setFormData({ ...formData, list_price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Cost Price ($)</label>
              <Input type="number" min={0} step={0.01} value={formData.cost_price} onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief product description…" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_recurring"
              checked={formData.is_recurring}
              onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
              className="rounded border-border"
            />
            <label htmlFor="is_recurring" className="text-sm text-text-primary cursor-pointer">Recurring / Subscription product</label>
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
