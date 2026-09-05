"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"

export default function SettingsPage() {
  const store = useDataStore()
  const { toast } = useToast()

  const [form, setForm] = useState({ ...store.settings })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    store.updateSettings(form)
    toast({
      title: "System Parameters Saved",
      description: "Autonomous governance thresholds and margin floors updated."
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">System Parameters & Governance</h1>
        <p className="text-sm text-text-secondary mt-1">
          Global thresholds for stalled deal alerts, margin degradation warnings, and Odoo ERP webhooks.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Deal Health & Risk Settings */}
        <Card className="p-6 border-border bg-surface space-y-4">
          <h2 className="text-base font-semibold text-text-primary border-b border-border pb-3">
            Deal Health & Pipeline Governance
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Stalled Quotation Inactivity Limit (Days)
              </label>
              <Input
                type="number"
                value={form.stalledQuotationDays}
                onChange={(e) => setForm({ ...form, stalledQuotationDays: Number(e.target.value) })}
                min={1}
                max={30}
              />
              <span className="text-[11px] text-text-muted mt-1 block">
                Deals inactive longer than this are flagged as high risk.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Approval Queue Timeout (Hours)
              </label>
              <Input
                type="number"
                value={form.approvalTimeoutHours}
                onChange={(e) => setForm({ ...form, approvalTimeoutHours: Number(e.target.value) })}
                min={6}
                max={168}
              />
              <span className="text-[11px] text-text-muted mt-1 block">
                Pending approvals will escalate if unresolved within window.
              </span>
            </div>
          </div>
        </Card>

        {/* Financial & Margin Floors */}
        <Card className="p-6 border-border bg-surface space-y-4">
          <h2 className="text-base font-semibold text-text-primary border-b border-border pb-3">
            Margin Floors & Currency Policy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Target Benchmark Gross Margin (%)
              </label>
              <Input
                type="number"
                value={form.targetGrossMarginPercent}
                onChange={(e) => setForm({ ...form, targetGrossMarginPercent: Number(e.target.value) })}
                min={10}
                max={90}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Strict Margin Floor (%)
              </label>
              <Input
                type="number"
                value={form.minimumGrossMarginPercent}
                onChange={(e) => setForm({ ...form, minimumGrossMarginPercent: Number(e.target.value) })}
                min={5}
                max={50}
              />
              <span className="text-[11px] text-text-muted mt-1 block">
                Quotations below this floor require executive CFO override.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Base System Currency
            </label>
            <select
              value={form.currencyDefault}
              onChange={(e) => setForm({ ...form, currencyDefault: e.target.value })}
              className="w-full sm:w-64 h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="USD">USD ($) - United States Dollar</option>
              <option value="EUR">EUR (€) - Eurozone</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" className="px-6">
            Save System Settings
          </Button>
        </div>
      </form>
    </div>
  )
}
