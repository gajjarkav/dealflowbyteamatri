"use client";
import Link from "next/link";
import { useState } from "react";
import { Check, Plus, Repeat, Users } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, PageHeader, StatCard } from "@/components/bento/bento";
import { StatusBadge } from "@/components/layout/status-badge";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { qk, useApiMutation, usePlans } from "@/hooks/use-dealflow";
import { subscriptionService } from "@/lib/api/services";
import { money, num, titleCase } from "@/lib/format";



export default function SubscriptionsPage() {
  const { data, isLoading } = usePlans();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", interval: "monthly", price: 0, seats: 10 });

  const mutation = useApiMutation((values: typeof form) => subscriptionService.savePlan(values as never), {
    successMessage: "Plan saved",
    invalidate: [qk.plans],
    onDone: () => setOpen(false),
  });

  const mrr = (data ?? []).reduce((s, p) => s + p.mrr, 0);
  const subscribers = (data ?? []).reduce((s, p) => s + p.subscribers, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Subscriptions & upsell"
        title="Plans"
        description="The recurring side of the business — what customers are on, and what each plan contributes."
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/subscriptions/upsell-rules">Upsell rules</Link>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="size-4" />
                  New plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New plan</DialogTitle>
                  <DialogDescription>Existing subscribers stay on their current plan until migrated.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="plan-name">Plan name</Label>
                    <Input id="plan-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Interval</Label>
                      <Select value={form.interval} onValueChange={(v) => setForm({ ...form, interval: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["monthly", "quarterly", "annual"].map((interval) => (
                            <SelectItem key={interval} value={interval}>
                              {titleCase(interval)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="plan-price">Price</Label>
                      <Input
                        id="plan-price"
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="plan-seats">Included seats</Label>
                      <Input
                        id="plan-seats"
                        type="number"
                        value={form.seats}
                        onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
                    Save plan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <BentoGrid>
        <StatCard label="MRR" value={money(mrr, "EUR", true)} icon={Repeat} tint="ember" />
        <StatCard label="Subscribers" value={num(subscribers)} icon={Users} tint="honey" delay={0.05} />
        <StatCard label="Plans" value={num(data?.length ?? 0)} tint="sand" delay={0.1} />
        <StatCard
          label="Average per account"
          value={money(mrr / Math.max(1, subscribers))}
          tint="moss"
          delay={0.15}
        />
      </BentoGrid>

      {isLoading ? (
        <BentoGrid className="lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </BentoGrid>
      ) : (
        <BentoGrid className="lg:grid-cols-3">
          {(data ?? []).map((plan, index) => (
            <BentoCard key={plan.id} interactive delay={index * 0.05} tint={index === 1 ? "honey" : "plain"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{plan.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{titleCase(plan.interval)} billing</p>
                </div>
                <StatusBadge status={plan.status} />
              </div>

              <p className="mt-5 font-display text-3xl font-semibold tracking-tight">
                {money(plan.price, plan.currency)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  /{plan.interval === "annual" ? "yr" : plan.interval === "quarterly" ? "qtr" : "mo"}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{num(plan.seats)} seats included</p>

              <ul className="mt-5 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-moss-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Subscribers</p>
                  <p className="mt-0.5 font-medium">{num(plan.subscribers)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">MRR</p>
                  <p className="mt-0.5 font-medium">{money(plan.mrr, plan.currency, true)}</p>
                </div>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      )}

      <BentoCard tint="sand">
        <BentoHeader title="Price changes need a migration plan" />
        <p className="text-sm text-muted-foreground">
          Editing a live plan&apos;s price surprises existing subscribers at their next renewal. Publish a new plan and move
          accounts deliberately, with notice, instead of editing in place.
        </p>
      </BentoCard>
    </div>
  );
}
