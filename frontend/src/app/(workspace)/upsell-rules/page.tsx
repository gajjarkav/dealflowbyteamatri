"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { DataTable, Column } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import type { UpsellRuleItem } from "@/lib/data/mockStore"
import { mockStore } from "@/lib/data/mockStore"

export default function UpsellRulesPage() {
  const store = useDataStore()
  const { toast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [formData, setFormData] = useState({
    triggerProduct: "",
    recommendedProduct: "",
    incentiveDiscount: 15,
    active: true
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.triggerProduct || !formData.recommendedProduct) {
      toast({ title: "Validation Error", description: "Both trigger and recommended products are required.", type: "error" })
      return
    }

    const newRule: UpsellRuleItem = {
      id: `upsell-${Date.now()}`,
      triggerProduct: formData.triggerProduct,
      recommendedProduct: formData.recommendedProduct,
      incentiveDiscount: formData.incentiveDiscount,
      conversionRate: 0.0,
      active: formData.active
    }

    mockStore.upsellRules = [...store.upsellRules, newRule]
    mockStore.notify()
    toast({ title: "Upsell Rule Configured", description: "Cross-sell bundle trigger added to quotation engine." })
    setDrawerOpen(false)
  }

  const toggleRuleActive = (rule: UpsellRuleItem) => {
    mockStore.upsellRules = store.upsellRules.map((r) =>
      r.id === rule.id ? { ...r, active: !r.active } : r
    )
    mockStore.notify()
    toast({
      title: !rule.active ? "Upsell Rule Activated" : "Upsell Rule Paused",
      description: `${rule.triggerProduct} rule state updated.`
    })
  }

  const columns: Column<UpsellRuleItem>[] = [
    {
      key: "triggerProduct",
      header: "Triggering Product in Quote",
      render: (r) => (
        <span className="font-semibold text-text-primary text-xs">
          {r.triggerProduct}
        </span>
      )
    },
    {
      key: "recommendedProduct",
      header: "Recommended Upsell / Bundle",
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="text-accent text-xs font-mono">&rarr;</span>
          <span className="font-medium text-text-primary text-xs">{r.recommendedProduct}</span>
        </div>
      )
    },
    {
      key: "incentiveDiscount",
      header: "Bundle Incentive",
      render: (r) => (
        <Badge variant="outline" className="font-mono text-xs border-accent/40 text-accent">
          -{r.incentiveDiscount}% Off Attached Item
        </Badge>
      )
    },
    {
      key: "conversionRate",
      header: "Conversion Rate",
      render: (r) => (
        <span className="font-mono text-xs text-text-secondary">
          {r.conversionRate > 0 ? `${r.conversionRate}% attach` : "New Rule (0%)"}
        </span>
      )
    },
    {
      key: "active",
      header: "Status",
      render: (r) => (
        <Badge variant={r.active ? "default" : "secondary"} className="text-xs">
          {r.active ? "Active" : "Paused"}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => toggleRuleActive(r)}
          >
            {r.active ? "Pause" : "Activate"}
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Upsell & Cross-Sell Rules</h1>
          <p className="text-sm text-text-secondary mt-1">
            Automated recommendations shown to sales reps and portal customers to increase average deal size.
          </p>
        </div>

        <Button onClick={() => setDrawerOpen(true)}>
          + New Upsell Rule
        </Button>
      </div>

      <DataTable
        data={store.upsellRules}
        columns={columns}
        searchPlaceholder="Search rules by trigger or recommendation..."
        searchKey={(r) => `${r.triggerProduct} ${r.recommendedProduct}`}
        title="Active Cross-Sell Matrix"
        subtitle="Evaluated in real-time during quotation assembly"
      />

      {/* Drawer */}
      <FormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Upsell Recommendation"
        subtitle="Define trigger product and the incentivized bundle addition"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Upsell Rule
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Trigger Product (In Cart)</label>
            <select
              value={formData.triggerProduct}
              onChange={(e) => setFormData({ ...formData, triggerProduct: e.target.value })}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
              required
            >
              <option value="">Select Triggering Product...</option>
              {store.products.map((p) => (
                <option key={p.id} value={p.name}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Recommended Product to Attach</label>
            <select
              value={formData.recommendedProduct}
              onChange={(e) => setFormData({ ...formData, recommendedProduct: e.target.value })}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
              required
            >
              <option value="">Select Recommendation...</option>
              {store.products.map((p) => (
                <option key={p.id} value={p.name}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Incentive Discount (%) on Recommendation</label>
            <Input
              type="number"
              value={formData.incentiveDiscount}
              onChange={(e) => setFormData({ ...formData, incentiveDiscount: Number(e.target.value) })}
              min={0}
              max={50}
            />
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
