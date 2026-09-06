"use client";
import { useEffect, useState } from "react";
import { Save, SlidersHorizontal } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, PageHeader, StatCard } from "@/components/bento/bento";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { qk, useApiMutation, useAppSettings } from "@/hooks/use-dealflow";
import { pricingService } from "@/lib/api/services";



export default function AdminSettingsPage() {
  const { data, isLoading } = useAppSettings();
  const [values, setValues] = useState<Record<string, string | number | boolean>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (data) setValues(Object.fromEntries(data.map((s) => [s.key, s.value])));
  }, [data]);

  const save = useApiMutation(
    (input: { key: string; value: string | number | boolean }) =>
      pricingService.updateSetting(input.key, { value: input.value }),
    { successMessage: "Setting saved", invalidate: [qk.settings] },
  );

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Configuration"
        description="These values are read by the quoting engine, the approval chain and the customer portal at runtime."
      />

      <BentoGrid>
        <StatCard label="Policy keys" value={String(data?.length ?? 0)} icon={SlidersHorizontal} tint="ember" />
        <StatCard label="Risk threshold" value={String(values["risk_threshold"] ?? "—")} hint="score forcing review" tint="honey" delay={0.05} />
        <StatCard label="Manager cap" value={`${values["manager_discount_cap"] ?? "—"}%`} hint="approve without finance" tint="sand" delay={0.1} />
        <StatCard label="Approval SLA" value={`${values["approval_sla_hours"] ?? "—"}h`} hint="before breach" tint="clay" delay={0.15} />
      </BentoGrid>

      {isLoading ? (
        <BentoGrid className="lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </BentoGrid>
      ) : (
        <BentoGrid className="lg:grid-cols-2">
          {(data ?? []).map((setting, index) => {
            const value = values[setting.key] ?? setting.value;
            return (
              <BentoCard key={setting.key} delay={index * 0.04}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Label className="text-sm font-semibold">{setting.label}</Label>
                    <p className="mt-1 text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                  <span className="font-mono text-[11px] uppercase text-muted-foreground">{setting.key}</span>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  {setting.type === "boolean" ? (
                    <Switch
                      checked={Boolean(value)}
                      onCheckedChange={(checked) => {
                        setValues((v) => ({ ...v, [setting.key]: checked }));
                        save.mutate({ key: setting.key, value: checked });
                      }}
                    />
                  ) : (
                    <>
                      <Input
                        type={setting.type === "number" ? "number" : "text"}
                        value={String(value)}
                        onChange={(e) =>
                          setValues((v) => ({
                            ...v,
                            [setting.key]: setting.type === "number" ? Number(e.target.value) : e.target.value,
                          }))
                        }
                        className="max-w-40"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={save.isPending}
                        onClick={() => save.mutate({ key: setting.key, value: value })}
                      >
                        <Save className="size-4" />
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </BentoCard>
            );
          })}
        </BentoGrid>
      )}

      <BentoCard tint="sand">
        <BentoHeader title="Changing a cap doesn't rewrite history" />
        <p className="text-sm text-muted-foreground">
          Quotes already in the approval chain keep the policy that applied when they were submitted. New thresholds take
          effect on the next submission, so an audit reviewer can always reconstruct why a deal was approved.
        </p>
      </BentoCard>
    </>
  );
}
