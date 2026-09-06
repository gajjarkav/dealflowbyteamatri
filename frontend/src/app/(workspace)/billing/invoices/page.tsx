"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CircleDollarSign, Clock, Receipt, Search } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, EmptyState, MiniBar, PageHeader, StatCard } from "@/components/bento/bento";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInvoices } from "@/hooks/use-dealflow";
import { dateLabel, money, num } from "@/lib/format";



const tabs = ["all", "open", "partial", "overdue", "paid"];

export default function InvoicesPage() {
  const { data, isLoading } = useInvoices();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const invoices = useMemo(
    () =>
      (data ?? []).filter(
        (invoice) =>
          (tab === "all" || invoice.status === tab) &&
          `${invoice.number} ${invoice.customer}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [data, tab, search],
  );

  const billed = (data ?? []).reduce((s, i) => s + i.amount, 0);
  const collected = (data ?? []).reduce((s, i) => s + i.paid, 0);
  const overdue = (data ?? []).filter((i) => i.status === "overdue").reduce((s, i) => s + (i.amount - i.paid), 0);

  return (
    <>
      <PageHeader
        eyebrow="Billing"
        title="Invoices"
        description="Issued documents and their collection state, ordered by how much cash they are holding up."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/billing/payments">Record a payment</Link>
          </Button>
        }
      />

      <BentoGrid>
        <StatCard label="Billed" value={money(billed, "EUR", true)} icon={Receipt} tint="ember" />
        <StatCard label="Collected" value={money(collected, "EUR", true)} icon={CircleDollarSign} tint="moss" delay={0.05} />
        <StatCard label="Outstanding" value={money(billed - collected, "EUR", true)} tint="honey" delay={0.1} />
        <StatCard label="Overdue" value={money(overdue, "EUR", true)} icon={Clock} tint="clay" delay={0.15} />
      </BentoGrid>

      <BentoCard delay={0.1}>
        <BentoHeader title="Collection rate" subtitle="Share of billed value already received" />
        <MiniBar value={(collected / Math.max(1, billed)) * 100} tone="moss" />
        <p className="mt-3 text-sm text-muted-foreground">
          {money(collected, "EUR", true)} of {money(billed, "EUR", true)} collected across {num(data?.length ?? 0)} invoices.
        </p>
      </BentoCard>

      <BentoCard padded={false} delay={0.15}>
        <div className="flex flex-col gap-3 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap">
              {tabs.map((value) => (
                <TabsTrigger key={value} value={value} className="capitalize">
                  {value}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices" className="pl-9" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nothing to collect here" description="No invoices match this filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell className="text-sm">{invoice.customer}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{dateLabel(invoice.issuedAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{dateLabel(invoice.dueAt)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{money(invoice.amount, invoice.currency)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{money(invoice.paid, invoice.currency)}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium">
                      {money(invoice.amount - invoice.paid, invoice.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </BentoCard>

      <BentoCard tint="sand">
        <BentoHeader title="Chase by balance, not by age" />
        <p className="text-sm text-muted-foreground">
          A three-day-old six-figure balance usually deserves attention before a small invoice that slipped 40 days.
          Sorting by outstanding value puts collection effort where the cash is.
        </p>
      </BentoCard>
    </>
  );
}
