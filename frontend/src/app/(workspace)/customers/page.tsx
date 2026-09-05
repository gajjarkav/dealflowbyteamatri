"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { DataTable, Column } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import type { CustomerItem } from "@/lib/data/mockStore"

export default function CustomersPage() {
  const store = useDataStore()
  const { toast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    tier: "Gold" as CustomerItem["tier"],
    currency: "USD",
    creditLimit: 100000,
    status: "Active" as "Active" | "Under Review",
    industry: "Technology",
    accountManagerId: "usr-1"
  })

  const openCreateDrawer = () => {
    setEditingCustomer(null)
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      tier: "Gold",
      currency: "USD",
      creditLimit: 100000,
      status: "Active",
      industry: "Technology",
      accountManagerId: "usr-1"
    })
    setDrawerOpen(true)
  }

  const openEditDrawer = (customer: CustomerItem) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      contactPerson: customer.contactPerson,
      email: customer.email,
      phone: customer.phone,
      tier: customer.tier,
      currency: customer.currency,
      creditLimit: customer.creditLimit,
      status: customer.status,
      industry: customer.industry,
      accountManagerId: customer.accountManagerId
    })
    setDrawerOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast({ title: "Validation Error", description: "Company name and email are required.", type: "error" })
      return
    }

    if (editingCustomer) {
      store.updateCustomer(editingCustomer.id, formData)
      toast({ title: "Customer Updated", description: `${formData.name} account details saved.` })
    } else {
      store.addCustomer(formData)
      toast({ title: "Customer Enrolled", description: `${formData.name} added to customer directory.` })
    }
    setDrawerOpen(false)
  }

  const columns: Column<CustomerItem>[] = [
    {
      key: "name",
      header: "Enterprise Customer",
      render: (c) => (
        <div>
          <div className="font-semibold text-text-primary">{c.name}</div>
          <div className="text-xs text-text-secondary">Contact: {c.contactPerson}</div>
        </div>
      )
    },
    {
      key: "tier",
      header: "Account Tier",
      render: (c) => {
        const tierStyles = {
          Platinum: "border-purple-500/50 text-purple-600 bg-purple-500/5",
          Gold: "border-amber-500/50 text-amber-600 bg-amber-500/5",
          Silver: "border-slate-400 text-slate-600 bg-slate-400/5",
          Bronze: "border-orange-400 text-orange-600 bg-orange-400/5"
        }[c.tier]

        return (
          <Badge variant="secondary" className={`font-mono text-xs ${tierStyles}`}>
            {c.tier}
          </Badge>
        )
      }
    },
    {
      key: "creditLimit",
      header: "Credit Line",
      render: (c) => (
        <span className="font-mono text-xs font-medium">
          {c.currency} ${c.creditLimit.toLocaleString()}
        </span>
      )
    },
    {
      key: "totalSpent",
      header: "Lifetime Bookings",
      render: (c) => (
        <span className="font-mono text-xs text-text-secondary">
          ${c.totalSpent.toLocaleString()}
        </span>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <Badge variant={c.status === "Active" ? "default" : "secondary"} className="text-xs">
          {c.status}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" className="h-7 px-2.5 text-xs" onClick={() => openEditDrawer(c)}>
            Edit Tier
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Customer Ledger & Tiers</h1>
          <p className="text-sm text-text-secondary mt-1">
            Accounts, tier-based discount ceilings, credit approvals, and billing contacts.
          </p>
        </div>

        <Button onClick={openCreateDrawer}>
          + Register Customer
        </Button>
      </div>

      <DataTable
        data={store.customers}
        columns={columns}
        searchPlaceholder="Search customer by name or contact..."
        searchKey={(c) => `${c.name} ${c.contactPerson} ${c.email} ${c.tier}`}
        title="Enterprise Accounts"
        subtitle={`${store.customers.length} actively tracked customer accounts`}
      />

      {/* Customer Drawer */}
      <FormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingCustomer ? "Edit Customer Record" : "Enroll Enterprise Customer"}
        subtitle="Manage discount tier privileges and billing line"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingCustomer ? "Save Changes" : "Create Account"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Company / Organization Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. OpenAI Global Corp"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Primary Procurement Contact</label>
            <Input
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="e.g. Sarah Jenkins"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Billing Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ap@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Phone Number</label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Account Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value as CustomerItem["tier"] })}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="Bronze">Bronze (5% Max Disc)</option>
                <option value="Silver">Silver (10% Max Disc)</option>
                <option value="Gold">Gold (15% Max Disc)</option>
                <option value="Platinum">Platinum (20% Max Disc)</option>
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
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Credit Limit ($)</label>
            <Input
              type="number"
              value={formData.creditLimit}
              onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
              min={0}
              step={5000}
            />
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
