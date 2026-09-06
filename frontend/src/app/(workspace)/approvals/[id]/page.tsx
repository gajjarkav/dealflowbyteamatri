"use client";
import React, { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { useParams, useRouter } from "next/navigation"
import { 
  apiGetApproval, 
  apiApproveStep, 
  apiRejectStep, 
  apiReturnStep,
  type ApprovalRequestResponse 
} from "@/lib/api/approvals"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export default function ApprovalDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [req, setReq] = useState<ApprovalRequestResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [comment, setComment] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(() => {
    if (typeof id !== "string") return
    apiGetApproval(id)
      .then(res => setReq(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <div className="p-8"><Skeleton className="h-64 w-full" /></div>
  if (error || !req) return <div className="p-8">Approval request not found. <Link href="/approvals" className="text-accent">Go back</Link></div>

  const handleAction = async (action: "approve" | "reject" | "return") => {
    if (!req) return
    const pendingStep = req.steps.find(s => s.status === "pending")
    if (!pendingStep) {
      toast({ title: "No pending step found", type: "error" })
      return
    }
    setActionLoading(true)
    try {
      if (action === "approve") {
        await apiApproveStep(pendingStep.id, comment)
      } else if (action === "reject") {
        await apiRejectStep(pendingStep.id, comment)
      } else {
        await apiReturnStep(pendingStep.id, comment)
      }
      toast({ 
        title: `Quotation ${action}d`, 
        description: `The quotation has been ${action}d.`,
        type: action === "approve" ? "success" : "warning"
      })
      setTimeout(() => router.push("/approvals"), 1000)
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Error processing action", type: "error" })
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/approvals")} className="px-2">&larr; Back to Inbox</Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Approval Request: Quote {req.quotation.number || req.quotation.id.slice(0, 8)}
            </h1>
          </div>
        </div>
        <Badge variant={
          req.status === "approved" ? "default" :
          req.status === "rejected" ? "secondary" :
          "outline"
        }>
          {req.status.toUpperCase()}
        </Badge>
      </div>

      <Card className="p-6 border-amber-500/30 bg-amber-500/5 mb-6">
        <h3 className="text-sm font-semibold text-amber-400 mb-2">Reason for Escalation</h3>
        <p className="text-sm text-text-primary font-mono whitespace-pre-wrap">
          {req.trigger}
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-border bg-surface">
          <h2 className="text-base font-semibold mb-4 border-b border-border pb-2">Deal Context</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Customer</dt>
              <dd className="font-medium">{req.quotation.customer_name || "Unknown Customer"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Total Value</dt>
              <dd className="font-mono font-bold">${req.quotation.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Quotation Status</dt>
              <dd><Badge variant="outline" className="text-[10px]">{req.quotation.status}</Badge></dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6 border-border bg-surface">
          <h2 className="text-base font-semibold mb-4 border-b border-border pb-2">Line Items Summary</h2>
          <div className="space-y-3 max-h-[150px] overflow-y-auto">
            {req.quotation.lines?.length > 0 ? req.quotation.lines.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-text-secondary">{item.qty}x {item.product_name || "Item"}</span>
                <span className="font-mono font-bold">${item.line_total.toLocaleString()}</span>
              </div>
            )) : <div className="text-xs text-text-muted">No line items.</div>}
          </div>
        </Card>
      </div>

      <Card className="p-6 border-border bg-surface mt-6">
        <h2 className="text-base font-semibold mb-4 border-b border-border pb-2">Approval Timeline</h2>
        <div className="space-y-4">
          {req.steps.map((step) => (
            <div key={step.id} className="flex items-start gap-4">
              <div className="mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-background border border-border">
                {step.seq}
              </div>
              <div>
                <div className="text-sm font-semibold capitalize">
                  {step.required_role} 
                  <span className="ml-2 text-xs font-normal text-text-muted">
                    ({step.status})
                  </span>
                </div>
                {step.comment && <div className="text-xs italic text-text-secondary mt-1">&quot;{step.comment}&quot;</div>}
                {step.actor_name && <div className="text-xs text-text-muted mt-1">By {step.actor_name} on {new Date(step.acted_at || "").toLocaleDateString()}</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {req.status === "pending" && (
        <div className="mt-8 pt-6 border-t border-border">
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-secondary mb-1">Comment (Optional)</label>
            <Input 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              placeholder="Leave a comment for this action..." 
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="secondary" 
              className="flex-1 border-danger text-danger hover:bg-danger/10"
              onClick={() => handleAction("reject")}
              disabled={actionLoading}
            >
              Reject Entirely
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1 border-amber-500 text-amber-400 hover:bg-amber-500/10"
              onClick={() => handleAction("return")}
              disabled={actionLoading}
            >
              Return for Revision
            </Button>
            <Button 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => handleAction("approve")}
              disabled={actionLoading}
            >
              Approve Quote
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
