export type ID = string;

export type User = {
  id: ID;
  name: string;
  email: string;
  role: string;
  phone?: string;
  timezone?: string;
  twoFactorEnabled?: boolean;
  avatarInitials?: string;
};

export type Customer = {
  id: ID;
  name: string;
  contact: string;
  email: string;
  phone: string;
  segment: "Enterprise" | "Mid-market" | "SMB";
  tier: string;
  creditLimit: number;
  outstanding: number;
  status: "active" | "on_hold" | "prospect";
  country: string;
  createdAt: string;
};

export type Category = {
  id: ID;
  name: string;
  code: string;
  productCount: number;
  marginFloor: number;
  ceiling: number;
  parent?: string | null;
};

export type Variant = {
  id: ID;
  sku: string;
  label: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "discontinued";
};

export type Product = {
  id: ID;
  name: string;
  sku: string;
  categoryId: ID;
  category: string;
  listPrice: number;
  cost: number;
  uom: string;
  status: "active" | "draft" | "discontinued";
  stock: number;
  description?: string;
  variants: Variant[];
};

export type Warehouse = {
  id: ID;
  name: string;
  code: string;
  city: string;
  country: string;
  capacity: number;
  utilisation: number;
  manager: string;
  status: "operational" | "maintenance";
};

export type StockLevel = {
  id: ID;
  sku: string;
  product: string;
  warehouse: string;
  warehouseId: ID;
  onHand: number;
  reserved: number;
  available: number;
  reorderPoint: number;
};

export type StockAdjustment = {
  id: ID;
  reference: string;
  sku: string;
  warehouse: string;
  quantity: number;
  reason: string;
  createdBy: string;
  createdAt: string;
  status: "posted" | "draft";
};

export type Pricelist = {
  id: ID;
  name: string;
  currency: string;
  segment: string;
  validFrom: string;
  validTo: string;
  items: number;
  status: "active" | "scheduled" | "expired";
};

export type DiscountTier = {
  id: ID;
  name: string;
  minQty: number;
  maxQty: number | null;
  discountPct: number;
  appliesTo: string;
  requiresApproval: boolean;
};

export type CategoryCeiling = {
  id: ID;
  category: string;
  maxDiscountPct: number;
  marginFloorPct: number;
  owner: string;
};

export type ApprovalRule = {
  id: ID;
  name: string;
  trigger: string;
  threshold: string;
  approvers: string[];
  slaHours: number;
  active: boolean;
};

export type QuotationLine = {
  id: ID;
  sku: string;
  product: string;
  qty: number;
  unitPrice: number;
  discountPct: number;
  total: number;
  marginPct: number;
};

export type TimelineEvent = {
  id: ID;
  label: string;
  actor: string;
  at: string;
  state: "done" | "current" | "upcoming";
};

export type Suggestion = {
  id: ID;
  title: string;
  detail: string;
  impact: string;
  kind: "upsell" | "risk" | "pricing";
};

export type Quotation = {
  id: ID;
  number: string;
  customer: string;
  customerId: ID;
  owner: string;
  status: "draft" | "pending_approval" | "approved" | "sent" | "won" | "lost";
  currency: string;
  subtotal: number;
  discount: number;
  total: number;
  marginPct: number;
  riskScore: number;
  validUntil: string;
  createdAt: string;
  lines: QuotationLine[];
  timeline: TimelineEvent[];
  suggestions: Suggestion[];
};

export type Invoice = {
  id: ID;
  number: string;
  customer: string;
  issuedAt: string;
  dueAt: string;
  amount: number;
  paid: number;
  currency: string;
  status: "paid" | "partial" | "open" | "overdue";
};

export type Payment = {
  id: ID;
  reference: string;
  invoice: string;
  method: "card" | "bank_transfer" | "sepa" | "credit_note";
  amount: number;
  currency: string;
  receivedAt: string;
  status: "settled" | "pending" | "failed";
};

export type ApprovalStep = {
  id: ID;
  name: string;
  approver: string;
  state: "approved" | "pending" | "returned" | "rejected" | "upcoming";
  actedAt?: string;
  comment?: string;
};

export type ApprovalRequest = {
  id: ID;
  reference: string;
  subject: string;
  type: "quotation" | "discount" | "credit";
  requestedBy: string;
  requestedAt: string;
  amount: number;
  currency: string;
  riskScore: number;
  slaHoursLeft: number;
  status: "pending" | "approved" | "rejected" | "returned";
  steps: ApprovalStep[];
  notes?: string;
};

export type SubscriptionPlan = {
  id: ID;
  name: string;
  interval: "monthly" | "quarterly" | "annual";
  price: number;
  currency: string;
  seats: number;
  subscribers: number;
  mrr: number;
  status: "active" | "draft" | "retired";
  features: string[];
};

export type UpsellRule = {
  id: ID;
  name: string;
  trigger: string;
  action: string;
  planFrom: string;
  planTo: string;
  conversion: number;
  active: boolean;
};

export type DashboardStats = {
  pipelineValue: number;
  quotesOpen: number;
  winRate: number;
  avgMargin: number;
  pendingApprovals: number;
  overdueInvoices: number;
  mrr: number;
  revenueSeries: { month: string; revenue: number; quotes: number }[];
  marginByCategory: { category: string; margin: number }[];
};

export type RoleName = "admin" | "sales_rep" | "sales_manager" | "finance" | "warehouse" | "customer";

export type StaffUser = {
  id: ID;
  name: string;
  email: string;
  role: RoleName;
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
  twoFactorEnabled?: boolean;
};

export type FulfillmentLine = {
  id: ID;
  sku: string;
  product: string;
  warehouse: string;
  required: number;
  available: number;
};

export type FulfillmentOrder = {
  id: ID;
  reference: string;
  quotationId: ID;
  customer: string;
  confirmedAt: string;
  status: "awaiting_stock" | "split_pending" | "ready" | "fulfilled";
  lines: FulfillmentLine[];
  note?: string;
};

export type CounterOffer = {
  id: ID;
  lineId: ID;
  sku: string;
  product: string;
  quotedPrice: number;
  requestedPrice: number;
  qty: number;
  state: "proposed" | "accepted" | "declined";
  note?: string;
};

export type AppSetting = {
  key: string;
  label: string;
  value: string | number | boolean;
  type: "text" | "number" | "boolean";
  description: string;
};
