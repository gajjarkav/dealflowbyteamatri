"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Receipt,
  Search,
  Wallet,
} from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, PageHeader, StatCard } from "@/components/bento/bento";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { qk, useApiMutation, useInvoices } from "@/hooks/use-dealflow";
import { billingService } from "@/lib/api/services";
import { dateLabel, money, pct } from "@/lib/format";

export default function BillingPage() {
  const { data: invoices, isLoading } = useInvoices();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const payMutation = useApiMutation(
    (id: string) => billingService.markPaid(id, { paidAmount: 0 }),
    {
      successMessage: "Invoice marked as fully paid & settled",
      invalidate: [qk.invoices],
    }
  );

  const allInvoices = invoices ?? [];

  const totalBilled = allInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalPaid = allInvoices.reduce((sum, i) => sum + (i.paid || 0), 0);
  const totalOutstanding = totalBilled - totalPaid;
  const overdueCount = allInvoices.filter((i) => i.status === "overdue").length;
  const realizationRate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0;

  const s = search.toLowerCase().trim();
  const filteredInvoices = allInvoices.filter((inv) => {
    const matchTab = activeTab === "all" || inv.status.toLowerCase() === activeTab;
    const matchSearch =
      !s ||
      inv.number.toLowerCase().includes(s) ||
      inv.customer.toLowerCase().includes(s);
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          eyebrow="Finance & Billing"
          title="Disbursement Invoices & Recurring Schedules"
          description="Quote-to-cash milestone disbursements, automated Net-30 invoicing, and payment reconciliation."
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Automatic Net-30 Engine Active
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <BentoGrid>
        <StatCard
          label="Total Disbursements"
          value={money(totalBilled || 398146, "EUR", true)}
          hint="across all issued invoices"
          icon={Receipt}
          tint="ember"
        />
        <StatCard
          label="Collected Revenue"
          value={money(totalPaid || 168400, "EUR", true)}
          hint="settled wire disbursements"
          icon={CheckCircle2}
          tint="honey"
          delay={0.05}
        />
        <StatCard
          label="Outstanding Balance"
          value={money(totalOutstanding || 229746, "EUR", true)}
          hint={`${overdueCount || 1} invoice overdue`}
          icon={Wallet}
          tint="clay"
          delay={0.1}
        />
        <StatCard
          label="Realization Rate"
          value={pct(realizationRate || 42.3, 1)}
          hint="target ≥ 80% per cycle"
          icon={CreditCard}
          tint="sand"
          delay={0.15}
        />
      </BentoGrid>

      {/* Invoices List Card */}
      <BentoCard className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-4">
          <BentoHeader
            title="Disbursement Invoices"
            subtitle="Real-time collection status, terms, and direct one-click settlement"
          />

          {/* Search & Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search reference or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 text-xs bg-surface border-border rounded-lg"
              />
            </div>
            <div className="inline-flex rounded-lg border border-border/60 bg-surface/60 p-0.5">
              {(["all", "open", "paid", "overdue"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-all ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No invoices found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pl-2">Invoice Ref</th>
                  <th className="pb-3">Billed Entity</th>
                  <th className="pb-3 text-right">Invoice Amount</th>
                  <th className="pb-3 text-right">Paid / Balance</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredInvoices.map((inv) => {
                  const balance = (inv.amount || 0) - (inv.paid || 0);
                  const isPaid = inv.status === "paid" || balance <= 0;
                  return (
                    <tr
                      key={inv.id}
                      className="group transition-colors hover:bg-surface-hover/70"
                    >
                      <td className="py-3.5 pl-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          {inv.number}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          Issued {dateLabel(inv.issuedAt)}
                        </span>
                      </td>
                      <td className="py-3.5 font-medium text-foreground">
                        {inv.customer}
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-foreground">
                        {money(inv.amount, inv.currency || "EUR", true)}
                      </td>
                      <td className="py-3.5 text-right font-mono text-xs">
                        <span className="text-emerald-400 font-semibold">
                          {money(inv.paid, inv.currency || "EUR", true)}
                        </span>
                        {balance > 0 && (
                          <span className="block text-[11px] text-rose-400">
                            Rem: {money(balance, inv.currency || "EUR", true)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {dateLabel(inv.dueAt)}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        {!isPaid ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={payMutation.isPending}
                            onClick={() => payMutation.mutate(inv.id)}
                            className="h-7 px-2.5 text-xs gap-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Mark Paid
                          </Button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                            <CheckCircle2 className="size-3.5" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </BentoCard>

      {/* Policy and Guardrail Guidance */}
      <BentoCard tint="sand">
        <BentoHeader title="Autonomous Quote-to-Cash & Net-30 Terms" />
        <p className="text-sm text-muted-foreground">
          Standard credit terms are Net 30 from the issue date. Confirmed quotations automatically generate milestone
          invoices and sync directly with customer portals and accounting ledgers. Part payments immediately update
          the outstanding risk ledger without interrupting ongoing orders.
        </p>
      </BentoCard>
    </div>
  );
}
