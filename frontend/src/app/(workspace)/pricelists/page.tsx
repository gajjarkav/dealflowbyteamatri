"use client";
import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import Link from "next/link"
import {
  apiListPricelists,
  apiCreatePricelist,
  apiUpdatePricelist,
  apiDeletePricelist,
  apiListPricelistItems,
  apiAddPricelistItem,
  apiDeletePricelistItem,
  type PriceListResponse,
  type PriceListItemResponse,
} from "@/lib/api/pricing"
import { apiListProducts, type ProductResponse } from "@/lib/api/catalog"

const DEFAULT_FORM = { name: "", currency: "USD", tier: "", is_active: true }

export default function PricelistsPage() {
  const { toast } = useToast()
  const [pricelists, setPricelists] = useState<PriceListResponse[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [selectedPricelist, setSelectedPricelist] = useState<PriceListResponse | null>(null)
  const [items, setItems] = useState<PriceListItemResponse[]>([])
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [newItem, setNewItem] = useState({ product_id: "", fixed_price: "", discount_pct: "", min_qty: 1 })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiListPricelists({ page, size: 20 })
      setPricelists(res.items)
      setTotal(res.total)
    } catch {
      toast({ title: "Error", description: "Failed to load pricelists", type: "error" })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const loadItems = async (pl: PriceListResponse) => {
    setSelectedPricelist(pl)
    const res = await apiListPricelistItems(pl.id, { size: 100 }).catch(() => null)
    setItems(res?.items || [])
    const pRes = await apiListProducts({ size: 200, is_active: true }).catch(() => null)
    setProducts(pRes?.items || [])
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData(DEFAULT_FORM)
    setDrawerOpen(true)
  }

  const openEdit = (pl: PriceListResponse) => {
    setEditingId(pl.id)
    setFormData({ name: pl.name, currency: pl.currency, tier: pl.tier || "", is_active: pl.is_active })
    setDrawerOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return
    setSaving(true)
    try {
      if (editingId) {
        await apiUpdatePricelist(editingId, { name: formData.name, currency: formData.currency, tier: formData.tier || undefined, is_active: formData.is_active })
        toast({ title: "Pricelist Updated" })
      } else {
        await apiCreatePricelist({ name: formData.name, currency: formData.currency, tier: formData.tier || undefined, is_active: formData.is_active })
        toast({ title: "Pricelist Created" })
      }
      setDrawerOpen(false)
      load()
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Save failed", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pricelist?")) return
    try {
      await apiDeletePricelist(id)
      toast({ title: "Deleted" })
      if (selectedPricelist?.id === id) setSelectedPricelist(null)
      load()
    } catch { toast({ title: "Delete failed", type: "error" }) }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPricelist || !newItem.product_id) return
    setSaving(true)
    try {
      const res = await apiAddPricelistItem(selectedPricelist.id, {
        product_id: newItem.product_id,
        fixed_price: newItem.fixed_price ? parseFloat(newItem.fixed_price) : undefined,
        discount_pct: newItem.discount_pct ? parseFloat(newItem.discount_pct) : undefined,
        min_qty: newItem.min_qty,
      })
      setItems((prev) => [...prev, res])
      setAddItemOpen(false)
      toast({ title: "Item Added" })
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await apiDeletePricelistItem(itemId)
      setItems((prev) => prev.filter((i) => i.id !== itemId))
      toast({ title: "Item Removed" })
    } catch { toast({ title: "Delete failed", type: "error" }) }
  }

  const pName = (id: string) => products.find((p) => p.id === id)?.name || id.slice(0, 12) + "…"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Price Lists</h1>
          <p className="text-sm text-text-secondary mt-1">Customer-specific and tier-based price configurations.</p>
        </div>
        <Button onClick={openCreate}>+ Create Pricelist</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-text-secondary">All Pricelists ({total})</h2>
          {loading ? (
            <div className="text-center py-8 text-text-muted text-sm">Loading…</div>
          ) : pricelists.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border rounded-lg text-text-muted text-sm">No pricelists yet.</div>
          ) : pricelists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => loadItems(pl)}
              className={`p-4 border rounded-lg cursor-pointer hover:border-accent/60 transition-all ${selectedPricelist?.id === pl.id ? "border-accent ring-1 ring-accent bg-accent/5" : "border-border bg-surface"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary">{pl.name}</div>
                  <div className="text-xs text-text-muted mt-0.5 font-mono">{pl.currency}{pl.tier ? ` · ${pl.tier}` : ""}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={pl.is_active ? "default" : "secondary"} className="text-xs">{pl.is_active ? "Active" : "Inactive"}</Badge>
                  <Button variant="ghost" className="h-6 px-2 text-xs" onClick={(e) => { e.stopPropagation(); openEdit(pl) }}>Edit</Button>
                  <Button variant="ghost" className="h-6 px-2 text-xs text-danger hover:text-danger" onClick={(e) => { e.stopPropagation(); handleDelete(pl.id) }}>Del</Button>
                </div>
              </div>
            </div>
          ))}
          {total > 20 && (
            <div className="flex gap-2">
              <Button variant="ghost" className="h-7 px-3 text-xs" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
              <Button variant="ghost" className="h-7 px-3 text-xs" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>Next →</Button>
            </div>
          )}
        </div>

        {/* Items */}
        {selectedPricelist && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-text-secondary">{selectedPricelist.name} — Items</h2>
              <div className="flex gap-2">
                <Link href={`/pricelists/${selectedPricelist.id}`}>
                          <Button variant="secondary" className="h-7 px-3 text-[10px] uppercase tracking-widest font-bold">Details</Button>
                </Link>
                <Button variant="secondary" className="h-7 px-3 text-xs" onClick={() => { setNewItem({ product_id: "", fixed_price: "", discount_pct: "", min_qty: 1 }); setAddItemOpen(true) }}>+ Add Item</Button>
              </div>
            </div>
            {items.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded text-text-muted text-xs">No items. Add products to this pricelist.</div>
            ) : (
              <div className="border border-border rounded overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface border-b border-border font-mono text-text-secondary">
                    <tr>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">Fixed Price</th>
                      <th className="px-3 py-2">Disc %</th>
                      <th className="px-3 py-2">Min Qty</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-surface/60">
                        <td className="px-3 py-2 font-medium">{pName(item.product_id)}</td>
                        <td className="px-3 py-2 font-mono">{item.fixed_price != null ? `$${item.fixed_price}` : "—"}</td>
                        <td className="px-3 py-2 font-mono text-amber-400">{item.discount_pct != null ? `${item.discount_pct}%` : "—"}</td>
                        <td className="px-3 py-2 font-mono">{item.min_qty}</td>
                        <td className="px-3 py-2"><Button variant="ghost" className="h-5 px-1.5 text-[10px] text-danger hover:text-danger" onClick={() => handleDeleteItem(item.id)}>×</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pricelist Form Drawer */}
      <FormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "Edit Pricelist" : "Create Pricelist"}
        subtitle="Configure name, currency, and tier"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editingId ? "Save" : "Create"}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Pricelist Name *</label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Gold Customer Rate Card" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Currency</label>
              <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:border-accent">
                <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Tier</label>
              <select value={formData.tier} onChange={(e) => setFormData({ ...formData, tier: e.target.value })} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:border-accent">
                <option value="">None</option><option value="bronze">Bronze</option><option value="silver">Silver</option><option value="gold">Gold</option><option value="platinum">Platinum</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="pl_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" />
            <label htmlFor="pl_active" className="text-sm text-text-primary cursor-pointer">Active pricelist</label>
          </div>
        </form>
      </FormDrawer>

      {/* Add Item Drawer */}
      <FormDrawer
        isOpen={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        title="Add Pricelist Item"
        subtitle="Link a product with a fixed price or discount"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setAddItemOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem} disabled={saving}>{saving ? "Adding…" : "Add Item"}</Button>
          </>
        }
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Product *</label>
            <select value={newItem.product_id} onChange={(e) => setNewItem({ ...newItem, product_id: e.target.value })} required className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:border-accent">
              <option value="">Select product…</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Fixed Price ($)</label>
              <Input type="number" min={0} step={0.01} value={newItem.fixed_price} onChange={(e) => setNewItem({ ...newItem, fixed_price: e.target.value })} placeholder="Leave empty to use discount" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Discount %</label>
              <Input type="number" min={0} max={100} step={0.5} value={newItem.discount_pct} onChange={(e) => setNewItem({ ...newItem, discount_pct: e.target.value })} placeholder="e.g. 15" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Min Quantity</label>
            <Input type="number" min={1} value={newItem.min_qty} onChange={(e) => setNewItem({ ...newItem, min_qty: parseInt(e.target.value) || 1 })} />
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
