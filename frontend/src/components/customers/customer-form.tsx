"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Customer } from "@/lib/api/types";
import { useCurrentUser } from "@/lib/auth/context";

export type CustomerFormValues = {
  name: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  segment: string;
  tier: string;
  creditLimit: number;
  status: string;
  notes: string;
};

export function CustomerForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Customer>;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (values: CustomerFormValues) => void;
  onCancel?: () => void;
}) {
  const { user } = useCurrentUser();
  const isAdmin = user && "role" in user && user.role === "admin";

  const [values, setValues] = useState<CustomerFormValues>({
    name: initial?.name ?? "",
    contact: initial?.contact ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    country: initial?.country ?? "",
    segment: initial?.segment ?? "Mid-market",
    tier: initial?.tier ?? "Silver",
    creditLimit: initial?.creditLimit ?? 50000,
    status: initial?.status ?? "active",
    notes: "",
  });

  const set = <K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">Company name</Label>
          <Input id="name" required value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="Northwind Industrials" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact">Primary contact</Label>
          <Input id="contact" required value={values.contact} onChange={(e) => set("contact", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={values.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Input id="country" value={values.country} onChange={(e) => set("country", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Segment</Label>
          <Select value={values.segment} onValueChange={(v) => set("segment", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Enterprise", "Mid-market", "SMB"].map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Pricing tier</Label>
          {isAdmin ? (
            <Select value={values.tier} onValueChange={(v) => set("tier", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Platinum", "Gold", "Silver", "Bronze"].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="w-full h-9 rounded-md border border-border bg-surface-hover px-3 flex items-center text-sm capitalize text-text-muted cursor-not-allowed opacity-70">
              {values.tier}
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="credit">Credit limit</Label>
          <Input
            id="credit"
            type="number"
            min={0}
            step={1000}
            value={values.creditLimit}
            onChange={(e) => set("creditLimit", Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={values.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="on_hold">On credit hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="notes">Internal notes</Label>
          <Textarea
            id="notes"
            rows={3}
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Negotiation context, payment behaviour, key stakeholders…"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
