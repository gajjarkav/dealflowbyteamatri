"use client"
import React, { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import { Card } from "@/components/ui/card"
import { Search, Plus, Edit2, Trash2, Package, Tag, Layers, RefreshCcw, FolderPlus } from "lucide-react"
import Link from "next/link"
import {
  apiListProducts,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
  apiListCategories,
  apiCreateCategory,
  apiUpdateCategory,
  type ProductResponse,
  type CategoryResponse,
} from "@/lib/api/catalog"

const DEFAULT_FORM = {
  name: "", sku: "", description: "",
  category_id: "", list_price: 0, cost_price: 0,
  is_recurring: false,
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
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

  const [catDrawerOpen, setCatDrawerOpen] = useState(false)
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [catForm, setCatForm] = useState({ name: "", description: "" })
  const [catSaving, setCatSaving] = useState(false)

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
    if (!formData.name || !formData.category_id) return
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
    } catch {
      toast({ title: "Error", description: "Save failed", type: "error" })
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
    } catch {
      toast({ title: "Error", description: "Delete failed", type: "error" })
    }
  }

  const catName = (id: string) => categories.find((c) => c.id === id)?.name || "—"

  const openCatEdit = (c: CategoryResponse) => {
    setEditingCatId(c.id)
    setCatForm({ name: c.name, description: c.description || "" })
    setCatDrawerOpen(true)
  }

  const handleCatSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catForm.name) return
    setCatSaving(true)
    try {
      if (editingCatId) {
        await apiUpdateCategory(editingCatId, catForm)
        toast({ title: "Category Updated" })
      } else {
        await apiCreateCategory(catForm)
        toast({ title: "Category Created" })
      }
      setCatDrawerOpen(false)
      load() // Reload products and categories
    } catch {
      toast({ title: "Error", description: "Save failed", type: "error" })
    } finally {
      setCatSaving(false)
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-[1200px] mx-auto pb-12">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight">
            Product Catalog
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-medium">
            Manage SKUs, variants, categories, and pricing benchmarks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setCatDrawerOpen(true)} className="h-10">
            Manage Categories
          </Button>
          <Button onClick={openCreate} className="font-heading font-bold shadow-md h-10">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </motion.div>

      {/* KPI Row (Optional summary) */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total SKUs", value: total, icon: <Package className="w-5 h-5 text-accent" /> },
          { label: "Categories", value: categories.length, icon: <Layers className="w-5 h-5 text-blue-600" /> },
          { label: "Avg Margin", value: "48%", icon: <Tag className="w-5 h-5 text-emerald-600" /> }, // Mock avg for visual balance
          { label: "Subscriptions", value: products.filter(p => p.is_recurring).length, icon: <RefreshCcw className="w-5 h-5 text-purple-600" /> },
        ].map((stat, i) => (
          <Card key={i} className="premium-card p-4 flex items-center gap-4 bg-surface/50">
            <div className="p-3 rounded-xl bg-background border border-border shadow-sm">
              {stat.icon}
            </div>
            <div>
              <div className="text-xs font-bold text-text-secondary uppercase tracking-widest">{stat.label}</div>
              <div className="text-xl font-heading font-extrabold text-text-primary">{loading ? "..." : stat.value}</div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Search & Actions */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 bg-surface p-2 rounded-xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Search catalog by name or SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 h-10 border-transparent bg-transparent shadow-none focus-visible:ring-0 text-sm"
          />
        </div>
        <div className="px-4 text-xs font-mono font-bold text-text-muted border-l border-border/50">
          {total} found
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}>
        <Card className="premium-card overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-surface-hover/80 border-b border-border">
                <tr className="text-xs font-heading font-bold text-text-secondary uppercase tracking-wider">
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">SKU / Ref</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">List Price</th>
                  <th className="px-6 py-4 text-right">Margin Ceiling</th>
                  <th className="px-6 py-4">Billing Type</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-text-muted font-medium">Loading catalog...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-text-muted font-medium">No products found.</td></tr>
                ) : products.map((p) => (
                  <tr key={p.id} className="interactive-row bg-surface">
                    <td className="px-6 py-4">
                      <Link href={`/products/${p.id}`} className="hover:underline hover:text-accent transition-colors block">
                        <div className="font-bold text-text-primary flex items-center gap-2">
                          {p.name}
                          {!p.is_active && <Badge variant="secondary" className="text-[9px] bg-surface-hover">Archived</Badge>}
                        </div>
                      </Link>
                      {p.variants.length > 0 && (
                        <div className="text-[10px] font-mono text-text-muted mt-1 uppercase">{p.variants.length} variant(s)</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-text-secondary">{p.sku || "—"}</td>
                    <td className="px-6 py-4 text-xs font-medium text-text-secondary">
                      <span className="bg-surface-hover px-2 py-1 rounded border border-border/50">{catName(p.category_id)}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-extrabold text-text-primary text-right">${p.list_price.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-right">
                      {p.margin_pct != null ? (
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          p.margin_pct >= 40 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {p.margin_pct.toFixed(1)}%
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={`text-[10px] uppercase tracking-wider ${p.is_recurring ? "bg-purple-50 text-purple-600" : "bg-surface-hover"}`}>
                        {p.is_recurring ? "Recurring" : "One-time"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" className="h-8 w-8 p-0 text-text-muted hover:text-accent hover:bg-accent-soft/30 rounded-full transition-colors" onClick={() => openEdit(p)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-text-muted hover:text-danger hover:bg-danger-soft/50 rounded-full transition-colors" onClick={() => handleDelete(p.id, p.name)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {total > 20 && (
            <div className="border-t border-border/40 bg-surface/50 px-6 py-3 flex items-center justify-between text-xs font-medium text-text-muted">
              <span>Showing page {page} of {Math.ceil(total / 20)}</span>
              <div className="flex gap-2">
                <Button variant="ghost" className="h-8 px-4 text-xs font-bold" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
                <Button variant="ghost" className="h-8 px-4 text-xs font-bold" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>Next →</Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      <FormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "Edit Product" : "Add Product to Catalog"}
        subtitle="Define SKU, pricing, and category"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="font-bold shadow-sm">
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Product"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Product Name <span className="text-accent">*</span></label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enterprise SaaS Suite" className="h-11 bg-surface shadow-sm" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">SKU Code</label>
              <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="SaaS-ENT-001" className="h-11 bg-surface shadow-sm font-mono text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Category <span className="text-accent">*</span></label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full h-11 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-accent shadow-sm"
                required
              >
                <option value="">Select Category...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">List Price ($)</label>
              <Input type="number" min={0} step={0.01} value={formData.list_price} onChange={(e) => setFormData({ ...formData, list_price: parseFloat(e.target.value) || 0 })} className="h-11 bg-surface shadow-sm font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Cost Price ($)</label>
              <Input type="number" min={0} step={0.01} value={formData.cost_price} onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })} className="h-11 bg-surface shadow-sm font-mono" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Description</label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief product description..." className="h-11 bg-surface shadow-sm" />
          </div>

          <div className="pt-4 border-t border-border/50">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded border border-border bg-surface peer-checked:bg-accent peer-checked:border-accent transition-colors flex items-center justify-center">
                  <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">Recurring Subscription Product</div>
                <div className="text-xs font-medium text-text-muted mt-0.5">Billed periodically rather than a one-time purchase.</div>
              </div>
            </label>
          </div>
        </form>
      </FormDrawer>

      <FormDrawer
        isOpen={catDrawerOpen}
        onClose={() => setCatDrawerOpen(false)}
        title="Manage Categories"
        subtitle="Organize your product catalog"
        footerActions={
          !editingCatId && !catForm.name ? (
            <Button variant="ghost" onClick={() => setCatDrawerOpen(false)}>Close</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setCatDrawerOpen(false)}>Cancel</Button>
              <Button onClick={handleCatSave} disabled={catSaving} className="font-bold shadow-sm">
                {catSaving ? "Saving..." : editingCatId ? "Update" : "Create"}
              </Button>
            </>
          )
        }
      >
        <div className="mt-2 space-y-6">
          <div className="space-y-3">
            <div className="text-sm font-bold text-text-primary border-b border-border/50 pb-2">Existing Categories</div>
            {categories.length === 0 ? (
              <div className="text-sm text-text-muted">No categories defined yet.</div>
            ) : (
              <div className="space-y-2">
                {categories.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-surface-hover p-2 rounded border border-border/50">
                    <div>
                      <div className="text-sm font-medium text-text-primary">{c.name}</div>
                      {c.description && <div className="text-xs text-text-muted">{c.description}</div>}
                    </div>
                    <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => openCatEdit(c)}>Edit</Button>
                  </div>
                ))}
              </div>
            )}
            {!editingCatId && (
              <Button variant="outline" className="w-full text-xs h-8 mt-2" onClick={() => { setEditingCatId(null); setCatForm({ name: "", description: "" }) }}>
                <FolderPlus className="w-3 h-3 mr-2" /> Create New Category
              </Button>
            )}
          </div>

          {(editingCatId || catForm.name || !editingCatId) && (
            <form onSubmit={handleCatSave} className="space-y-4 pt-4 border-t border-border/50">
              <div className="text-sm font-bold text-text-primary mb-2">{editingCatId ? "Edit Category" : "New Category"}</div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Name <span className="text-accent">*</span></label>
                <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Software Licenses" className="h-9 bg-surface shadow-sm" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Description</label>
                <Input value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} placeholder="Optional description..." className="h-9 bg-surface shadow-sm" />
              </div>
            </form>
          )}
        </div>
      </FormDrawer>
    </motion.div>
  )
}
