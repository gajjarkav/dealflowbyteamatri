"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { DataTable, Column } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import type { PriceListItem } from "@/lib/data/mockStore"

export default function PriceListsPage() {
  const store = useDataStore()
  const { toast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<PriceListItem | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    currency: "USD",
    description: "",
    isDefault: false
  })

  const openCreateDrawer = () => {
    setFormData({
      name: "",
      code: "",
      currency: "USD",
      description: "",
      isDefault: false
    })
    setDrawerOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.code) {
      toast({ title: "Validation Error", description: "Name and Price List Code are required.", type: "error" })
      return
    }

    const newItem: PriceListItem = {
      id: `pl-${Date.now()}`,
      name: formData.name,
      code: formData.code,
      currency: formData.currency,
      description: formData.description,
      ruleCount: 12,
      isDefault: formData.isDefault
    }

    store.pricelists = [newItem, ...store.pricelists]
    store.notify()
    toast({ title: "Price List Created", description: `${formData.name} price schedule saved.` })
    setDrawerOpen(false)
  }

  const columns: Column<PriceListItem>[] = [
    {
      key: "code",
      header: "List Code",
      render: (p) => <span className="font-mono text-xs font-semibold text-text-primary">{p.code}</span>
    },
    {
      key: "name",
      header: "Price Schedule Title",
      render: (p) => (
        <div>
          <div className="font-medium text-text-primary flex items-center gap-2">
            {p.name}
            {p.isDefault && (
              <Badge variant="outline" className="text-[10px] border-accent text-accent">
                DEFAULT
              </Badge>
            )}
          </div>
          <div className="text-xs text-text-secondary">{p.description}</div>
        </div>
      )
    },
    {
      key: "currency",
      header: "Currency",
      render: (p) => (
        <Badge variant="outline" className="font-mono text-xs">
          {p.currency}
        </Badge>
      )
    },
    {
      key: "ruleCount",
      header: "Override Rules",
      render: (p) => <span className="font-mono text-xs">{p.ruleCount} item rules</span>
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            className="h-7 px-2.5 text-xs"
            onClick={() => setSelectedList(p)}
          >
            Inspect Rules
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Price Lists & Schedules</h1>
          <p className="text-sm text-text-secondary mt-1">
            Segmented pricing models, currency mappings, partner discounts, and volume tiers.
          </p>
        </div>

        <Button onClick={openCreateDrawer}>
          + New Price Schedule
        </Button>
      </div>

      <DataTable
        data={store.pricelists}
        columns={columns}
        searchPlaceholder="Search price lists by code or name..."
        searchKey={(p) => `${p.code} ${p.name} ${p.currency}`}
        title="Active Price Lists"
        subtitle="Applied automatically during quotation line pricing"
      />

      {/* Detail inspect modal */}
      {selectedList && (
        <div className="p-6 bg-surface border border-border rounded-md mt-6 animate-in fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-text-primary">
                Item Rule Overrides for <span className="text-accent">{selectedList.name}</span>
              </h3>
              <p className="text-xs text-text-secondary">
                Currency: {selectedList.currency} &bull; Code: {selectedList.code}
              </p>
            </div>
            <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => setSelectedList(null)}>
              Close Panel
            </Button>
          </div>

          <div className="border border-border rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-background/60 border-b border-border font-mono text-text-secondary">
                <tr>
                  <th className="p-2.5">Category / Product</th>
                  <th className="p-2.5">Min Quantity</th>
                  <th className="p-2.5">Discount Computation</th>
                  <th className="p-2.5">Validity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="p-2.5 font-medium">All Hardware Category</td>
                  <td className="p-2.5 font-mono">10+ units</td>
                  <td className="p-2.5 text-accent font-mono font-medium">Fixed 8.0% Base Reduction</td>
                  <td className="p-2.5 text-text-muted">Permanent</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">NVIDIA H100 SXM5 Node</td>
                  <td className="p-2.5 font-mono">4+ units</td>
                  <td className="p-2.5 text-accent font-mono font-medium">Floor Lock at $31,500</td>
                  <td className="p-2.5 text-text-muted">Q3 Fiscal 2026</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Services & Architectures</td>
                  <td className="p-2.5 font-mono">1+ units</td>
                  <td className="p-2.5 text-accent font-mono font-medium">Bundle with HW: -15%</td>
                  <td className="p-2.5 text-text-muted">Permanent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Drawer */}
      <FormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Create Price Schedule"
        subtitle="Establish currency baselines and default rule assignments"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Price List
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Schedule Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. APAC Direct Enterprise Schedule"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Price List Code</label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. PL-APAC-ENT"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Target market and tier details..."
            />
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
