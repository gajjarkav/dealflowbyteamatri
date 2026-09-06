"use client";
import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import Link from "next/link"
import {
  apiListPlans,
  apiCreatePlan,
  apiUpdatePlan,
  apiDeletePlan,
  type PlanResponse,
} from "@/lib/api/subscriptions"

type BillingInterval = "monthly" | "yearly" | "one_time"

const INTERVAL_LABELS: Record<BillingInterval, string> = {
  monthly: "Monthly",
  yearly: "Annual",
  one_time: "One-Time",
}

const DEFAULT_FORM = {
  name: "", description: "", price: 0,
  currency: "USD", billing_interval: "monthly" as BillingInterval,
}

export default function PlansPage() {
  const { toast } = useToast()
  const [plans, setPlans] = useState<PlanResponse[]>([])
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
      const res = await apiListPlans({ page, size: 20 })
      setPlans(res.items)
      setTotal(res.total)
    } catch {
      toast({ title: "Error", description: "Failed to load plans", type: "error" })
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

  const openEdit = (p: PlanResponse) => {
    setEditingId(p.id)
    setFormData({
      name: p.name,
      description: p.description || "",
      price: p.price,
      currency: p.currency,
      billing_interval: p.billing_interval,
    })
    setDrawerOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast({ title: "Plan name required", type: "error" })
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await apiUpdatePlan(editingId, { ...formData })
        toast({ title: "Plan Updated" })
      } else {
        await apiCreatePlan({ ...formData })
        toast({ title: "Plan Created" })
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
    if (!confirm(`Delete plan "${name}"?`)) return
    try {
      await apiDeletePlan(id)
      toast({ title: "Plan Deleted" })
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
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Subscription Plans</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage recurring and one-time service plans for customers.
          </p>
        </div>
        <Button onClick={openCreate}>+ Create Plan</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-text-muted text-sm">Loading plans…</div>
        ) : plans.length === 0 ? (
          <div className="col-span-3 text-center py-12 border border-dashed border-border rounded-lg text-text-muted text-sm">
            No subscription plans yet.
          </div>
        ) : plans.map((p) => (
          <div key={p.id} className="border border-border rounded-lg p-5 bg-surface hover:border-accent/50 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-text-primary text-base">{p.name}</div>
                {p.description && <div className="text-xs text-text-secondary mt-1">{p.description}</div>}
              </div>
              <Badge variant={p.is_active ? "default" : "secondary"} className="text-xs shrink-0">
                {p.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="my-4 pb-4 border-b border-border">
              <span className="font-mono font-extrabold text-2xl text-accent">{p.currency} {p.price.toLocaleString()}</span>
              <span className="text-text-muted text-xs ml-2">/{INTERVAL_LABELS[p.billing_interval]}</span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Link href={`/plans/${p.id}`}>
                <Button variant="ghost" className="h-7 px-2.5 text-xs">Details</Button>
              </Link>
              <Button variant="ghost" className="h-7 px-2.5 text-xs" onClick={() => openEdit(p)}>Edit</Button>
              <Button variant="ghost" className="h-7 px-2.5 text-xs text-danger hover:text-danger" onClick={() => handleDelete(p.id, p.name)}>Delete</Button>
            </div>
          </div>
        ))}
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
        title={editingId ? "Edit Plan" : "Create Plan"}
        subtitle="Define pricing and billing terms for this plan"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editingId ? "Save Changes" : "Create Plan"}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Plan Name *</label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enterprise Growth" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Unlimited seats, priority support…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Price</label>
              <Input type="number" min={0} step={0.01} value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Billing Interval</label>
            <select
              value={formData.billing_interval}
              onChange={(e) => setFormData({ ...formData, billing_interval: e.target.value as BillingInterval })}
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Annual (Yearly)</option>
              <option value="one_time">One-Time</option>
            </select>
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
