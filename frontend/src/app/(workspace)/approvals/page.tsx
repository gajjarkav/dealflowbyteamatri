"use client"
import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { CheckCircle2, XCircle, RotateCcw, Filter, UserCog, History, ShieldAlert } from "lucide-react"
import {
  apiListApprovals,
  apiApproveStep,
  apiRejectStep,
  apiReturnStep,
  type ApprovalRequestResponse,
  type ApprovalStatus,
} from "@/lib/api/approvals"

const STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: "border-amber-500/50 text-amber-600 bg-amber-500/10",
  approved: "border-emerald-500/50 text-emerald-600 bg-emerald-500/10",
  rejected: "border-red-400/50 text-red-500 bg-red-500/10",
  returned: "border-purple-500/50 text-purple-600 bg-purple-500/10",
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
}

export default function ApprovalsPage() {
  const { toast } = useToast()
  const [approvals, setApprovals] = useState<ApprovalRequestResponse[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "">("pending") // Default to pending
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
      // Auto-select first item if we have data and nothing is selected
      if (res.items.length > 0 && (!selected || !res.items.find(i => i.id === selected.id))) {
        setSelected(res.items[0])
      } else if (res.items.length === 0) {
        setSelected(null)
      }
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
      load() // Reload list to reflect changes
    } catch {
      toast({ title: "Error", description: "Action failed", type: "error" })
    } finally {
      setSaving(false)
    }
  }


  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-[1400px] mx-auto pb-12">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight">
            Approval Requests
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-medium">
            Review and act on pending quotation governance workflows.
          </p>
        </div>
        <div className="flex items-center px-4 py-2 rounded-lg bg-surface border border-border shadow-sm">
          <ShieldAlert className="w-4 h-4 text-accent mr-2" />
          <span className="text-xs font-heading font-bold text-text-secondary uppercase tracking-wider mr-2">Queue:</span>
          <span className="font-mono text-sm font-extrabold text-text-primary">{total}</span>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <Filter className="w-4 h-4 text-text-muted shrink-0 mr-2" />
        {([["", "All History"], ["pending", "Pending Action"], ["approved", "Approved"], ["rejected", "Rejected"], ["returned", "Returned"]] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setStatusFilter(val as ApprovalStatus | ""); setPage(1) }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              statusFilter === val ? "bg-text-primary text-surface shadow-md" : "bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border"
            }`}
          >
            {label}
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px]">
        
        {/* Left Side: List */}
        <motion.div variants={itemVariants} className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3">
          {loading ? (
            <div className="text-center py-20 text-text-muted font-medium bg-surface/50 rounded-xl border border-border">Loading queue...</div>
          ) : approvals.length === 0 ? (
            <div className="text-center py-20 bg-surface/50 rounded-xl border-2 border-dashed border-border text-text-muted font-medium">
              No approval requests found in this queue.
            </div>
          ) : (
            approvals.map((req) => (
              <Card
                key={req.id}
                onClick={() => setSelected(req)}
                className={`p-4 border-border cursor-pointer transition-all bg-surface ${
                  selected?.id === req.id 
                    ? "border-accent ring-1 ring-accent shadow-md bg-accent-soft/5" 
                    : "hover:border-accent/40 hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="font-mono font-extrabold text-text-primary text-base">
                      {req.quotation?.number || req.quotation_id.slice(0, 8)}
                    </div>
                    <div className="text-xs font-medium text-text-secondary mt-1 truncate max-w-[200px]">
                      {req.quotation?.customer_name || "—"}
                    </div>
                  </div>
                  <Badge variant="secondary" className={`font-mono text-[10px] uppercase tracking-widest ${STATUS_COLORS[req.status]}`}>
                    {req.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
                    <History className="w-3.5 h-3.5" />
                    <span className="capitalize">{req.trigger.replace(/_/g, " ")} Trigger</span>
                  </div>
                  {req.quotation && (
                    <div className="text-xs font-mono font-extrabold text-text-primary">
                      ${(req.quotation.total || 0).toLocaleString()}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between text-xs font-medium text-text-muted p-2">
              <span>Page {page} of {Math.ceil(total / 20)}</span>
              <div className="flex gap-2">
                <Button variant="ghost" className="h-8 px-3 text-xs font-bold" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
                <Button variant="ghost" className="h-8 px-3 text-xs font-bold" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>Next →</Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Right Side: Detail View */}
        <motion.div variants={itemVariants} className="lg:col-span-7 xl:col-span-8">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Card className="premium-card bg-surface flex flex-col h-full min-h-[600px] overflow-hidden">
                  
                  {/* Detail Header */}
                  <div className="p-6 md:p-8 border-b border-border bg-gradient-to-br from-surface to-surface-hover relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="secondary" className={`font-mono text-[10px] uppercase tracking-widest ${STATUS_COLORS[selected.status]}`}>
                            Status: {selected.status}
                          </Badge>
                          <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-widest bg-background border-border">
                            Trigger: {selected.trigger.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <h2 className="text-3xl font-heading font-extrabold text-text-primary">
                          {selected.quotation?.number || "Unknown Ref"}
                        </h2>
                        <p className="text-sm font-medium text-text-secondary mt-1">
                          {selected.quotation?.customer_name || "Unknown Customer"}
                        </p>
                      </div>
                      
                      <div className="bg-background/80 backdrop-blur border border-border/50 p-4 rounded-xl text-right">
                        <div className="text-[10px] font-heading font-bold text-text-secondary uppercase tracking-widest mb-1">Deal Value</div>
                        <div className="font-mono text-2xl font-extrabold text-text-primary">
                          ${(selected.quotation?.total || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
                    
                    {/* Quotation Lines Summary */}
                    {selected.quotation?.lines && selected.quotation.lines.length > 0 && (
                      <div>
                        <h3 className="text-sm font-heading font-bold text-text-primary mb-4 flex items-center gap-2">
                          <Package className="w-4 h-4 text-accent" /> Deal Context
                        </h3>
                        <div className="bg-background border border-border rounded-xl overflow-hidden">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-surface-hover border-b border-border">
                              <tr className="text-[10px] font-heading font-bold text-text-secondary uppercase tracking-wider">
                                <th className="px-4 py-3">Product</th>
                                <th className="px-4 py-3 text-right">Discount</th>
                                <th className="px-4 py-3 text-right">Subtotal</th>
                                <th className="px-4 py-3 text-right">Margin</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                              {selected.quotation.lines.map((line: {product_name: string; qty?: number; discount_pct?: number; line_total: number; margin_pct?: number}, i: number) => (
                                <tr key={i} className="hover:bg-surface/50 transition-colors">
                                  <td className="px-4 py-3 font-medium text-text-primary truncate max-w-[200px]">{line.product_name}</td>
                                  <td className="px-4 py-3 text-right font-mono text-xs">
                                    {line.discount_pct && line.discount_pct > 0 ? (
                                      <span className="text-accent bg-accent-soft/30 px-1.5 py-0.5 rounded font-bold">{line.discount_pct}%</span>
                                    ) : "—"}
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono font-bold text-text-primary">${(line.line_total || 0).toLocaleString()}</td>
                                  <td className="px-4 py-3 text-right font-mono text-xs">
                                    <span className={(line.margin_pct || 0) >= 40 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                                      {line.margin_pct != null ? `${line.margin_pct.toFixed(1)}%` : "—"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Governance Chain */}
                    <div>
                      <h3 className="text-sm font-heading font-bold text-text-primary mb-4 flex items-center gap-2">
                        <UserCog className="w-4 h-4 text-accent" /> Governance Chain
                      </h3>
                      <div className="space-y-3">
                        {selected.steps.map((step, idx) => {
                          const isCurrent = step.seq === selected.current_step_seq && step.status === "pending"
                          return (
                            <div key={step.id} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold z-10 ${
                                  step.status === "approved" ? "bg-emerald-500 text-white" :
                                  step.status === "rejected" ? "bg-red-500 text-white" :
                                  step.status === "returned" ? "bg-purple-500 text-white" :
                                  isCurrent ? "bg-accent text-white ring-4 ring-accent-soft" : "bg-surface border border-border text-text-muted"
                                }`}>
                                  {step.seq}
                                </div>
                                {idx < selected.steps.length - 1 && (
                                  <div className={`w-[2px] flex-1 my-1 ${
                                    step.status === "approved" ? "bg-emerald-500/50" : "bg-border"
                                  }`} />
                                )}
                              </div>
                              <div className={`flex-1 pb-4 ${idx === selected.steps.length - 1 ? "" : ""}`}>
                                <div className={`p-4 rounded-xl border ${
                                  isCurrent ? "bg-accent-soft/10 border-accent/40 shadow-sm" : "bg-background border-border"
                                }`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-text-primary text-sm capitalize">{step.required_role.replace(/_/g, " ")} Approval</span>
                                    <Badge variant="secondary" className={`text-[10px] uppercase tracking-widest ${STATUS_COLORS[step.status as ApprovalStatus]}`}>
                                      {step.status}
                                    </Badge>
                                  </div>
                                  {step.comment && (
                                    <div className="mt-2 text-xs font-medium text-text-secondary bg-surface p-3 rounded-lg border border-border/50">
                                      &quot;{step.comment}&quot;
                                    </div>
                                  )}
                                  {isCurrent && (
                                    <div className="mt-4 pt-4 border-t border-border/60 flex flex-wrap gap-2">
                                      <Button className="h-9 px-4 text-xs font-bold" onClick={() => setActionModal({ type: "approve", stepId: step.id })}>
                                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
                                      </Button>
                                      <Button variant="secondary" className="h-9 px-4 text-xs font-bold text-amber-600 border border-amber-500/30 hover:bg-amber-50" onClick={() => setActionModal({ type: "return", stepId: step.id })}>
                                        <RotateCcw className="w-4 h-4 mr-1.5" /> Return for Revision
                                      </Button>
                                      <Button variant="ghost" className="h-9 px-4 text-xs font-bold text-danger hover:bg-danger-soft/50 hover:text-danger border border-transparent" onClick={() => setActionModal({ type: "reject", stepId: step.id })}>
                                        <XCircle className="w-4 h-4 mr-1.5" /> Reject Deal
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full border-2 border-dashed border-border/60 rounded-xl flex items-center justify-center bg-surface/30 p-12"
              >
                <div className="text-center max-w-sm">
                  <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-6 text-text-muted">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading font-bold text-text-primary text-xl mb-2">Select a Request</h3>
                  <p className="text-text-secondary text-sm font-medium">Choose an approval workflow from the queue to review deal context and take action.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>

      <Dialog
        isOpen={!!actionModal}
        onClose={() => { setActionModal(null); setComment("") }}
        title={actionModal ? `${actionModal.type.charAt(0).toUpperCase() + actionModal.type.slice(1)} Deal` : ""}
        subtitle="Add a comment to the audit ledger."
        footerActions={
          <>
            <Button variant="ghost" onClick={() => { setActionModal(null); setComment("") }}>Cancel</Button>
            <Button 
              onClick={handleAction} 
              disabled={saving}
              className={actionModal?.type === 'reject' ? 'bg-danger text-white hover:bg-danger/90' : actionModal?.type === 'return' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}
            >
              {saving ? "Processing..." : `Confirm ${actionModal?.type.charAt(0).toUpperCase()}${actionModal?.type.slice(1)}`}
            </Button>
          </>
        }
      >
        <div className="mt-2">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Audit Ledger Comment</label>
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              actionModal?.type === 'approve' ? "e.g. Margins align with Q3 strategy. Approved." :
              actionModal?.type === 'reject' ? "e.g. Margin too low, cannot accommodate." :
              "e.g. Please revise discount to max 15%."
            }
            className="h-11 bg-surface shadow-sm"
          />
        </div>
      </Dialog>
    </motion.div>
  )
}
// Add Package icon for the missing import
function Package(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}
