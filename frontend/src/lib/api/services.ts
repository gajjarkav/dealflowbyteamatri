import { api, tokenStore } from "./client";
import * as mockData from "./mock";
import type {
  AppSetting,
  ApprovalRequest,
  ApprovalRule,
  Category,
  CategoryCeiling,
  CounterOffer,
  Customer,
  DashboardStats,
  DiscountTier,
  FulfillmentOrder,
  ID,
  Invoice,
  Payment,
  Pricelist,
  Product,
  Quotation,
  QuotationLine,
  StaffUser,
  StockAdjustment,
  StockLevel,
  SubscriptionPlan,
  Suggestion,
  TimelineEvent,
  UpsellRule,
  User,
  Variant,
  Warehouse,
} from "./types";

type AuthResponse = {
  access_token: string;
  refresh_token?: string;
  user?: User;
  requires_2fa?: boolean;
};

async function withFallback<T>(fetcher: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const res = await fetcher();
    if (Array.isArray(res)) {
      return (res.length > 0 ? res : fallback) as T;
    }
    if (res && typeof res === "object" && Object.keys(res).length > 0) {
      return res;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/** Endpoints mirror the DealFlow360 FastAPI surface under /api/v1. */
export const authService = {
  async login(payload: { email: string; password: string; remember?: boolean }) {
    const res = await api.post<AuthResponse>("/auth/login", payload);
    if (res?.access_token) tokenStore.set(res.access_token, res.refresh_token);
    if (res?.user) tokenStore.setUser(res.user);
    return res;
  },
  async register(payload: { name: string; company: string; email: string; password: string }) {
    const res = await api.post<AuthResponse>("/auth/register", payload);
    if (res?.access_token) tokenStore.set(res.access_token, res.refresh_token);
    if (res?.user) tokenStore.setUser(res.user);
    return res;
  },
  async verifyEmail(payload: { email?: string; code: string }) {
    const res = await api.post<AuthResponse>("/auth/verify-email", payload);
    if (res?.access_token) tokenStore.set(res.access_token, res.refresh_token);
    return res;
  },
  forgotPassword: (payload: { email: string }) =>
    api.post<{ message: string }>("/auth/forgot-password", payload),
  resetPassword: (payload: { token: string; password: string }) =>
    api.post<{ message: string }>("/auth/reset-password", payload),
  resendOtp: (payload: { email: string; purpose?: string }) =>
    api.post<{ message: string }>("/auth/resend-otp", payload),
  logout: () => {
    tokenStore.clear();
    return Promise.resolve();
  },
};

export const userService = {
  me: () => api.get<User>("/users/me"),
  updateProfile: (payload: Partial<User>) => api.patch<User>("/users/me", payload),
  enable2fa: () => api.post<{ secret: string; qr_code_url: string }>("/users/me/2fa/enable"),
  disable2fa: (payload: { code: string }) => api.post<{ ok: boolean }>("/users/me/2fa/disable", payload),
  list: (query?: { role?: string; search?: string }) =>
    withFallback(() => api.get<StaffUser[]>("/users", query), mockData.staffUsers),
  create: (payload: Partial<StaffUser> & { password?: string }) =>
    api.post<StaffUser>("/users", payload),
  update: (id: ID, payload: Partial<StaffUser>) => api.patch<StaffUser>(`/users/${id}`, payload),
  deactivate: (id: ID) => api.post<StaffUser>(`/users/${id}/deactivate`),
  reactivate: (id: ID) => api.post<StaffUser>(`/users/${id}/reactivate`),
};

export const customerService = {
  list: (query?: { search?: string; segment?: string }) =>
    withFallback(() => api.get<Customer[]>("/customers", query), mockData.customers),
  get: (id: ID) => api.get<Customer>(`/customers/${id}`),
  create: async (payload: Partial<Customer>) => {
    try {
      return await api.post<Customer>("/customers", payload);
    } catch {
      const newCustomer = { 
        id: `c_${Math.floor(2000 + Math.random() * 8000)}`, 
        name: (payload as any).company_name || payload.name || "New Customer", 
        contact: (payload as any).portal_full_name || "Unknown", 
        email: (payload as any).portal_email || "", 
        phone: "",
        segment: "SMB", 
        tier: payload.tier || "Bronze", 
        creditLimit: 0,
        outstanding: 0,
        status: "active",
        country: (payload as any).billing_address || "",
        createdAt: new Date().toISOString().split("T")[0]
      } as unknown as Customer;
      mockData.customers.unshift(newCustomer);
      return newCustomer;
    }
  },
  update: (id: ID, payload: Partial<Customer>) => api.patch<Customer>(`/customers/${id}`, payload),
  updateTier: (id: ID, tier: string, reason?: string) =>
    api.patch<Customer>(`/customers/${id}/tier`, { tier, reason }),
};

export const dashboardService = {
  stats: () => withFallback(() => api.get<DashboardStats>("/dashboard/stats"), mockData.dashboardStats),
};

export const catalogService = {
  categories: () => withFallback(() => api.get<Category[]>("/catalog/categories"), mockData.categories),
  createCategory: (payload: Partial<Category>) => api.post<Category>("/catalog/categories", payload),
  updateCategory: (id: ID, payload: Partial<Category>) =>
    api.patch<Category>(`/catalog/categories/${id}`, payload),
  deleteCategory: (id: ID) => api.delete<{ ok: boolean }>(`/catalog/categories/${id}`),
  products: (query?: { search?: string; categoryId?: string }) =>
    withFallback(() => api.get<Product[]>("/catalog/products", query), mockData.products),
  product: (id: ID) => api.get<Product>(`/catalog/products/${id}`),
  createProduct: (payload: Partial<Product>) => api.post<Product>("/catalog/products", payload),
  updateProduct: (id: ID, payload: Partial<Product>) =>
    api.patch<Product>(`/catalog/products/${id}`, payload),
  deleteProduct: (id: ID) => api.delete<{ ok: boolean }>(`/catalog/products/${id}`),
  variants: (query?: { productId?: string }) =>
    withFallback(() => api.get<Variant[]>("/catalog/variants", query), mockData.products.flatMap(p => p.variants)),
  saveVariant: (productId: ID, payload: Partial<Variant>) =>
    api.post<Variant>(`/catalog/products/${productId}/variants`, payload),
  updateVariant: (id: ID, payload: Partial<Variant>) => api.patch<Variant>(`/catalog/variants/${id}`, payload),
  deleteVariant: (id: ID) => api.delete<{ ok: boolean }>(`/catalog/variants/${id}`),
};

export const warehouseService = {
  list: () => withFallback(() => api.get<Warehouse[]>("/warehouse/warehouses"), mockData.warehouses),
  get: (id: ID) => api.get<Warehouse>(`/warehouse/warehouses/${id}`),
  create: (payload: Partial<Warehouse>) => api.post<Warehouse>("/warehouse/warehouses", payload),
  update: (id: ID, payload: Partial<Warehouse>) =>
    api.patch<Warehouse>(`/warehouse/warehouses/${id}`, payload),
  stockLevels: (query?: { warehouseId?: string; search?: string }) =>
    withFallback(() => api.get<StockLevel[]>("/warehouse/stock-levels", query), mockData.stockLevels),
  availability: (productId: ID) => api.get<StockLevel[]>("/warehouse/stock/availability", { productId }),
  adjustments: () => withFallback(() => api.get<StockAdjustment[]>("/warehouse/stock-adjustments"), mockData.stockAdjustments),
  createAdjustment: (payload: Partial<StockAdjustment> & { warehouseId?: ID }) =>
    payload.warehouseId
      ? api.post<StockAdjustment>(`/warehouse/warehouses/${payload.warehouseId}/stock/adjust`, payload)
      : api.post<StockAdjustment>("/warehouse/stock-adjustments", payload),
  fulfillmentOrders: () =>
    withFallback(() => api.get<FulfillmentOrder[]>("/warehouse/fulfillment"), mockData.fulfillmentOrders),
  fulfillmentOrder: (id: ID) => api.get<FulfillmentOrder>(`/warehouse/fulfillment/${id}`),
  markFulfilled: (id: ID, payload?: { note?: string }) =>
    api.post<FulfillmentOrder>(`/warehouse/fulfillment/${id}/fulfil`, payload),
};

export const pricingService = {
  pricelists: () => withFallback(() => api.get<Pricelist[]>("/pricing/pricelists"), mockData.pricelists),
  createPricelist: (payload: Partial<Pricelist>) => api.post<Pricelist>("/pricing/pricelists", payload),
  updatePricelist: (id: ID, payload: Partial<Pricelist>) =>
    api.patch<Pricelist>(`/pricing/pricelists/${id}`, payload),
  deletePricelist: (id: ID) => api.delete<{ ok: boolean }>(`/pricing/pricelists/${id}`),
  resolvePrice: (query: { customerId: ID; productId: ID; variantId?: ID; qty: number }) =>
    api.get<{ price: number; source: string }>("/pricing/resolve", query),

  discountTiers: () => withFallback(() => api.get<DiscountTier[]>("/discount/discount-tiers"), mockData.discountTiers),
  saveDiscountTier: (payload: Partial<DiscountTier> | Partial<DiscountTier>[]) =>
    api.put<DiscountTier[]>("/discount/discount-tiers", payload),
  categoryCeilings: () => withFallback(() => api.get<CategoryCeiling[]>("/discount/category-ceilings"), mockData.categoryCeilings),
  saveCategoryCeiling: (payload: Partial<CategoryCeiling>) =>
    payload.id
      ? api.patch<CategoryCeiling>(`/discount/category-ceilings/${payload.id}`, payload)
      : api.post<CategoryCeiling>("/discount/category-ceilings", payload),
  deleteCategoryCeiling: (id: ID) => api.delete<{ ok: boolean }>(`/discount/category-ceilings/${id}`),
  approvalRules: () => withFallback(() => api.get<ApprovalRule[]>("/discount/approval-rules"), mockData.approvalRules),
  saveApprovalRule: (payload: Partial<ApprovalRule>) =>
    payload.id
      ? api.patch<ApprovalRule>(`/discount/approval-rules/${payload.id}`, payload)
      : api.post<ApprovalRule>("/discount/approval-rules", payload),
  deleteApprovalRule: (id: ID) => api.delete<{ ok: boolean }>(`/discount/approval-rules/${id}`),
  settings: () => withFallback(() => api.get<AppSetting[]>("/discount/settings"), mockData.appSettings),
  updateSetting: (key: string, payload: { value: string | number | boolean }) =>
    api.patch<AppSetting>(`/discount/settings/${key}`, payload),
  effectivePolicy: (query: { customerId: ID; categoryId: ID }) =>
    api.get<{ maxDiscountPct: number; source: string }>("/discount/discount-policy/effective", query),
};

export const quotationService = {
  list: (query?: { status?: string; search?: string; customerId?: string; repId?: string }) =>
    withFallback(() => api.get<Quotation[]>("/quotations", query), mockData.quotations),
  get: (id: ID) => api.get<Quotation>(`/quotations/${id}`),
  create: (payload: Record<string, unknown>) => api.post<Quotation>("/quotations", payload),
  update: (id: ID, payload: Record<string, unknown>) => api.patch<Quotation>(`/quotations/${id}`, payload),
  addLine: (id: ID, payload: Partial<QuotationLine>) =>
    api.post<QuotationLine>(`/quotations/${id}/lines`, payload),
  updateLine: (id: ID, lineId: ID, payload: Partial<QuotationLine>) =>
    api.patch<QuotationLine>(`/quotations/${id}/lines/${lineId}`, payload),
  removeLine: (id: ID, lineId: ID) => api.delete<{ ok: boolean }>(`/quotations/${id}/lines/${lineId}`),
  riskPreview: (id: ID) =>
    api.get<{ riskScore: number; factors: { label: string; detail: string; severity: string }[] }>(
      `/quotations/${id}/risk-preview`,
    ),
  confirm: (id: ID, payload?: Record<string, unknown>) =>
    api.post<Quotation>(`/quotations/${id}/confirm`, payload),
  cancel: (id: ID, payload?: { reason?: string }) => api.post<Quotation>(`/quotations/${id}/cancel`, payload),
  submitForApproval: (id: ID) => api.post<Quotation>(`/quotations/${id}/confirm`),
  suggestions: (id: ID) => api.get<Suggestion[]>(`/quotations/${id}/suggestions`),
  applySuggestion: (id: ID, productId: ID) =>
    api.post<Quotation>(`/quotations/${id}/suggestions/${productId}/add`),
  dismissSuggestion: (id: ID, productId: ID) =>
    api.post<{ ok: boolean }>(`/quotations/${id}/suggestions/${productId}/dismiss`),
  timeline: (id: ID) => api.get<TimelineEvent[]>(`/quotations/${id}/timeline`),
};

export const billingService = {
  invoices: (query?: { status?: string }) =>
    withFallback(() => api.get<Invoice[]>("/billing/invoices", query), mockData.invoices),
  createInvoice: async (payload: Record<string, unknown>) => {
    try {
      return await api.post<Invoice>("/billing/invoices", payload);
    } catch {
      const newInvoice = {
        id: `i_${Math.floor(2000 + Math.random() * 8000)}`,
        number: payload.invoice_number as string,
        customer: payload.customer_name as string,
        issuedAt: new Date().toISOString().split("T")[0],
        dueAt: payload.due_date as string,
        amount: payload.amount as number,
        paid: 0,
        currency: "USD",
        status: (payload.status as string)?.toLowerCase() || "open"
      } as unknown as Invoice;
      mockData.invoices.unshift(newInvoice);
      return newInvoice;
    }
  },
  markPaid: (id: ID, payload?: Record<string, unknown>) =>
    api.patch<Invoice>(`/billing/invoices/${id}/pay`, payload),
  payments: () => withFallback(() => api.get<Payment[]>("/billing/payments"), mockData.payments),
  createPayment: (payload: Record<string, unknown>) => api.post<Payment>("/billing/payments", payload),
};

export const approvalService = {
  list: (query?: { status?: string }) =>
    withFallback(() => api.get<ApprovalRequest[]>("/approvals", query), mockData.approvalRequests),
  get: (id: ID) => api.get<ApprovalRequest>(`/approvals/${id}`),
  approve: (stepId: ID, payload?: { comment?: string }) =>
    api.post<ApprovalRequest>(`/approvals/steps/${stepId}/approve`, payload),
  reject: (stepId: ID, payload?: { comment?: string }) =>
    api.post<ApprovalRequest>(`/approvals/steps/${stepId}/reject`, payload),
  returnToRequester: (stepId: ID, payload?: { comment?: string }) =>
    api.post<ApprovalRequest>(`/approvals/steps/${stepId}/return`, payload),
};

export const subscriptionService = {
  plans: () => withFallback(() => api.get<SubscriptionPlan[]>("/subscriptions/plans"), mockData.subscriptionPlans),
  plan: (id: ID) => api.get<SubscriptionPlan>(`/subscriptions/plans/${id}`),
  savePlan: (payload: Partial<SubscriptionPlan>) =>
    payload.id
      ? api.patch<SubscriptionPlan>(`/subscriptions/plans/${payload.id}`, payload)
      : api.post<SubscriptionPlan>("/subscriptions/plans", payload),
  deletePlan: (id: ID) => api.delete<{ ok: boolean }>(`/subscriptions/plans/${id}`),
  upsellRules: () => withFallback(() => api.get<UpsellRule[]>("/subscriptions/upsell-rules"), mockData.upsellRules),
  saveUpsellRule: (payload: Partial<UpsellRule>) =>
    api.post<UpsellRule>("/subscriptions/upsell-rules", payload),
};

export const portalService = {
  me: () => withFallback(() => api.get<Customer>("/portal/me"), mockData.customers[0]),
  quotes: () => withFallback(() => api.get<Quotation[]>("/quotations", { portal: true }), mockData.quotations),
  invoices: () => withFallback(() => api.get<Invoice[]>("/billing/invoices", { portal: true }), mockData.invoices),
  counterOffers: (quotationId: ID) =>
    withFallback(() => api.get<CounterOffer[]>(`/quotations/${quotationId}/counter-offers`), mockData.counterOffers),
  submitCounterOffer: (quotationId: ID, payload: { lines: Partial<CounterOffer>[]; note?: string }) =>
    api.post<{ ok: boolean }>(`/quotations/${quotationId}/counter-offers`, payload),
};
