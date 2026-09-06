"use client";
import React, { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { ArrowLeft, CheckCircle2, ChevronRight, AlertTriangle, ShieldAlert, Sparkles, TrendingUp, Plus, Trash2 } from "lucide-react"
import {
  apiGetQuotation,
  apiAddQuotationLine,
  apiRemoveQuotationLine,
  apiGetRiskPreview,
  apiConfirmQuotation,
  apiCancelQuotation,
  apiGetSuggestions,
  apiApplySuggestion,
  apiDismissSuggestion,
  apiGetTimeline,
  type QuotationResponse,
  type RiskPreviewResponse,
  type SuggestionResponse,
  type QuotationEvent,
} from "@/lib/api/quotations"
import { apiListProducts, type ProductResponse } from "@/lib/api/catalog"

const STATUS_COLORS: Record<string, string> = {
  draft: "border-border text-text-secondary bg-surface",
  pending_approval: "border-accent/40 text-accent bg-accent-soft/30",
  approved: "border-blue-500/50 text-blue-400 bg-blue-500/10",
  revision_requested: "border-amber-500/50 text-amber-400 bg-amber-500/10",
  under_negotiation: "border-purple-500/50 text-purple-400 bg-purple-500/10",
  accepted: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10",
  cancelled: "border-red-400/50 text-red-500 bg-red-500/10",
  fulfilled: "border-emerald-600 text-emerald-400 bg-emerald-500/20",
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  revision_requested: "Revision Req.",
  under_negotiation: "Negotiation",
  accepted: "Accepted",
  cancelled: "Cancelled",
  fulfilled: "Fulfilled",
}

const RISK_COLORS: Record<string, string> = {
  low: "text-emerald-400 bg-emerald-500/10",
  medium: "text-amber-400 bg-amber-500/10",
  high: "text-orange-400 bg-orange-500/10",
  critical: "text-red-400 bg-red-500/10",
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
}

export default function QuotationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const [quotation, setQuotation] = useState<QuotationResponse | null>(null)
  const [risk, setRisk] = useState<RiskPreviewResponse | null>(null)
  const [suggestions, setSuggestions] = useState<SuggestionResponse[]>([])
  const [timeline, setTimeline] = useState<QuotationEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"lines" | "risk" | "suggestions" | "timeline">("lines")
  
  const [addLineOpen, setAddLineOpen] = useState(false)
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [newLine, setNewLine] = useState({ product_id: "", qty: 1, discount_pct: 0 })
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    try {
      const q = await apiGetQuotation(id)
      setQuotation(q)
    } catch {
      toast({ title: "Error", description: "Quotation not found", type: "error" })
      router.push("/pipeline")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await reload()
      setLoading(false)
    }
    load()
  }, [reload])

  useEffect(() => {
    if (!quotation) return
    apiGetRiskPreview(id).then(setRisk).catch(() => null)
    apiGetSuggestions(id).then(setSuggestions).catch(() => null)
    apiGetTimeline(id).then(setTimeline).catch(() => null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotation?.id])

  const handleOpenAddLine = async () => {
    const p = await apiListProducts({ page: 1, size: 100, is_active: true }).catch(() => null)
    setProducts(p?.items || [])
    setNewLine({ product_id: "", qty: 1, discount_pct: 0 })
    setAddLineOpen(true)
  }

  const handleAddLine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLine.product_id) return
    setSaving(true)
    try {
      const updated = await apiAddQuotationLine(id, {
        product_id: newLine.product_id,
        qty: newLine.qty,
        discount_pct: newLine.discount_pct || undefined,
      })
      setQuotation(updated)
      setAddLineOpen(false)
      toast({ title: "Line Added" })
    } catch {
      toast({ title: "Error", description: "Failed to add line", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveLine = async (lineId: string) => {
    try {
      const updated = await apiRemoveQuotationLine(id, lineId)
      setQuotation(updated)
      toast({ title: "Line Removed" })
    } catch {
      toast({ title: "Error", description: "Failed to remove", type: "error" })
    }
  }

  const handleConfirm = async () => {
    setSaving(true)
    try {
      const updated = await apiConfirmQuotation(id)
      setQuotation(updated)
      toast({ title: "Confirmed", description: "Submitted for approval flow." })
    } catch {
      toast({ title: "Error", description: "Failed to confirm", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm("Cancel this quotation?")) return
    setSaving(true)
    try {
      const updated = await apiCancelQuotation(id)
      setQuotation(updated)
      toast({ title: "Cancelled" })
    } catch {
      toast({ title: "Error", description: "Failed to cancel", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleApplySuggestion = async (productId: string) => {
    try {
      const updated = await apiApplySuggestion(id, productId)
      setQuotation(updated)
      setSuggestions((prev) => prev.filter(s => s.product_id !== productId))
      toast({ title: "Suggestion Applied" })
    } catch {
      toast({ title: "Error", description: "Failed to apply", type: "error" })
    }
  }

  const handleDismissSuggestion = async (productId: string) => {
    try {
      await apiDismissSuggestion(id, productId)
      setSuggestions((prev) => prev.filter(s => s.product_id !== productId))
      toast({ title: "Suggestion Dismissed" })
    } catch {
      toast({ title: "Error", description: "Failed to dismiss", type: "error" })
    }
  }

  if (loading || !quotation) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="flex gap-6 border-b border-border pb-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  const isEditable = quotation.status === "draft" || quotation.status === "revision_requested"

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Top Breadcrumb & Actions */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/pipeline" className="p-2 rounded-full hover:bg-surface-hover text-text-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <Link href="/pipeline" className="hover:text-text-primary transition-colors">Pipeline</Link>
            <ChevronRight className="w-4 h-4 text-text-muted" />
            <span className="font-mono font-bold text-text-primary">{quotation.number}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditable && (
            <Button variant="ghost" className="text-danger hover:bg-danger-soft hover:text-danger" onClick={handleCancel} disabled={saving}>
              Cancel Deal
            </Button>
          )}
          {isEditable && quotation.lines && quotation.lines.length > 0 && (
            <Button onClick={handleConfirm} disabled={saving} className="font-bold shadow-md">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm & Submit
            </Button>
          )}
        </div>
      </motion.div>

      {/* Hero Deal Card */}
      <motion.div variants={itemVariants}>
        <Card className="premium-card p-6 md:p-8 bg-gradient-to-br from-surface to-surface-hover border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <TrendingUp className="w-64 h-64 text-text-primary" />
          </div>
          <div className="flex flex-col md:flex-row gap-8 justify-between relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary" className={`font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 ${STATUS_COLORS[quotation.status]}`}>
                  {STATUS_LABELS[quotation.status]}
                </Badge>
                {risk && (
                  <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 border-orange-200 text-orange-400 bg-orange-500/10">
                    <ShieldAlert className="w-3 h-3 mr-1 inline" /> {risk.flags.length > 0 ? "Flags Found" : "Analyzed"}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-text-primary tracking-tight mt-2">
                {quotation.customer_name || "Unknown Customer"}
              </h1>
              <p className="text-sm font-medium text-text-secondary mt-2 flex items-center gap-4">
                <span>Rep: <strong className="text-text-primary">{quotation.rep_name || "—"}</strong></span>
                <span>Promised: <strong className="text-text-primary">{quotation.promised_date ? new Date(quotation.promised_date).toLocaleDateString() : "—"}</strong></span>
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end justify-center bg-background/50 backdrop-blur-sm p-4 rounded-xl border border-border/50 shadow-sm">
              <div className="text-xs font-heading font-bold text-text-secondary uppercase tracking-widest mb-1">Total Value</div>
              <div className="font-mono text-4xl md:text-5xl font-extrabold text-text-primary tracking-tighter">
                ${(quotation.total || 0).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  (quotation.gross_margin_pct || 0) >= 40 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-100" : "bg-amber-500/10 text-amber-400 border border-amber-100"
                }`}>
                  Margin: {quotation.gross_margin_pct != null ? `${quotation.gross_margin_pct.toFixed(1)}%` : "—"}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex items-center gap-6 border-b border-border">
        {[
          { id: "lines", label: "Line Items", count: quotation.lines?.length || 0 },
          { id: "risk", label: "Risk & Governance", count: null },
          { id: "suggestions", label: "Upsell AI", count: suggestions.length },
          { id: "timeline", label: "Audit Timeline", count: timeline.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'lines' | 'risk' | 'suggestions' | 'timeline')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === tab.id ? "text-accent" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className={`ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? "bg-accent/10 text-accent" : "bg-surface border border-border"
              }`}>
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "lines" && (
            <Card className="premium-card overflow-hidden">
              <div className="p-5 border-b border-border/50 flex items-center justify-between bg-surface-hover/30">
                <h2 className="text-lg font-heading font-bold text-text-primary">Products & Services</h2>
                {isEditable && (
                  <Button size="sm" onClick={handleOpenAddLine} className="h-8 font-bold text-xs shadow-sm">
                    <Plus className="w-3 h-3 mr-1" /> Add Line
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-surface-hover/50 border-b border-border">
                    <tr className="text-[11px] font-heading font-bold text-text-secondary uppercase tracking-wider">
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3 text-right">Qty</th>
                      <th className="px-5 py-3 text-right">Unit Price</th>
                      <th className="px-5 py-3 text-right">Discount</th>
                      <th className="px-5 py-3 text-right">Subtotal</th>
                      <th className="px-5 py-3 text-right">Margin</th>
                      {isEditable && <th className="px-5 py-3 w-10"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 bg-surface">
                    {(!quotation.lines || quotation.lines.length === 0) ? (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-text-muted font-medium border-2 border-dashed border-border/50 m-4 rounded-lg block">No lines added yet.</td></tr>
                    ) : quotation.lines.map((line) => (
                      <tr key={line.id} className="interactive-row">
                        <td className="px-5 py-4">
                          <div className="font-bold text-text-primary">{line.product_name}</div>
                          <div className="text-[10px] font-mono text-text-muted mt-0.5">SKU: {line.product_id.substring(0,8)}</div>
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-medium">{line.qty}</td>
                        <td className="px-5 py-4 text-right font-mono font-medium">${(line.unit_price || 0).toLocaleString()}</td>
                        <td className="px-5 py-4 text-right font-mono">
                          {line.discount_pct > 0 ? (
                            <span className="text-accent font-bold px-1.5 py-0.5 bg-accent-soft/30 rounded">
                              {line.discount_pct}%
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-bold text-text-primary">
                          ${(line.line_total || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-right font-mono">
                          <span className={(line.margin_pct || 0) >= 40 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                            {line.margin_pct != null ? `${line.margin_pct.toFixed(1)}%` : "—"}
                          </span>
                        </td>
                        {isEditable && (
                          <td className="px-5 py-4 text-right">
                            <button onClick={() => handleRemoveLine(line.id)} className="text-text-muted hover:text-danger p-1 rounded hover:bg-danger-soft transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === "risk" && risk && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="premium-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert className={`w-5 h-5 ${RISK_COLORS[risk.risk_level]}`} />
                  <h2 className="text-lg font-heading font-bold text-text-primary">Risk Assessment</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Level</div>
                    <Badge variant="secondary" className={`font-mono uppercase px-2.5 py-1 ${RISK_COLORS[risk.risk_level]}`}>
                      {risk.risk_level} Risk
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Risk Detail</div>
                    <div className="text-sm font-bold text-text-primary bg-surface-hover p-3 rounded-lg border border-border inline-block">
                      Score: <span className="text-accent">{risk.risk_score}</span> / 100
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="premium-card p-6">
                <h2 className="text-lg font-heading font-bold text-text-primary mb-4">Risk Factors</h2>
                <div className="space-y-2">
                  {risk.flags.length === 0 ? (
                    <div className="text-sm text-text-muted font-medium">No flags detected.</div>
                  ) : risk.flags.map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 bg-amber-500/10/50 border border-amber-100 p-3 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-amber-900 font-medium">{r}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "suggestions" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.length === 0 ? (
                <div className="col-span-full text-center py-12 text-sm text-text-muted font-medium border-2 border-dashed border-border/50 rounded-xl">
                  No AI upsell suggestions available.
                </div>
              ) : suggestions.map((s) => (
                <Card key={s.product_id} className="premium-card p-5 bg-gradient-to-b from-surface to-accent-soft/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <div className="text-xs font-bold text-accent uppercase tracking-widest">AI Suggestion</div>
                  </div>
                  <h3 className="font-bold text-text-primary mb-2">{s.product_name}</h3>
                  <p className="text-xs text-text-secondary font-medium leading-relaxed mb-5">{s.reason}</p>
                  
                  {isEditable && (
                    <div className="flex gap-2 mt-auto">
                      <Button size="sm" className="flex-1 font-bold text-xs" onClick={() => handleApplySuggestion(s.product_id)}>
                        Add to Deal
                      </Button>
                      <Button size="sm" variant="ghost" className="text-text-muted text-xs hover:text-danger" onClick={() => handleDismissSuggestion(s.product_id)}>
                        Dismiss
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {activeTab === "timeline" && (
            <Card className="premium-card p-6">
              <div className="space-y-6">
                {timeline.length === 0 ? (
                  <div className="text-sm text-text-muted font-medium">No audit events found.</div>
                ) : timeline.map((evt) => (
                  <div key={evt.id} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-accent-soft z-10" />
                      <div className="w-[1px] bg-border flex-1 mt-2" />
                    </div>
                    <div className="pb-6 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary text-sm">{evt.event_type.replace(/_/g, " ")}</span>
                        <span className="text-[10px] font-mono text-text-muted">{new Date(evt.created_at).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-text-secondary mt-1 font-medium bg-surface-hover p-2 rounded-md inline-block border border-border/50 mt-2">
                        {evt.description || "No additional context."}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      <FormDrawer
        isOpen={addLineOpen}
        onClose={() => setAddLineOpen(false)}
        title="Add Line Item"
        subtitle="Select a product and configure pricing"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setAddLineOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLine} disabled={saving} className="font-bold">
              {saving ? "Adding..." : "Add to Deal"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddLine} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Product <span className="text-accent">*</span></label>
            <select
              value={newLine.product_id}
              onChange={(e) => setNewLine({ ...newLine, product_id: e.target.value })}
              className="w-full h-11 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
              required
            >
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ${p.list_price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Quantity</label>
              <Input
                type="number"
                min="1"
                value={newLine.qty}
                onChange={(e) => setNewLine({ ...newLine, qty: parseInt(e.target.value) || 1 })}
                className="h-11 bg-surface shadow-sm font-mono text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Discount (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newLine.discount_pct}
                onChange={(e) => setNewLine({ ...newLine, discount_pct: parseFloat(e.target.value) || 0 })}
                className="h-11 bg-surface shadow-sm font-mono text-sm"
              />
            </div>
          </div>
        </form>
      </FormDrawer>
    </motion.div>
  )
}
