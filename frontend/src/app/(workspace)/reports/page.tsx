"use client"
import React from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ReportsPage() {
  const store = useDataStore()

  const totalWon = store.quotations
    .filter((q) => q.stage === "Accepted" || q.stage === "Done")
    .reduce((sum, q) => sum + q.totalAmount, 0)

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
          <Badge variant="outline" className="font-mono text-xs">Fiscal Q3 Ranking</Badge>
        </div>

        <div className="border border-border rounded overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background/80 border-b border-border font-mono text-text-secondary">
              <tr>
                <th className="p-3">Representative</th>
                <th className="p-3">Closed Volume</th>
                <th className="p-3">Average Margin Realized</th>
                <th className="p-3">Discount Discipline</th>
                <th className="p-3">Active Deals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr className="hover:bg-background/40 transition-colors">
                <td className="p-3">
                  <span className="font-semibold text-text-primary block">Alex Rivera</span>
                  <span className="text-[11px] text-text-muted font-mono">alex.rivera@dealflow360.com</span>
                </td>
                <td className="p-3 font-mono font-bold text-text-primary">$61,000</td>
                <td className="p-3 font-mono font-bold text-emerald-600">60.6%</td>
                <td className="p-3 font-mono text-text-primary">6.2% avg disc</td>
                <td className="p-3 font-mono">2 active</td>
              </tr>
              <tr className="hover:bg-background/40 transition-colors">
                <td className="p-3">
                  <span className="font-semibold text-text-primary block">Elena Rostova</span>
                  <span className="text-[11px] text-text-muted font-mono">elena.rostova@dealflow360.com</span>
                </td>
                <td className="p-3 font-mono font-bold text-text-primary">$45,900</td>
                <td className="p-3 font-mono font-bold text-emerald-600">60.2%</td>
                <td className="p-3 font-mono text-text-primary">6.5% avg disc</td>
                <td className="p-3 font-mono">2 active</td>
              </tr>
              <tr className="hover:bg-background/40 transition-colors">
                <td className="p-3">
                  <span className="font-semibold text-text-primary block">David Kim</span>
                  <span className="text-[11px] text-text-muted font-mono">david.kim@dealflow360.com</span>
                </td>
                <td className="p-3 font-mono font-bold text-text-primary">$179,200</td>
                <td className="p-3 font-mono font-bold text-amber-600">32.6%</td>
                <td className="p-3 font-mono text-accent">20.0% avg disc</td>
                <td className="p-3 font-mono">2 active</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
