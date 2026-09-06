"use client";
import { CalendarClock, Repeat, Sparkles } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, EmptyState, PageHeader, StatCard } from "@/components/bento/bento";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlans } from "@/hooks/use-dealflow";
import { money, num, titleCase } from "@/lib/format";



export default function PortalSubscriptionsPage() {
  const { data, isLoading } = usePlans();
  const plans = (data ?? []).filter((p) => p.status !== "retired");
  const active = plans.filter((p) => p.status === "active");
  const monthly = active.reduce((s, p) => s + (p.interval === "annual" ? p.price / 12 : p.interval === "quarterly" ? p.price / 3 : p.price), 0);

  return (
    <>
      <PageHeader
        eyebrow="Customer portal"
        title="Your subscriptions"
        description="Service plans attached to your account. Changes are requested here and confirmed by your account team."
      />

      <BentoGrid>
        <StatCard label="Active plans" value={num(active.length)} icon={Repeat} tint="ember" />
        <StatCard label="Monthly equivalent" value={money(monthly, "EUR", true)} icon={CalendarClock} tint="honey" delay={0.05} />
        <StatCard label="Seats covered" value={num(active.reduce((s, p) => s + p.seats, 0))} tint="sand" delay={0.1} />
        <StatCard label="Available upgrades" value={num(plans.length - active.length)} icon={Sparkles} tint="clay" delay={0.15} />
      </BentoGrid>

      {isLoading ? (
        <BentoGrid className="lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </BentoGrid>
      ) : plans.length === 0 ? (
        <EmptyState title="No subscriptions" description="Ask your account team about service plans for your equipment." />
      ) : (
        <BentoGrid className="lg:grid-cols-3">
          {plans.map((plan, index) => (
            <BentoCard key={plan.id} delay={index * 0.05} tint={plan.status === "active" ? "plain" : "sand"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{titleCase(plan.interval)} billing</p>
                </div>
                <StatusBadge status={plan.status} />
              </div>

              <p className="mt-4 font-mono text-2xl font-semibold">{money(plan.price, plan.currency)}</p>
              <p className="text-xs text-muted-foreground">
                {num(plan.seats)} seats included · renews {titleCase(plan.interval)}
              </p>

              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex justify-end">
                <Button size="sm" variant={plan.status === "active" ? "outline" : "default"}>
                  {plan.status === "active" ? "Request change" : "Request this plan"}
                </Button>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      )}

      <BentoCard tint="sand">
        <BentoHeader title="Cancellations keep a notice period" />
        <p className="text-sm text-muted-foreground">
          A change request pauses renewal at the end of the current term rather than mid-cycle, so monitoring coverage never
          stops without warning.
        </p>
      </BentoCard>
    </>
  );
}
