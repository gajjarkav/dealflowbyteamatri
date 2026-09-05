"use client"
import React, { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import { Network, Plus, Edit2, Trash2, ShieldAlert, GitMerge } from "lucide-react"
import {
  apiListApprovalRules,
  apiCreateApprovalRule,
  apiUpdateApprovalRule,
  apiDeleteApprovalRule,
  type ApprovalRuleResponse,
  type ApprovalTrigger,
} from "@/lib/api/discount"

const TRIGGER_LABELS: Record<ApprovalTrigger, string> = {
  rep_confirm: "Rep Confirm",
  manager_escalate: "Manager Escalate",
  finance_escalate: "Finance Escalate",
  auto: "Automatic",
}

const TRIGGER_COLORS: Record<ApprovalTrigger, string> = {
  rep_confirm: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  manager_escalate: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  finance_escalate: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  auto: "bg-slate-500/10 text-slate-600 border-slate-500/30",
}

const DEFAULT_FORM = {
  name: "",
  trigger: "rep_confirm" as ApprovalTrigger,
  min_amount: "",
  max_discount_pct: "",
  min_margin_pct: "",
  is_active: true,
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
}

export default function ApprovalRulesPage() {
  const { toast } = useToast()
  const [rules, setRules] = useState<ApprovalRuleResponse[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiListApprovalRules({ page, size: 20 })
      setRules(res.items)
      setTotal(res.total)
    } catch {
      toast({ title: "Error", description: "Failed to load approval rules", type: "error" })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const openCreate = () => {
    setEditingId(null)
    setFormData(DEFAULT_FORM)
    setDrawerOpen(true)
  }

  const openEdit = (r: ApprovalRuleResponse) => {
    setEditingId(r.id)
    setFormData({
      name: r.name,
      trigger: r.trigger,
      min_amount: r.min_amount != null ? String(r.min_amount) : "",
      max_discount_pct: r.max_discount_pct != null ? String(r.max_discount_pct) : "",
      min_margin_pct: r.min_margin_pct != null ? String(r.min_margin_pct) : "",
      is_active: r.is_active,
    })
    setDrawerOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast({ title: "Name is required", type: "error" })
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        trigger: formData.trigger,
        min_amount: formData.min_amount ? parseFloat(formData.min_amount) : undefined,
        max_discount_pct: formData.max_discount_pct ? parseFloat(formData.max_discount_pct) : undefined,
        min_margin_pct: formData.min_margin_pct ? parseFloat(formData.min_margin_pct) : undefined,
        is_active: formData.is_active,
      }
      if (editingId) {
        await apiUpdateApprovalRule(editingId, payload)
        toast({ title: "Rule Updated" })
      } else {
        await apiCreateApprovalRule(payload)
        toast({ title: "Rule Created" })
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
    if (!confirm(`Delete rule "${name}"?`)) return
    try {
      await apiDeleteApprovalRule(id)
      toast({ title: "Rule Deleted" })
      load()
    } catch {
      toast({ title: "Error", description: "Delete failed", type: "error" })
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-[1200px] mx-auto pb-12">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight">
            Governance & Routing Rules
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-medium">
            Define triggers that automatically escalate high-risk deals for managerial or financial review.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={openCreate} className="font-heading font-bold shadow-md h-10">
            <Plus className="w-4 h-4 mr-2" /> Add Rule
          </Button>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="premium-card p-5 bg-surface/50 border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-soft/20 border border-accent/20 flex items-center justify-center">
            <Network className="w-6 h-6 text-accent" />
          </div>
          <div>
            <div className="text-xs font-heading font-bold text-text-secondary uppercase tracking-widest">Active Rules</div>
            <div className="text-2xl font-mono font-extrabold text-text-primary mt-1">{loading ? "..." : rules.filter(r => r.is_active).length}</div>
          </div>
        </Card>
        <Card className="premium-card p-5 bg-surface/50 border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <div className="text-xs font-heading font-bold text-text-secondary uppercase tracking-widest">Risk Factors</div>
            <div className="text-sm font-medium text-text-primary mt-1 leading-tight">Discount, Margin, Amount</div>
          </div>
        </Card>
        <Card className="premium-card p-5 bg-surface/50 border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <GitMerge className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-xs font-heading font-bold text-text-secondary uppercase tracking-widest">Execution</div>
            <div className="text-sm font-medium text-text-primary mt-1 leading-tight">Evaluated continuously upon quote save.</div>
          </div>
        </Card>
      </motion.div>

      {/* Rules Table */}
      <motion.div variants={itemVariants}>
        <Card className="premium-card overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-surface-hover/80 border-b border-border">
                <tr className="text-[10px] font-heading font-bold text-text-secondary uppercase tracking-wider">
                  <th className="px-6 py-4">Routing Rule Name</th>
                  <th className="px-6 py-4">Trigger Action</th>
                  <th className="px-6 py-4 text-right">Min Deal Value</th>
                  <th className="px-6 py-4 text-right">Max Discount Ceiling</th>
                  <th className="px-6 py-4 text-right">Min Margin Floor</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-text-muted font-medium">Loading rules...</td></tr>
                ) : rules.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-text-muted font-medium">No approval rules configured.</td></tr>
                ) : rules.map((r) => (
                  <tr key={r.id} className="interactive-row bg-surface">
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-primary">{r.name}</div>
                      <div className="text-[10px] font-mono text-text-muted mt-1 uppercase tracking-widest">{r.steps.length} step(s) bound</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border ${TRIGGER_COLORS[r.trigger]}`}>
                        {TRIGGER_LABELS[r.trigger]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.min_amount != null ? (
                        <span className="font-mono font-extrabold text-text-primary">${r.min_amount.toLocaleString()}</span>
                      ) : (
                        <span className="text-text-muted/50 font-medium">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.max_discount_pct != null ? (
                        <span className="font-mono font-extrabold text-accent bg-accent-soft/20 px-2 py-0.5 rounded border border-accent/20">{r.max_discount_pct}%</span>
                      ) : (
                        <span className="text-text-muted/50 font-medium">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.min_margin_pct != null ? (
                        <span className="font-mono font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{r.min_margin_pct}%</span>
                      ) : (
                        <span className="text-text-muted/50 font-medium">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={r.is_active ? "default" : "secondary"} className={`text-[10px] uppercase tracking-wider ${r.is_active ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : ""}`}>
                        {r.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" className="h-8 w-8 p-0 text-text-muted hover:text-accent hover:bg-accent-soft/30 rounded-full transition-colors" onClick={() => openEdit(r)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-text-muted hover:text-danger hover:bg-danger-soft/50 rounded-full transition-colors" onClick={() => handleDelete(r.id, r.name)}>
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
        title={editingId ? "Edit Governance Rule" : "Create Governance Rule"}
        subtitle="Define when a quotation requires escalating approvals."
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="font-bold shadow-sm">
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Rule"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Rule Name <span className="text-accent">*</span></label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              placeholder="e.g. Finance Escalation for High Discount" 
              className="h-11 bg-surface shadow-sm"
              required 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Routing Action (Trigger)</label>
            <select
              value={formData.trigger}
              onChange={(e) => setFormData({ ...formData, trigger: e.target.value as ApprovalTrigger })}
              className="w-full h-11 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-primary focus:outline-none focus:border-accent shadow-sm"
            >
              {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          
          <div className="bg-surface-hover/50 p-4 rounded-xl border border-border/60">
            <h3 className="text-xs font-heading font-bold text-text-primary uppercase tracking-widest mb-4">Rule Conditions (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Min Amount ($)</label>
                <Input 
                  type="number" min={0} 
                  value={formData.min_amount} 
                  onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })} 
                  placeholder="e.g. 50000"
                  className="h-11 bg-surface shadow-sm font-mono text-sm" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Max Discount (%)</label>
                <Input 
                  type="number" min={0} max={100} step={0.5} 
                  value={formData.max_discount_pct} 
                  onChange={(e) => setFormData({ ...formData, max_discount_pct: e.target.value })} 
                  placeholder="e.g. 25"
                  className="h-11 bg-surface shadow-sm font-mono text-sm" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Min Margin (%)</label>
                <Input 
                  type="number" min={0} max={100} step={0.5} 
                  value={formData.min_margin_pct} 
                  onChange={(e) => setFormData({ ...formData, min_margin_pct: e.target.value })} 
                  placeholder="e.g. 40"
                  className="h-11 bg-surface shadow-sm font-mono text-sm" 
                />
              </div>
            </div>
            <p className="text-[10px] font-medium text-text-muted mt-3">
              Leave conditions blank to ignore them. If multiple conditions are set, the rule triggers if ANY condition is met.
            </p>
          </div>

          <div className="pt-4 border-t border-border/50">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded border border-border bg-surface peer-checked:bg-accent peer-checked:border-accent transition-colors flex items-center justify-center">
                  <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">Rule is Active</div>
                <div className="text-xs font-medium text-text-muted mt-0.5">Inactive rules will not trigger escalations.</div>
              </div>
            </label>
          </div>
        </form>
      </FormDrawer>
    </motion.div>
  )
}
