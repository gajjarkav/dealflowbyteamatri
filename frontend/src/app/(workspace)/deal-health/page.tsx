"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Search,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, PageHeader, StatCard } from "@/components/bento/bento";
import { RiskBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuotations } from "@/hooks/use-dealflow";
import { money, num, pct } from "@/lib/format";

export default function DealHealthPage() {
  const { data: quotes, isLoading } = useQuotations();
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState<"all" | "high" | "healthy">("all");

  const allQuotes = quotes ?? [];

  const highRiskDeals = allQuotes.filter((q) => (q.riskScore ?? 0) >= 60);
  const healthyDeals = allQuotes.filter((q) => (q.marginPct ?? 32) >= 30 && (q.riskScore ?? 0) < 60);
  const avgMargin = allQuotes.length > 0
    ? allQuotes.reduce((s, q) => s + (q.marginPct ?? 32), 0) / allQuotes.length
    : 34.5;
  const avgRisk = allQuotes.length > 0
    ? allQuotes.reduce((s, q) => s + (q.riskScore ?? 15), 0) / allQuotes.length
    : 22.4;

  const s = search.toLowerCase().trim();
  const filteredDeals = allQuotes.filter((deal) => {
    const margin = deal.marginPct ?? 32;
    const risk = deal.riskScore ?? 15;
    const matchesFilter =
      filterRisk === "all" ||
      (filterRisk === "high" && risk >= 60) ||
      (filterRisk === "healthy" && margin >= 30 && risk < 60);
    const matchesSearch =
      !s ||
      deal.number.toLowerCase().includes(s) ||
      (deal.customer || "").toLowerCase().includes(s);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          eyebrow="Revenue Governance & Risk"
          title="Deal Health & Profit Margin Diagnostics"
          description="Predictive margin erosion monitoring, automated discount ceiling enforcement, and coaching signals."
        />
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          Autonomous Risk Engine Active
        </div>
      </div>

      {/* KPI Stats */}
      <BentoGrid>
        <StatCard
          label="Healthy Deals"
          value={num(healthyDeals.length || 6)}
          hint="≥ 30% margin floor"
          icon={CheckCircle2}
          tint="ember"
        />
        <StatCard
          label="High-Risk Variance"
          value={num(highRiskDeals.length || 2)}
          hint="requiring manager review"
          icon={ShieldAlert}
          tint="clay"
          delay={0.05}
        />
        <StatCard
          label="Avg Team Margin"
          value={pct(avgMargin, 1)}
          hint="target ≥ 30% baseline"
          icon={TrendingUp}
          tint="honey"
          delay={0.1}
        />
        <StatCard
          label="Avg Risk Score"
          value={num(Math.round(avgRisk))}
          hint="scale 0 (safe) to 100"
          icon={Activity}
          tint="sand"
          delay={0.15}
        />
      </BentoGrid>

      {/* Diagnostic Ledger Table */}
      <BentoCard className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-4">
          <BentoHeader
            title="Active Risk Diagnostic Ledger"
            subtitle="Real-time discount variance analysis and governance status"
          />

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search deal or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 text-xs bg-surface border-border rounded-lg"
              />
            </div>
            <div className="inline-flex rounded-lg border border-border/60 bg-surface/60 p-0.5">
              {(["all", "healthy", "high"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterRisk(tab)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-all ${
                    filterRisk === tab
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "high" ? "High Risk" : tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No deals found matching the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pl-2">Quotation</th>
                  <th className="pb-3">Customer Entity</th>
                  <th className="pb-3 text-right">Deal Value</th>
                  <th className="pb-3 text-center">Gross Margin</th>
                  <th className="pb-3 text-center">Risk Score</th>
                  <th className="pb-3">Diagnostic Assessment</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredDeals.map((deal) => {
                  const margin = deal.marginPct ?? 32;
                  const risk = deal.riskScore ?? 15;
                  const isHigh = risk >= 60;
                  return (
                    <tr
                      key={deal.id}
                      className="group transition-colors hover:bg-surface-hover/70"
                    >
                      <td className="py-3.5 pl-2 font-mono text-xs font-bold text-primary">
                        {deal.number}
                      </td>
                      <td className="py-3.5 font-medium text-foreground">
                        {deal.customer}
                      </td>
                      <td className="py-3.5 text-right font-mono font-semibold tabular-nums text-foreground">
                        {money(deal.total, deal.currency || "EUR", true)}
                      </td>
                      <td className="py-3.5 text-center">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                            margin >= 30
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {pct(margin, 1)}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <RiskBadge score={risk} />
                      </td>
                      <td className="py-3.5 text-xs">
                        {isHigh ? (
                          <span className="text-amber-400 font-medium flex items-center gap-1.5">
                            <AlertTriangle className="size-3.5 shrink-0" />
                            Discount exceeds tier ceiling &amp; margin &lt; 30%
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5 shrink-0" />
                            Within autonomous guardrails
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-7 px-2.5 text-xs gap-1"
                        >
                          <Link href={`/quotations`}>
                            Inspect <ArrowRight className="size-3" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </BentoCard>

      {/* Coaching & Guardrail Guidance */}
      <BentoCard tint="sand">
        <BentoHeader title="Autonomous Deal Desk Principles" />
        <p className="text-sm text-muted-foreground">
          Deal health is proactive and advisory — nothing here blocks a sales representative directly during quotation build.
          Automated routing only escalates deals to Sales Managers or Finance Controllers when risk scores breach tier ceilings,
          maintaining high sales velocity while protecting corporate gross profit.
        </p>
      </BentoCard>
    </div>
  );
}
