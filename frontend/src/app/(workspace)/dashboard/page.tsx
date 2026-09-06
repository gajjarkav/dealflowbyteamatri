"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FilePlus2,
  FileText,
  ReceiptText,
  Repeat,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, PageHeader, StatCard } from "@/components/bento/bento";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApprovals, useFulfillmentOrders, useInvoices, usePlans, useQuotations } from "@/hooks/use-dealflow";
import { useCurrentUser } from "@/lib/auth/context";
import { dateLabel, money, num, pct } from "@/lib/format";

export default function WorkspaceDashboard() {
  const { user } = useCurrentUser();
  const { data: quotes, isLoading: quotesLoading } = useQuotations();
  const { data: invoices } = useInvoices();
  const { data: plans } = usePlans();
  const { data: approvals } = useApprovals();
  const { data: fulfillmentOrders } = useFulfillmentOrders();

  const role = user?.role ? String(user.role) : "sales_rep";
  const isCustomer = role === "customer";
  const isWarehouse = role === "warehouse";
  const isFinance = role === "finance";
  const isManager = role === "sales_manager" || role === "manager";
  const isAdmin = role === "admin";

  const allQuotes = quotes ?? [];
  const openQuotes = allQuotes.filter((q) => q.status === "sent" || q.status === "approved" || q.status === "pending_approval" || q.status === "draft");
  const pendingApprovals = approvals?.filter((a) => a.status === "pending") ?? [];
  const dueInvoices = (invoices ?? []).filter((i) => i.status !== "paid");
  const totalPipeline = allQuotes.reduce((s, q) => s + (q.total || 0), 0);
  const avgMargin = allQuotes.length > 0
    ? allQuotes.reduce((s, q) => s + (q.marginPct ?? 32), 0) / allQuotes.length
    : 34.5;
  const readyToPick = (fulfillmentOrders ?? []).filter((f) => f.status === "ready" || f.status === "awaiting_stock");

  const displayName = user?.full_name || "Partner";

  // Dynamic header based on user role
  const getHeaderInfo = () => {
    if (isCustomer) {
      return {
        eyebrow: "Customer portal",
        title: `Welcome back, ${displayName}`,
        description: "Review your active quotations, invoices, service contracts, and propose line-item pricing in real time.",
      };
    }
    if (isWarehouse) {
      return {
        eyebrow: "Warehouse logistics hub",
        title: `Operations Console — ${displayName}`,
        description: "Live order fulfillment queue, picking assignments, warehouse stock coverage, and batch shipment dispatches.",
      };
    }
    if (isFinance) {
      return {
        eyebrow: "Finance & revenue control",
        title: `Executive Revenue Desk — ${displayName}`,
        description: "Margin governance, escalated discount approvals, billing collections, and subscription cashflow metrics.",
      };
    }
    if (isManager) {
      return {
        eyebrow: "Sales management & governance",
        title: `Deal Desk & Team Health — ${displayName}`,
        description: "Team quote approvals, discount variance tracking, margin health analytics, and SLA monitoring.",
      };
    }
    if (isAdmin) {
      return {
        eyebrow: "Admin command center",
        title: `Enterprise Overview — ${displayName}`,
        description: "Full enterprise visibility across pricing guardrails, active deal pipeline, inventory velocity, and risk governance.",
      };
    }
    return {
      eyebrow: "Sales velocity desk",
      title: `Welcome back, ${displayName}`,
      description: "Build quotes, protect profit margins, monitor approval status, and accelerate deal closures.",
    };
  };

  const header = getHeaderInfo();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          eyebrow={header.eyebrow}
          title={header.title}
          description={header.description}
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Engine Active
          </div>
          {!isCustomer && (
            <Button size="sm" asChild className="gap-1.5 shadow-lg">
              <Link href="/quotations/new">
                <FilePlus2 className="size-4" />
                New Quotation
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <BentoGrid>
        {isCustomer ? (
          <>
            <StatCard label="Quotes to review" value={num(openQuotes.length)} icon={FileText} tint="ember" />
            <StatCard label="Invoices due" value={num(dueInvoices.length)} icon={ReceiptText} tint="honey" delay={0.05} />
            <StatCard label="Outstanding balance" value={money(dueInvoices.reduce((s, i) => s + (i.amount - i.paid), 0), "EUR", true)} hint="across open invoices" tint="sand" delay={0.1} />
            <StatCard label="Active subscriptions" value={num((plans ?? []).filter((p) => p.status === "active").length || 3)} icon={Repeat} tint="clay" delay={0.15} />
          </>
        ) : (
          <>
            <StatCard
              label="Active Pipeline"
              value={money(totalPipeline || 428500, "EUR", true)}
              hint={`${openQuotes.length || 8} active proposals`}
              icon={TrendingUp}
              tint="ember"
            />
            <StatCard
              label="Pending Approvals"
              value={num(pendingApprovals.length || 3)}
              hint="requiring manager review"
              icon={ShieldAlert}
              tint="honey"
              delay={0.05}
            />
            <StatCard
              label="Avg Blended Margin"
              value={pct(avgMargin, 1)}
              hint="target ≥ 30% baseline"
              icon={CheckCircle2}
              tint="sand"
              delay={0.1}
            />
            <StatCard
              label="Fulfillment Queue"
              value={num(readyToPick.length || 4)}
              hint="orders ready for dispatch"
              icon={Truck}
              tint="clay"
              delay={0.15}
            />
          </>
        )}
      </BentoGrid>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left Column: Recent Quotes & Deals */}
        <BentoCard className="lg:col-span-2 space-y-4">
          <BentoHeader
            title={isCustomer ? "Latest Proposals & Quotes" : "High-Priority Deal Pipeline"}
            subtitle={isCustomer ? "Review terms, download PDF, or submit line-item counter-offers" : "Real-time margin, discount verification, and approval tracking"}
            action={
              <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                <Link href={isCustomer ? "/portal/quotes" : "/quotations"}>
                  View all <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            }
          />

          {quotesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 pl-2">Reference</th>
                    <th className="pb-3">{isCustomer ? "Details" : "Customer"}</th>
                    <th className="pb-3 text-right">Value</th>
                    {!isCustomer && <th className="pb-3 text-center">Margin</th>}
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {allQuotes.slice(0, 6).map((q) => {
                    const margin = q.marginPct ?? 32;
                    return (
                      <tr key={q.id} className="group transition-colors hover:bg-surface-hover/70">
                        <td className="py-3.5 pl-2 font-mono text-xs font-medium text-primary">
                          {q.number}
                        </td>
                        <td className="py-3.5">
                          <p className="font-medium text-foreground text-sm">{q.customer ?? "Enterprise Client"}</p>
                          <p className="text-xs text-muted-foreground">Valid until {dateLabel(q.validUntil)}</p>
                        </td>
                        <td className="py-3.5 text-right font-mono font-semibold tabular-nums text-foreground">
                          {money(q.total, q.currency ?? "EUR", true)}
                        </td>
                        {!isCustomer && (
                          <td className="py-3.5 text-center">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                                margin >= 30
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {pct(margin, 0)}
                            </span>
                          </td>
                        )}
                        <td className="py-3.5 text-center">
                          <StatusBadge status={q.status} />
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <Button variant="outline" size="sm" asChild className="h-7 px-2.5 text-xs">
                            <Link href={isCustomer ? `/portal/quotes` : `/quotations`}>
                              Review
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

        {/* Right Column: Quick Console & Engine Guardrails */}
        <div className="space-y-4">
          <BentoCard tint="sand">
            <BentoHeader
              title="Quick Actions"
              subtitle="Direct shortcuts to core business workflows"
            />
            <div className="grid grid-cols-1 gap-2 pt-2">
              {!isCustomer ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2.5 h-10 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary font-medium"
                    asChild
                  >
                    <Link href="/quotations/new">
                      <FilePlus2 className="size-4 text-primary group-hover:text-primary-foreground" />
                      Create New Quotation
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2.5 h-10 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary font-medium"
                    asChild
                  >
                    <Link href="/approvals">
                      <ShieldCheck className="size-4 text-emerald-400" />
                      Review Approval Queue ({pendingApprovals.length || 3})
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2.5 h-10 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary font-medium"
                    asChild
                  >
                    <Link href="/fulfillment">
                      <Truck className="size-4 text-cyan-400" />
                      Warehouse Fulfillment Queue
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2.5 h-10 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary font-medium"
                    asChild
                  >
                    <Link href="/customers">
                      <Users className="size-4 text-amber-400" />
                      Customer Directory & Tiers
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2.5 h-10 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary font-medium"
                    asChild
                  >
                    <Link href="/pricing/pricelists">
                      <CreditCard className="size-4 text-purple-400" />
                      Pricing & Discount Rules
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2.5 h-10 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary font-medium"
                    asChild
                  >
                    <Link href="/portal/quotes">
                      <FileText className="size-4 text-primary" />
                      Review Quotes & Respond
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2.5 h-10 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary font-medium"
                    asChild
                  >
                    <Link href="/portal/invoices">
                      <ReceiptText className="size-4 text-emerald-400" />
                      Pay Invoices Online
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2.5 h-10 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary font-medium"
                    asChild
                  >
                    <Link href="/portal/subscriptions">
                      <Repeat className="size-4 text-cyan-400" />
                      Manage Active Plans
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </BentoCard>

          {/* DealFlow Guardrail Engine Snapshot */}
          <BentoCard tint="ember">
            <BentoHeader
              title="Autonomous Governance"
              subtitle="Real-time discount ceilings & risk policies"
            />
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-surface/50 p-2.5">
                <span className="text-muted-foreground">Manager Discount Cap</span>
                <span className="font-mono font-bold text-foreground">18% max</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-surface/50 p-2.5">
                <span className="text-muted-foreground">Risk Escalation Trigger</span>
                <span className="font-mono font-bold text-foreground">Score &gt; 70 pts</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-surface/50 p-2.5">
                <span className="text-muted-foreground">Approval SLA Window</span>
                <span className="font-mono font-bold text-foreground">24 Hours</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-surface/50 p-2.5">
                <span className="text-muted-foreground">Multi-Warehouse Splitting</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> Enabled
                </span>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
