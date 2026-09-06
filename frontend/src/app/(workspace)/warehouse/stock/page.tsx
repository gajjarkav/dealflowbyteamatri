"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, Search } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, EmptyState, MiniBar, PageHeader, StatCard } from "@/components/bento/bento";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStockLevels, useWarehouses } from "@/hooks/use-dealflow";
import { num } from "@/lib/format";



export default function StockLevelsPage() {
  const { data, isLoading } = useStockLevels();
  const { data: warehouses } = useWarehouses();
  const [search, setSearch] = useState("");
  const [site, setSite] = useState("all");

  const rows = useMemo(
    () =>
      (data ?? []).filter((row) => {
        const matchesSearch = `${row.sku} ${row.product}`.toLowerCase().includes(search.toLowerCase());
        const matchesSite = site === "all" || row.warehouseId === site;
        return matchesSearch && matchesSite;
      }),
    [data, search, site],
  );

  const critical = (data ?? []).filter((row) => row.available < row.reorderPoint);

  return (
    <>
      <PageHeader
        eyebrow="Warehouse"
        title="Stock levels"
        description="What's physically on hand, what's already promised, and what's actually sellable today."
        actions={
          <Button size="sm" asChild>
            <Link href="/warehouse/adjustments">New adjustment</Link>
          </Button>
        }
      />

      <BentoGrid>
        <StatCard label="Tracked rows" value={num(data?.length ?? 0)} icon={Boxes} tint="ember" />
        <StatCard label="Units on hand" value={num((data ?? []).reduce((s, r) => s + r.onHand, 0), true)} tint="honey" delay={0.05} />
        <StatCard label="Reserved" value={num((data ?? []).reduce((s, r) => s + r.reserved, 0), true)} hint="committed to quotes" tint="sand" delay={0.1} />
        <StatCard label="Below reorder" value={num(critical.length)} icon={AlertTriangle} tint="clay" delay={0.15} />
      </BentoGrid>

      {critical.length > 0 ? (
        <BentoCard tint="clay" delay={0.05}>
          <BentoHeader title="Replenish these first" subtitle="Available stock is under the reorder point" icon={AlertTriangle} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {critical.map((row) => (
              <div key={row.id} className="rounded-xl bg-card/75 p-4">
                <p className="text-sm font-medium">{row.product}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {row.sku} · {row.warehouse}
                </p>
                <div className="mt-3">
                  <MiniBar value={(row.available / row.reorderPoint) * 100} tone="clay" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {num(row.available)} available vs reorder point {num(row.reorderPoint)}
                </p>
              </div>
            ))}
          </div>
        </BentoCard>
      ) : null}

      <BentoCard padded={false} delay={0.1}>
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search SKU or product" className="pl-9" />
          </div>
          <Select value={site} onValueChange={setSite}>
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="Warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All warehouses</SelectItem>
              {(warehouses ?? []).map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-11 rounded-xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nothing to show" description="Adjust the filters to see stock rows." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">On hand</TableHead>
                  <TableHead className="text-right">Reserved</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="w-40">Vs reorder point</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const ratio = (row.available / row.reorderPoint) * 100;
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                      <TableCell className="font-medium">{row.product}</TableCell>
                      <TableCell className="text-sm">{row.warehouse}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{num(row.onHand)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{num(row.reserved)}</TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium">{num(row.available)}</TableCell>
                      <TableCell>
                        <MiniBar value={ratio} tone={ratio < 100 ? "clay" : ratio < 150 ? "honey" : "moss"} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </BentoCard>
    </>
  );
}
