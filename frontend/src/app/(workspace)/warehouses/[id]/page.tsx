"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable, Column } from "@/components/ui/data-table"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import { useParams, useRouter } from "next/navigation"

export default function WarehouseDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const store = useDataStore()
  const { toast } = useToast()
  
  // Assuming a generic warehouse since it's not strictly in the mockStore
  const [warehouse, setWarehouse] = useState({
    id: id as string,
    name: "Main Distribution Center (East)",
    location: "New York, NY",
    manager: "John Doe",
    status: "Operational"
  })

  const [adjustmentDrawerOpen, setAdjustmentDrawerOpen] = useState(false)
  
  // Build a stock table based on all products in the store for this warehouse
  const inventory = store.products.filter(p => p.category === "Hardware").map(p => ({
    ...p,
    warehouseStock: p.stockTotal // Just taking total stock for demo
  }))

  const productColumns: Column<{sku: string; name: string; warehouseStock: number}>[] = [
    { key: "sku", header: "SKU", render: (p) => <span className="font-mono text-xs">{p.sku}</span> },
    { key: "name", header: "Product", render: (p) => <span className="font-medium text-sm">{p.name}</span> },
    { 
      key: "stock", 
      header: "Available Stock", 
      render: (p) => (
        <span className={`font-mono text-sm font-bold ${p.warehouseStock < 5 ? "text-danger" : "text-emerald-600"}`}>
          {p.warehouseStock} Units
        </span>
      ) 
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: () => (
        <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => setAdjustmentDrawerOpen(true)}>
          Adjust
        </Button>
      )
    }
  ]

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast({ title: "Warehouse Updated", description: "Warehouse configuration saved.", type: "success" })
  }

  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({ title: "Inventory Adjusted", description: "Stock count manually reconciled.", type: "success" })
    setAdjustmentDrawerOpen(false)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/warehouses")} className="px-2">&larr; Back</Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {warehouse.name}
            </h1>
            <p className="text-sm text-text-secondary mt-1">{warehouse.location} &bull; {warehouse.status}</p>
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
                <Input value={warehouse.name} onChange={e => setWarehouse({...warehouse, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Location</label>
                <Input value={warehouse.location} onChange={e => setWarehouse({...warehouse, location: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Operations Manager</label>
                <Input value={warehouse.manager} onChange={e => setWarehouse({...warehouse, manager: e.target.value})} />
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-border bg-surface overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background">
              <h2 className="text-lg font-semibold text-text-primary">Inventory Levels</h2>
              <Button variant="secondary" size="sm" onClick={() => setAdjustmentDrawerOpen(true)}>Manual Adjustment</Button>
            </div>
            <div className="p-0">
              <DataTable
                data={inventory}
                columns={productColumns}
                searchPlaceholder="Search inventory by SKU or Name..."
                searchKey={(p) => `${p.sku} ${p.name}`}
              />
            </div>
          </Card>
        </div>
      </div>

      <FormDrawer
        isOpen={adjustmentDrawerOpen}
        onClose={() => setAdjustmentDrawerOpen(false)}
        title="Manual Stock Adjustment"
        subtitle="Reconcile physical inventory counts for the selected SKU."
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setAdjustmentDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjustmentSubmit}>Confirm Adjustment</Button>
          </>
        }
      >
        <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Adjustment Type</label>
            <select className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none">
              <option value="add">Add Stock (Received/Found)</option>
              <option value="remove">Remove Stock (Damaged/Lost)</option>
              <option value="set">Set Absolute Value (Audit)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Quantity</label>
            <Input type="number" min="0" placeholder="e.g. 5" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Reason / Notes</label>
            <textarea 
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-accent outline-none min-h-[80px]"
              placeholder="e.g. Discovered during Q3 audit..."
            />
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
