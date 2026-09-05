"use client"
import React from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { useParams, useRouter } from "next/navigation"

export default function ApprovalDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const store = useDataStore()
  const { toast } = useToast()
  
  // Try to find the quotation associated with this ID (assuming ID is quotation ID for demo)
  const quotation = store.quotations.find(q => q.id === id) || store.quotations[0]
  const customer = store.customers.find(c => c.id === quotation.customerId)

  if (!quotation || !customer) {
    return <div className="p-8">Approval request not found.</div>
  }

  const handleAction = (action: string) => {
    toast({ 
      title: `Quotation ${action}`, 
      description: `The quotation has been ${action.toLowerCase()}. Notifications sent.`,
      type: action === "Approved" ? "success" : "warning"
    })
    setTimeout(() => router.push("/approvals"), 1000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/approvals")} className="px-2">&larr; Back to Inbox</Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Approval Request: Quote {quotation.id.split("-")[0].toUpperCase()}
            </h1>
          </div>
        </div>
      </div>

      <Card className="p-6 border-amber-500/30 bg-amber-500/5 mb-6">
        <h3 className="text-sm font-semibold text-amber-600 mb-2">Reason for Escalation</h3>
        <p className="text-sm text-text-primary">
          Requested discount (18%) exceeds the autonomous ceiling for Bronze tier customers (10%). Requires Sales Manager override.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-border bg-surface">
          <h2 className="text-base font-semibold mb-4 border-b border-border pb-2">Deal Context</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Customer</dt>
              <dd className="font-medium">{customer.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Tier</dt>
              <dd><Badge variant="outline" className="text-[10px]">{customer.tier}</Badge></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Total Value</dt>
              <dd className="font-mono font-bold">${quotation.totalValue.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Blended Margin</dt>
              <dd className="font-mono text-amber-600 font-medium">32.4%</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6 border-border bg-surface">
          <h2 className="text-base font-semibold mb-4 border-b border-border pb-2">Line Items Summary</h2>
          <div className="space-y-3">
            {quotation.items.map((item, i) => {
              const product = store.products.find(p => p.id === item.productId)
              return (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{item.quantity}x {product?.name || "Item"}</span>
                  <span className="font-mono">Disc: <span className="font-bold text-accent">{item.discountPercent}%</span></span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-border">
        <Button 
          variant="secondary" 
          className="flex-1 border-danger text-danger hover:bg-danger/10"
          onClick={() => handleAction("Rejected")}
        >
          Reject Entirely
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1 border-amber-500 text-amber-600 hover:bg-amber-500/10"
          onClick={() => handleAction("Returned for Revision")}
        >
          Return for Revision
        </Button>
        <Button 
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => handleAction("Approved")}
        >
          Approve Quote
        </Button>
      </div>
    </div>
  )
}
