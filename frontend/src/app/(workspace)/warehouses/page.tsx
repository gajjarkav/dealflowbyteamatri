"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog } from "@/components/ui/dialog"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import {
  apiListWarehouses,
  apiCreateWarehouse,
  apiGetWarehouseStock,
  apiAdjustStock,
  type WarehouseResponse,
  type StockLevelResponse,
} from "@/lib/api/warehouses"

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed"
      toast({ title: "Error", description: msg, type: "error" })
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Adjustment failed"
      toast({ title: "Error", description: msg, type: "error" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Warehouses &amp; Live Stock</h1>
          <p className="text-sm text-text-secondary mt-1">
            Multi-warehouse inventory sync, quote reservation locks, and manual adjustments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface border border-border rounded p-0.5">
            {(["warehouses", "stock"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs font-medium rounded capitalize transition-colors ${activeTab === tab ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"}`}
              >
                {tab === "warehouses" ? `Logistics Hubs (${total})` : `Stock Ledger`}
              </button>
            ))}
          </div>
          <Button onClick={() => setCreateOpen(true)}>+ Add Warehouse</Button>
        </div>
      </div>

      {/* Warehouses Tab */}
      {activeTab === "warehouses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-12 text-text-muted text-sm">Loading warehouses…</div>
          ) : warehouses.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-text-muted text-sm border border-dashed border-border rounded-lg">
              No warehouses yet. Add your first hub!
            </div>
          ) : warehouses.map((wh) => (
            <Card
              key={wh.id}
              onClick={() => { setSelectedWarehouseId(wh.id); setActiveTab("stock") }}
              className={`p-5 border-border cursor-pointer hover:border-accent/60 transition-all ${selectedWarehouseId === wh.id ? "border-accent ring-1 ring-accent" : ""}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-text-primary">{wh.name}</div>
                  {wh.location && <div className="text-xs text-text-secondary mt-0.5">{wh.location}</div>}
                </div>
                <Badge variant={wh.is_active ? "default" : "secondary"} className="text-xs">
                  {wh.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="text-xs text-text-muted font-mono">
                ID: {wh.id.slice(0, 8)}…
              </div>
              <div className="mt-3 text-xs text-accent font-medium">View Stock →</div>
            </Card>
          ))}
        </div>
      )}

      {/* Stock Tab */}
      {activeTab === "stock" && (
        <div className="space-y-4">
          {/* Warehouse Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Viewing stock for:</span>
            <select
              value={selectedWarehouseId || ""}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="h-8 rounded border border-border bg-background px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>
          </div>

          {stockLoading ? (
            <div className="text-center py-12 text-text-muted text-sm">Loading stock…</div>
          ) : stock.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg text-text-muted text-sm">
              No stock entries for this warehouse.
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface border-b border-border text-xs font-mono text-text-secondary">
                  <tr>
                    <th className="px-4 py-3">Product ID</th>
                    <th className="px-4 py-3">On Hand</th>
                    <th className="px-4 py-3">Reserved</th>
                    <th className="px-4 py-3">Available</th>
                    <th className="px-4 py-3">Reorder Point</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {stock.map((s) => {
                    const available = Math.max(0, s.qty_on_hand - s.qty_reserved)
                    return (
                      <tr key={s.id} className="hover:bg-surface/60">
                        <td className="px-4 py-3 font-mono text-xs text-text-muted">{s.product_id.slice(0, 12)}…</td>
                        <td className="px-4 py-3 font-mono font-bold text-text-primary">{s.qty_on_hand}</td>
                        <td className="px-4 py-3 font-mono text-amber-600">{s.qty_reserved}</td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-600">{available}</td>
                        <td className="px-4 py-3 font-mono text-text-muted">{s.reorder_point}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            className="h-7 px-2.5 text-xs text-accent hover:text-accent font-medium"
                            onClick={() => { setAdjustItem(s); setAdjustDelta(5) }}
                          >
                            Adjust
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Warehouse Drawer */}
      <FormDrawer
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Logistics Hub"
        subtitle="Register a new warehouse or distribution center"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Creating…" : "Create Warehouse"}</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Warehouse Name *</label>
            <Input value={newWh.name} onChange={(e) => setNewWh({ ...newWh, name: e.target.value })} placeholder="e.g. Mumbai Central Hub" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Location / Address</label>
            <Input value={newWh.location} onChange={(e) => setNewWh({ ...newWh, location: e.target.value })} placeholder="e.g. MIDC, Mumbai, India" />
          </div>
        </form>
      </FormDrawer>

      {/* Adjust Stock Dialog */}
      <Dialog
        isOpen={!!adjustItem}
        onClose={() => setAdjustItem(null)}
        title="Adjust Inventory Balance"
        subtitle={adjustItem ? `Product: ${adjustItem.product_id.slice(0, 16)}…` : ""}
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setAdjustItem(null)}>Cancel</Button>
            <Button onClick={handleAdjust} disabled={saving}>{saving ? "Applying…" : "Apply Delta"}</Button>
          </>
        }
      >
        {adjustItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-background border border-border rounded text-xs font-mono">
              <div>
                <span className="text-text-secondary block">Current On-Hand:</span>
                <span className="text-base font-bold text-text-primary">{adjustItem.qty_on_hand}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Projected:</span>
                <span className="text-base font-bold text-accent">{Math.max(0, adjustItem.qty_on_hand + adjustDelta)}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Delta (+/-)</label>
              <Input type="number" value={adjustDelta} onChange={(e) => setAdjustDelta(Number(e.target.value))} step={1} />
              <span className="text-[11px] text-text-muted mt-1 block">Positive = add stock, negative = deduct.</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Reason</label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="inbound">Inbound Restock / PO Receipt</option>
                <option value="audit">Physical Warehouse Audit</option>
                <option value="damaged">Damaged / Written-Off Units</option>
                <option value="transfer">Inter-warehouse Transfer</option>
              </select>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
