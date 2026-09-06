"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Plus, Search, Users } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, EmptyState, MiniBar, PageHeader, StatCard } from "@/components/bento/bento";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCustomers } from "@/hooks/use-dealflow";
import { money, num } from "@/lib/format";



export default function CustomersPage() {
  const { data, isLoading } = useCustomers();
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("all");

  const customers = useMemo(() => {
    return (data ?? []).filter((customer) => {
      const matchesSearch = `${customer.name} ${customer.contact} ${customer.email}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesSegment = segment === "all" || customer.segment === segment;
      return matchesSearch && matchesSegment;
    });
  }, [data, search, segment]);

  const totalExposure = (data ?? []).reduce((sum, c) => sum + c.outstanding, 0);
  const totalLimit = (data ?? []).reduce((sum, c) => sum + c.creditLimit, 0);
  const onHold = (data ?? []).filter((c) => c.status === "on_hold").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customers"
        title="Accounts"
        description="Every buying entity with its credit position, tier and quoting history."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-4" />
              Export
            </Button>
            <Button size="sm" asChild>
              <Link href="/customers/new">
                <Plus className="size-4" />
                New customer
              </Link>
            </Button>
          </>
        }
      />

      <BentoGrid>
        <StatCard label="Accounts" value={num(data?.length ?? 0)} hint="4 active · 1 prospect" icon={Users} tint="ember" />
        <StatCard label="Credit granted" value={money(totalLimit, "EUR", true)} hint="across all tiers" tint="sand" delay={0.05} />
        <StatCard label="Outstanding" value={money(totalExposure, "EUR", true)} hint="live receivables" tint="honey" delay={0.1} />
        <StatCard label="On credit hold" value={num(onHold)} hint="blocked from new quotes" tint="clay" delay={0.15} />
      </BentoGrid>

      <BentoCard padded={false} delay={0.1}>
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, contact or email"
              className="pl-9"
            />
          </div>
          <Select value={segment} onValueChange={setSegment}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All segments</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
              <SelectItem value="Mid-market">Mid-market</SelectItem>
              <SelectItem value="SMB">SMB</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No matching accounts" description="Try a different search term or clear the segment filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Credit usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Link href={`/customers/${customer.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {customer.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {customer.country} · {customer.tier}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{customer.contact}</p>
                      <p className="text-xs text-muted-foreground">{customer.email}</p>
                    </TableCell>
                    <TableCell className="text-sm">{customer.segment}</TableCell>
                    <TableCell className="min-w-44">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono">{money(customer.outstanding, "EUR", true)}</span>
                        <span className="text-muted-foreground">{money(customer.creditLimit, "EUR", true)}</span>
                      </div>
                      <div className="mt-1.5">
                        <MiniBar
                          value={(customer.outstanding / customer.creditLimit) * 100}
                          tone={customer.outstanding / customer.creditLimit > 0.8 ? "clay" : "primary"}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={customer.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/customers/${customer.id}`}>
                          Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </BentoCard>

      <BentoCard tint="sand" delay={0.15}>
        <BentoHeader title="Credit hygiene tip" subtitle="Suggested workflow" />
        <p className="text-sm text-muted-foreground">
          Accounts above 80% credit utilisation are flagged in red. Consider requiring an approval step before quoting
          them rather than blocking outright — sales keeps momentum while finance keeps control.
        </p>
      </BentoCard>
    </div>
  );
}
