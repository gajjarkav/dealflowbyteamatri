"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Package, Plus, Search, TrendingUp } from "lucide-react";

import { BentoCard, BentoGrid, EmptyState, PageHeader, StatCard } from "@/components/bento/bento";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCategories, useProducts } from "@/hooks/use-dealflow";
import { money, num, pct } from "@/lib/format";



export default function ProductsPage() {
  const { data, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const products = useMemo(
    () =>
      (data ?? []).filter((product) => {
        const matchesSearch = `${product.name} ${product.sku}`.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "all" || product.categoryId === category;
        return matchesSearch && matchesCategory;
      }),
    [data, search, category],
  );

  const avgMargin =
    (data ?? []).reduce((sum, p) => sum + ((p.listPrice - p.cost) / p.listPrice) * 100, 0) / Math.max(1, data?.length ?? 1);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Every sellable item with cost, list price, margin and the variants available to quote."
        actions={
          <Button size="sm">
            <Plus className="size-4" />
            New product
          </Button>
        }
      />

      <BentoGrid>
        <StatCard label="Products" value={num(data?.length ?? 0)} icon={Package} tint="ember" />
        <StatCard label="Variants" value={num((data ?? []).reduce((s, p) => s + p.variants.length, 0))} tint="honey" delay={0.05} />
        <StatCard label="Average margin" value={pct(avgMargin)} icon={TrendingUp} tint="sand" delay={0.1} />
        <StatCard label="Discontinued" value={num((data ?? []).filter((p) => p.status === "discontinued").length)} tint="clay" delay={0.15} />
      </BentoGrid>

      <BentoCard padded={false} delay={0.1}>
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name or SKU"
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categories ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No products found" description="Try another search term or category." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">List price</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const margin = ((product.listPrice - product.cost) / product.listPrice) * 100;
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Link href={`/catalog/products/${product.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {product.name}
                        </Link>
                        <p className="font-mono text-xs text-muted-foreground">
                          {product.sku} · {product.variants.length} variants
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{product.category}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{money(product.cost)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{money(product.listPrice)}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{pct(margin)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{num(product.stock, true)}</TableCell>
                      <TableCell>
                        <StatusBadge status={product.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </BentoCard>
    </div>
  );
}
