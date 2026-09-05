"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
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

const DEFAULT_FORM = {
  name: "",
  trigger: "rep_confirm" as ApprovalTrigger,
  min_amount: "",
  max_discount_pct: "",
  min_margin_pct: "",
  is_active: true,
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
      await apiDeleteApprovalRule(id)
      toast({ title: "Rule Deleted" })
      load()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed"
      toast({ title: "Error", description: msg, type: "error" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Approval Chain Rules</h1>
          <p className="text-sm text-text-secondary mt-1">
            Configure when and how deals must flow through approval chains based on amount, discount, or margin.
          </p>
        </div>
        <Button onClick={openCreate}>+ Add Rule</Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface border-b border-border text-xs font-mono text-text-secondary">
            <tr>
              <th className="px-4 py-3">Rule Name</th>
              <th className="px-4 py-3">Trigger</th>
              <th className="px-4 py-3">Min Amount</th>
              <th className="px-4 py-3">Max Discount</th>
              <th className="px-4 py-3">Min Margin</th>
              <th className="px-4 py-3">Steps</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-text-muted">Loading…</td></tr>
            ) : rules.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-text-muted">No approval rules configured.</td></tr>
            ) : rules.map((r) => (
              <tr key={r.id} className="hover:bg-surface/60">
                <td className="px-4 py-3 font-semibold text-text-primary">{r.name}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="font-mono text-xs">{TRIGGER_LABELS[r.trigger]}</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{r.min_amount != null ? `$${r.min_amount.toLocaleString()}` : "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.max_discount_pct != null ? `${r.max_discount_pct}%` : "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.min_margin_pct != null ? `${r.min_margin_pct}%` : "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.steps.length} step{r.steps.length !== 1 ? "s" : ""}</td>
                <td className="px-4 py-3">
                  <Badge variant={r.is_active ? "default" : "secondary"} className="text-xs">{r.is_active ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
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
        title={editingId ? "Edit Approval Rule" : "Add Approval Rule"}
        subtitle="Define when a quotation must pass through an approval workflow"
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
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="High-Value Deal Rule" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Trigger Type</label>
            <select
              value={formData.trigger}
              onChange={(e) => setFormData({ ...formData, trigger: e.target.value as ApprovalTrigger })}
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Min Amount ($)</label>
              <Input type="number" min={0} value={formData.min_amount} onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })} placeholder="e.g. 10000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Max Discount (%)</label>
              <Input type="number" min={0} max={100} step={0.5} value={formData.max_discount_pct} onChange={(e) => setFormData({ ...formData, max_discount_pct: e.target.value })} placeholder="e.g. 20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Min Margin (%)</label>
              <Input type="number" min={0} max={100} step={0.5} value={formData.min_margin_pct} onChange={(e) => setFormData({ ...formData, min_margin_pct: e.target.value })} placeholder="e.g. 35" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox" id="rule_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-border"
            />
            <label htmlFor="rule_active" className="text-sm text-text-primary cursor-pointer">Rule is active</label>
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
