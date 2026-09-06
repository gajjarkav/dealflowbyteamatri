"use client";
import { useRouter } from "next/navigation";
import { Receipt, Info, Loader2 } from "lucide-react";
import { useState } from "react";

import { BentoCard, BentoHeader, PageHeader } from "@/components/bento/bento";
import { qk, useApiMutation, useCustomers } from "@/hooks/use-dealflow";
import { billingService } from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewInvoicePage() {
  const router = useRouter();
  const { data: customersResponse } = useCustomers();
  const customers = Array.isArray(customersResponse) 
    ? customersResponse 
    : (customersResponse as any)?.items || [];

  const mutation = useApiMutation(
    (values: Record<string, unknown>) => billingService.createInvoice(values),
    {
      successMessage: "Invoice created successfully",
      invalidate: [qk.invoices],
      onDone: () => router.push("/billing"),
    }
  );

  const [formData, setFormData] = useState({
    customerId: "",
    amount: "",
    currency: "USD",
    dueAt: "",
  });

  const set = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.amount || !formData.dueAt) return;
    
    const selectedCustomer = customers.find((c: any) => c.id === formData.customerId);
    
    mutation.mutate({
      invoice_number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_id: formData.customerId,
      customer_name: selectedCustomer ? selectedCustomer.company_name || selectedCustomer.name : "Unknown",
      amount: parseFloat(formData.amount),
      due_date: formData.dueAt,
      status: "Draft",
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Billing"
        title="Create New Invoice"
        description="Generate a new invoice for a customer with a proper billing format."
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
        <BentoCard className="lg:col-span-2">
          <BentoHeader title="Invoice Details" subtitle="Enter the billing information below" icon={Receipt} />
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Customer</Label>
                <Select value={formData.customerId} onValueChange={(v) => set("customerId", v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.company_name || c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => set("amount", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select value={formData.currency} onValueChange={(v) => set("currency", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dueAt">Due Date</Label>
                <Input
                  id="dueAt"
                  type="date"
                  required
                  value={formData.dueAt}
                  onChange={(e) => set("dueAt", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => router.push("/billing")}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {mutation.isPending ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </form>
        </BentoCard>

        <div className="flex flex-col gap-3 lg:gap-4">
          <BentoCard tint="honey" delay={0.05}>
            <BentoHeader title="Billing Process" icon={Info} />
            <ol className="space-y-3 text-sm text-muted-foreground mt-4">
              <li>1 · The invoice will be generated and marked as open.</li>
              <li>2 · It will appear in the customer's portal for payment.</li>
              <li>3 · You can track the payment status in the billing dashboard.</li>
            </ol>
          </BentoCard>
          <BentoCard tint="sand" delay={0.1}>
            <BentoHeader title="UX note" />
            <p className="text-sm text-muted-foreground mt-2">
              Ensure the amount and currency are accurate before creating. Invoices cannot be modified once they are sent to the customer portal.
            </p>
          </BentoCard>
        </div>
      </div>
    </>
  );
}
