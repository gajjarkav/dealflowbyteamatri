"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { motion, Variants } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiListQuotations, type QuotationResponse } from "@/lib/api/quotations"
import { apiListWarehouses } from "@/lib/api/warehouses"
import { apiListApprovals } from "@/lib/api/approvals"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  XAxis, 
  YAxis 
} from "recharts"
import { ArrowUpRight, BarChart3, Package, ShieldAlert, Zap } from "lucide-react"

const statusColors: Record<string, string> = {
  draft: "border-border text-text-secondary",
  pending_approval: "border-accent text-accent bg-accent-soft/30",
  approved: "border-blue-500/50 text-blue-600 bg-blue-500/10",
  revision_requested: "border-amber-500/50 text-amber-600 bg-amber-500/10",
  under_negotiation: "border-purple-500/50 text-purple-600 bg-purple-500/10",
  accepted: "border-emerald-500/50 text-emerald-600 bg-emerald-500/10",
  fulfilled: "border-emerald-600 text-emerald-700 bg-emerald-500/20",
  cancelled: "border-red-400/50 text-red-500 bg-red-500/10",
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function DashboardPage() {
  const [quotations, setQuotations] = useState<QuotationResponse[]>([])
  const [warehouseCount, setWarehouseCount] = useState(0)
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [qRes, wRes, aRes] = await Promise.allSettled([
          apiListQuotations({ page: 1, size: 15 }), // get more for chart
          apiListWarehouses({ page: 1, size: 1 }),
          apiListApprovals({ status: "pending", page: 1, size: 1 }),
        ])
        if (qRes.status === "fulfilled") setQuotations(qRes.value.items.reverse()) // Reverse for chronological chart feel
        if (wRes.status === "fulfilled") setWarehouseCount(wRes.value.total)
        if (aRes.status === "fulfilled") setPendingApprovalsCount(aRes.value.total)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalPipeline = quotations.reduce((s, q) => s + (q.total || 0), 0)
  const avgMargin =
    quotations.length > 0
      ? (
          quotations.reduce((s, q) => s + (q.gross_margin_pct || 0), 0) /
          quotations.length
        ).toFixed(1)
      : "0.0"

  // Generate chart data strictly from live backend quotations
  const chartData = quotations.map((q, i) => ({
    name: q.number || `Q-${i}`,
    value: q.total || 0,
    margin: q.gross_margin_pct || 0
  }))

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-text-primary tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-medium">
            Your live sales pipeline and pending actions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/approvals">
            <Button variant="secondary" className="shadow-sm font-medium">
              <ShieldAlert className="w-4 h-4 mr-2 text-accent" />
              Approvals ({pendingApprovalsCount})
            </Button>
          </Link>
          <Link href="/quotations/new">
            <Button className="font-heading font-bold bg-text-primary text-white hover:bg-text-secondary shadow-md">
              <Zap className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        <Card className="premium-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 className="w-16 h-16 text-text-primary" />
          </div>
          <div className="text-xs font-heading font-bold tracking-widest text-text-secondary uppercase">Pipeline Value</div>
          <div className="mt-4">
            <div className="font-heading text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tighter">
              {loading ? <Skeleton className="h-12 w-32 mt-1" /> : `$${totalPipeline.toLocaleString()}`}
            </div>
            <div className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1 bg-emerald-50 w-fit px-2 py-0.5 rounded-full border border-emerald-100">
              <ArrowUpRight className="w-3 h-3" /> Live Data
            </div>
          </div>
        </Card>

        <Card className="premium-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert className="w-16 h-16 text-accent" />
          </div>
          <div className="text-xs font-heading font-bold tracking-widest text-text-secondary uppercase">Pending Approvals</div>
          <div className="mt-4">
            <div className="font-heading text-4xl sm:text-5xl font-extrabold text-accent tracking-tighter">
              {loading ? <Skeleton className="h-12 w-16 mt-1" /> : pendingApprovalsCount}
            </div>
            <div className="text-xs text-text-muted font-medium mt-2">
              Action Required &lt; 24h
            </div>
          </div>
        </Card>

        <Card className="premium-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="text-xs font-heading font-bold tracking-widest text-text-secondary uppercase">Avg Margin</div>
          <div className="mt-4">
            <div className="font-heading text-4xl sm:text-5xl font-extrabold text-emerald-600 tracking-tighter">
              {loading ? <Skeleton className="h-12 w-24 mt-1" /> : `${avgMargin}%`}
            </div>
            <div className="text-xs text-text-muted font-medium mt-2">
              Across {quotations.length} active deals
            </div>
          </div>
        </Card>

        <Card className="premium-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Package className="w-16 h-16 text-blue-600" />
          </div>
          <div className="text-xs font-heading font-bold tracking-widest text-text-secondary uppercase">Active Hubs</div>
          <div className="mt-4">
            <div className="font-heading text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tighter">
              {loading ? <Skeleton className="h-12 w-16 mt-1" /> : warehouseCount}
            </div>
            <div className="text-xs text-blue-600 font-bold mt-2 flex items-center gap-1 bg-blue-50 w-fit px-2 py-0.5 rounded-full border border-blue-100">
              Live Connected
            </div>
          </div>
        </Card>

      </motion.div>

      {/* Main Sections Bento Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart & Table Area */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          
          {/* Live Pipeline Chart */}
          <Card className="premium-card p-6 h-[320px] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-heading font-bold text-text-primary">Pipeline Velocity</h2>
                <p className="text-xs text-text-secondary">Deal value mapped across recent quotations</p>
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              {loading ? (
                <div className="h-full w-full flex items-end gap-2 pb-4 pt-10">
                  <Skeleton className="w-1/6 h-[30%]" />
                  <Skeleton className="w-1/6 h-[50%]" />
                  <Skeleton className="w-1/6 h-[40%]" />
                  <Skeleton className="w-1/6 h-[70%]" />
                  <Skeleton className="w-1/6 h-[60%]" />
                  <Skeleton className="w-1/6 h-[80%]" />
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-sans)', fontSize: '12px' }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Deal Value'] as [string, string]}
                    />
                    <Area type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-text-muted text-sm border-2 border-dashed border-border rounded-lg">
                  No data to chart yet.
                </div>
              )}
            </div>
          </Card>

          {/* Recent Quotations */}
          <Card className="premium-card overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-text-primary">Active Flow</h2>
              <Link href="/pipeline" className="text-xs font-bold text-accent hover:underline">
                View All →
              </Link>
            </div>
            
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface-hover border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Client</th>
                    <th className="p-4 text-right">Value</th>
                    <th className="p-4 text-right">Margin</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {loading ? (
                     <>
                       {[1, 2, 3, 4, 5].map((i) => (
                         <tr key={i} className="border-b border-border/40">
                           <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                           <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                           <td className="p-4"><Skeleton className="h-4 w-20 ml-auto" /></td>
                           <td className="p-4"><Skeleton className="h-4 w-12 ml-auto" /></td>
                           <td className="p-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                         </tr>
                       ))}
                     </>
                  ) : quotations.length === 0 ? (
                     <tr><td colSpan={5} className="p-8 text-center text-text-muted">No deals in pipeline.</td></tr>
                  ) : (
                    quotations.slice(0, 5).map((q) => (
                      <tr key={q.id} className="interactive-row bg-surface">
                        <td className="p-4">
                          <Link href={`/quotations/${q.id}`} className="font-mono font-bold text-text-primary hover:text-accent">
                            {q.number}
                          </Link>
                        </td>
                        <td className="p-4 font-medium text-text-primary">{q.customer_name || "—"}</td>
                        <td className="p-4 text-right font-mono font-bold text-text-primary">
                          ${(q.total || 0).toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-mono font-bold">
                          <span className={(q.gross_margin_pct || 0) >= 40 ? "text-emerald-600" : "text-amber-600"}>
                            {q.gross_margin_pct != null ? `${q.gross_margin_pct.toFixed(1)}%` : "—"}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className={`font-mono text-[10px] ${statusColors[q.status] || ""}`}>
                            {q.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Card className="premium-card p-6">
            <h2 className="text-lg font-heading font-bold text-text-primary mb-1">Modules</h2>
            <p className="text-xs text-text-secondary mb-5 font-medium">Quick access to backend configurations</p>

            <div className="space-y-3">
              {[
                { href: "/discount-tiers", label: "Discount Strategy", desc: "Tiers & Category Caps" },
                { href: "/approval-rules", label: "Approval Chains", desc: "Governance Routing" },
                { href: "/warehouses", label: "Hub Stock", desc: "Multi-warehouse ledger" },
                { href: "/customers", label: "Accounts", desc: "CRM & Credit lines" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block p-4 rounded-xl border border-border bg-surface-hover hover:bg-surface hover:border-accent hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-primary group-hover:text-accent">
                      {item.label}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                  </div>
                  <div className="text-xs text-text-secondary mt-1 font-medium">{item.desc}</div>
                </Link>
              ))}

              <Link
                href="/portal"
                className="block p-4 rounded-xl border border-accent/30 bg-accent-soft/30 hover:bg-accent-soft hover:border-accent/60 transition-all mt-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-accent">Client Portal</span>
                  <ArrowUpRight className="w-4 h-4 text-accent" />
                </div>
                <div className="text-xs text-accent/70 mt-1 font-medium">Simulate buyer view</div>
              </Link>
            </div>
          </Card>
        </motion.div>
        
      </div>
    </motion.div>
  )
}
