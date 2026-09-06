"use client";
import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable, Column } from "@/components/ui/data-table"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import { useParams, useRouter } from "next/navigation"
import { apiGetWarehouse, apiGetWarehouseStock, apiUpdateWarehouse, apiAdjustStock, WarehouseResponse, StockLevelResponse } from "@/lib/api/warehouses"
import { apiListProducts, ProductResponse } from "@/lib/api/catalog"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function WarehouseDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [warehouse, setWarehouse] = useState<WarehouseResponse | null>(null)
  const [formData, setFormData] = useState<Partial<WarehouseResponse>>({})
  const [stockLevels, setStockLevels] = useState<StockLevelResponse[]>([])
  const [products, setProducts] = useState<ProductResponse[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [adjustmentDrawerOpen, setAdjustmentDrawerOpen] = useState(false)
  const [adjustProductId, setAdjustProductId] = useState("")
  const [adjustType, setAdjustType] = useState<"add" | "remove">("add")
  const [adjustQty, setAdjustQty] = useState(0)
  const [adjustReason, setAdjustReason] = useState("")
  const [adjusting, setAdjusting] = useState(false)

  useEffect(() => {
    if (typeof id !== "string") return
    Promise.all([
      apiGetWarehouse(id),
      apiGetWarehouseStock(id),
      apiListProducts({ size: 100 })
    ])
    .then(([wh, stock, prods]) => {
      setWarehouse(wh)
      setFormData(wh)
      setStockLevels(stock)
      setProducts(prods.items)
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8"><Skeleton className="h-48 w-full" /></div>
  if (error || !warehouse) return <div className="p-8">Warehouse not found. <Link href="/warehouses" className="text-accent">Go back</Link></div>

  // Merge stock levels with product data for display
  const inventory = stockLevels.map(sl => {
    const p = products.find(prod => prod.id === sl.product_id)
    return {
      id: sl.id,
      product_id: sl.product_id,
      sku: p?.sku || "N/A",
      name: p?.name || "Unknown Product",
      qty_on_hand: sl.qty_on_hand,
      qty_reserved: sl.qty_reserved,
      available: sl.qty_on_hand - sl.qty_reserved
    }
  })

  const productColumns: Column<{product_id: string; sku: string; name: string; qty_on_hand: number; available: number}>[] = [
    { key: "sku", header: "SKU", render: (p) => <span className="font-mono text-xs">{p.sku}</span> },
    { key: "name", header: "Product", render: (p) => <span className="font-medium text-sm">{p.name}</span> },
    { 
      key: "on_hand", 
      header: "On Hand", 
      render: (p) => <span className="font-mono text-sm">{p.qty_on_hand}</span>
    },
    { 
      key: "available", 
      header: "Available", 
      render: (p) => (
        <span className={`font-mono text-sm font-bold ${p.available < 5 ? "text-danger" : "text-emerald-400"}`}>
          {p.available}
        </span>
      ) 
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (p) => (
        <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => {
          setAdjustProductId(p.product_id)
          setAdjustType("add")
          setAdjustQty(0)
          setAdjustReason("")
          setAdjustmentDrawerOpen(true)
        }}>
          Adjust
        </Button>
      )
    }
  ]

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof id !== "string") return
    try {
      const updated = await apiUpdateWarehouse(id, {
        name: formData.name,
        location: formData.location || undefined,
        is_active: formData.is_active
      })
      setWarehouse(updated)
      setFormData(updated)
      toast({ title: "Warehouse Updated", type: "success" })
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Error", type: "error" })
    }
  }

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof id !== "string" || !adjustProductId || adjustQty <= 0) return
    setAdjusting(true)
    try {
      const delta = adjustType === "add" ? adjustQty : -adjustQty
      await apiAdjustStock(id, {
        product_id: adjustProductId,
        delta,
        reason: adjustReason || undefined
      })
      const newStock = await apiGetWarehouseStock(id)
      setStockLevels(newStock)
      toast({ title: "Inventory Adjusted", type: "success" })
      setAdjustmentDrawerOpen(false)
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Error", type: "error" })
    } finally {
      setAdjusting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/warehouses")} className="px-2">&larr; Back</Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {formData.name}
            </h1>
            <p className="text-sm text-text-secondary mt-1">{formData.location || "No location set"} &bull; {formData.is_active ? "Active" : "Inactive"}</p>
          </div>
        </div>
        <Button onClick={handleSave}>Save Warehouse</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border-border bg-surface">
            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Configuration</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Facility Name</label>
                <Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Location</label>
                <Input value={formData.location || ""} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input 
                  type="checkbox" 
                  id="is_active" 
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="text-sm">Active</label>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-border bg-surface overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background">
              <h2 className="text-lg font-semibold text-text-primary">Inventory Levels</h2>
              <Button variant="secondary" size="sm" onClick={() => {
                setAdjustProductId("")
                setAdjustType("add")
                setAdjustQty(0)
                setAdjustReason("")
                setAdjustmentDrawerOpen(true)
              }}>Manual Adjustment</Button>
            </div>
            <div className="p-0">
              {inventory.length === 0 ? (
                <div className="text-center py-8 border-t border-border text-text-muted text-sm">
                  No stock data available. Add stock to see it here.
                </div>
              ) : (
                <DataTable
                  data={inventory}
                  columns={productColumns}
                  searchPlaceholder="Search inventory by SKU or Name..."
                  searchKey={(p) => `${p.sku} ${p.name}`}
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      <FormDrawer
        isOpen={adjustmentDrawerOpen}
        onClose={() => setAdjustmentDrawerOpen(false)}
        title="Manual Stock Adjustment"
        subtitle="Add or remove stock for a product."
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setAdjustmentDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjustmentSubmit} disabled={adjusting || !adjustProductId || adjustQty <= 0}>Confirm</Button>
          </>
        }
      >
        <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Product</label>
            <select
              value={adjustProductId}
              onChange={e => setAdjustProductId(e.target.value)}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
              required
            >
              <option value="">Select Product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Adjustment Type</label>
            <select 
              value={adjustType}
              onChange={e => setAdjustType(e.target.value as "add" | "remove")}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
            >
              <option value="add">Add Stock</option>
              <option value="remove">Remove Stock</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Quantity</label>
            <Input type="number" min="1" value={adjustQty || ""} onChange={e => setAdjustQty(parseInt(e.target.value) || 0)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Reason / Notes</label>
            <textarea 
              value={adjustReason}
              onChange={e => setAdjustReason(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-accent outline-none min-h-[80px]"
              placeholder="e.g. Audit reconciliation"
            />
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
