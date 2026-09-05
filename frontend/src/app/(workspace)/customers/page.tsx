"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import {
  apiListCustomers,
  apiCreateCustomer,
  apiUpdateCustomer,
  type CustomerResponse,
  type Tier,
} from "@/lib/api/customers"

const TIER_STYLES: Record<Tier, string> = {
  platinum: "border-purple-500/50 text-purple-600 bg-purple-500/5",
  gold: "border-amber-500/50 text-amber-600 bg-amber-500/5",
  silver: "border-slate-400 text-slate-600 bg-slate-400/5",
  bronze: "border-orange-400 text-orange-600 bg-orange-400/5",
}

const DEFAULT_FORM = {
  company_name: "",
  tier: "bronze" as Tier,
  currency: "USD",
  billing_address: "",
  tax_id: "",
  portal_email: "",
  portal_full_name: "",
}

export default function CustomersPage() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<CustomerResponse[]>([])
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
      const res = await apiListCustomers({ search: search || undefined, page, size: 20 })
      setCustomers(res.items)
      setTotal(res.total)
    } catch (_err: unknown) {
      toast({ title: "Error", description: "Failed to load customers", type: "error" })
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

  const openEdit = (c: CustomerResponse) => {
    setEditingId(c.id)
    setFormData({
      company_name: c.company_name,
      tier: c.tier,
      currency: c.currency,
      billing_address: c.billing_address || "",
      tax_id: c.tax_id || "",
      portal_email: "",
      portal_full_name: "",
    })
    setDrawerOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.company_name) {
      toast({ title: "Validation Error", description: "Company name is required.", type: "error" })
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await apiUpdateCustomer(editingId, {
          company_name: formData.company_name,
          tier: formData.tier,
          currency: formData.currency,
          billing_address: formData.billing_address || undefined,
          tax_id: formData.tax_id || undefined,
        })
        toast({ title: "Customer Updated", description: `${formData.company_name} saved.` })
      } else {
        await apiCreateCustomer({
          company_name: formData.company_name,
          tier: formData.tier,
          currency: formData.currency,
          billing_address: formData.billing_address || undefined,
          tax_id: formData.tax_id || undefined,
          portal_email: formData.portal_email || undefined,
          portal_full_name: formData.portal_full_name || undefined,
        })
        toast({ title: "Customer Created", description: `${formData.company_name} added.` })
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Customer Ledger &amp; Tiers</h1>
          <p className="text-sm text-text-secondary mt-1">
            Accounts, tier-based discount ceilings, credit approvals, and billing contacts.
          </p>
        </div>
        <Button onClick={openCreate}>+ Register Customer</Button>
      </div>

      {/* Search + Count bar */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by company name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
        <span className="text-xs text-text-muted">{total} accounts</span>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface border-b border-border">
            <tr className="text-xs font-mono text-text-secondary">
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Currency</th>
              <th className="px-4 py-3">Portal Users</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-text-muted text-sm">
                  Loading customers…
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-text-muted text-sm">
                  No customers found. Add your first account!
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-text-primary">{c.company_name}</div>
                    {c.tax_id && (
                      <div className="text-xs text-text-muted font-mono">TAX: {c.tax_id}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={`font-mono text-xs ${TIER_STYLES[c.tier]}`}>
                      {c.tier.charAt(0).toUpperCase() + c.tier.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.currency}</td>
                  <td className="px-4 py-3 text-xs text-text-secondary">
                    {c.users.length} user{c.users.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.is_active ? "default" : "secondary"} className="text-xs">
                      {c.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" className="h-7 px-2.5 text-xs" onClick={() => openEdit(c)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Page {page} of {Math.ceil(total / 20)}</span>
          <div className="flex gap-2">
            <Button variant="ghost" className="h-7 px-3 text-xs" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              ← Prev
            </Button>
            <Button variant="ghost" className="h-7 px-3 text-xs" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Drawer */}
      <FormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "Edit Customer Record" : "Enroll Enterprise Customer"}
        subtitle="Manage tier privileges and billing line"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save Changes" : "Create Account"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Company / Organization Name *</label>
            <Input
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="e.g. OpenAI Global Corp"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Account Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value as Tier })}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Billing Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Billing Address</label>
            <Input
              value={formData.billing_address}
              onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
              placeholder="123 Main St, City, Country"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Tax ID / VAT Number</label>
            <Input
              value={formData.tax_id}
              onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              placeholder="US-12-3456789"
            />
          </div>

          {!editingId && (
            <div className="border-t border-border pt-4">
              <p className="text-xs font-medium text-text-secondary mb-3">
                Optional: Invite a portal user immediately
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Portal Contact Name</label>
                  <Input
                    value={formData.portal_full_name}
                    onChange={(e) => setFormData({ ...formData, portal_full_name: e.target.value })}
                    placeholder="Jane Procurement"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Portal Email</label>
                  <Input
                    type="email"
                    value={formData.portal_email}
                    onChange={(e) => setFormData({ ...formData, portal_email: e.target.value })}
                    placeholder="jane@customer.com"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </FormDrawer>
    </div>
  )
}
