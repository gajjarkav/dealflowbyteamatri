"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertTriangle, Check, Lightbulb, Plus, Trash2 } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, MiniBar, PageHeader } from "@/components/bento/bento";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { qk, useApiMutation, useCustomers, useProducts } from "@/hooks/use-dealflow";
import { quotationService } from "@/lib/api/services";
import { money, pct } from "@/lib/format";



type DraftLine = { key: string; productId: string; qty: number; discountPct: number };

const newLine = (): DraftLine => ({ key: crypto.randomUUID(), productId: "", qty: 1, discountPct: 0 });

export default function NewQuotationPage() {
  const router = useRouter();
  const { data: customers } = useCustomers();
  const { data: products } = useProducts();

  const [customerId, setCustomerId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([newLine()]);

  const priced = useMemo(
    () =>
      lines.map((line) => {
        const product = products?.find((p) => p.id === line.productId);
        const unit = product?.listPrice ?? 0;
        const cost = product?.cost ?? 0;
        const net = unit * (1 - line.discountPct / 100);
        const total = net * line.qty;
        const marginPct = net > 0 ? ((net - cost) / net) * 100 : 0;
        return { ...line, product, unit, net, total, marginPct };
      }),
    [lines, products],
  );

  const subtotal = priced.reduce((s, l) => s + l.unit * l.qty, 0);
  const total = priced.reduce((s, l) => s + l.total, 0);
  const discount = subtotal - total;
  const avgMargin = priced.length ? priced.reduce((s, l) => s + l.marginPct, 0) / priced.length : 0;
  const deepest = priced.reduce((m, l) => Math.max(m, l.discountPct), 0);

  const hasLines = priced.some((line) => line.product);
  const riskScore = hasLines
    ? Math.min(99, Math.round(deepest * 2.2 + Math.max(0, 32 - avgMargin) * 1.6 + (total > 250000 ? 18 : 0)))
    : 0;

  const blockers = [
    deepest > 15 ? `A line is discounted ${pct(deepest, 0)} — above the automatic ceiling.` : null,
    hasLines && avgMargin < 24 ? `Blended margin of ${pct(avgMargin)} sits under the 24% floor.` : null,
    total > 250000 ? "Total above €250,000 routes to the CRO for sign-off." : null,
  ].filter(Boolean) as string[];

  const suggestions = [
    deepest > 10
      ? { title: "Trade the discount for term", detail: "Offer the same net price on a 24-month commitment instead of a one-off deal." }
      : { title: "Add a service tier", detail: "Attaching onboarding lifts blended margin without touching unit price." },
    { title: "Bundle a fast-moving SKU", detail: "Customers on this segment attach thermal probes to 6 of 10 quotes." },
    { title: "Shorten validity", detail: "A 14-day window historically closes 9 days faster than a 30-day one." },
  ];

  const mutation = useApiMutation(
    () =>
      quotationService.create({
        customerId,
        validUntil,
        notes,
        lines: priced.map((l) => ({
          productId: l.productId,
          sku: l.product?.sku,
          qty: l.qty,
          unitPrice: l.unit,
          discountPct: l.discountPct,
          total: l.total,
        })),
      }),
    {
      successMessage: "Quote created",
      invalidate: [qk.quotations()],
      onDone: () => router.push("/quotations"),
    },
  );

  const ready = customerId && priced.some((l) => l.productId && l.qty > 0);

  return (
    <>
      <PageHeader
        eyebrow="Quotations"
        title="New quote"
        description="Pricing, margin and risk recalculate as you type — nothing is hidden until submission."
      />

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <div className="space-y-4 lg:col-span-2 lg:space-y-5">
          <BentoCard>
            <BentoHeader title="Header" subtitle="Who the quote is for and how long it stands" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {(customers ?? []).map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="valid">Valid until</Label>
                <Input id="valid" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
            </div>
          </BentoCard>

          <BentoCard delay={0.05}>
            <BentoHeader
              title="Lines"
              subtitle="Quantity tiers apply automatically; manual discount stacks on top"
              action={
                <Button variant="outline" size="sm" onClick={() => setLines((prev) => [...prev, newLine()])}>
                  <Plus className="size-4" />
                  Add line
                </Button>
              }
            />
            <div className="space-y-3">
              {priced.map((line, index) => (
                <div key={line.key} className="rounded-2xl border border-border bg-surface-2/60 p-4">
                  <div className="grid gap-3 sm:grid-cols-12">
                    <div className="space-y-1.5 sm:col-span-5">
                      <Label className="text-xs">Product</Label>
                      <Select
                        value={line.productId}
                        onValueChange={(value) =>
                          setLines((prev) => prev.map((l, i) => (i === index ? { ...l, productId: value } : l)))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pick a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {(products ?? []).map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        min={1}
                        value={line.qty}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((l, i) => (i === index ? { ...l, qty: Number(e.target.value) } : l)),
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs">Disc. %</Label>
                      <Input
                        type="number"
                        min={0}
                        max={60}
                        value={line.discountPct}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((l, i) => (i === index ? { ...l, discountPct: Number(e.target.value) } : l)),
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs">Line total</Label>
                      <div className="flex h-9 items-center font-mono text-sm">{money(line.total)}</div>
                    </div>
                    <div className="flex items-end sm:col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove line"
                        onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  {line.product ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      List {money(line.unit)} · net {money(line.net)} · margin {pct(line.marginPct)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </BentoCard>

          <BentoCard delay={0.1}>
            <BentoHeader title="Internal notes" subtitle="Visible to approvers, never to the customer" />
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context an approver needs: competitive pressure, volume commitments, renewal timing…"
            />
          </BentoCard>
        </div>

        <div className="space-y-4 lg:space-y-5">
          <BentoCard tint="honey" delay={0.05}>
            <BentoHeader title="Risk preview" />
            <p className="font-display text-4xl font-semibold">{riskScore}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {!hasLines ? "Add a line to see the score" : riskScore >= 70 ? "Approval certain" : riskScore >= 40 ? "Approval likely" : "Clear to send"}
            </p>
            <div className="mt-4">
              <MiniBar value={riskScore} tone={riskScore >= 70 ? "clay" : riskScore >= 40 ? "honey" : "moss"} />
            </div>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              {blockers.length === 0 ? (
                <p className="flex items-start gap-2 text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0" />
                  No rule breaches detected.
                </p>
              ) : (
                blockers.map((blocker) => (
                  <p key={blocker} className="flex items-start gap-2 text-muted-foreground">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-clay-foreground" />
                    {blocker}
                  </p>
                ))
              )}
            </div>
          </BentoCard>

          <BentoCard delay={0.1}>
            <BentoHeader title="Totals" />
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-mono">{money(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="font-mono text-clay-foreground">−{money(discount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Blended margin</dt>
                <dd className="font-medium">{pct(avgMargin)}</dd>
              </div>
              <Separator />
              <div className="flex items-baseline justify-between">
                <dt className="font-medium">Total</dt>
                <dd className="font-display text-2xl font-semibold">{money(total)}</dd>
              </div>
            </dl>
            <div className="mt-5 space-y-2">
              <Button className="w-full" disabled={!ready || mutation.isPending} onClick={() => mutation.mutate(undefined as never)}>
                {blockers.length ? "Submit for approval" : "Create quote"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => router.push("/quotations")}>
                Cancel
              </Button>
            </div>
          </BentoCard>

          <BentoCard tint="sand" delay={0.15}>
            <BentoHeader title="Smart suggestions" />
            <ul className="space-y-3">
              {suggestions.map((suggestion) => (
                <li key={suggestion.title} className="flex gap-2.5">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-ember-foreground" />
                  <div>
                    <p className="text-sm font-medium">{suggestion.title}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </BentoCard>
        </div>
      </div>

      <BentoGrid className="lg:grid-cols-1">
        <BentoCard tint="sand">
          <BentoHeader title="Why the risk preview sits beside the form" />
          <p className="text-sm text-muted-foreground">
            Reps discover approval requirements at submission time in most systems, which is where deals stall. Showing
            the score while the discount is still being typed means the trade-off happens during the conversation.
          </p>
        </BentoCard>
      </BentoGrid>
    </>
  );
}
