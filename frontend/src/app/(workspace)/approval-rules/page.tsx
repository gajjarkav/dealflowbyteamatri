"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { DataTable, Column } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import type { ApprovalRuleItem } from "@/lib/data/mockStore"
import { mockStore } from "@/lib/data/mockStore"

export default function ApprovalRulesPage() {
  const store = useDataStore()
  const { toast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    discountRange: "15% - 25%",
    minMargin: 30,
    approverRole: "Sales Manager",
    riskLevel: "Medium" as ApprovalRuleItem["riskLevel"],
    actionRequired: "Review margin contribution and discount justification."
  })

  const openCreateDrawer = () => {
    setFormData({
      title: "",
      discountRange: "15% - 25%",
      minMargin: 30,
      approverRole: "Sales Manager",
      riskLevel: "Medium",
      actionRequired: "Review margin contribution and discount justification."
    })
    setDrawerOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      toast({ title: "Validation Error", description: "Rule title is required.", type: "error" })
      return
    }

    const newRule: ApprovalRuleItem = {
      id: `rule-${Date.now()}`,
      ...formData
    }

    mockStore.approvalRules = [...store.approvalRules, newRule]
    mockStore.notify()
    toast({ title: "Approval Rule Added", description: `${formData.title} published to governance engine.` })
    setDrawerOpen(false)
  }

  const columns: Column<ApprovalRuleItem>[] = [
    {
      key: "title",
      header: "Rule Definition",
      render: (r) => (
        <div>
          <div className="font-semibold text-text-primary">{r.title}</div>
          <div className="text-xs text-text-secondary">{r.actionRequired}</div>
        </div>
      )
    },
    {
      key: "discountRange",
      header: "Discount Range",
      render: (r) => <span className="font-mono text-xs font-medium">{r.discountRange}</span>
    },
    {
      key: "minMargin",
      header: "Min Margin Floor",
      render: (r) => <span className="font-mono text-xs font-semibold text-accent">{r.minMargin}%</span>
    },
    {
      key: "approverRole",
      header: "Required Approver",
      render: (r) => (
        <span className="font-medium text-xs text-text-primary">
          {r.approverRole}
        </span>
      )
    },
    {
      key: "riskLevel",
      header: "Risk Tier",
      render: (r) => {
        const riskColors = {
          Low: "border-emerald-500/50 text-emerald-600 bg-emerald-500/5",
          Medium: "border-blue-500/50 text-blue-600 bg-blue-500/5",
          High: "border-accent text-accent bg-accent/5",
          Critical: "border-danger text-danger bg-danger/5"
        }[r.riskLevel]

        return (
          <Badge variant="outline" className={`font-mono text-xs ${riskColors}`}>
            {r.riskLevel.toUpperCase()}
          </Badge>
        )
      }
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Approval Workflows & Risk Rules</h1>
          <p className="text-sm text-text-secondary mt-1">
            Rules engine mapping quotation variance, margin degradation, and deal sizes to approval chains.
          </p>
        </div>

        <Button onClick={openCreateDrawer}>
          + New Approval Rule
        </Button>
      </div>

      <DataTable
        data={store.approvalRules}
        columns={columns}
        searchPlaceholder="Filter rules by title or approver..."
        searchKey={(r) => `${r.title} ${r.approverRole} ${r.riskLevel}`}
        title="Governance Rule Catalog"
        subtitle="Evaluated sequentially on quotation submit"
      />

      {/* Drawer */}
      <FormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Create Approval Rule"
        subtitle="Define triggers, margin limits, and escalation roles"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Rule
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Rule Name</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. High Value Strategic Loss Leader Rule"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Discount Range</label>
              <Input
                value={formData.discountRange}
                onChange={(e) => setFormData({ ...formData, discountRange: e.target.value })}
                placeholder="e.g. 20% - 35%"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Min Margin Floor (%)</label>
              <Input
                type="number"
                value={formData.minMargin}
                onChange={(e) => setFormData({ ...formData, minMargin: Number(e.target.value) })}
                min={0}
                max={100}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Required Approver Role</label>
            <Input
              value={formData.approverRole}
              onChange={(e) => setFormData({ ...formData, approverRole: e.target.value })}
              placeholder="e.g. Sales Manager + VP Finance"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Risk Classification</label>
            <select
              value={formData.riskLevel}
              onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as ApprovalRuleItem["riskLevel"] })}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
              <option value="Critical">Critical Risk</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Mandatory Action Note</label>
            <Input
              value={formData.actionRequired}
              onChange={(e) => setFormData({ ...formData, actionRequired: e.target.value })}
              placeholder="e.g. Sign-off and log in CRM"
            />
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
