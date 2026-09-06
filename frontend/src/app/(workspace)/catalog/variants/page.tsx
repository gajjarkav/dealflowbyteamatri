"use client";
import { useMemo, useState } from "react";
import { Boxes, Plus, Search } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, EmptyState, PageHeader, StatCard } from "@/components/bento/bento";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { qk, useApiMutation, useProducts } from "@/hooks/use-dealflow";
import { catalogService } from "@/lib/api/services";
import { money, num } from "@/lib/format";



export default function VariantsPage() {
  const { data: products, isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ productId: string; sku: string; label: string; price: number; status: "active" | "draft" | "discontinued" }>({
    productId: "",
    sku: "",
    label: "",
    price: 0,
    status: "active",
  });

  const mutation = useApiMutation(
    (values: typeof form) => catalogService.saveVariant(values.productId, values),
    { successMessage: "Variant saved", invalidate: [qk.products()], onDone: () => setOpen(false) },
  );

  const rows = useMemo(() => {
    const flat = (products ?? []).flatMap((product) =>
      product.variants.map((variant) => ({ ...variant, product: product.name, productId: product.id, category: product.category })),
    );
    return flat.filter((row) => `${row.label} ${row.sku} ${row.product}`.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Variant management"
        description="Variants are what your team actually quotes. Keep prices and lifecycle status accurate here."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" />
                New variant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New variant</DialogTitle>
                <DialogDescription>Attach a sellable variation to an existing product.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Product</Label>
                  <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {(products ?? []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="v-sku">SKU</Label>
                    <Input id="v-sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="v-price">Price</Label>
                    <Input
                      id="v-price"
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-label">Label</Label>
                  <Input
                    id="v-label"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="Stainless A4 · 40mm"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.productId}>
                  Save variant
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <BentoGrid>
        <StatCard label="Variants" value={num(rows.length)} icon={Boxes} tint="ember" />
        <StatCard label="Active" value={num(rows.filter((r) => r.status === "active").length)} tint="honey" delay={0.05} />
        <StatCard label="Draft" value={num(rows.filter((r) => r.status === "draft").length)} tint="sand" delay={0.1} />
        <StatCard label="Discontinued" value={num(rows.filter((r) => r.status === "discontinued").length)} tint="clay" delay={0.15} />
      </BentoGrid>

      <BentoCard padded={false} delay={0.1}>
        <div className="border-b border-border p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search variants by SKU, label or product"
              className="pl-9"
            />
          </div>
        </div>
        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-11 rounded-xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No variants match" description="Clear the search to see the full list." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="text-sm">{row.product}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.category}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{money(row.price)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{num(row.stock, true)}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </BentoCard>

      <BentoCard tint="sand">
        <BentoHeader title="Retire, don't delete" />
        <p className="text-sm text-muted-foreground">
          Marking a variant discontinued keeps historic quotes and invoices readable. Deleting it leaves past documents
          referencing an SKU that no longer resolves.
        </p>
      </BentoCard>
    </>
  );
}
