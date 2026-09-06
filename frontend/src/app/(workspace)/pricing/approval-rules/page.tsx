"use client";
import { useState } from "react";
import { Clock, GitBranch, Plus, Users } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, PageHeader, StatCard } from "@/components/bento/bento";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { qk, useApiMutation, useApprovalRules } from "@/hooks/use-dealflow";
import { pricingService } from "@/lib/api/services";
import { num } from "@/lib/format";



export default function ApprovalRulesPage() {
  const { data, isLoading } = useApprovalRules();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", trigger: "", threshold: "", slaHours: 12 });

  const mutation = useApiMutation((values: typeof form) => pricingService.saveApprovalRule(values), {
    successMessage: "Rule saved",
    invalidate: [qk.approvalRules],
    onDone: () => setOpen(false),
  });

  const active = (data ?? []).filter((r) => r.active);

  return (
    <>
      <PageHeader
        eyebrow="Pricing & discounts"
        title="Approval rules"
        description="Rules evaluate top to bottom when a quote is submitted. The first match determines the approval chain."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" />
                New rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New approval rule</DialogTitle>
                <DialogDescription>Keep the trigger narrow — broad rules queue everything and slow deals down.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="r-name">Rule name</Label>
                  <Input id="r-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-trigger">Trigger</Label>
                  <Input
                    id="r-trigger"
                    value={form.trigger}
                    onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                    placeholder="Quote total exceeds threshold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="r-threshold">Threshold</Label>
                    <Input
                      id="r-threshold"
                      value={form.threshold}
                      onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                      placeholder="> €250,000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-sla">SLA (hours)</Label>
                    <Input
                      id="r-sla"
                      type="number"
                      value={form.slaHours}
                      onChange={(e) => setForm({ ...form, slaHours: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
                  Save rule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <BentoGrid>
        <StatCard label="Rules" value={num(data?.length ?? 0)} icon={GitBranch} tint="ember" />
        <StatCard label="Active" value={num(active.length)} tint="honey" delay={0.05} />
        <StatCard label="Fastest SLA" value="6h" hint="credit hold override" icon={Clock} tint="clay" delay={0.1} />
        <StatCard label="Distinct approvers" value="5" icon={Users} tint="sand" delay={0.15} />
      </BentoGrid>

      {isLoading ? (
        <BentoGrid className="lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </BentoGrid>
      ) : (
        <BentoGrid className="lg:grid-cols-2">
          {(data ?? []).map((rule, index) => (
            <BentoCard key={rule.id} delay={index * 0.05} interactive tint={rule.active ? "plain" : "sand"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-md bg-secondary font-mono text-[11px] font-semibold">
                      {index + 1}
                    </span>
                    <h3 className="text-base font-semibold">{rule.name}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{rule.trigger}</p>
                </div>
                <Switch defaultChecked={rule.active} />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[11px] font-semibold">
                  {rule.threshold}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-honey/25 px-2.5 py-1 text-[11px] font-semibold text-honey-foreground">
                  <Clock className="size-3" />
                  {rule.slaHours}h SLA
                </span>
              </div>

              <div className="mt-5">
                <p className="text-xs text-muted-foreground">Approval chain</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {rule.approvers.map((approver, i) => (
                    <span key={approver} className="flex items-center gap-1.5">
                      <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium">{approver}</span>
                      {i < rule.approvers.length - 1 ? <span className="text-muted-foreground">→</span> : null}
                    </span>
                  ))}
                </div>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      )}

      <BentoCard tint="sand">
        <BentoHeader title="Sequential or parallel?" />
        <p className="text-sm text-muted-foreground">
          Chains longer than two approvers rarely finish inside a day. For large deals, run pricing and finance sign-off
          in parallel and reserve sequential chains for genuine escalations.
        </p>
      </BentoCard>
    </>
  );
}
