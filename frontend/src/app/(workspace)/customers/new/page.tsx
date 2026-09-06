"use client";
import { useRouter } from "next/navigation";
import { Building2, Info } from "lucide-react";

import { BentoCard, BentoHeader, PageHeader } from "@/components/bento/bento";
import { CustomerForm } from "@/components/customers/customer-form";
import { qk, useApiMutation } from "@/hooks/use-dealflow";
import { customerService } from "@/lib/api/services";
import type { Customer } from "@/lib/api/types";



export default function NewCustomerPage() {
  const router = useRouter();
  const mutation = useApiMutation(
    (values: Partial<Customer>) => customerService.create(values),
    {
      successMessage: "Customer created",
      invalidate: [qk.customers()],
      onDone: () => router.push("/customers"),
    },
  );

  return (
    <>
      <PageHeader
        eyebrow="Customers"
        title="Add a customer"
        description="Segment and tier drive which pricelist and discount ceilings apply when quoting this account."
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
        <BentoCard className="lg:col-span-2">
          <BentoHeader title="Account details" subtitle="All fields except notes sync to your API" icon={Building2} />
          <CustomerForm
            submitLabel="Create customer"
            submitting={mutation.isPending}
            onSubmit={(values) => mutation.mutate(values as unknown as Partial<Customer>)}
            onCancel={() => router.push("/customers")}
          />
        </BentoCard>

        <div className="flex flex-col gap-3 lg:gap-4">
          <BentoCard tint="honey" delay={0.05}>
            <BentoHeader title="What happens next" icon={Info} />
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li>1 · The account inherits the pricelist matched to its segment.</li>
              <li>2 · Discount ceilings for its tier apply automatically on every quote line.</li>
              <li>3 · Credit limit breaches trigger the credit-hold approval rule.</li>
            </ol>
          </BentoCard>
          <BentoCard tint="sand" delay={0.1}>
            <BentoHeader title="UX note" />
            <p className="text-sm text-muted-foreground">
              Keep credit limits realistic at creation. A generous placeholder limit hides real exposure and makes the
              credit-hold rule fire too late to be useful.
            </p>
          </BentoCard>
        </div>
      </div>
    </>
  );
}
