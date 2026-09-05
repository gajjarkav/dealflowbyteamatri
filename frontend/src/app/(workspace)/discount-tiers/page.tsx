"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import {
  apiListDiscountTiers,
  apiUpsertDiscountTiers,
  apiListCeilings,
  apiCreateCeiling,
  apiUpdateCeiling,
  apiDeleteCeiling,
  type DiscountTierResponse,
  type CategoryCeilingResponse,
  type TierEnum,
} from "@/lib/api/discount"
import { apiListCategories, type CategoryResponse } from "@/lib/api/catalog"

const TIER_ORDER: TierEnum[] = ["bronze", "silver", "gold", "platinum"]
const TIER_COLORS: Record<TierEnum, string> = {
  bronze: "text-orange-600 border-orange-400",
  silver: "text-slate-500 border-slate-400",
  gold: "text-amber-600 border-amber-500",
  platinum: "text-purple-600 border-purple-500",
}

export default function DiscountTiersPage() {
  const { toast } = useToast()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tiers, setTiers] = useState<DiscountTierResponse[]>([])
  const [editedTiers, setEditedTiers] = useState<Record<TierEnum, number>>({} as Record<TierEnum, number>)
  const [ceilings, setCeilings] = useState<CategoryCeilingResponse[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [savingTiers, setSavingTiers] = useState(false)
  const [ceilingDrawerOpen, setCeilingDrawerOpen] = useState(false)
  const [editingCeiling, setEditingCeiling] = useState<CategoryCeilingResponse | null>(null)
  const [ceilingForm, setCeilingForm] = useState({ tier: "bronze" as TierEnum, category_id: "", max_discount_pct: 0 })
  const [savingCeiling, setSavingCeiling] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [tRes, cRes, catRes] = await Promise.all([
        apiListDiscountTiers(),
        apiListCeilings({ size: 100 }),
        apiListCategories({ size: 100 }),
      ])
      setTiers(tRes)
      const map: Record<TierEnum, number> = {} as Record<TierEnum, number>
      tRes.forEach((t) => { map[t.tier] = t.max_discount_pct })
      setEditedTiers(map)
      setCeilings(cRes.items)
      setCategories(catRes.items)
    } catch {
      toast({ title: "Error", description: "Failed to load discount config", type: "error" })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const saveTiers = async () => {
    setSavingTiers(true)
    try {
      const data = TIER_ORDER.map((tier) => ({
        tier,
        max_discount_pct: editedTiers[tier] ?? 0,
      }))
      await apiUpsertDiscountTiers(data)
      toast({ title: "Discount Tiers Saved" })
      load()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed"
      toast({ title: "Error", description: msg, type: "error" })
    } finally {
      setSavingTiers(false)
    }
  }

  const openCreateCeiling = () => {
    setEditingCeiling(null)
    setCeilingForm({ tier: "bronze", category_id: "", max_discount_pct: 0 })
    setCeilingDrawerOpen(true)
  }

  const openEditCeiling = (c: CategoryCeilingResponse) => {
    setEditingCeiling(c)
    setCeilingForm({ tier: c.tier, category_id: c.category_id, max_discount_pct: c.max_discount_pct })
    setCeilingDrawerOpen(true)
  }

  const saveCeiling = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ceilingForm.category_id) {
      toast({ title: "Select a category", type: "error" })
      return
    }
    setSavingCeiling(true)
    try {
      if (editingCeiling) {
        await apiUpdateCeiling(editingCeiling.id, { max_discount_pct: ceilingForm.max_discount_pct })
        toast({ title: "Ceiling Updated" })
      } else {
        await apiCreateCeiling({
          tier: ceilingForm.tier,
          category_id: ceilingForm.category_id,
          max_discount_pct: ceilingForm.max_discount_pct,
        })
        toast({ title: "Ceiling Created" })
      }
      setCeilingDrawerOpen(false)
      load()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed"
      toast({ title: "Error", description: msg, type: "error" })
    } finally {
      setSavingCeiling(false)
    }
  }

  const deleteCeiling = async (id: string) => {
    if (!confirm("Delete this ceiling?")) return
    try {
      await apiDeleteCeiling(id)
      toast({ title: "Ceiling Deleted" })
      load()
    } catch { toast({ title: "Delete failed", type: "error" }) }
  }

  const catName = (id: string) => categories.find((c) => c.id === id)?.name || id.slice(0, 8)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Discount Tiers &amp; Category Ceilings</h1>
        <p className="text-sm text-text-secondary mt-1">
          Configure maximum discount percentages per account tier and per product category.
        </p>
      </div>

      {/* Tier Max Discount Editor */}
      <Card className="p-6 border-border bg-surface space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Global Tier Discount Limits</h2>
            <p className="text-xs text-text-secondary mt-0.5">The maximum discount any rep may offer to each account tier.</p>
          </div>
          <Button onClick={saveTiers} disabled={savingTiers || loading}>
            {savingTiers ? "Saving…" : "Save Tiers"}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-6 text-text-muted text-sm">Loading…</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TIER_ORDER.map((tier) => (
              <div key={tier} className={`p-4 rounded-lg border-2 ${TIER_COLORS[tier].split(" ")[1]}`}>
                <div className={`text-xs font-mono font-bold uppercase mb-3 ${TIER_COLORS[tier].split(" ")[0]}`}>
                  {tier}
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={editedTiers[tier] ?? 0}
                    onChange={(e) => setEditedTiers({ ...editedTiers, [tier]: parseFloat(e.target.value) || 0 })}
                    className="pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Category Ceilings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Category-Level Discount Ceilings</h2>
            <p className="text-xs text-text-secondary mt-0.5">Override tier limits for specific product categories.</p>
          </div>
          <Button variant="secondary" onClick={openCreateCeiling}>+ Add Ceiling</Button>
        </div>

        {ceilings.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-lg text-text-muted text-sm">
            No category ceilings configured.
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface border-b border-border text-xs font-mono text-text-secondary">
                <tr>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Max Discount</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ceilings.map((c) => (
                  <tr key={c.id} className="hover:bg-surface/60">
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={`font-mono text-xs ${TIER_COLORS[c.tier]}`}>
                        {c.tier}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-text-primary font-medium">{catName(c.category_id)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-accent">{c.max_discount_pct}%</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" className="h-7 px-2.5 text-xs" onClick={() => openEditCeiling(c)}>Edit</Button>
                        <Button variant="ghost" className="h-7 px-2.5 text-xs text-danger hover:text-danger" onClick={() => deleteCeiling(c.id)}>Del</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ceiling Drawer */}
      <FormDrawer
        isOpen={ceilingDrawerOpen}
        onClose={() => setCeilingDrawerOpen(false)}
        title={editingCeiling ? "Edit Category Ceiling" : "Add Category Ceiling"}
        subtitle="Override the global tier limit for a specific product category"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setCeilingDrawerOpen(false)}>Cancel</Button>
            <Button onClick={saveCeiling} disabled={savingCeiling}>{savingCeiling ? "Saving…" : "Save Ceiling"}</Button>
          </>
        }
      >
        <form onSubmit={saveCeiling} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Tier</label>
              <select
                value={ceilingForm.tier}
                onChange={(e) => setCeilingForm({ ...ceilingForm, tier: e.target.value as TierEnum })}
                disabled={!!editingCeiling}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:border-accent disabled:opacity-50"
              >
                {TIER_ORDER.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
              <select
                value={ceilingForm.category_id}
                onChange={(e) => setCeilingForm({ ...ceilingForm, category_id: e.target.value })}
                disabled={!!editingCeiling}
                required
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:border-accent disabled:opacity-50"
              >
                <option value="">Select…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Max Discount % for this Category</label>
            <Input
              type="number" min={0} max={100} step={0.5}
              value={ceilingForm.max_discount_pct}
              onChange={(e) => setCeilingForm({ ...ceilingForm, max_discount_pct: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
