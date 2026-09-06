"use client";
import { useState } from "react";
import { FileText, HandCoins, Send } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, EmptyState, PageHeader, StatCard } from "@/components/bento/bento";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useApiMutation, useQuotations } from "@/hooks/use-dealflow";
import { portalService } from "@/lib/api/services";
import { dateLabel, money, num, pct } from "@/lib/format";



export default function PortalQuotesPage() {
  const { data, isLoading } = useQuotations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [offers, setOffers] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");

  const quotes = data ?? [];
  const active = quotes.find((q) => q.id === activeId) ?? quotes[0];

  const propose = useApiMutation(
    () =>
      portalService.submitCounterOffer(active?.id ?? "", {
        note,
        lines: Object.entries(offers)
          .filter(([, v]) => v !== "")
          .map(([lineId, v]) => ({ lineId, requestedPrice: Number(v) })),
      }),
    {
      successMessage: "Proposal sent to your account team",
      onDone: () => {
        setOffers({});
        setNote("");
      },
    },
  );

  const proposedCount = Object.values(offers).filter((v) => v !== "").length;

  return (
    <>
      <PageHeader
        eyebrow="Customer portal"
        title="Your quotes"
        description="Every line, its quoted price and the option to propose a different one. Nothing you enter changes the quote on its own."
      />

      <BentoGrid>
        <StatCard label="Quotes" value={num(quotes.length)} icon={FileText} tint="ember" />
        <StatCard label="Awaiting your reply" value={num(quotes.filter((q) => q.status === "sent").length)} tint="honey" delay={0.05} />
        <StatCard label="Total quoted" value={money(quotes.reduce((s, q) => s + q.total, 0), "EUR", true)} tint="sand" delay={0.1} />
        <StatCard label="Lines proposed" value={num(proposedCount)} hint="in this draft" icon={HandCoins} tint="clay" delay={0.15} />
      </BentoGrid>

      {isLoading ? (
        <BentoGrid className="lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </BentoGrid>
      ) : quotes.length === 0 ? (
        <EmptyState title="No quotes yet" description="Your account team's quotes will appear here as soon as they're sent." />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
          <BentoCard padded={false} className="lg:col-span-1">
            <ul className="divide-y divide-border">
              {quotes.map((q) => (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(q.id)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60 ${
                      active?.id === q.id ? "bg-secondary" : ""
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block font-mono text-xs text-muted-foreground">{q.number}</span>
                      <span className="block truncate text-sm font-medium">{money(q.total, q.currency, true)}</span>
                    </span>
                    <StatusBadge status={q.status} />
                  </button>
                </li>
              ))}
            </ul>
          </BentoCard>

          {active ? (
            <BentoCard className="lg:col-span-2">
              <BentoHeader
                title={`Quote ${active.number}`}
                subtitle={`Valid until ${dateLabel(active.validUntil)} · discount ${pct((active.discount / Math.max(1, active.subtotal)) * 100)}`}
              />

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-3 font-medium">Item</th>
                      <th className="py-2 pr-3 font-medium">Qty</th>
                      <th className="py-2 pr-3 font-medium">Quoted</th>
                      <th className="py-2 font-medium">Your proposal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.lines.map((line) => (
                      <tr key={line.id} className="border-b border-border/60">
                        <td className="py-3 pr-3">
                          <span className="block font-medium">{line.product}</span>
                          <span className="block font-mono text-xs text-muted-foreground">{line.sku}</span>
                        </td>
                        <td className="py-3 pr-3 font-mono text-xs">{num(line.qty)}</td>
                        <td className="py-3 pr-3 font-mono text-xs">{money(line.unitPrice, active.currency)}</td>
                        <td className="py-3">
                          <Input
                            inputMode="decimal"
                            placeholder="—"
                            value={offers[line.id] ?? ""}
                            onChange={(e) => setOffers((o) => ({ ...o, [line.id]: e.target.value }))}
                            className="h-9 max-w-28"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="w-full sm:max-w-md">
                  <Textarea
                    rows={2}
                    placeholder="Context for your account team — volume commitment, competing quote, timing"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-semibold">{money(active.total, active.currency)}</span>
                  <Button size="sm" disabled={proposedCount === 0 || propose.isPending} onClick={() => propose.mutate(undefined)}>
                    <Send className="size-4" />
                    Send proposal
                  </Button>
                </div>
              </div>
            </BentoCard>
          ) : null}
        </div>
      )}
    </>
  );
}
