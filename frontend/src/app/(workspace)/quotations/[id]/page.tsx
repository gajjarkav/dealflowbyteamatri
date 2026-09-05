"use client"
import React, { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
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
  draft: "border-border text-text-secondary",
  pending_approval: "border-accent text-accent bg-accent/5",
  approved: "border-blue-500/50 text-blue-600 bg-blue-500/5",
  revision_requested: "border-amber-500/50 text-amber-600 bg-amber-500/5",
  under_negotiation: "border-purple-500/50 text-purple-600 bg-purple-500/5",
  accepted: "border-emerald-500/50 text-emerald-600 bg-emerald-500/5",
  cancelled: "border-red-400/50 text-red-500 bg-red-500/5",
  fulfilled: "border-emerald-600 text-emerald-700 bg-emerald-500/10",
}

const RISK_COLORS: Record<string, string> = {
  low: "text-emerald-600",
  medium: "text-amber-500",
  high: "text-orange-500",
  critical: "text-red-600",
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
    if (!newLine.product_id) {
      toast({ title: "Validation", description: "Select a product", type: "error" })
      return
    }
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add line"
      toast({ title: "Error", description: msg, type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveLine = async (lineId: string) => {
    try {
      const updated = await apiRemoveQuotationLine(id, lineId)
      setQuotation(updated)
      toast({ title: "Line Removed" })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed"
      toast({ title: "Error", description: msg, type: "error" })
    }
  }

  const handleConfirm = async () => {
    setSaving(true)
    try {
      const updated = await apiConfirmQuotation(id)
      setQuotation(updated)
      toast({ title: "Confirmed", description: "Submitted for approval flow." })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed"
      toast({ title: "Error", description: msg, type: "error" })
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
      toast({ title: "Cancelled", type: "info" })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed"
      toast({ title: "Error", description: msg, type: "error" })
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
      toast({ title: "Error", description: "Failed to apply suggestion", type: "error" })
    }
  }

  const handleDismissSuggestion = async (productId: string) => {
    try {
      await apiDismissSuggestion(id, productId)
      setSuggestions((prev) => prev.filter(s => s.product_id !== productId))
      toast({ title: "Suggestion Dismissed" })
    } catch {
      toast({ title: "Error", description: "Failed to dismiss suggestion", type: "error" })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-text-muted text-sm">Loading quotation…</div>
  }
  if (!quotation) return null

  const canEdit = ["draft", "revision_requested", "under_negotiation"].includes(quotation.status)
  const canConfirm = canEdit
  const canCancel = !["cancelled", "fulfilled"].includes(quotation.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="mb-2">
            <Link href="/pipeline" className="text-xs text-text-muted hover:text-accent transition-colors">← Pipeline</Link>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold font-mono text-text-primary">{quotation.number}</h1>
            <Badge variant="secondary" className={`font-mono text-xs ${STATUS_COLORS[quotation.status]}`}>
              {quotation.status.replace(/_/g, " ")}
            </Badge>
            {risk && (
              <Badge variant="secondary" className={`font-mono text-xs ${RISK_COLORS[risk.risk_level]}`}>
                Risk: {risk.risk_level.toUpperCase()} ({risk.risk_score}/100)
              </Badge>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Customer: <span className="text-text-primary font-medium">{quotation.customer_name || "—"}</span>
            {quotation.rep_name && <> · Rep: <span className="text-text-primary font-medium">{quotation.rep_name}</span></>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canConfirm && (
            <Button onClick={handleConfirm} disabled={saving || quotation.lines.length === 0}>
              ✓ Confirm & Submit
            </Button>
          )}
          {canCancel && (
            <Button variant="ghost" className="text-danger border border-transparent hover:border-danger/40" onClick={handleCancel} disabled={saving}>
              Cancel Deal
            </Button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Subtotal", value: `$${(quotation.subtotal || 0).toLocaleString()}` },
          { label: "Order Discount", value: `${quotation.order_discount_pct}%`, sub: `-$${(quotation.order_discount_amount || 0).toLocaleString()}` },
          { label: "Total", value: `$${(quotation.total || 0).toLocaleString()}`, accent: true },
          { label: "Gross Margin", value: quotation.gross_margin_pct != null ? `${quotation.gross_margin_pct.toFixed(1)}%` : "—", green: true },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-4 border-border bg-surface">
            <div className="text-[11px] font-mono text-text-secondary">{kpi.label}</div>
            <div className={`font-mono font-extrabold text-xl mt-1 ${kpi.accent ? "text-accent" : kpi.green ? "text-emerald-600" : "text-text-primary"}`}>
              {kpi.value}
            </div>
            {kpi.sub && <div className="text-[11px] text-text-muted mt-0.5">{kpi.sub}</div>}
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["lines", "risk", "suggestions", "timeline"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px capitalize ${activeTab === tab ? "border-accent text-accent" : "border-transparent text-text-secondary hover:text-text-primary"}`}
          >
            {tab === "lines" ? `Lines (${quotation.lines.length})` :
             tab === "suggestions" ? `AI Suggestions (${suggestions.length})` : tab}
          </button>
        ))}
      </div>

      {/* Lines */}
      {activeTab === "lines" && (
        <div className="space-y-3">
          {canEdit && <Button onClick={handleOpenAddLine} variant="secondary">+ Add Product Line</Button>}
          {quotation.lines.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg text-text-muted text-sm">
              No lines yet. Add products to build this quotation.
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface border-b border-border text-xs font-mono text-text-secondary">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit Price</th>
                    <th className="px-4 py-3">Discount</th>
                    <th className="px-4 py-3">Line Total</th>
                    <th className="px-4 py-3">Margin</th>
                    {canEdit && <th className="px-4 py-3"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {quotation.lines.map((line) => (
                    <tr key={line.id} className="hover:bg-surface/60">
                      <td className="px-4 py-3 font-medium text-text-primary">{line.product_name}</td>
                      <td className="px-4 py-3 font-mono">{line.qty}</td>
                      <td className="px-4 py-3 font-mono">${line.unit_price.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-amber-600">{line.discount_pct}%</td>
                      <td className="px-4 py-3 font-mono font-semibold">${line.line_total.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono">
                        <span className={(line.margin_pct || 0) >= 40 ? "text-emerald-600" : "text-amber-600"}>
                          {line.margin_pct != null ? `${line.margin_pct.toFixed(1)}%` : "—"}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3">
                          <Button variant="ghost" className="h-6 px-2 text-xs text-danger hover:text-danger" onClick={() => handleRemoveLine(line.id)}>×</Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Risk */}
      {activeTab === "risk" && (
        <Card className="p-6 border-border bg-surface space-y-4">
          {risk ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-text-primary">Risk Score:</span>
                <span className={`font-mono font-extrabold text-2xl ${RISK_COLORS[risk.risk_level]}`}>{risk.risk_score}/100</span>
                <Badge variant="secondary" className={`font-mono text-xs ${RISK_COLORS[risk.risk_level]}`}>{risk.risk_level.toUpperCase()}</Badge>
              </div>
              {risk.flags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-text-secondary">Risk Flags:</p>
                  {risk.flags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-text-primary bg-background border border-border rounded p-2">
                      <span className="text-amber-500 mt-0.5">⚠</span>{flag}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-text-muted text-sm">Loading risk analysis…</div>
          )}
        </Card>
      )}

      {/* Suggestions */}
      {activeTab === "suggestions" && (
        <div className="space-y-3">
          {suggestions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg text-text-muted text-sm">No upsell suggestions.</div>
          ) : suggestions.map((s) => (
            <Card key={s.product_id} className="p-4 border-border bg-surface flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-text-primary text-sm">{s.product_name}</div>
                <div className="text-xs text-text-secondary mt-0.5">{s.reason}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="secondary" className="h-7 px-3 text-xs" onClick={() => handleApplySuggestion(s.product_id)}>Add to Deal</Button>
                <Button variant="ghost" className="h-7 px-2 text-xs text-text-muted" onClick={() => handleDismissSuggestion(s.product_id)}>Dismiss</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Timeline */}
      {activeTab === "timeline" && (
        <div className="space-y-3">
          {timeline.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg text-text-muted text-sm">No timeline events yet.</div>
          ) : (
            <div className="relative pl-4">
              <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />
              {timeline.map((event) => (
                <div key={event.id} className="relative mb-4 pl-6">
                  <div className="absolute left-[-4px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-surface" />
                  <div className="text-xs font-medium text-text-primary">{event.event_type.replace(/_/g, " ")}</div>
                  {event.description && <div className="text-xs text-text-secondary mt-0.5">{event.description}</div>}
                  <div className="text-[11px] text-text-muted mt-1 font-mono">
                    {event.actor_name && <>{event.actor_name} · </>}{new Date(event.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Line Drawer */}
      <FormDrawer
        isOpen={addLineOpen}
        onClose={() => setAddLineOpen(false)}
        title="Add Product Line"
        subtitle="Add a product to this quotation"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setAddLineOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLine} disabled={saving}>{saving ? "Adding…" : "Add Line"}</Button>
          </>
        }
      >
        <form onSubmit={handleAddLine} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Product *</label>
            <select
              value={newLine.product_id}
              onChange={(e) => setNewLine({ ...newLine, product_id: e.target.value })}
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:border-accent"
              required
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — ${p.list_price.toLocaleString()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Quantity</label>
            <Input type="number" min={1} value={newLine.qty} onChange={(e) => setNewLine({ ...newLine, qty: parseInt(e.target.value) || 1 })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Line Discount (%)</label>
            <Input type="number" min={0} max={100} step={0.1} value={newLine.discount_pct} onChange={(e) => setNewLine({ ...newLine, discount_pct: parseFloat(e.target.value) || 0 })} />
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
