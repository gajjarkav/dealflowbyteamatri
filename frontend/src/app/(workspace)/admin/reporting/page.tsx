"use client";
import { Activity, BarChart3, Percent, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { BentoCard, BentoGrid, BentoHeader, MiniBar, PageHeader, StatCard } from "@/components/bento/bento";
import { Skeleton } from "@/components/ui/skeleton";
import { useApprovals, useDashboard, useInvoices, useQuotations } from "@/hooks/use-dealflow";
import { money, num, pct } from "@/lib/format";



export default function AdminReportingPage() {
  const { data: stats, isLoading } = useDashboard();
  const { data: quotes } = useQuotations();
  const { data: approvals } = useApprovals();
  const { data: invoices } = useInvoices();

  const highRisk = (quotes ?? []).filter((q) => q.riskScore >= 70);
  const thinMargin = (quotes ?? []).filter((q) => q.marginPct < 15);
  const overdue = (invoices ?? []).filter((i) => i.status === "overdue");
  const slaBreach = (approvals ?? []).filter((a) => a.slaHoursLeft <= 0);

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Reporting & anomalies"
        description="One view across every panel: what was quoted, what was approved, what shipped and what got paid."
      />

      <BentoGrid>
        <StatCard label="Pipeline" value={money(stats?.pipelineValue ?? 0, "EUR", true)} icon={TrendingUp} tint="ember" />
        <StatCard label="Win rate" value={pct(stats?.winRate ?? 0)} icon={Percent} tint="honey" delay={0.05} />
        <StatCard label="Avg margin" value={pct(stats?.avgMargin ?? 0)} hint="post-discount" icon={BarChart3} tint="sand" delay={0.1} />
        <StatCard label="MRR" value={money(stats?.mrr ?? 0, "EUR", true)} hint="recurring lines" icon={Activity} tint="clay" delay={0.15} />
      </BentoGrid>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
        <BentoCard className="lg:col-span-2">
          <BentoHeader title="Revenue and quote volume" subtitle="Last six months" />
          {isLoading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.revenueSeries ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => num(Number(v), true)} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any, name: any) => (name === "revenue" ? money(Number(v)) : num(Number(v)))}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="quotes" stroke="var(--color-clay)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </BentoCard>

        <BentoCard>
          <BentoHeader title="Margin by category" subtitle="Weighted, post-discount" />
          {isLoading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.marginByCategory ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="category" stroke="var(--color-muted-foreground)" fontSize={11} interval={0} angle={-20} height={48} textAnchor="end" />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} unit="%" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => pct(Number(v))}
                  />
                  <Bar dataKey="margin" fill="var(--color-honey)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </BentoCard>
      </div>

      <BentoGrid className="lg:grid-cols-2">
        <BentoCard tint="clay">
          <BentoHeader title="Anomaly flags" subtitle="Worth a conversation this week" />
          <ul className="space-y-3 text-sm">
            <AnomalyRow label="Quotes scoring 70+ risk" value={num(highRisk.length)} share={(highRisk.length / Math.max(1, quotes?.length ?? 1)) * 100} />
            <AnomalyRow label="Quotes under 15% margin" value={num(thinMargin.length)} share={(thinMargin.length / Math.max(1, quotes?.length ?? 1)) * 100} tone="clay" />
            <AnomalyRow label="Approvals past SLA" value={num(slaBreach.length)} share={(slaBreach.length / Math.max(1, approvals?.length ?? 1)) * 100} tone="honey" />
            <AnomalyRow label="Overdue invoices" value={num(overdue.length)} share={(overdue.length / Math.max(1, invoices?.length ?? 1)) * 100} tone="clay" />
          </ul>
        </BentoCard>

        <BentoCard>
          <BentoHeader title="Cash exposure" subtitle="Invoiced but unpaid" />
          <p className="font-mono text-3xl font-semibold">
            {money((invoices ?? []).reduce((s, i) => s + (i.amount - i.paid), 0))}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Of which {money(overdue.reduce((s, i) => s + (i.amount - i.paid), 0))} is already overdue. Finance sees the same
            figures on the billing panel — reps never do, so discounting stays a margin conversation, not a cash one.
          </p>
        </BentoCard>
      </BentoGrid>
    </>
  );
}

function AnomalyRow({
  label,
  value,
  share,
  tone = "primary",
}: {
  label: string;
  value: string;
  share: number;
  tone?: "primary" | "honey" | "clay" | "moss";
}) {
  return (
    <li>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium">{value}</span>
      </div>
      <div className="mt-1.5">
        <MiniBar value={Math.min(100, share)} tone={tone} />
      </div>
    </li>
  );
}
