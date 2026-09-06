"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FileText, Plus, Search, TrendingUp } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, EmptyState, PageHeader, StatCard } from "@/components/bento/bento";
import { RiskBadge, StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useQuotations } from "@/hooks/use-dealflow";
import { dateLabel, money, num, pct } from "@/lib/format";



const tabs = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "pending_approval", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export default function QuotationsPage() {
  const { data, isLoading } = useQuotations();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const quotes = useMemo(
    () =>
      (data ?? []).filter((quote) => {
        const matchesTab = tab === "all" || quote.status === tab;
        const matchesSearch = `${quote.number} ${quote.customer} ${quote.owner}`
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchesTab && matchesSearch;
      }),
    [data, tab, search],
  );

  const totalPages = Math.ceil(quotes.length / pageSize);
  const paginatedQuotes = quotes.slice((page - 1) * pageSize, page * pageSize);

  const totalValue = (data ?? []).reduce((s, q) => s + q.total, 0);
  const avgMargin = (data ?? []).reduce((s, q) => s + q.marginPct, 0) / Math.max(1, data?.length ?? 1);
  const highRisk = (data ?? []).filter((q) => q.riskScore >= 70).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Quotations"
        title="Quotes"
        description="Everything your team has priced — with the margin and risk position behind each number."
        actions={
          <Button size="sm" asChild>
            <Link href="/quotations/new">
              <Plus className="size-4" />
              New quote
            </Link>
          </Button>
        }
      />

      <BentoGrid>
        <StatCard label="Quotes" value={num(data?.length ?? 0)} icon={FileText} tint="ember" />
        <StatCard label="Total value" value={money(totalValue, "EUR", true)} tint="honey" delay={0.05} />
        <StatCard label="Average margin" value={pct(avgMargin)} icon={TrendingUp} tint="sand" delay={0.1} />
        <StatCard label="High risk" value={num(highRisk)} hint="score 70+" tint="clay" delay={0.15} />
      </BentoGrid>

      <BentoCard padded={false} delay={0.1}>
        <div className="flex flex-col gap-3 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList className="flex-wrap">
              {tabs.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search quotes, customers, owners"
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No quotes here"
              description="Nothing matches this filter yet."
              action={
                <Button size="sm" className="mt-3" asChild>
                  <Link href="/quotations/new">Build a quote</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid until</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedQuotes.map((quote, idx) => (
                  <TableRow 
                    key={quote.id} 
                    className="interactive-row animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "both" }}
                  >
                    <TableCell>
                      <Link href={`/quotations/${quote.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {quote.number}
                      </Link>
                      <p className="text-xs text-muted-foreground">{quote.lines.length} lines</p>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{quote.customer}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{quote.owner}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{money(quote.total, quote.currency, true)}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{pct(quote.marginPct)}</TableCell>
                    <TableCell>
                      <RiskBadge score={quote.riskScore} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={quote.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{dateLabel(quote.validUntil)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {totalPages > 1 && (
              <div className="border-t border-border p-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.max(1, p - 1));
                        }}
                        className={page === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          href="#"
                          isActive={page === i + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(i + 1);
                          }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.min(totalPages, p + 1));
                        }}
                        className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </BentoCard>

      <BentoCard tint="sand">
        <BentoHeader title="Risk score, plainly" />
        <p className="text-sm text-muted-foreground">
          The score blends discount depth against category ceilings, margin distance from the floor, customer credit
          position and stock availability. Anything at 70 or above will almost certainly need a sign-off.
        </p>
      </BentoCard>
    </div>
  );
}
