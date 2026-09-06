"use client";
import { useState } from "react";
import { ArrowDownUp, ClipboardList, Loader2 } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, PageHeader, StatCard } from "@/components/bento/bento";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { qk, useApiMutation, useStockAdjustments, useStockLevels, useWarehouses } from "@/hooks/use-dealflow";
import { warehouseService } from "@/lib/api/services";
import { num } from "@/lib/format";
import { cn } from "@/lib/utils";



const reasons = [
  "Cycle count variance",
  "Damaged in transit",
  "Return to stock",
  "Write-off",
  "Supplier shortfall",
  "Reclassification",
];

export default function AdjustmentsPage() {
  const { data, isLoading } = useStockAdjustments();
  const { data: warehouses } = useWarehouses();
  const { data: stock } = useStockLevels();
  const [form, setForm] = useState({ sku: "", warehouse: "", quantity: 0, reason: reasons[0] ?? "", note: "" });

  const mutation = useApiMutation((values: typeof form) => warehouseService.createAdjustment(values), {
    successMessage: "Adjustment posted",
    invalidate: [qk.adjustments, qk.stockLevels()],
    onDone: () => setForm({ sku: "", warehouse: "", quantity: 0, reason: reasons[0] ?? "", note: "" }),
  });

  const increases = (data ?? []).filter((a) => a.quantity > 0).length;
  const decreases = (data ?? []).filter((a) => a.quantity < 0).length;

  return (
    <>
      <PageHeader
        eyebrow="Warehouse"
        title="Stock adjustments"
        description="Every correction is attributed to a person and a reason code so variance can be investigated later."
      />

      <BentoGrid>
        <StatCard label="Adjustments" value={num(data?.length ?? 0)} icon={ClipboardList} tint="ember" />
        <StatCard label="Increases" value={num(increases)} tint="honey" delay={0.05} />
        <StatCard label="Decreases" value={num(decreases)} tint="clay" delay={0.1} />
        <StatCard label="Awaiting posting" value={num((data ?? []).filter((a) => a.status === "draft").length)} tint="sand" delay={0.15} />
      </BentoGrid>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
        <BentoCard delay={0.05}>
          <BentoHeader title="New adjustment" subtitle="Posts immediately to the selected site" icon={ArrowDownUp} />
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate(form);
            }}
          >
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Select value={form.sku} onValueChange={(v) => setForm({ ...form, sku: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an SKU" />
                </SelectTrigger>
                <SelectContent>
                  {(stock ?? []).map((row) => (
                    <SelectItem key={row.id} value={row.sku}>
                      {row.sku}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Warehouse</Label>
              <Select value={form.warehouse} onValueChange={(v) => setForm({ ...form, warehouse: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a site" />
                </SelectTrigger>
                <SelectContent>
                  {(warehouses ?? []).map((w) => (
                    <SelectItem key={w.id} value={w.name}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qty">Quantity (negative to reduce)</Label>
              <Input
                id="qty"
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Reason code</Label>
              <Select value={form.reason} onValueChange={(v) => setForm({ ...form, reason: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                rows={3}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Pallet 4 short by 320 pieces, supplier notified."
              />
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending || !form.sku || !form.warehouse}>
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Post adjustment
            </Button>
          </form>
        </BentoCard>

        <BentoCard className="lg:col-span-2" padded={false} delay={0.1}>
          <div className="border-b border-border p-5">
            <BentoHeader title="Adjustment history" subtitle="Most recent first" icon={ClipboardList} />
          </div>
          {isLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>By</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data ?? []).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.reference}</TableCell>
                      <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                      <TableCell className="text-sm">{row.warehouse}</TableCell>
                      <TableCell
                        className={cn("text-right font-mono text-sm font-medium", row.quantity < 0 ? "text-destructive" : "text-moss")}
                      >
                        {row.quantity > 0 ? "+" : ""}
                        {num(row.quantity)}
                      </TableCell>
                      <TableCell className="text-sm">{row.reason}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.createdBy}</TableCell>
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
      </div>
    </>
  );
}
