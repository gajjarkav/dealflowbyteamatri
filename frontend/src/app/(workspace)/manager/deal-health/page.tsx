"use client";
import Link from "next/link";
import { AlertTriangle, Gauge, ShieldAlert, TrendingDown } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, EmptyState, MiniBar, PageHeader, StatCard } from "@/components/bento/bento";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApprovals, useQuotations } from "@/hooks/use-dealflow";
import { money, num, pct } from "@/lib/format";



export default function DealHealthPage() {
  const { data: quotes, isLoading } = useQuotations();
  const { data: approvals } = useApprovals();

  const open = (quotes ?? []).filter((q) => q.status !== "won" && q.status !== "lost");
  const flagged = [...open]
    .map((q) => ({
      quote: q,
      reasons: [
        q.riskScore >= 70 ? "Risk score above threshold" : null,
        q.marginPct < 15 ? "Margin below floor" : null,
        q.discount / Math.max(1, q.subtotal) > 0.18 ? "Discount above manager cap" : null,
      ].filter(Boolean) as string[],
    }))
    .filter((row) => row.reasons.length > 0)
    .sort((a, b) => b.quote.riskScore - a.quote.riskScore);

  const avgRisk = open.reduce((s, q) => s + q.riskScore, 0) / Math.max(1, open.length);
  const exposure = flagged.reduce((s, r) => s + r.quote.total, 0);

  return (
    <>
      <PageHeader
        eyebrow="Sales manager"
        title="Deal health"
        description="Team-wide signals on risk, margin and discount pressure — the coaching view before the approval queue."
      />

      <BentoGrid>
        <StatCard label="Open deals" value={num(open.length)} icon={Gauge} tint="ember" />
        <StatCard label="Flagged" value={num(flagged.length)} hint="one or more signals" icon={AlertTriangle} tint="clay" delay={0.05} />
        <StatCard label="Avg risk score" value={num(Math.round(avgRisk))} hint="0–100" tint="honey" delay={0.1} />
        <StatCard label="Value at risk" value={money(exposure, "EUR", true)} hint="flagged deals" icon={TrendingDown} tint="sand" delay={0.15} />
      </BentoGrid>

      {isLoading ? (
        <BentoGrid className="lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </BentoGrid>
      ) : flagged.length === 0 ? (
        <EmptyState
          title="No deals flagged"
          description="Every open quote sits inside the risk, margin and discount guardrails."
        />
      ) : (
        <BentoGrid className="lg:grid-cols-2">
          {flagged.map(({ quote, reasons }, index) => (
            <BentoCard key={quote.id} interactive delay={index * 0.05} tint={quote.riskScore >= 70 ? "clay" : "plain"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{quote.number}</p>
                  <h3 className="mt-1 text-base font-semibold">{quote.customer}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Owner {quote.owner}</p>
                </div>
                <StatusBadge status={quote.status} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <Metric label="Total" value={money(quote.total, quote.currency, true)} />
                <Metric label="Margin" value={pct(quote.marginPct)} />
                <Metric label="Risk" value={num(quote.riskScore)} />
              </div>

              <div className="mt-4">
                <MiniBar value={quote.riskScore} tone={quote.riskScore >= 70 ? "clay" : "honey"} />
              </div>

              <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                {reasons.map((r) => (
                  <li key={r} className="flex items-center gap-2">
                    <ShieldAlert className="size-3.5 text-clay" />
                    {r}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex justify-end gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/quotations/${quote.id}`}>
                    Open quote
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/approvals">Approval queue</Link>
                </Button>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      )}

      <BentoCard tint="sand">
        <BentoHeader title={`${num((approvals ?? []).filter((a) => a.status === "pending").length)} approvals are waiting on you`} />
        <p className="text-sm text-muted-foreground">
          Deal health is advisory — nothing here blocks a rep. Blocking happens in the approval chain, where every decision
          needs a reason and lands in the audit trail.
        </p>
      </BentoCard>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}
