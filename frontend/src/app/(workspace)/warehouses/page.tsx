"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { DataTable, Column } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import type { WarehouseItem, StockItem } from "@/lib/data/mockStore"

export default function WarehousesPage() {
  const store = useDataStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"warehouses" | "stock">("stock")
  const [adjustingStock, setAdjustingStock] = useState<StockItem | null>(null)
  const [deltaQuantity, setDeltaQuantity] = useState(5)
  const [reason, setReason] = useState("Inbound Restock")

  const handlePerformAdjust = () => {
    if (!adjustingStock) return
    store.adjustStock(adjustingStock.id, deltaQuantity)
    toast({
      title: "Stock Level Adjusted",
      description: `${adjustingStock.productName} (${adjustingStock.warehouseCode}) updated by ${deltaQuantity > 0 ? `+${deltaQuantity}` : deltaQuantity} units.`,
      type: "success"
    })
    setAdjustingStock(null)
  }

  const warehouseColumns: Column<WarehouseItem>[] = [
    {
      key: "code",
      header: "Hub Code",
      render: (w) => <span className="font-mono text-xs font-bold text-text-primary">{w.code}</span>
    },
    {
      key: "name",
      header: "Warehouse Name",
      render: (w) => (
        <div>
          <div className="font-semibold text-text-primary">{w.name}</div>
          <div className="text-xs text-text-secondary">{w.location}</div>
        </div>
      )
    },
    {
      key: "capacityPercent",
      header: "Utilization",
      render: (w) => (
        <div className="flex items-center gap-2">
          <div className="w-20 bg-background border border-border h-2 rounded overflow-hidden">
            <div className="bg-accent h-full" style={{ width: `${w.capacityPercent}%` }} />
          </div>
          <span className="font-mono text-xs font-medium">{w.capacityPercent}%</span>
        </div>
      )
    },
    {
      key: "totalSkus",
      header: "Managed SKUs",
      render: (w) => <span className="font-mono text-xs">{w.totalSkus} SKUs</span>
    },
    {
      key: "manager",
      header: "Logistics Lead",
      render: (w) => <span className="text-xs text-text-secondary">{w.manager}</span>
    }
  ]

  const stockColumns: Column<StockItem>[] = [
    {
      key: "sku",
      header: "SKU Code",
      render: (s) => <span className="font-mono text-xs font-semibold text-text-primary">{s.sku}</span>
    },
    {
      key: "productName",
      header: "Product Title",
      render: (s) => <span className="font-medium text-text-primary">{s.productName}</span>
    },
    {
      key: "warehouseCode",
      header: "Hub Location",
      render: (s) => (
        <Badge variant="outline" className="font-mono text-xs border-border">
          {s.warehouseCode}
        </Badge>
      )
    },
    {
      key: "onHand",
      header: "On Hand",
      render: (s) => <span className="font-mono text-xs font-bold">{s.onHand}</span>
    },
    {
      key: "reserved",
      header: "Reserved (Quotes)",
      render: (s) => <span className="font-mono text-xs text-amber-600">{s.reserved}</span>
    },
    {
      key: "available",
      header: "Available to Promise",
      render: (s) => (
        <span className="font-mono text-xs font-bold text-emerald-600">
          {s.available}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (s) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            className="h-7 px-2.5 text-xs text-accent hover:text-accent font-medium"
            onClick={() => {
              setAdjustingStock(s)
              setDeltaQuantity(5)
            }}
          >
            Adjust Stock
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Warehouses & Live Stock</h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time multi-warehouse inventory sync, quote reservation locks, and manual balance adjustments.
          </p>
        </div>

        <div className="flex bg-surface border border-border rounded p-0.5">
          <button
            onClick={() => setActiveTab("stock")}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === "stock" ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Inventory On-Hand ({store.stock.length})
          </button>
          <button
            onClick={() => setActiveTab("warehouses")}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === "warehouses" ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Logistics Hubs ({store.warehouses.length})
          </button>
        </div>
      </div>

      {activeTab === "stock" ? (
        <DataTable
          data={store.stock}
          columns={stockColumns}
          searchPlaceholder="Search inventory by SKU, product, or hub..."
          searchKey={(s) => `${s.sku} ${s.productName} ${s.warehouseCode}`}
          title="Warehouse Stock Ledger"
          subtitle="Real-time availability synced with Odoo ERP"
        />
      ) : (
        <DataTable
          data={store.warehouses}
          columns={warehouseColumns}
          title="Fulfillment Distribution Hubs"
          subtitle="Regional distribution nodes for split-order fulfillment"
        />
      )}

      {/* Quick Adjust Dialog */}
      <Dialog
        isOpen={!!adjustingStock}
        onClose={() => setAdjustingStock(null)}
        title="Adjust Inventory Balance"
        subtitle={adjustingStock ? `${adjustingStock.productName} [${adjustingStock.warehouseCode}]` : ""}
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setAdjustingStock(null)}>
              Cancel
            </Button>
            <Button onClick={handlePerformAdjust}>
              Apply Stock Delta
            </Button>
          </>
        }
      >
        {adjustingStock && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-background border border-border rounded text-xs font-mono">
              <div>
                <span className="text-text-secondary block">Current On-Hand:</span>
                <span className="text-base font-bold text-text-primary">{adjustingStock.onHand}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Projected New Total:</span>
                <span className="text-base font-bold text-accent">
                  {Math.max(0, adjustingStock.onHand + deltaQuantity)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Adjustment Delta (+/-)</label>
              <Input
                type="number"
                value={deltaQuantity}
                onChange={(e) => setDeltaQuantity(Number(e.target.value))}
                step={1}
              />
              <span className="text-[11px] text-text-muted mt-1 block">
                Enter positive integer to add stock, negative to deduct.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Audit Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="Inbound Restock">Inbound Restock / PO Receipt</option>
                <option value="Physical Audit Correction">Physical Warehouse Audit Reconciliation</option>
                <option value="Damaged / Written-off">Damaged / Written-Off Units</option>
                <option value="Inter-warehouse Transfer">Inter-warehouse Rebalancing</option>
              </select>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
