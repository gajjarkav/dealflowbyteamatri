"use client";
import { useState } from "react";
import { Gauge, Save, ShieldCheck } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, MiniBar, PageHeader, StatCard } from "@/components/bento/bento";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { qk, useApiMutation, useCategoryCeilings } from "@/hooks/use-dealflow";
import { pricingService } from "@/lib/api/services";
import { num, pct } from "@/lib/format";



export default function CeilingsPage() {
  const { data, isLoading } = useCategoryCeilings();
  const [draft, setDraft] = useState<Record<string, { max: number; floor: number }>>({});

  const mutation = useApiMutation(
    (values: { id: string; maxDiscountPct: number; marginFloorPct: number }) => pricingService.saveCategoryCeiling(values),
    { successMessage: "Ceiling updated", invalidate: [qk.ceilings] },
  );

  return (
    <>
      <PageHeader
        eyebrow="Pricing & discounts"
        title="Category ceilings"
        description="The hard limits. A quote line above its category ceiling cannot be sent without approval."
      />

      <BentoGrid>
        <StatCard label="Categories guarded" value={num(data?.length ?? 0)} icon={ShieldCheck} tint="ember" />
        <StatCard label="Tightest ceiling" value={pct(10, 0)} hint="Cold Chain Units" tint="clay" delay={0.05} />
        <StatCard label="Highest floor" value={pct(31, 0)} hint="Cold Chain Units" icon={Gauge} tint="honey" delay={0.1} />
        <StatCard label="Owners" value="3" hint="Pricing Council + 2" tint="sand" delay={0.15} />
      </BentoGrid>

      {isLoading ? (
        <BentoGrid className="lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </BentoGrid>
      ) : (
        <BentoGrid className="lg:grid-cols-2">
          {(data ?? []).map((ceiling, index) => {
            const current = draft[ceiling.id] ?? { max: ceiling.maxDiscountPct, floor: ceiling.marginFloorPct };
            const dirty = current.max !== ceiling.maxDiscountPct || current.floor !== ceiling.marginFloorPct;
            return (
              <BentoCard key={ceiling.id} delay={index * 0.05} interactive>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">{ceiling.category}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">Owned by {ceiling.owner}</p>
                  </div>
                  {dirty ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        mutation.mutate({ id: ceiling.id, maxDiscountPct: current.max, marginFloorPct: current.floor })
                      }
                      disabled={mutation.isPending}
                    >
                      <Save className="size-4" />
                      Save
                    </Button>
                  ) : null}
                </div>

                <div className="mt-6 space-y-6">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Max discount</span>
                      <span className="font-display text-lg font-semibold">{pct(current.max, 0)}</span>
                    </div>
                    <Slider
                      className="mt-3"
                      value={[current.max]}
                      max={40}
                      step={1}
                      onValueChange={(values) =>
                        setDraft((prev) => ({ ...prev, [ceiling.id]: { ...current, max: values[0] ?? current.max } }))
                      }
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Margin floor</span>
                      <span className="font-display text-lg font-semibold">{pct(current.floor, 0)}</span>
                    </div>
                    <Slider
                      className="mt-3"
                      value={[current.floor]}
                      max={50}
                      step={1}
                      onValueChange={(values) =>
                        setDraft((prev) => ({ ...prev, [ceiling.id]: { ...current, floor: values[0] ?? current.floor } }))
                      }
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Headroom between floor and ceiling</p>
                    <div className="mt-2">
                      <MiniBar value={Math.max(0, current.floor - current.max) * 4} tone="moss" />
                    </div>
                  </div>
                </div>
              </BentoCard>
            );
          })}
        </BentoGrid>
      )}

      <BentoCard tint="sand">
        <BentoHeader title="Ceilings and floors should not collide" />
        <p className="text-sm text-muted-foreground">
          When the maximum discount pushes a line under its margin floor, both rules fire and reps see two conflicting
          blockers. Keep a few points of headroom so the guidance stays unambiguous.
        </p>
      </BentoCard>
    </>
  );
}
