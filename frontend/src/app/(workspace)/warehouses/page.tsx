"use client"
import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog } from "@/components/ui/dialog"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import Link from "next/link"
import { Box, Building2, Plus, Layers, TrendingUp, MapPin, Archive } from "lucide-react"
import {
  apiListWarehouses,
  apiCreateWarehouse,
  apiGetWarehouseStock,
  apiAdjustStock,
  type WarehouseResponse,
  type StockLevelResponse,
} from "@/lib/api/warehouses"

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
}

export default function WarehousesPage() {
  const { toast } = useToast()
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"warehouses" | "stock">("warehouses")
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null)
  const [stock, setStock] = useState<StockLevelResponse[]>([])
  const [stockLoading, setStockLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newWh, setNewWh] = useState({ name: "", location: "" })
  const [saving, setSaving] = useState(false)
  const [adjustItem, setAdjustItem] = useState<StockLevelResponse | null>(null)
  const [adjustDelta, setAdjustDelta] = useState(5)
  const [adjustReason, setAdjustReason] = useState("inbound")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiListWarehouses({ size: 50 })
      setWarehouses(res.items)
      setTotal(res.total)
      if (res.items.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(res.items[0].id)
      }
    } catch {
      toast({ title: "Error", description: "Failed to load warehouses", type: "error" })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  useEffect(() => {
    if (!selectedWarehouseId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStockLoading(true)
    apiGetWarehouseStock(selectedWarehouseId)
      .then(setStock)
      .catch(() => setStock([]))
      .finally(() => setStockLoading(false))
  }, [selectedWarehouseId])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWh.name) return
    setSaving(true)
    try {
      await apiCreateWarehouse({ name: newWh.name, location: newWh.location || undefined })
      toast({ title: "Warehouse Created" })
      setCreateOpen(false)
      load()
    } catch {
      toast({ title: "Error", description: "Failed to create", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleAdjust = async () => {
    if (!adjustItem || !selectedWarehouseId) return
    setSaving(true)
    try {
      await apiAdjustStock(selectedWarehouseId, {
        product_id: adjustItem.product_id,
        delta: adjustDelta,
        reason: adjustReason,
      })
      toast({ title: "Stock Adjusted", description: `Updated by ${adjustDelta > 0 ? "+" : ""}${adjustDelta}` })
      setAdjustItem(null)
      if (selectedWarehouseId) {
        apiGetWarehouseStock(selectedWarehouseId).then(setStock)
      }
    } catch {
      toast({ title: "Error", description: "Adjustment failed", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-[1200px] mx-auto pb-12">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight">
            Logistics & Stock
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-medium">
            Multi-warehouse inventory synchronization, reservations, and adjustments.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-surface-hover/50 rounded-xl border border-border shadow-inner">
            {(["warehouses", "stock"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-1.5 text-xs font-bold rounded-lg capitalize transition-all z-10 ${
                  activeTab === tab ? "text-white" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {activeTab === tab && (
                  <motion.div 
                    layoutId="wh-tab-pill" 
                    className="absolute inset-0 bg-accent rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab === "warehouses" ? (
                    <><Building2 className="w-3.5 h-3.5" /> Hubs ({total})</>
                  ) : (
                    <><Layers className="w-3.5 h-3.5" /> Ledger</>
                  )}
                </span>
              </button>
            ))}
          </div>
          <Button onClick={() => setCreateOpen(true)} className="font-heading font-bold shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Add Hub
          </Button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Warehouses Tab */}
        {activeTab === "warehouses" && (
          <motion.div 
            key="warehouses" 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? (
              <div className="col-span-full text-center py-20 bg-surface/30 rounded-xl border border-dashed border-border text-text-muted font-medium">Loading hubs...</div>
            ) : warehouses.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-surface/30 rounded-xl border-2 border-dashed border-border text-text-muted font-medium">
                No logistics hubs available. Add your first warehouse.
              </div>
            ) : warehouses.map((wh) => (
              <Card
                key={wh.id}
                onClick={() => { setSelectedWarehouseId(wh.id); setActiveTab("stock") }}
                className={`group p-6 border-border cursor-pointer transition-all bg-surface overflow-hidden relative ${
                  selectedWarehouseId === wh.id ? "border-accent ring-1 ring-accent shadow-md bg-accent-soft/5" : "hover:border-accent/40 hover:bg-surface-hover"
                }`}
              >
                <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl opacity-10 ${wh.is_active ? "bg-emerald-500" : "bg-slate-500"}`} />
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${wh.is_active ? "bg-emerald-500/10 border-emerald-500/20" : "bg-surface-hover border-border"}`}>
                      <Building2 className={`w-5 h-5 ${wh.is_active ? "text-emerald-600" : "text-text-muted"}`} />
                    </div>
                    <div>
                      <div className="font-heading font-extrabold text-text-primary text-base leading-none">{wh.name}</div>
                      <Badge variant={wh.is_active ? "default" : "secondary"} className={`text-[9px] mt-1.5 uppercase tracking-widest ${wh.is_active ? "bg-emerald-50 text-emerald-600" : ""}`}>
                        {wh.is_active ? "Active" : "Archived"}
                      </Badge>
                    </div>
                  </div>
                </div>
                {wh.location ? (
                  <div className="flex items-start gap-2 text-xs font-medium text-text-secondary mt-4">
                    <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
                    <span className="leading-tight">{wh.location}</span>
                  </div>
                ) : (
                  <div className="text-xs font-medium text-text-muted/50 italic mt-4">No location set</div>
                )}
                <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                  <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                    ID: {wh.id.slice(0, 8)}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/warehouses/${wh.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button variant="secondary" className="h-6 px-2 text-xs">Details</Button>
                    </Link>
                    <div className="text-xs font-bold text-accent group-hover:translate-x-1 transition-transform flex items-center">
                      Stock Ledger <span className="ml-1">→</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Stock Tab */}
        {activeTab === "stock" && (
          <motion.div 
            key="stock" 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
            className="space-y-6"
          >
            {/* Stock Control Bar */}
            <Card className="premium-card p-4 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-border">
              <div className="flex items-center gap-3">
                <Archive className="w-5 h-5 text-accent" />
                <span className="text-xs font-heading font-bold text-text-secondary uppercase tracking-widest">Active Ledger:</span>
                <select
                  value={selectedWarehouseId || ""}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="h-10 rounded-lg border border-border bg-background px-4 text-sm font-bold text-text-primary focus:outline-none focus:border-accent shadow-sm min-w-[200px]"
                >
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 px-6 border-l border-border/50 text-xs font-bold text-text-secondary">
                <div className="text-center">
                  <div className="uppercase tracking-widest text-[9px] mb-0.5">Total SKUs</div>
                  <div className="text-lg font-mono font-extrabold text-text-primary">{stock.length}</div>
                </div>
              </div>
            </Card>

            <Card className="premium-card overflow-hidden border-border bg-surface">
              {stockLoading ? (
                <div className="text-center py-24 text-text-muted font-medium bg-surface/30">Syncing stock ledger...</div>
              ) : stock.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-border/40 m-6 rounded-xl text-text-muted font-medium bg-background">
                  No stock entries registered for this hub.
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-surface-hover/80 border-b border-border">
                      <tr className="text-[10px] font-heading font-bold text-text-secondary uppercase tracking-wider">
                        <th className="px-6 py-4">Product Ref</th>
                        <th className="px-6 py-4 text-right">Physical On Hand</th>
                        <th className="px-6 py-4 text-right">Quote Reserved</th>
                        <th className="px-6 py-4 text-right">Available to Promise</th>
                        <th className="px-6 py-4 text-right">Reorder Threshold</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {stock.map((s) => {
                        const available = Math.max(0, s.qty_on_hand - s.qty_reserved)
                        const lowStock = available <= s.reorder_point
                        return (
                          <tr key={s.id} className="interactive-row bg-background">
                            <td className="px-6 py-4">
                              <div className="font-mono font-bold text-text-primary text-xs flex items-center gap-2">
                                <Box className="w-3.5 h-3.5 text-text-muted" />
                                {s.product_id.slice(0, 16)}...
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-text-primary bg-surface/30">
                              {s.qty_on_hand}
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-amber-600 bg-amber-50/10">
                              {s.qty_reserved}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`font-mono font-extrabold px-2.5 py-1 rounded-md border ${
                                lowStock ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                              }`}>
                                {available}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-medium text-text-muted">
                              {s.reorder_point}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant="ghost"
                                className="h-8 px-3 text-xs font-bold text-accent hover:bg-accent-soft/20 transition-colors"
                                onClick={() => { setAdjustItem(s); setAdjustDelta(5) }}
                              >
                                <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Adjust
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Warehouse Drawer */}
      <FormDrawer
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Logistics Hub"
        subtitle="Register a new distribution center or stock location."
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving} className="font-bold shadow-sm">
              {saving ? "Creating..." : "Register Hub"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Warehouse Name <span className="text-accent">*</span></label>
            <Input 
              value={newWh.name} 
              onChange={(e) => setNewWh({ ...newWh, name: e.target.value })} 
              placeholder="e.g. Frankfurt Distribution Center" 
              className="h-11 bg-surface shadow-sm"
              required 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Physical Address / Region</label>
            <Input 
              value={newWh.location} 
              onChange={(e) => setNewWh({ ...newWh, location: e.target.value })} 
              placeholder="e.g. Frankfurt, DE" 
              className="h-11 bg-surface shadow-sm"
            />
          </div>
        </form>
      </FormDrawer>

      {/* Adjust Stock Dialog */}
      <Dialog
        isOpen={!!adjustItem}
        onClose={() => setAdjustItem(null)}
        title="Adjust Inventory Balance"
        subtitle={adjustItem ? `SKU: ${adjustItem.product_id.slice(0, 16)}…` : ""}
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setAdjustItem(null)}>Cancel</Button>
            <Button onClick={handleAdjust} disabled={saving} className="font-bold shadow-sm">
              {saving ? "Committing..." : "Commit Delta"}
            </Button>
          </>
        }
      >
        {adjustItem && (
          <div className="space-y-5 mt-2">
            <div className="grid grid-cols-2 gap-4 p-4 bg-surface-hover/50 border border-border/60 rounded-xl">
              <div>
                <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-text-secondary block mb-1">Physical On-Hand</span>
                <span className="text-2xl font-mono font-extrabold text-text-primary">{adjustItem.qty_on_hand}</span>
              </div>
              <div className="pl-4 border-l border-border">
                <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-text-secondary block mb-1">Post-Delta Projection</span>
                <span className={`text-2xl font-mono font-extrabold ${adjustDelta > 0 ? "text-emerald-600" : adjustDelta < 0 ? "text-amber-600" : "text-text-primary"}`}>
                  {Math.max(0, adjustItem.qty_on_hand + adjustDelta)}
                </span>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Adjustment Delta (+/-)</label>
              <Input 
                type="number" 
                value={adjustDelta} 
                onChange={(e) => setAdjustDelta(Number(e.target.value))} 
                step={1} 
                className="h-11 bg-surface shadow-sm font-mono text-lg font-bold"
              />
              <span className="text-[10px] font-medium text-text-muted mt-1 block">
                Use positive values for inbound receipts, negative values for spoilage/loss.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Audit Reason Code</label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full h-11 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-primary focus:outline-none focus:border-accent shadow-sm"
              >
                <option value="inbound">Inbound Restock / PO Receipt</option>
                <option value="audit">Physical Cycle Count Adjustment</option>
                <option value="damaged">Damaged / Written-Off Units</option>
                <option value="transfer">Inter-hub Transfer Routing</option>
              </select>
            </div>
          </div>
        )}
      </Dialog>
    </motion.div>
  )
}
