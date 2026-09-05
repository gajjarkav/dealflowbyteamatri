"use client"
import React, { useState } from "react"
import { DataTable, Column } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"

export interface FulfillmentItem {
  id: string
  orderNumber: string
  customerName: string
  warehouseCode: string
  itemsSummary: string
  status: "Allocated" | "Picking" | "Dispatched" | "Backordered"
  trackingNumber: string
}

const INITIAL_FULFILLMENT: FulfillmentItem[] = [
  { id: "ful-1", orderNumber: "ORD-9921", customerName: "Vercel Frontends", warehouseCode: "US-WEST-02", itemsSummary: "2x Dual AMD EPYC Compute Blade", status: "Dispatched", trackingNumber: "FEDEX-8892-0192" },
  { id: "ful-2", orderNumber: "ORD-9922", customerName: "Stripe Enterprise", warehouseCode: "US-EAST-01", itemsSummary: "4x NVIDIA H100 SXM5 Node", status: "Allocated", trackingNumber: "Awaiting Carrier Pickup" },
  { id: "ful-3", orderNumber: "ORD-9923", customerName: "Snowflake Computing", warehouseCode: "EU-CENT-01", itemsSummary: "2x H100 Node (Split Shipment)", status: "Backordered", trackingNumber: "ETA 2 Business Days" }
]

export default function FulfillmentPage() {
  const { toast } = useToast()
  const [fulfillmentItems, setFulfillmentItems] = useState<FulfillmentItem[]>(INITIAL_FULFILLMENT)

  const handleUpdateStatus = (item: FulfillmentItem) => {
    const nextStatusMap: Record<FulfillmentItem["status"], FulfillmentItem["status"]> = {
      Allocated: "Picking",
      Picking: "Dispatched",
      Dispatched: "Allocated",
      Backordered: "Allocated"
    }
    const nextStatus = nextStatusMap[item.status]
    setFulfillmentItems((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: nextStatus } : f))
    )
    toast({
      title: "Fulfillment Status Advanced",
      description: `${item.orderNumber} is now marked as "${nextStatus}".`,
      type: "success"
    })
  }

  const columns: Column<FulfillmentItem>[] = [
    {
      key: "orderNumber",
      header: "Fulfillment Order",
      render: (f) => (
        <div>
          <span className="font-mono font-bold text-text-primary text-xs">{f.orderNumber}</span>
          <span className="text-xs text-text-secondary block font-sans">{f.customerName}</span>
        </div>
      )
    },
    {
      key: "warehouseCode",
      header: "Logistics Origin",
      render: (f) => (
        <Badge variant="secondary" className="font-mono text-xs border-border">
          {f.warehouseCode}
        </Badge>
      )
    },
    {
      key: "itemsSummary",
      header: "Allocation Summary",
      render: (f) => <span className="text-xs font-medium text-text-primary">{f.itemsSummary}</span>
    },
    {
      key: "status",
      header: "Dispatch Status",
      render: (f) => {
        const statusColors = {
          Allocated: "border-blue-500/50 text-blue-600 bg-blue-500/5",
          Picking: "border-amber-500/50 text-amber-600 bg-amber-500/5",
          Dispatched: "border-emerald-500/50 text-emerald-600 bg-emerald-500/5",
          Backordered: "border-danger text-danger bg-danger/5"
        }[f.status]

        return (
          <Badge variant="secondary" className={`font-mono text-xs ${statusColors}`}>
            {f.status}
          </Badge>
        )
      }
    },
    {
      key: "trackingNumber",
      header: "Tracking / Carrier",
      render: (f) => <span className="font-mono text-xs text-text-muted">{f.trackingNumber}</span>
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (f) => (
        <Button
          variant="ghost"
          className="h-7 px-2.5 text-xs text-accent hover:text-accent font-medium"
          onClick={() => handleUpdateStatus(f)}
        >
          Advance &rarr;
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Fulfillment & Stock Allocation</h1>
          <p className="text-sm text-text-secondary mt-1">
            Multi-warehouse split dispatch schedules, inventory reservation locks, and carrier tracking.
          </p>
        </div>

        <Badge variant="secondary" className="font-mono text-xs">
          Odoo Warehouse Synced
        </Badge>
      </div>

      <DataTable
        data={fulfillmentItems}
        columns={columns}
        searchPlaceholder="Search shipments by order or customer..."
        searchKey={(f) => `${f.orderNumber} ${f.customerName} ${f.warehouseCode}`}
        title="Active Dispatch Queue"
        subtitle="Split order routing across regional fulfillment centers"
      />
    </div>
  )
}
