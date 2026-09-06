"use client";

import { useState } from "react";
import { Boxes, ClipboardCheck, PackageCheck, Truck } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, EmptyState, MiniBar, PageHeader, StatCard } from "@/components/bento/bento";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { qk, useApiMutation, useFulfillmentOrders } from "@/hooks/use-dealflow";
import { warehouseService } from "@/lib/api/services";
import { num } from "@/lib/format";

const statusCopy: Record<string, { label: string; tone: "primary" | "honey" | "clay" | "moss" }> = {
  awaiting_stock: { label: "Awaiting stock", tone: "clay" },
  split_pending: { label: "Split pending", tone: "honey" },
  ready: { label: "Ready to pick", tone: "primary" },
  fulfilled: { label: "Fulfilled", tone: "moss" },
};

export default function FulfillmentPage() {
  const { data, isLoading } = useFulfillmentOrders();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fulfil = useApiMutation(
    (input: { id: string; note: string }) => warehouseService.markFulfilled(input.id, { note: input.note }),
    { successMessage: "Order marked fulfilled", invalidate: [qk.fulfillment, qk.stockLevels()] },
  );

  const orders = data ?? [];
  const awaiting = orders.filter((o) => o.status === "awaiting_stock");
  const ready = orders.filter((o) => o.status === "ready");
  const fulfilled = orders.filter((o) => o.status === "fulfilled");
  const shortfall = orders.reduce(
    (s, o) => s + o.lines.reduce((ls, l) => ls + Math.max(0, l.required - l.available), 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          eyebrow="Warehouse Operations"
          title="Fulfilment queue"
          description="Every confirmed order, in quantities only. Prices, discounts and customer balances stay out of this panel."
        />
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Auto-Sync with Sales Engine
          </div>
        </div>
      </div>

      <BentoGrid>
        <StatCard label="Open orders" value={num(orders.length - fulfilled.length)} icon={Truck} tint="ember" />
        <StatCard label="Ready to pick" value={num(ready.length)} icon={PackageCheck} tint="honey" delay={0.05} />
        <StatCard label="Awaiting stock" value={num(awaiting.length)} icon={Boxes} tint="clay" delay={0.1} />
        <StatCard label="Unit shortfall" value={num(shortfall, true)} hint="across all lines" tint="sand" delay={0.15} />
      </BentoGrid>

      {isLoading ? (
        <BentoGrid className="lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </BentoGrid>
      ) : orders.length === 0 ? (
        <EmptyState title="Nothing to pick" description="Confirmed orders appear here as soon as sales closes them." />
      ) : (
        <BentoGrid className="lg:grid-cols-2">
          {orders.map((order, index) => {
            const status = statusCopy[order.status] ?? { label: order.status, tone: "primary" as const };
            const done = order.status === "fulfilled";
            return (
              <BentoCard key={order.id} delay={index * 0.05} tint={order.status === "awaiting_stock" ? "clay" : "plain"}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{order.reference}</p>
                    <h3 className="mt-1 text-base font-semibold">{order.customer}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Confirmed {new Date(order.confirmedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      done
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : order.status === "awaiting_stock"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-primary/10 text-primary border-primary/20"
                    }`}
                  >
                    {status.label}
                  </span>
                </div>

                <ul className="mt-4 space-y-3">
                  {order.lines.map((line) => {
                    const coverage = Math.min(100, (line.available / Math.max(1, line.required)) * 100);
                    return (
                      <li key={line.id} className="rounded-lg border border-border/40 bg-surface/40 p-2.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate font-medium">
                            {line.product} <span className="font-mono text-xs text-muted-foreground ml-1">{line.sku}</span>
                          </span>
                          <span className="font-mono text-xs font-semibold tabular-nums">
                            {num(line.available)} / {num(line.required)} units
                          </span>
                        </div>
                        <div className="mt-2">
                          <MiniBar value={coverage} tone={coverage < 100 ? "clay" : "moss"} />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Facility: {line.warehouse}</span>
                          <span className={coverage < 100 ? "text-rose-400 font-semibold" : "text-emerald-400"}>
                            {coverage < 100 ? `Short by ${line.required - line.available} units` : "100% In Stock"}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {!done && (
                  <div className="mt-5 space-y-2">
                    <Textarea
                      rows={2}
                      placeholder="Pick note (optional) — e.g. partial ship, batch numbers"
                      value={notes[order.id] ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [order.id]: e.target.value }))}
                      className="bg-surface border-border text-xs"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={fulfil.isPending}
                        onClick={() => fulfil.mutate({ id: order.id, note: notes[order.id] ?? "" })}
                        className="gap-1.5"
                      >
                        <ClipboardCheck className="size-4" />
                        Mark Fulfilled & Dispatch
                      </Button>
                    </div>
                  </div>
                )}
              </BentoCard>
            );
          })}
        </BentoGrid>
      )}

      <BentoCard tint="sand">
        <BentoHeader title="Automated Multi-Warehouse Decision Engine" />
        <p className="text-sm text-muted-foreground">
          When available stock is under required qty, DealFlow360 automatically computes optimal split shipment routes
          across primary and regional depots, minimizing freight surcharges while preventing customer promise-date breaches.
        </p>
      </BentoCard>
    </div>
  );
}
