"use client";
import { useState } from "react";
import { Banknote, CreditCard, Landmark, Wallet } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, PageHeader, StatCard } from "@/components/bento/bento";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { qk, useApiMutation, useInvoices, usePayments } from "@/hooks/use-dealflow";
import { billingService } from "@/lib/api/services";
import { dateLabel, money, num, titleCase } from "@/lib/format";



const methodIcon = {
  card: CreditCard,
  bank_transfer: Landmark,
  sepa: Banknote,
  credit_note: Wallet,
} as const;

export default function PaymentsPage() {
  const { data: payments, isLoading } = usePayments();
  const { data: invoices } = useInvoices();
  const [form, setForm] = useState({ invoice: "", method: "bank_transfer", amount: "", reference: "", note: "" });

  const mutation = useApiMutation(
    (values: typeof form) => billingService.createPayment({ ...values, amount: Number(values.amount) }),
    {
      successMessage: "Payment recorded",
      invalidate: [qk.payments, qk.invoices],
      onDone: () => setForm({ invoice: "", method: "bank_transfer", amount: "", reference: "", note: "" }),
    },
  );

  const settled = (payments ?? []).filter((p) => p.status === "settled");
  const pending = (payments ?? []).filter((p) => p.status === "pending");

  return (
    <>
      <PageHeader
        eyebrow="Billing"
        title="Payments"
        description="Receipts as they land, and a single form to apply one against an open invoice."
      />

      <BentoGrid>
        <StatCard label="Received" value={money(settled.reduce((s, p) => s + p.amount, 0), "EUR", true)} tint="moss" />
        <StatCard label="Pending" value={money(pending.reduce((s, p) => s + p.amount, 0), "EUR", true)} tint="honey" delay={0.05} />
        <StatCard label="Payments" value={num(payments?.length ?? 0)} tint="ember" delay={0.1} />
        <StatCard label="Failed" value={num((payments ?? []).filter((p) => p.status === "failed").length)} tint="clay" delay={0.15} />
      </BentoGrid>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <BentoCard delay={0.05}>
          <BentoHeader title="Record a payment" subtitle="Applies immediately to the invoice balance" />
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Invoice</Label>
              <Select value={form.invoice} onValueChange={(v) => setForm({ ...form, invoice: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
                <SelectContent>
                  {(invoices ?? [])
                    .filter((invoice) => invoice.status !== "paid")
                    .map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.number}>
                        {invoice.number} · {money(invoice.amount - invoice.paid, invoice.currency)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(methodIcon).map((method) => (
                    <SelectItem key={method} value={method}>
                      {titleCase(method)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-amount">Amount</Label>
              <Input
                id="pay-amount"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-ref">Bank reference</Label>
              <Input
                id="pay-ref"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                placeholder="TRX-…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-note">Note</Label>
              <Textarea id="pay-note" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
            <Button
              className="w-full"
              disabled={!form.invoice || !form.amount || mutation.isPending}
              onClick={() => mutation.mutate(form)}
            >
              Record payment
            </Button>
          </div>
        </BentoCard>

        <BentoCard padded={false} className="lg:col-span-2" delay={0.1}>
          <div className="border-b border-border p-5">
            <BentoHeader title="Payment history" subtitle="Newest receipts first" />
          </div>
          {isLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(payments ?? []).map((payment) => {
                    const Icon = methodIcon[payment.method] ?? Wallet;
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                        <TableCell className="text-sm">{payment.invoice}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Icon className="size-4" />
                            {titleCase(payment.method)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{money(payment.amount, payment.currency)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{dateLabel(payment.receivedAt)}</TableCell>
                        <TableCell>
                          <StatusBadge status={payment.status} />
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

      <BentoCard tint="sand">
        <BentoHeader title="Partial payments need a plan, not just a record" />
        <p className="text-sm text-muted-foreground">
          When a receipt covers only part of a balance, capture the expected date for the rest in the note. Otherwise the
          invoice looks handled while the remaining amount quietly ages.
        </p>
      </BentoCard>
    </>
  );
}
