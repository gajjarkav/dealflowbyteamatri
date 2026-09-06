"use client";
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";

import type { ID } from "@/lib/api/types";
import {
  approvalService,
  billingService,
  catalogService,
  customerService,
  dashboardService,
  portalService,
  pricingService,
  quotationService,
  subscriptionService,
  userService,
  warehouseService,
} from "@/lib/api/services";

const defaults = { staleTime: 60_000, retry: 0 } satisfies Partial<UseQueryOptions>;

export const qk = {
  dashboard: ["dashboard"] as const,
  customers: (q?: unknown) => ["customers", q ?? null] as const,
  customer: (id: ID) => ["customer", id] as const,
  categories: ["categories"] as const,
  products: (q?: unknown) => ["products", q ?? null] as const,
  product: (id: ID) => ["product", id] as const,
  variants: ["variants"] as const,
  warehouses: ["warehouses"] as const,
  stockLevels: (q?: unknown) => ["stock-levels", q ?? null] as const,
  adjustments: ["stock-adjustments"] as const,
  fulfillment: ["fulfillment"] as const,
  pricelists: ["pricelists"] as const,
  discountTiers: ["discount-tiers"] as const,
  ceilings: ["category-ceilings"] as const,
  approvalRules: ["approval-rules"] as const,
  settings: ["settings"] as const,
  staffUsers: (q?: unknown) => ["users", q ?? null] as const,
  counterOffers: (id: ID) => ["counter-offers", id] as const,
  quotations: (q?: unknown) => ["quotations", q ?? null] as const,
  quotation: (id: ID) => ["quotation", id] as const,
  invoices: ["invoices"] as const,
  payments: ["payments"] as const,
  approvals: (q?: unknown) => ["approvals", q ?? null] as const,
  approval: (id: ID) => ["approval", id] as const,
  plans: ["subscription-plans"] as const,
  upsellRules: ["upsell-rules"] as const,
};


export const useDashboard = () =>
  useQuery({ queryKey: qk.dashboard, queryFn: dashboardService.stats, ...defaults });

export const useCustomers = (query?: { search?: string; segment?: string }) =>
  useQuery({ queryKey: qk.customers(query), queryFn: () => customerService.list(query), ...defaults });

export const useCustomer = (id: ID) =>
  useQuery({ queryKey: qk.customer(id), queryFn: () => customerService.get(id), enabled: !!id, ...defaults });

export const useCategories = () =>
  useQuery({ queryKey: qk.categories, queryFn: catalogService.categories, ...defaults });

export const useProducts = (query?: { search?: string; categoryId?: string }) =>
  useQuery({ queryKey: qk.products(query), queryFn: () => catalogService.products(query), ...defaults });

export const useProduct = (id: ID) =>
  useQuery({ queryKey: qk.product(id), queryFn: () => catalogService.product(id), enabled: !!id, ...defaults });

export const useWarehouses = () =>
  useQuery({ queryKey: qk.warehouses, queryFn: warehouseService.list, ...defaults });

export const useStockLevels = (query?: { warehouseId?: string }) =>
  useQuery({ queryKey: qk.stockLevels(query), queryFn: () => warehouseService.stockLevels(query), ...defaults });

export const useStockAdjustments = () =>
  useQuery({ queryKey: qk.adjustments, queryFn: warehouseService.adjustments, ...defaults });

export const usePricelists = () =>
  useQuery({ queryKey: qk.pricelists, queryFn: pricingService.pricelists, ...defaults });

export const useDiscountTiers = () =>
  useQuery({ queryKey: qk.discountTiers, queryFn: pricingService.discountTiers, ...defaults });

export const useCategoryCeilings = () =>
  useQuery({ queryKey: qk.ceilings, queryFn: pricingService.categoryCeilings, ...defaults });

export const useApprovalRules = () =>
  useQuery({ queryKey: qk.approvalRules, queryFn: pricingService.approvalRules, ...defaults });

export const useQuotations = (query?: { status?: string; search?: string }) =>
  useQuery({ queryKey: qk.quotations(query), queryFn: () => quotationService.list(query), ...defaults });

export const useQuotation = (id: ID) =>
  useQuery({ queryKey: qk.quotation(id), queryFn: () => quotationService.get(id), enabled: !!id, ...defaults });

export const useInvoices = () =>
  useQuery({ queryKey: qk.invoices, queryFn: () => billingService.invoices(), ...defaults });

export const usePayments = () =>
  useQuery({ queryKey: qk.payments, queryFn: billingService.payments, ...defaults });

export const useApprovals = (query?: { status?: string }) =>
  useQuery({ queryKey: qk.approvals(query), queryFn: () => approvalService.list(query), ...defaults });

export const useApproval = (id: ID) =>
  useQuery({ queryKey: qk.approval(id), queryFn: () => approvalService.get(id), enabled: !!id, ...defaults });

export const usePlans = () =>
  useQuery({ queryKey: qk.plans, queryFn: subscriptionService.plans, ...defaults });

export const useUpsellRules = () =>
  useQuery({ queryKey: qk.upsellRules, queryFn: subscriptionService.upsellRules, ...defaults });

export const useStaffUsers = (query?: { role?: string; search?: string }) =>
  useQuery({ queryKey: qk.staffUsers(query), queryFn: () => userService.list(query), ...defaults });

export const useFulfillmentOrders = () =>
  useQuery({ queryKey: qk.fulfillment, queryFn: warehouseService.fulfillmentOrders, ...defaults });

export const useAppSettings = () =>
  useQuery({ queryKey: qk.settings, queryFn: pricingService.settings, ...defaults });

export const useCounterOffers = (quotationId: ID) =>
  useQuery({
    queryKey: qk.counterOffers(quotationId),
    queryFn: () => portalService.counterOffers(quotationId),
    enabled: !!quotationId,
    ...defaults,
  });


import { useToast } from "@/components/ui/toast";

/** Generic write helper: runs the mutation, toasts, then invalidates the given keys. */
export function useApiMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
  options?: {
    successMessage?: string | undefined;
    invalidate?: readonly (readonly unknown[])[] | undefined;
    onDone?: ((data: TOutput) => void) | undefined;
  },
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      if (options?.successMessage) {
        toast({ title: options.successMessage, type: "success" });
      }
      options?.invalidate?.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      options?.onDone?.(data);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Something went wrong", type: "error" });
    },
  });
}
