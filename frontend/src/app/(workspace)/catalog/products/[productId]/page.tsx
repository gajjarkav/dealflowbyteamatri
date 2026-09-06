"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Boxes, Package, Percent, Warehouse as WarehouseIcon } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, PageHeader, StatCard } from "@/components/bento/bento";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProduct, useStockLevels } from "@/hooks/use-dealflow";
import { money, num, pct } from "@/lib/format";



export default function ProductDetailPage() {
  const params = useParams();
  const rawId = params?.productId;
  const productId = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";
  const { data: product, isLoading } = useProduct(productId);
  const { data: stock } = useStockLevels();

  if (isLoading || !product) {
    return (
      <>
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </>
    );
  }

  const margin = ((product.listPrice - product.cost) / product.listPrice) * 100;
  const variantSkus = new Set(product.variants.map((v) => v.sku));
  const relatedStock = (stock ?? []).filter((s) => variantSkus.has(s.sku));

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title={product.name}
        description={product.description ?? ""}
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/catalog/products">
                <ArrowLeft className="size-4" />
                All products
              </Link>
            </Button>
            <Button size="sm">Edit product</Button>
          </>
        }
      />

      <BentoGrid>
        <StatCard label="List price" value={money(product.listPrice)} hint={`per ${product.uom}`} icon={Package} tint="ember" />
        <StatCard label="Cost" value={money(product.cost)} hint="landed cost" tint="sand" delay={0.05} />
        <StatCard label="Margin" value={pct(margin)} icon={Percent} tint="honey" delay={0.1} />
        <StatCard label="Total stock" value={num(product.stock, true)} icon={Boxes} tint="clay" delay={0.15} />
      </BentoGrid>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
        <BentoCard className="lg:col-span-2" padded={false}>
          <Tabs defaultValue="variants">
            <div className="border-b border-border px-5 pt-5">
              <TabsList>
                <TabsTrigger value="variants">Variants</TabsTrigger>
                <TabsTrigger value="stock">Stock by warehouse</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="variants" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variant</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell className="font-medium">{variant.label}</TableCell>
                      <TableCell className="font-mono text-xs">{variant.sku}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{money(variant.price)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{num(variant.stock, true)}</TableCell>
                      <TableCell>
                        <StatusBadge status={variant.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end p-5">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/catalog/variants">Manage all variants</Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="stock" className="m-0">
              {relatedStock.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground">No warehouse rows recorded for these variants yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">On hand</TableHead>
                      <TableHead className="text-right">Reserved</TableHead>
                      <TableHead className="text-right">Available</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatedStock.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.warehouse}</TableCell>
                        <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{num(row.onHand)}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{num(row.reserved)}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{num(row.available)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="pricing" className="m-0 space-y-4 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { label: "EU Enterprise 2026", price: product.listPrice * 0.92 },
                  { label: "Nordics Mid-market", price: product.listPrice * 0.95 },
                  { label: "UK Distributor", price: product.listPrice * 0.88 },
                  { label: "Legacy SMB 2025", price: product.listPrice },
                ].map((row) => (
                  <div key={row.label} className="rounded-xl bg-surface-2 p-4">
                    <p className="text-sm font-medium">{row.label}</p>
                    <p className="mt-1 font-mono text-lg">{money(row.price)}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/pricing/pricelists">Open pricelists</Link>
              </Button>
            </TabsContent>
          </Tabs>
        </BentoCard>

        <div className="flex flex-col gap-3 lg:gap-4">
          <BentoCard tint="honey" delay={0.05}>
            <BentoHeader title="Availability" subtitle="Across all warehouses" icon={WarehouseIcon} />
            <ul className="space-y-2.5 text-sm">
              {relatedStock.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-2 rounded-lg bg-card/70 px-3 py-2">
                  <span className="truncate">{row.warehouse}</span>
                  <span className="font-mono text-xs">{num(row.available)}</span>
                </li>
              ))}
              {relatedStock.length === 0 ? <li className="text-muted-foreground">No stock rows.</li> : null}
            </ul>
          </BentoCard>
          <BentoCard delay={0.1}>
            <BentoHeader title="Classification" />
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium">{product.category}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Base SKU</dt>
                <dd className="font-mono text-xs">{product.sku}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Unit</dt>
                <dd className="font-medium">{product.uom}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge status={product.status} />
                </dd>
              </div>
            </dl>
          </BentoCard>
        </div>
      </div>
    </>
  );
}
