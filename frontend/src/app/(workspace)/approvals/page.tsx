"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  apiListApprovals,
  apiApproveStep,
  apiRejectStep,
  apiReturnStep,
  type ApprovalRequestResponse,
  type ApprovalStatus,
} from "@/lib/api/approvals"

const STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: "border-amber-500/50 text-amber-600 bg-amber-500/5",
  approved: "border-emerald-500/50 text-emerald-600 bg-emerald-500/5",
  rejected: "border-red-400/50 text-red-500 bg-red-500/5",
  returned: "border-purple-500/50 text-purple-600 bg-purple-500/5",
}

export default function ApprovalsPage() {
  const { toast } = useToast()
  const [approvals, setApprovals] = useState<ApprovalRequestResponse[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "">("")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<ApprovalRequestResponse | null>(null)
  const [actionModal, setActionModal] = useState<{ type: "approve" | "reject" | "return"; stepId: string } | null>(null)
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiListApprovals({ status: statusFilter || undefined, page, size: 20 })
      setApprovals(res.items)
      setTotal(res.total)
    } catch {
      toast({ title: "Error", description: "Failed to load approvals", type: "error" })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const handleAction = async () => {
    if (!actionModal) return
    setSaving(true)
    try {
      let updated: ApprovalRequestResponse
      if (actionModal.type === "approve") {
        updated = await apiApproveStep(actionModal.stepId, comment)
      } else if (actionModal.type === "reject") {
        updated = await apiRejectStep(actionModal.stepId, comment)
      } else {
        updated = await apiReturnStep(actionModal.stepId, comment)
      }
      toast({
        title: `Step ${actionModal.type.charAt(0).toUpperCase() + actionModal.type.slice(1)}d`,
        description: `Approval request updated.`,
      })
      setActionModal(null)
      setComment("")
      setSelected(updated)
      load()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed"
      toast({ title: "Error", description: msg, type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const currentStep = selected
    ? selected.steps.find((s) => s.seq === selected.current_step_seq && s.status === "pending")
    : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Approval Requests</h1>
          <p className="text-sm text-text-secondary mt-1">
            Review and act on pending quotation approval requests.
          </p>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">{total} requests</Badge>
      </div>

      {/* Status Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {([["", "All"], ["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"], ["returned", "Returned"]] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setStatusFilter(val as ApprovalStatus | ""); setPage(1) }}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${statusFilter === val ? "bg-accent text-white" : "bg-surface border border-border text-text-secondary hover:border-accent/50"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-text-muted text-sm">Loading approvals…</div>
          ) : approvals.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg text-text-muted text-sm">
              No approval requests found.
            </div>
          ) : approvals.map((req) => (
            <Card
              key={req.id}
              onClick={() => setSelected(req)}
              className={`p-4 border-border cursor-pointer hover:border-accent/60 transition-all ${selected?.id === req.id ? "border-accent ring-1 ring-accent" : ""}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-mono font-bold text-text-primary text-sm">
                    {req.quotation?.number || req.quotation_id.slice(0, 8)}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {req.quotation?.customer_name || "—"}
                  </div>
                </div>
                <Badge variant="secondary" className={`font-mono text-[10px] ${STATUS_COLORS[req.status]}`}>
                  {req.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                <span>Trigger: {req.trigger.replace(/_/g, " ")}</span>
                <span>Step {req.current_step_seq}</span>
              </div>
              {req.quotation && (
                <div className="mt-2 text-xs font-mono text-text-primary font-semibold">
                  Total: ${(req.quotation.total || 0).toLocaleString()}
                </div>
              )}
            </Card>
          ))}

          {total > 20 && (
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Page {page} of {Math.ceil(total / 20)}</span>
              <div className="flex gap-2">
                <Button variant="ghost" className="h-7 px-3 text-xs" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
                <Button variant="ghost" className="h-7 px-3 text-xs" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>Next →</Button>
              </div>
            </div>
          )}
        </div>

        {/* Detail */}
        {selected && (
          <Card className="p-5 border-border bg-surface space-y-4 h-fit sticky top-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <div className="font-mono font-bold text-text-primary">{selected.quotation?.number}</div>
                <div className="text-xs text-text-secondary">{selected.quotation?.customer_name || "—"}</div>
              </div>
              <Badge variant="secondary" className={`font-mono text-xs ${STATUS_COLORS[selected.status]}`}>
                {selected.status}
              </Badge>
            </div>

            {/* Quotation Lines Summary */}
            {selected.quotation?.lines && selected.quotation.lines.length > 0 && (
              <div>
                <p className="text-xs font-medium text-text-secondary mb-2">Line Items:</p>
                <div className="space-y-1">
                  {selected.quotation.lines.slice(0, 5).map((line, i) => (
                    <div key={i} className="flex justify-between text-xs font-mono">
                      <span className="text-text-secondary truncate max-w-[180px]">{line.product_name}</span>
                      <span className="text-text-primary font-semibold">${(line.line_total || 0).toLocaleString()}</span>
                    </div>
                  ))}
                  {selected.quotation.lines.length > 5 && (
                    <div className="text-xs text-text-muted">+{selected.quotation.lines.length - 5} more…</div>
                  )}
                </div>
              </div>
            )}

            {/* Approval Steps */}
            <div>
              <p className="text-xs font-medium text-text-secondary mb-2">Approval Steps:</p>
              <div className="space-y-1.5">
                {selected.steps.map((step) => (
                  <div key={step.id} className={`flex items-center justify-between text-xs p-2 rounded border ${step.seq === selected.current_step_seq ? "border-accent/60 bg-accent/5" : "border-border"}`}>
                    <div>
                      <span className="font-mono text-text-muted">Step {step.seq}:</span>{" "}
                      <span className="text-text-primary capitalize">{step.required_role.replace(/_/g, " ")}</span>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] ${STATUS_COLORS[step.status as ApprovalStatus]}`}>
                      {step.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons for current pending step */}
            {currentStep && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs font-medium text-text-secondary mb-2">Act on Current Step:</p>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 text-xs h-8"
                    onClick={() => setActionModal({ type: "approve", stepId: currentStep.id })}
                  >
                    ✓ Approve
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1 text-xs h-8 border-amber-500/40 text-amber-600 hover:bg-amber-500/5"
                    onClick={() => setActionModal({ type: "return", stepId: currentStep.id })}
                  >
                    ↩ Return
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 text-xs h-8 text-danger hover:text-danger border border-transparent hover:border-danger/40"
                    onClick={() => setActionModal({ type: "reject", stepId: currentStep.id })}
                  >
                    ✕ Reject
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Action Modal */}
      <Dialog
        isOpen={!!actionModal}
        onClose={() => { setActionModal(null); setComment("") }}
        title={actionModal ? `${actionModal.type.charAt(0).toUpperCase() + actionModal.type.slice(1)} Step` : ""}
        subtitle="Add an optional comment for the audit trail."
        footerActions={
          <>
            <Button variant="ghost" onClick={() => { setActionModal(null); setComment("") }}>Cancel</Button>
            <Button onClick={handleAction} disabled={saving}>
              {saving ? "Processing…" : "Confirm"}
            </Button>
          </>
        }
      >
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Comment (optional)</label>
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. Margin acceptable, proceed."
          />
        </div>
      </Dialog>
    </div>
  )
}
