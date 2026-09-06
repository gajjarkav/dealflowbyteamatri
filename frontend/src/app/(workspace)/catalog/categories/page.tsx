"use client";
import { useState } from "react";
import { FolderTree, Layers, Plus } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, MiniBar, PageHeader, StatCard } from "@/components/bento/bento";
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
import { qk, useApiMutation, useCategories } from "@/hooks/use-dealflow";
import { catalogService } from "@/lib/api/services";
import { num, pct } from "@/lib/format";



export default function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", marginFloor: 20, ceiling: 15 });

  const mutation = useApiMutation((values: typeof form) => catalogService.createCategory(values), {
    successMessage: "Category created",
    invalidate: [qk.categories],
    onDone: () => setOpen(false),
  });

  const totalProducts = (data ?? []).reduce((sum, c) => sum + c.productCount, 0);

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Product categories"
        description="Categories carry the margin floor and discount ceiling that guard every quote line beneath them."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" />
                New category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New category</DialogTitle>
                <DialogDescription>Set the guardrails now — they apply to every product you add.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="cat-name">Name</Label>
                  <Input id="cat-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="cat-code">Code</Label>
                  <Input id="cat-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="IND-FST" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cat-floor">Margin floor %</Label>
                  <Input
                    id="cat-floor"
                    type="number"
                    value={form.marginFloor}
                    onChange={(e) => setForm({ ...form, marginFloor: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cat-ceiling">Discount ceiling %</Label>
                  <Input
                    id="cat-ceiling"
                    type="number"
                    value={form.ceiling}
                    onChange={(e) => setForm({ ...form, ceiling: Number(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
                  Create category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <BentoGrid>
        <StatCard label="Categories" value={num(data?.length ?? 0)} icon={FolderTree} tint="ember" />
        <StatCard label="Products" value={num(totalProducts)} icon={Layers} tint="honey" delay={0.05} />
        <StatCard label="Tightest ceiling" value="8%" hint="Spare Parts" tint="clay" delay={0.1} />
        <StatCard label="Highest floor" value="35%" hint="Spare Parts" tint="sand" delay={0.15} />
      </BentoGrid>

      {isLoading ? (
        <BentoGrid className="lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </BentoGrid>
      ) : (
        <BentoGrid className="lg:grid-cols-3">
          {(data ?? []).map((category, index) => (
            <BentoCard key={category.id} interactive delay={index * 0.04}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold">{category.name}</h3>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{category.code}</p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold">
                  {num(category.productCount)} SKUs
                </span>
              </div>
              {category.parent ? (
                <p className="mt-2 text-xs text-muted-foreground">Nested under {category.parent}</p>
              ) : null}
              <div className="mt-5 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Margin floor</span>
                    <span className="font-medium">{pct(category.marginFloor, 0)}</span>
                  </div>
                  <div className="mt-1.5">
                    <MiniBar value={category.marginFloor * 2} tone="moss" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Discount ceiling</span>
                    <span className="font-medium">{pct(category.ceiling, 0)}</span>
                  </div>
                  <div className="mt-1.5">
                    <MiniBar value={category.ceiling * 3} tone="honey" />
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-5 w-full">
                Edit guardrails
              </Button>
            </BentoCard>
          ))}
        </BentoGrid>
      )}

      <BentoCard tint="sand">
        <BentoHeader title="Why guardrails live on categories" />
        <p className="text-sm text-muted-foreground">
          Setting floors per category rather than per SKU keeps the rule set small enough for humans to reason about,
          while still catching the lines that actually erode margin.
        </p>
      </BentoCard>
    </>
  );
}
