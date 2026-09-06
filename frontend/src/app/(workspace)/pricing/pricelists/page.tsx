"use client";
import { useState } from "react";
import { CalendarRange, Plus, Tags } from "lucide-react";

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
import { qk, useApiMutation, usePricelists } from "@/hooks/use-dealflow";
import { pricingService } from "@/lib/api/services";
import { dateLabel, num } from "@/lib/format";



export default function PricelistsPage() {
  const { data, isLoading } = usePricelists();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", currency: "EUR", segment: "Enterprise", validFrom: "", validTo: "" });

  const mutation = useApiMutation((values: typeof form) => pricingService.createPricelist(values), {
    successMessage: "Pricelist created",
    invalidate: [qk.pricelists],
    onDone: () => setOpen(false),
  });

  return (
    <>
      <PageHeader
        eyebrow="Pricing & discounts"
        title="Pricelists"
        description="Each account resolves to exactly one active pricelist per currency and segment."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" />
                New pricelist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New pricelist</DialogTitle>
                <DialogDescription>Overlapping windows for the same segment will conflict — keep them sequential.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pl-name">Name</Label>
                  <Input id="pl-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["EUR", "GBP", "SEK", "USD"].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Segment</Label>
                    <Select value={form.segment} onValueChange={(v) => setForm({ ...form, segment: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Enterprise", "Mid-market", "SMB", "Distributor"].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pl-from">Valid from</Label>
                    <Input id="pl-from" type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pl-to">Valid to</Label>
                    <Input id="pl-to" type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
                  Create pricelist
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <BentoGrid>
        <StatCard label="Pricelists" value={num(data?.length ?? 0)} icon={Tags} tint="ember" />
        <StatCard label="Active now" value={num((data ?? []).filter((p) => p.status === "active").length)} tint="honey" delay={0.05} />
        <StatCard label="Scheduled" value={num((data ?? []).filter((p) => p.status === "scheduled").length)} icon={CalendarRange} tint="sand" delay={0.1} />
        <StatCard label="Priced items" value={num((data ?? []).reduce((s, p) => s + p.items, 0), true)} tint="clay" delay={0.15} />
      </BentoGrid>

      {isLoading ? (
        <BentoGrid className="lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </BentoGrid>
      ) : (
        <BentoGrid className="lg:grid-cols-2">
          {(data ?? []).map((list, index) => (
            <BentoCard key={list.id} interactive delay={index * 0.05} tint={list.status === "active" ? "honey" : "plain"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{list.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {list.segment} · {list.currency}
                  </p>
                </div>
                <StatusBadge status={list.status} />
              </div>
              <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Items</dt>
                  <dd className="mt-0.5 font-medium">{num(list.items)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Valid from</dt>
                  <dd className="mt-0.5 font-medium">{dateLabel(list.validFrom)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Valid to</dt>
                  <dd className="mt-0.5 font-medium">{dateLabel(list.validTo)}</dd>
                </div>
              </dl>
              <div className="mt-5 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Open items
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  Duplicate
                </Button>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      )}

      <BentoCard tint="sand">
        <BentoHeader title="Duplicate before you edit" />
        <p className="text-sm text-muted-foreground">
          Editing an active pricelist silently changes quotes still in draft. Duplicating into a scheduled list keeps
          in-flight negotiations stable and gives your team a switch-over date.
        </p>
      </BentoCard>
    </>
  );
}
