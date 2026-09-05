"use client"
import React, { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { Card } from "@/components/ui/card"
import { Search, Plus, Edit2, Users, Building2, CreditCard, ShieldCheck } from "lucide-react"
import Link from "next/link"
import {
  apiListCustomers,
  apiCreateCustomer,
  apiUpdateCustomer,
  type CustomerResponse,
  type Tier,
} from "@/lib/api/customers"

const TIER_STYLES: Record<Tier, string> = {
  platinum: "border-purple-500/50 text-purple-600 bg-purple-500/10",
  gold: "border-amber-500/50 text-amber-600 bg-amber-500/10",
  silver: "border-slate-400/50 text-slate-600 bg-slate-400/10",
  bronze: "border-orange-400/50 text-orange-600 bg-orange-400/10",
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
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
    } catch {
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
    if (!formData.company_name) return
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
        toast({ title: "Customer Updated" })
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
        toast({ title: "Customer Created" })
      }
      setDrawerOpen(false)
      load()
    } catch {
      toast({ title: "Error", description: "Save failed", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-[1200px] mx-auto pb-12">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight">
            Accounts & Tiers
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-medium">
            Manage customer tier privileges, credit lines, and billing details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={openCreate} className="font-heading font-bold shadow-md h-10">
            <Plus className="w-4 h-4 mr-2" /> Register Customer
          </Button>
        </div>
      </motion.div>

      {/* KPI Row (Optional summary) */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Accounts", value: total, icon: <Building2 className="w-5 h-5 text-accent" /> },
          { label: "Platinum Partners", value: customers.filter(c => c.tier === 'platinum').length, icon: <ShieldCheck className="w-5 h-5 text-purple-600" /> },
          { label: "Active Portals", value: customers.reduce((acc, c) => acc + c.users.length, 0), icon: <Users className="w-5 h-5 text-blue-600" /> },
          { label: "Currencies", value: "Multi", icon: <CreditCard className="w-5 h-5 text-emerald-600" /> },
        ].map((stat, i) => (
          <Card key={i} className="premium-card p-4 flex items-center gap-4 bg-surface/50">
            <div className="p-3 rounded-xl bg-background border border-border shadow-sm">
              {stat.icon}
            </div>
            <div>
              <div className="text-xs font-bold text-text-secondary uppercase tracking-widest">{stat.label}</div>
              <div className="text-xl font-heading font-extrabold text-text-primary">
                {loading ? <Skeleton className="h-6 w-12" /> : stat.value}
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Search & Actions */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 bg-surface p-2 rounded-xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Search accounts by name or tax ID..."
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
                  <th className="px-6 py-4">Company Details</th>
                  <th className="px-6 py-4">Pricing Tier</th>
                  <th className="px-6 py-4">Currency</th>
                  <th className="px-6 py-4 text-center">Portal Users</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="px-6 py-4"><Skeleton className="h-4 w-32 mb-1" /><Skeleton className="h-3 w-20" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-6 rounded-full mx-auto" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></td>
                      </tr>
                    ))}
                  </>
                ) : customers.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-text-muted font-medium">No customers found.</td></tr>
                ) : customers.map((c) => (
                  <tr key={c.id} className="interactive-row bg-surface">
                    <td className="px-6 py-4">
                      <Link href={`/customers/${c.id}`} className="hover:underline hover:text-accent transition-colors block">
                        <div className="font-bold text-text-primary">{c.company_name}</div>
                      </Link>
                      {c.tax_id ? (
                        <div className="text-[10px] font-mono text-text-muted mt-1 uppercase">Tax ID: {c.tax_id}</div>
                      ) : (
                        <div className="text-[10px] font-mono text-text-muted/50 mt-1 uppercase">No Tax ID</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 ${TIER_STYLES[c.tier]}`}>
                        {c.tier}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-text-secondary">{c.currency}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-surface-hover border border-border text-xs font-bold text-text-primary">
                        {c.users.length}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={c.is_active ? "default" : "secondary"} className={`text-[10px] uppercase tracking-wider ${c.is_active ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : ""}`}>
                        {c.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" className="h-8 w-8 p-0 text-text-muted hover:text-accent hover:bg-accent-soft/30 rounded-full transition-colors" onClick={() => openEdit(c)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
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
        title={editingId ? "Edit Customer Record" : "Enroll Enterprise Customer"}
        subtitle="Manage tier privileges and billing line"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="font-bold shadow-sm">
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Account"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Company Name <span className="text-accent">*</span></label>
            <Input
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="e.g. Acme Corp"
              className="h-11 bg-surface shadow-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Account Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value as Tier })}
                className="w-full h-11 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-accent shadow-sm"
              >
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Billing Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full h-11 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-accent shadow-sm"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Billing Address</label>
            <Input
              value={formData.billing_address}
              onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
              placeholder="123 Main St, City, Country"
              className="h-11 bg-surface shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tax ID / VAT Number</label>
            <Input
              value={formData.tax_id}
              onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              placeholder="US-12-3456789"
              className="h-11 bg-surface shadow-sm font-mono text-sm"
            />
          </div>

          {!editingId && (
            <div className="border-t border-border/60 pt-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-heading font-bold text-text-primary">Portal Access Setup</h3>
              </div>
              <p className="text-xs font-medium text-text-secondary mb-4">
                Optional: Provision a client portal account immediately for procurement teams.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Contact Name</label>
                  <Input
                    value={formData.portal_full_name}
                    onChange={(e) => setFormData({ ...formData, portal_full_name: e.target.value })}
                    placeholder="Jane Procurement"
                    className="h-11 bg-surface shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Portal Email</label>
                  <Input
                    type="email"
                    value={formData.portal_email}
                    onChange={(e) => setFormData({ ...formData, portal_email: e.target.value })}
                    placeholder="jane@customer.com"
                    className="h-11 bg-surface shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </FormDrawer>
    </motion.div>
  )
}
