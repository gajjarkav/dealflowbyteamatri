"use client"
import React, { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import { Percent, Save, Plus, Edit2, Trash2, ShieldCheck, Tag } from "lucide-react"
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
const TIER_STYLES: Record<TierEnum, { bg: string, text: string, border: string, bgSoft: string }> = {
  bronze: { bg: "bg-orange-500", text: "text-orange-600", border: "border-orange-500", bgSoft: "bg-orange-500/10" },
  silver: { bg: "bg-slate-400", text: "text-slate-600", border: "border-slate-400", bgSoft: "bg-slate-400/10" },
  gold: { bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-500", bgSoft: "bg-amber-500/10" },
  platinum: { bg: "bg-purple-500", text: "text-purple-600", border: "border-purple-500", bgSoft: "bg-purple-500/10" },
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
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
      toast({ title: "Tiers Saved", description: "Global discount limits updated." })
      load()
    } catch {
      toast({ title: "Error", description: "Save failed", type: "error" })
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
    } catch {
      toast({ title: "Error", description: "Save failed", type: "error" })
    } finally {
      setSavingCeiling(false)
    }
  }

  const deleteCeiling = async (id: string) => {
    if (!confirm("Delete this category ceiling override?")) return
    try {
      await apiDeleteCeiling(id)
      toast({ title: "Ceiling Deleted" })
      load()
    } catch { toast({ title: "Delete failed", type: "error" }) }
  }

  const catName = (id: string) => categories.find((c) => c.id === id)?.name || id.slice(0, 8)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-[1000px] mx-auto pb-12">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="border-b border-border/50 pb-6">
        <h1 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight">
          Discount Ceilings
        </h1>
        <p className="text-sm text-text-secondary mt-1 font-medium">
          Configure maximum allowable discount percentages per account tier and category overrides.
        </p>
      </motion.div>

      {/* Tier Max Discount Editor */}
      <motion.div variants={itemVariants}>
        <Card className="premium-card overflow-hidden">
          <div className="p-6 border-b border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-soft/20 flex items-center justify-center border border-accent/20">
                <ShieldCheck className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-text-primary">Global Tier Limits</h2>
                <p className="text-xs font-medium text-text-secondary">Base discount ceiling rules applied universally to each tier.</p>
              </div>
            </div>
            <Button onClick={saveTiers} disabled={savingTiers || loading} className="font-bold shadow-md">
              <Save className="w-4 h-4 mr-2" />
              {savingTiers ? "Saving..." : "Save Tier Rules"}
            </Button>
          </div>

          <div className="p-6 md:p-8">
            {loading ? (
              <div className="text-center py-12 text-text-muted font-medium bg-surface/30 rounded-xl border-2 border-dashed border-border/60">Loading tiers...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {TIER_ORDER.map((tier) => (
                  <div key={tier} className={`relative p-5 rounded-xl border bg-surface overflow-hidden ${TIER_STYLES[tier].border}`}>
                    <div className={`absolute top-0 left-0 w-1 h-full ${TIER_STYLES[tier].bg}`} />
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 ${TIER_STYLES[tier].bgSoft} ${TIER_STYLES[tier].text}`}>
                        {tier} Tier
                      </Badge>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">Max Discount</label>
                      <div className="relative">
                        <Input
                          type="number"
                          min={0} max={100} step={0.5}
                          value={editedTiers[tier] ?? 0}
                          onChange={(e) => setEditedTiers({ ...editedTiers, [tier]: parseFloat(e.target.value) || 0 })}
                          className="pr-8 h-12 text-lg font-mono font-bold shadow-sm"
                        />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Category Ceilings */}
      <motion.div variants={itemVariants}>
        <Card className="premium-card overflow-hidden">
          <div className="p-6 border-b border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Tag className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-text-primary">Category Overrides</h2>
                <p className="text-xs font-medium text-text-secondary">Specific category discount limits that override global rules.</p>
              </div>
            </div>
            <Button variant="secondary" onClick={openCreateCeiling} className="font-bold border border-border shadow-sm bg-background">
              <Plus className="w-4 h-4 mr-2" /> Add Override
            </Button>
          </div>

          <div className="p-0">
            {ceilings.length === 0 ? (
              <div className="text-center py-16 bg-surface/30">
                <p className="text-sm font-medium text-text-muted">No category ceilings configured.</p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-surface-hover/80 border-b border-border">
                    <tr className="text-[10px] font-heading font-bold text-text-secondary uppercase tracking-wider">
                      <th className="px-6 py-4">Account Tier</th>
                      <th className="px-6 py-4">Product Category</th>
                      <th className="px-6 py-4 text-right">Max Discount Limit</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {ceilings.map((c) => (
                      <tr key={c.id} className="interactive-row bg-surface">
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 ${TIER_STYLES[c.tier].bgSoft} ${TIER_STYLES[c.tier].text} ${TIER_STYLES[c.tier].border} border`}>
                            {c.tier}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-medium text-text-primary">{catName(c.category_id)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono font-extrabold text-accent bg-accent-soft/20 px-2.5 py-1 rounded-md border border-accent/20">
                            {c.max_discount_pct}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" className="h-8 w-8 p-0 text-text-muted hover:text-accent hover:bg-accent-soft/30 rounded-full transition-colors" onClick={() => openEditCeiling(c)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-text-muted hover:text-danger hover:bg-danger-soft/50 rounded-full transition-colors" onClick={() => deleteCeiling(c.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Ceiling Drawer */}
      <FormDrawer
        isOpen={ceilingDrawerOpen}
        onClose={() => setCeilingDrawerOpen(false)}
        title={editingCeiling ? "Edit Category Override" : "Add Category Override"}
        subtitle="Override the global tier limit for a specific product category."
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setCeilingDrawerOpen(false)}>Cancel</Button>
            <Button onClick={saveCeiling} disabled={savingCeiling} className="font-bold shadow-sm">
              {savingCeiling ? "Saving..." : "Save Override"}
            </Button>
          </>
        }
      >
        <form onSubmit={saveCeiling} className="space-y-5 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Account Tier <span className="text-accent">*</span></label>
              <select
                value={ceilingForm.tier}
                onChange={(e) => setCeilingForm({ ...ceilingForm, tier: e.target.value as TierEnum })}
                disabled={!!editingCeiling}
                className="w-full h-11 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-primary focus:outline-none focus:border-accent disabled:opacity-50 shadow-sm"
              >
                {TIER_ORDER.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Category <span className="text-accent">*</span></label>
              <select
                value={ceilingForm.category_id}
                onChange={(e) => setCeilingForm({ ...ceilingForm, category_id: e.target.value })}
                disabled={!!editingCeiling}
                required
                className="w-full h-11 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-primary focus:outline-none focus:border-accent disabled:opacity-50 shadow-sm"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Max Discount % Limit <span className="text-accent">*</span></label>
            <div className="relative">
              <Input
                type="number" min={0} max={100} step={0.5}
                value={ceilingForm.max_discount_pct}
                onChange={(e) => setCeilingForm({ ...ceilingForm, max_discount_pct: parseFloat(e.target.value) || 0 })}
                className="h-11 bg-surface shadow-sm font-mono text-lg pr-10"
              />
              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
            <p className="text-[10px] font-medium text-text-muted mt-1">
              Any discount exceeding this percentage on items in this category will trigger an approval workflow.
            </p>
          </div>
        </form>
      </FormDrawer>
    </motion.div>
  )
}
