"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import Link from "next/link"
import {
  apiListUpsellRules,
  apiCreateUpsellRule,
  apiUpdateUpsellRule,
  apiDeleteUpsellRule,
  type UpsellRuleResponse,
} from "@/lib/api/upsell"
import { apiListProducts, type ProductResponse } from "@/lib/api/catalog"

const DEFAULT_FORM = {
  name: "",
  trigger_product_id: "",
  suggest_product_id: "",
  min_qty: 1,
  is_active: true,
}

export default function UpsellRulesPage() {
  const { toast } = useToast()
  const [rules, setRules] = useState<UpsellRuleResponse[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [rRes, pRes] = await Promise.all([
        apiListUpsellRules({ page, size: 20 }),
        apiListProducts({ size: 200, is_active: true }),
      ])
      setRules(rRes.items)
      setTotal(rRes.total)
      setProducts(pRes.items)
    } catch {
      toast({ title: "Error", description: "Failed to load upsell rules", type: "error" })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const pName = (id: string) => products.find((p) => p.id === id)?.name || id.slice(0, 8) + "…"

  const openCreate = () => {
    setEditingId(null)
    setFormData(DEFAULT_FORM)
    setDrawerOpen(true)
  }

  const openEdit = (r: UpsellRuleResponse) => {
    setEditingId(r.id)
    setFormData({
      name: r.name,
      trigger_product_id: r.trigger_product_id,
      suggest_product_id: r.suggest_product_id,
      min_qty: r.min_qty ?? 1,
      is_active: r.is_active,
    })
    setDrawerOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.trigger_product_id || !formData.suggest_product_id) {
      toast({ title: "All fields required", type: "error" })
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await apiUpdateUpsellRule(editingId, { ...formData })
        toast({ title: "Rule Updated" })
      } else {
        await apiCreateUpsellRule({
          name: formData.name,
          trigger_product_id: formData.trigger_product_id,
          suggest_product_id: formData.suggest_product_id,
          min_qty: formData.min_qty,
        })
        toast({ title: "Rule Created" })
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
    if (!confirm(`Delete rule "${name}"?`)) return
    try {
      await apiDeleteUpsellRule(id)
      toast({ title: "Rule Deleted" })
      load()
    } catch {
      toast({ title: "Delete failed", type: "error" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Upsell &amp; Cross-sell Rules</h1>
          <p className="text-sm text-text-secondary mt-1">
            AI-driven product suggestion engine — configure trigger→suggest product relationships.
          </p>
        </div>
        <Button onClick={openCreate}>+ Add Rule</Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface border-b border-border text-xs font-mono text-text-secondary">
            <tr>
              <th className="px-4 py-3">Rule Name</th>
              <th className="px-4 py-3">Trigger Product</th>
              <th className="px-4 py-3">Suggest Product</th>
              <th className="px-4 py-3">Min Qty</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-text-muted">Loading…</td></tr>
            ) : rules.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-text-muted">No upsell rules configured.</td></tr>
            ) : rules.map((r) => (
              <tr key={r.id} className="hover:bg-surface/60">
                <td className="px-4 py-3 font-semibold text-text-primary">{r.name}</td>
                <td className="px-4 py-3 text-xs text-text-secondary">{pName(r.trigger_product_id)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-accent">{pName(r.suggest_product_id)}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{r.min_qty ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={r.is_active ? "default" : "secondary"} className="text-xs">
                    {r.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/upsell-rules/${r.id}`}>
                      <Button variant="ghost" className="h-7 px-2.5 text-xs">Details</Button>
                    </Link>
                    <Button variant="ghost" className="h-7 px-2.5 text-xs" onClick={() => openEdit(r)}>Edit</Button>
                    <Button variant="ghost" className="h-7 px-2.5 text-xs text-danger hover:text-danger" onClick={() => handleDelete(r.id, r.name)}>Del</Button>
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
        title={editingId ? "Edit Upsell Rule" : "Add Upsell Rule"}
        subtitle="When trigger product is added, AI suggests the paired product"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editingId ? "Save Changes" : "Create Rule"}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Rule Name *</label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. SaaS → Pro Support Bundle" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Trigger Product *</label>
            <select
              value={formData.trigger_product_id}
              onChange={(e) => setFormData({ ...formData, trigger_product_id: e.target.value })}
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:border-accent"
              required
            >
              <option value="">When this product is added…</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Suggest This Product *</label>
            <select
              value={formData.suggest_product_id}
              onChange={(e) => setFormData({ ...formData, suggest_product_id: e.target.value })}
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:border-accent"
              required
            >
              <option value="">…suggest this product</option>
              {products
                .filter((p) => p.id !== formData.trigger_product_id)
                .map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Min Trigger Quantity</label>
            <Input
              type="number" min={1}
              value={formData.min_qty}
              onChange={(e) => setFormData({ ...formData, min_qty: parseInt(e.target.value) || 1 })}
            />
          </div>
          {editingId && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="rule_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" />
              <label htmlFor="rule_active" className="text-sm text-text-primary cursor-pointer">Rule is active</label>
            </div>
          )}
        </form>
      </FormDrawer>
    </div>
  )
}
