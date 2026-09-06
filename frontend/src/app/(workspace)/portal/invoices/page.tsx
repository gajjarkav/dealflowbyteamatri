"use client";
import { CreditCard, ReceiptText } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, EmptyState, MiniBar, PageHeader, StatCard } from "@/components/bento/bento";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoices } from "@/hooks/use-dealflow";
import { dateLabel, money, num } from "@/lib/format";



export default function PortalInvoicesPage() {
  const { data, isLoading } = useInvoices();
  const invoices = data ?? [];
  const outstanding = invoices.reduce((s, i) => s + (i.amount - i.paid), 0);
  const overdue = invoices.filter((i) => i.status === "overdue");

  return (
    <>
      <PageHeader
        eyebrow="Customer portal"
        title="Your invoices"
        description="Balances update as soon as a payment clears. Receipts are emailed to your billing contact."
      />

      <BentoGrid>
        <StatCard label="Invoices" value={num(invoices.length)} icon={ReceiptText} tint="ember" />
        <StatCard label="Outstanding" value={money(outstanding, "EUR", true)} tint="honey" delay={0.05} />
        <StatCard label="Overdue" value={num(overdue.length)} hint="please prioritise" tint="clay" delay={0.1} />
        <StatCard label="Paid this year" value={money(invoices.reduce((s, i) => s + i.paid, 0), "EUR", true)} tint="sand" delay={0.15} />
      </BentoGrid>

      {isLoading ? (
        <BentoGrid className="lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </BentoGrid>
      ) : invoices.length === 0 ? (
        <EmptyState title="No invoices yet" description="Invoices appear once an order is confirmed and shipped." />
      ) : (
        <BentoGrid className="lg:grid-cols-2">
          {invoices.map((invoice, index) => {
            const paidShare = (invoice.paid / Math.max(1, invoice.amount)) * 100;
            const balance = invoice.amount - invoice.paid;
            return (
              <BentoCard key={invoice.id} delay={index * 0.05} tint={invoice.status === "overdue" ? "clay" : "plain"}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{invoice.number}</p>
                    <h3 className="mt-1 font-mono text-xl font-semibold">{money(invoice.amount, invoice.currency)}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Issued {dateLabel(invoice.issuedAt)} · due {dateLabel(invoice.dueAt)}
                    </p>
                  </div>
                  <StatusBadge status={invoice.status} />
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Paid</span>
                    <span className="font-mono">{money(invoice.paid, invoice.currency, true)}</span>
                  </div>
                  <div className="mt-1.5">
                    <MiniBar value={paidShare} tone={paidShare >= 100 ? "moss" : "honey"} />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">
                    Balance <span className="font-mono font-medium text-foreground">{money(balance, invoice.currency)}</span>
                  </span>
                  {balance > 0 ? (
                    <Button size="sm">
                      <CreditCard className="size-4" />
                      Pay now
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" disabled>
                      Settled
                    </Button>
                  )}
                </div>
              </BentoCard>
            );
          })}
        </BentoGrid>
      )}

      <BentoCard tint="sand">
        <BentoHeader title="Payment terms" />
        <p className="text-sm text-muted-foreground">
          Standard terms are Net 30 from the issue date. Part payments are accepted and reduce the balance immediately —
          your credit limit frees up as soon as the payment clears.
        </p>
      </BentoCard>
    </>
  );
}
