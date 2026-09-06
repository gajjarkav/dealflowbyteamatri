"use client";
import Link from "next/link";
import { Boxes, MapPin, Plus, UserRound, Warehouse as WarehouseIcon } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, MiniBar, PageHeader, StatCard } from "@/components/bento/bento";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStockLevels, useWarehouses } from "@/hooks/use-dealflow";
import { num, pct } from "@/lib/format";



export default function WarehousesPage() {
  const { data, isLoading } = useWarehouses();
  const { data: stock } = useStockLevels();

  const avgUtilisation = (data ?? []).reduce((s, w) => s + w.utilisation, 0) / Math.max(1, data?.length ?? 1);
  const belowReorder = (stock ?? []).filter((s) => s.available < s.reorderPoint).length;

  return (
    <>
      <PageHeader
        eyebrow="Warehouse"
        title="Distribution sites"
        description="Capacity, utilisation and who to call when a site needs attention."
        actions={
          <Button size="sm">
            <Plus className="size-4" />
            Add warehouse
          </Button>
        }
      />

      <BentoGrid>
        <StatCard label="Sites" value={num(data?.length ?? 0)} icon={WarehouseIcon} tint="ember" />
        <StatCard label="Avg utilisation" value={pct(avgUtilisation, 0)} hint="target 70–85%" tint="honey" delay={0.05} />
        <StatCard label="Total capacity" value={num((data ?? []).reduce((s, w) => s + w.capacity, 0), true)} hint="pallet positions" icon={Boxes} tint="sand" delay={0.1} />
        <StatCard label="Below reorder" value={num(belowReorder)} hint="SKU / site combinations" tint="clay" delay={0.15} />
      </BentoGrid>

      {isLoading ? (
        <BentoGrid className="lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </BentoGrid>
      ) : (
        <BentoGrid className="lg:grid-cols-2">
          {(data ?? []).map((warehouse, index) => (
            <BentoCard key={warehouse.id} interactive delay={index * 0.05} tint={warehouse.utilisation > 85 ? "clay" : "plain"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{warehouse.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" />
                    {warehouse.city}, {warehouse.country} · <span className="font-mono">{warehouse.code}</span>
                  </p>
                </div>
                <StatusBadge status={warehouse.status} />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Utilisation</span>
                  <span className="font-medium">
                    {pct(warehouse.utilisation, 0)} of {num(warehouse.capacity, true)}
                  </span>
                </div>
                <div className="mt-2">
                  <MiniBar value={warehouse.utilisation} tone={warehouse.utilisation > 85 ? "clay" : "primary"} />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UserRound className="size-3.5" />
                  {warehouse.manager}
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/warehouse/stock">Stock</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/warehouse/adjustments">Adjust</Link>
                  </Button>
                </div>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      )}

      <BentoCard tint="sand">
        <BentoHeader title="Utilisation above 85% is a quoting risk" />
        <p className="text-sm text-muted-foreground">
          Milan South is at 91%. Sites this full slow down picking and increase promise-date slippage — worth flagging in
          the quote risk preview before committing lead times.
        </p>
      </BentoCard>
    </>
  );
}
