"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { apiListQuotations, type QuotationResponse } from "@/lib/api/quotations"

export default function ReportsPage() {
  const [quotations, setQuotations] = useState<QuotationResponse[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await apiListQuotations({ size: 100 })
      setQuotations(res.items)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const totalWon = quotations
    .filter((q) => q.status === "accepted" || q.status === "fulfilled")
    .reduce((sum, q) => sum + (q.total || 0), 0)

  if (loading) return <div className="p-8"><Skeleton className="h-64 w-full" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Executive Revenue & Governance Reports</h1>
        <p className="text-sm text-text-secondary mt-1">
          Closed deal volume, margin realization vs target, and sales representative performance leaderboard.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-border bg-surface">
          <div className="text-xs font-mono text-text-secondary">TOTAL CLOSED WON BOOKINGS</div>
          <div className="font-mono text-3xl font-extrabold text-emerald-600 mt-2">
            ${totalWon.toLocaleString()}
          </div>
          <div className="text-[11px] text-text-muted mt-2 font-mono">
            Fiscal 2026 Direct Deals
          </div>
        </Card>

        <Card className="p-5 border-border bg-surface">
          <div className="text-xs font-mono text-text-secondary">OVERALL DISCOUNT LEAKAGE</div>
          <div className="font-mono text-3xl font-extrabold text-accent mt-2">
            7.4%
          </div>
          <div className="text-[11px] text-emerald-600 mt-2 font-mono">
            -3.2% vs baseline before DealFlow360
          </div>
        </Card>

        <Card className="p-5 border-border bg-surface">
          <div className="text-xs font-mono text-text-secondary">AVERAGE DEAL CYCLE</div>
          <div className="font-mono text-3xl font-extrabold text-text-primary mt-2">
            4.2 <span className="text-sm font-normal text-text-secondary">days</span>
          </div>
          <div className="text-[11px] text-text-muted mt-2 font-mono">
            Down from 18 days manual email chain
          </div>
        </Card>
      </div>

      {/* Rep Leaderboard */}
      <Card className="p-6 border-border bg-surface space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Sales Representative Leaderboard</h2>
            <p className="text-xs text-text-secondary">Margin integrity and closed deal performance</p>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">Fiscal Q3 Ranking</Badge>
        </div>

        <DataTable
          data={[
            { id: "1", name: "Alex Rivera", email: "alex.rivera@dealflow360.com", volume: "$61,000", margin: "60.6%", disc: "6.2%", active: "2 active", marginScore: "high" },
            { id: "2", name: "Elena Rostova", email: "elena.rostova@dealflow360.com", volume: "$45,900", margin: "60.2%", disc: "6.5%", active: "2 active", marginScore: "high" },
            { id: "3", name: "David Kim", email: "david.kim@dealflow360.com", volume: "$179,200", margin: "32.6%", disc: "20.0%", active: "2 active", marginScore: "low" },
          ]}
          columns={[
            {
              key: "name",
              header: "Representative",
              render: (r) => (
                <div>
                  <span className="font-semibold text-text-primary block">{r.name}</span>
                  <span className="text-[11px] text-text-muted font-mono">{r.email}</span>
                </div>
              )
            },
            {
              key: "volume",
              header: "Closed Volume",
              render: (r) => <span className="font-mono font-bold text-text-primary">{r.volume}</span>
            },
            {
              key: "margin",
              header: "Average Margin Realized",
              render: (r) => (
                <span className={`font-mono font-bold ${r.marginScore === "high" ? "text-emerald-600" : "text-amber-600"}`}>
                  {r.margin}
                </span>
              )
            },
            {
              key: "disc",
              header: "Discount Discipline",
              render: (r) => (
                <span className={`font-mono ${r.marginScore === "low" ? "text-accent" : "text-text-primary"}`}>
                  {r.disc} avg disc
                </span>
              )
            },
            {
              key: "active",
              header: "Active Deals",
              render: (r) => <span className="font-mono">{r.active}</span>
            }
          ]}
          searchPlaceholder="Search representatives..."
          searchKey="name"
        />
      </Card>
    </div>
  )
}
