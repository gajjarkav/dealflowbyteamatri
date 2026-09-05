"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import type { SubscriptionPlanItem } from "@/lib/data/mockStore"
import { mockStore } from "@/lib/data/mockStore"

export default function SubscriptionPlansPage() {
  const store = useDataStore()
  const { toast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    billingInterval: "Annual" as "Monthly" | "Annual",
    price: 24000,
    includedSeats: 25,
    maxDeals: 1000,
    featuresText: "Smart Discount Routing\nReal-time Customer Negotiation\nCustom Approval Chains"
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.code) {
      toast({ title: "Validation Error", description: "Plan name and code are required.", type: "error" })
      return
    }

    const newPlan: SubscriptionPlanItem = {
      id: `plan-${Date.now()}`,
      name: formData.name,
      code: formData.code,
      billingInterval: formData.billingInterval,
      price: formData.price,
      includedSeats: formData.includedSeats,
      maxDeals: formData.maxDeals,
      features: formData.featuresText.split("\n").filter((f) => f.trim().length > 0)
    }

    mockStore.plans = [...store.plans, newPlan]
    mockStore.notify()
    toast({ title: "Plan Published", description: `${formData.name} subscription plan created.` })
    setDrawerOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Subscription Packages & Plans</h1>
          <p className="text-sm text-text-secondary mt-1">
            Configure recurring SaaS billing schedules, feature tiers, and quotation seat allotments.
          </p>
        </div>

        <Button onClick={() => setDrawerOpen(true)}>
          + Create Subscription Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {store.plans.map((plan) => (
          <Card
            key={plan.id}
            className="p-6 border-border bg-surface flex flex-col justify-between hover:border-accent/60 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {plan.code}
                </Badge>
              </div>

              <div className="flex items-baseline gap-1.5 my-4">
                <span className="font-mono text-3xl font-extrabold text-accent">
                  ${plan.price.toLocaleString()}
                </span>
                <span className="text-xs text-text-secondary font-mono">
                  / {plan.billingInterval.toLowerCase()}
                </span>
              </div>

              <div className="space-y-2 py-3 border-y border-border text-xs font-mono text-text-secondary">
                <div className="flex justify-between">
                  <span>Included User Seats:</span>
                  <span className="font-semibold text-text-primary">{plan.includedSeats} seats</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Deals / Year:</span>
                  <span className="font-semibold text-text-primary">{plan.maxDeals.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs font-semibold text-text-secondary mb-2 uppercase font-mono tracking-wider">
                  Entitlements
                </div>
                <ul className="space-y-1.5 text-xs text-text-primary">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-accent">&#10003;</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <Button variant="secondary" className="w-full text-xs">
                Edit Package
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Plan Drawer */}
      <FormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="New Subscription Tier"
        subtitle="Specify recurring pricing and feature entitlements"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Plan
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Plan Display Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Enterprise Global Tier"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Plan Code</label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. PLAN-GLOBAL-ENT"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Billing Interval</label>
              <select
                value={formData.billingInterval}
                onChange={(e) => setFormData({ ...formData, billingInterval: e.target.value as "Monthly" | "Annual" })}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="Monthly">Monthly</option>
                <option value="Annual">Annual (Prepaid)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Price ($)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Seats Allotment</label>
              <Input
                type="number"
                value={formData.includedSeats}
                onChange={(e) => setFormData({ ...formData, includedSeats: Number(e.target.value) })}
                min={1}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Max Deals</label>
              <Input
                type="number"
                value={formData.maxDeals}
                onChange={(e) => setFormData({ ...formData, maxDeals: Number(e.target.value) })}
                min={10}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Included Features (one per line)
            </label>
            <textarea
              rows={4}
              value={formData.featuresText}
              onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
              className="w-full rounded-md border border-border bg-background p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent font-sans"
            />
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
