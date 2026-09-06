"use client";
import { ArrowRight, Plus, Sparkles, Target } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, MiniBar, PageHeader, StatCard } from "@/components/bento/bento";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useUpsellRules } from "@/hooks/use-dealflow";
import { num, pct } from "@/lib/format";



export default function UpsellRulesPage() {
  const { data, isLoading } = useUpsellRules();
  const active = (data ?? []).filter((rule) => rule.active);
  const avgConversion = active.length ? active.reduce((s, r) => s + r.conversion, 0) / active.length : 0;

  return (
    <>
      <PageHeader
        eyebrow="Subscriptions & upsell"
        title="Upsell rules"
        description="Signals that turn usage into a conversation — each rule surfaces a suggestion, never an automatic charge."
        actions={
          <Button size="sm">
            <Plus className="size-4" />
            New rule
          </Button>
        }
      />

      <BentoGrid>
        <StatCard label="Rules" value={num(data?.length ?? 0)} icon={Sparkles} tint="ember" />
        <StatCard label="Active" value={num(active.length)} tint="honey" delay={0.05} />
        <StatCard label="Average conversion" value={pct(avgConversion)} icon={Target} tint="moss" delay={0.1} />
        <StatCard label="Best performer" value={pct(Math.max(0, ...(data ?? []).map((r) => r.conversion)))} tint="sand" delay={0.15} />
      </BentoGrid>

      {isLoading ? (
        <BentoGrid className="lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </BentoGrid>
      ) : (
        <BentoGrid className="lg:grid-cols-2">
          {(data ?? []).map((rule, index) => (
            <BentoCard key={rule.id} interactive delay={index * 0.05} tint={rule.active ? "plain" : "sand"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{rule.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{rule.trigger}</p>
                </div>
                <Switch defaultChecked={rule.active} />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium">{rule.planFrom}</span>
                <ArrowRight className="size-4 text-muted-foreground" />
                <span className="rounded-lg bg-honey/30 px-2.5 py-1 text-xs font-medium">{rule.planTo}</span>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">{rule.action}</p>

              <div className="mt-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Conversion</span>
                  <span className="font-medium">{pct(rule.conversion)}</span>
                </div>
                <div className="mt-2">
                  <MiniBar value={rule.conversion * 2} tone="moss" />
                </div>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      )}

      <BentoCard tint="sand">
        <BentoHeader title="Suggest, don't auto-upgrade" />
        <p className="text-sm text-muted-foreground">
          Automatic plan changes based on a usage threshold read as surprise billing and drive churn and disputes. A
          prompt to the account owner converts nearly as well and keeps the relationship intact.
        </p>
      </BentoCard>
    </>
  );
}
