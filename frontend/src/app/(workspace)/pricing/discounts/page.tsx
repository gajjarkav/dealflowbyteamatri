"use client";
import { Layers, Percent, ShieldAlert } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, MiniBar, PageHeader, StatCard } from "@/components/bento/bento";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDiscountTiers } from "@/hooks/use-dealflow";
import { num, pct } from "@/lib/format";



export default function DiscountTiersPage() {
  const { data, isLoading } = useDiscountTiers();

  return (
    <>
      <PageHeader
        eyebrow="Pricing & discounts"
        title="Discount tiers"
        description="Quantity breakpoints applied automatically on every quote line, before any manual override."
        actions={<Button size="sm">Add tier</Button>}
      />

      <BentoGrid>
        <StatCard label="Tiers" value={num(data?.length ?? 0)} icon={Layers} tint="ember" />
        <StatCard label="Max automatic" value={pct(8, 0)} hint="without approval" icon={Percent} tint="honey" delay={0.05} />
        <StatCard label="Needs approval" value={num((data ?? []).filter((t) => t.requiresApproval).length)} icon={ShieldAlert} tint="clay" delay={0.1} />
        <StatCard label="Highest tier" value={pct(19, 0)} hint="strategic override" tint="sand" delay={0.15} />
      </BentoGrid>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <>
          <BentoGrid className="lg:grid-cols-4">
            {(data ?? []).map((tier, index) => (
              <BentoCard key={tier.id} interactive delay={index * 0.05} tint={tier.requiresApproval ? "clay" : "plain"}>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{tier.name}</p>
                <p className="mt-3 font-display text-3xl font-semibold">{pct(tier.discountPct, 0)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {num(tier.minQty)}
                  {tier.maxQty ? `–${num(tier.maxQty)}` : "+"} units
                </p>
                <div className="mt-4">
                  <MiniBar value={tier.discountPct * 5} tone={tier.requiresApproval ? "clay" : "primary"} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{tier.appliesTo}</p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Approval</span>
                  <Switch defaultChecked={tier.requiresApproval} />
                </div>
              </BentoCard>
            ))}
          </BentoGrid>

          <BentoCard padded={false}>
            <div className="border-b border-border p-5">
              <BentoHeader title="Tier matrix" subtitle="How tiers resolve when quantities overlap" />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Min qty</TableHead>
                    <TableHead className="text-right">Max qty</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Approval</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data ?? []).map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell className="font-medium">{tier.name}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{num(tier.minQty)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{tier.maxQty ? num(tier.maxQty) : "—"}</TableCell>
                      <TableCell className="text-right font-medium">{pct(tier.discountPct, 0)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{tier.appliesTo}</TableCell>
                      <TableCell className="text-sm">{tier.requiresApproval ? "Required" : "Automatic"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </BentoCard>
        </>
      )}

      <BentoCard tint="sand">
        <BentoHeader title="Keep automatic tiers shallow" />
        <p className="text-sm text-muted-foreground">
          If the automatic ceiling is too generous, reps quote at the maximum by default and you lose the negotiating
          room. Deep discounts belong behind an approval step where they can be traded for volume or term.
        </p>
      </BentoCard>
    </>
  );
}
