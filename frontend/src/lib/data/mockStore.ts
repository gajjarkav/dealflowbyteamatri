// DealFlow360 - Comprehensive In-Memory Reactive Data Store
// Holds complete typed state for Admin, Manager, Finance, and Rep flows without requiring backend modifications.

export type Role = "Admin" | "Manager" | "Finance" | "Rep"

export interface UserItem {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  status: "Active" | "Deactivated"
  lastLogin: string
}

export interface CustomerItem {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  tier: "Bronze" | "Silver" | "Gold" | "Platinum"
  currency: string
  creditLimit: number
  totalSpent: number
  status: "Active" | "Under Review"
}

export interface ProductItem {
  id: string
  sku: string
  name: string
  category: "Hardware" | "Software" | "Services" | "Add-ons"
  costPrice: number
  sellPrice: number
  minMarginPercent: number
  promoted: boolean
  variantsCount: number
  stockTotal: number
}

export interface CategoryCeilingItem {
  id: string
  category: "Hardware" | "Software" | "Services" | "Add-ons"
  bronzeMaxDisc: number
  silverMaxDisc: number
  goldMaxDisc: number
  platinumMaxDisc: number
}

export interface PriceListItem {
  id: string
  name: string
  code: string
  currency: string
  description: string
  ruleCount: number
  isDefault: boolean
}

export interface ApprovalRuleItem {
  id: string
  title: string
  discountRange: string
  minMargin: number
  approverRole: string
  riskLevel: "Low" | "Medium" | "High" | "Critical"
  actionRequired: string
}

export interface WarehouseItem {
  id: string
  code: string
  name: string
  location: string
  capacityPercent: number
  totalSkus: number
  manager: string
}

export interface StockItem {
  id: string
  sku: string
  productName: string
  warehouseCode: string
  onHand: number
  reserved: number
  available: number
  minThreshold: number
}

export interface SubscriptionPlanItem {
  id: string
  name: string
  code: string
  billingInterval: "Monthly" | "Annual"
  price: number
  includedSeats: number
  maxDeals: number
  features: string[]
}

export interface UpsellRuleItem {
  id: string
  triggerProduct: string
  recommendedProduct: string
  incentiveDiscount: number
  conversionRate: number
  active: boolean
}

export interface SystemSettings {
  stalledQuotationDays: number
  targetGrossMarginPercent: number
  minimumGrossMarginPercent: number
  approvalTimeoutHours: number
  autoFulfillmentEnabled: boolean
  currencyDefault: string
}

export interface QuotationItem {
  id: string
  dealRef: string
  title: string
  customerName: string
  customerTier: "Bronze" | "Silver" | "Gold" | "Platinum"
  repName: string
  totalAmount: number
  discountPercent: number
  grossMarginPercent: number
  stage: "Draft" | "Pending Approval" | "Approved" | "Customer Review" | "Accepted" | "Done"
  riskLevel: "Low" | "Medium" | "High"
  itemsCount: number
  createdDate: string
  expiryDate: string
  notes?: string
}

export interface InvoiceItem {
  id: string
  invoiceNumber: string
  quotationRef: string
  customerName: string
  amount: number
  dueDate: string
  status: "Draft" | "Sent" | "Paid" | "Overdue"
  paymentMethod: string
}

export interface FulfillmentItem {
  id: string
  orderNumber: string
  customerName: string
  warehouseCode: string
  itemsSummary: string
  status: "Allocated" | "Picking" | "Dispatched" | "Backordered"
  trackingNumber: string
}

// Initial Seed Data
const INITIAL_USERS: UserItem[] = [
  { id: "usr-1", name: "Alex Rivera", email: "alex.rivera@dealflow360.com", phone: "+1 (555) 234-5678", role: "Admin", status: "Active", lastLogin: "10 mins ago" },
  { id: "usr-2", name: "Sarah Chen", email: "sarah.chen@dealflow360.com", phone: "+1 (555) 345-6789", role: "Manager", status: "Active", lastLogin: "1 hour ago" },
  { id: "usr-3", name: "Marcus Vance", email: "marcus.vance@dealflow360.com", phone: "+1 (555) 456-7890", role: "Finance", status: "Active", lastLogin: "3 hours ago" },
  { id: "usr-4", name: "Elena Rostova", email: "elena.rostova@dealflow360.com", phone: "+1 (555) 567-8901", role: "Rep", status: "Active", lastLogin: "Just now" },
  { id: "usr-5", name: "David Kim", email: "david.kim@dealflow360.com", phone: "+1 (555) 678-9012", role: "Rep", status: "Active", lastLogin: "Yesterday" }
]

const INITIAL_CUSTOMERS: CustomerItem[] = [
  { id: "cust-1", name: "Stripe Enterprise", contactPerson: "Patrick Collison", email: "procurement@stripe.com", phone: "+1 (415) 890-1234", tier: "Platinum", currency: "USD", creditLimit: 500000, totalSpent: 1240000, status: "Active" },
  { id: "cust-2", name: "Datadog Cloud Ops", contactPerson: "Olivier Pomel", email: "it-deals@datadoghq.com", phone: "+1 (212) 345-9876", tier: "Gold", currency: "USD", creditLimit: 250000, totalSpent: 680000, status: "Active" },
  { id: "cust-3", name: "Snowflake Computing", contactPerson: "Benoit Dageville", email: "billing@snowflake.com", phone: "+1 (650) 456-7890", tier: "Gold", currency: "USD", creditLimit: 300000, totalSpent: 920000, status: "Active" },
  { id: "cust-4", name: "Vercel Frontends", contactPerson: "Guillermo Rauch", email: "finance@vercel.com", phone: "+1 (415) 678-1122", tier: "Silver", currency: "USD", creditLimit: 100000, totalSpent: 310000, status: "Active" },
  { id: "cust-5", name: "Linear Systems Inc", contactPerson: "Karri Saarinen", email: "ops@linear.app", phone: "+1 (415) 789-2233", tier: "Bronze", currency: "USD", creditLimit: 50000, totalSpent: 85000, status: "Active" }
]

const INITIAL_PRODUCTS: ProductItem[] = [
  { id: "prod-1", sku: "HW-GPU-H100", name: "NVIDIA H100 SXM5 80GB Node", category: "Hardware", costPrice: 22000, sellPrice: 34500, minMarginPercent: 30, promoted: true, variantsCount: 2, stockTotal: 18 },
  { id: "prod-2", sku: "HW-SRV-EPYC9", name: "Dual AMD EPYC 9654 Compute Blade", category: "Hardware", costPrice: 6500, sellPrice: 11200, minMarginPercent: 35, promoted: false, variantsCount: 4, stockTotal: 34 },
  { id: "prod-3", sku: "SW-ORCH-ENT", name: "DealFlow Distributed Orchestrator (Annual)", category: "Software", costPrice: 2000, sellPrice: 18000, minMarginPercent: 80, promoted: true, variantsCount: 3, stockTotal: 999 },
  { id: "prod-4", sku: "SW-SEC-VAULT", name: "Zero-Trust HSM Encryption Suite", category: "Software", costPrice: 1200, sellPrice: 9500, minMarginPercent: 75, promoted: false, variantsCount: 1, stockTotal: 999 },
  { id: "prod-5", sku: "SRV-ARCH-247", name: "Dedicated Enterprise Solutions Architect (160h)", category: "Services", costPrice: 9000, sellPrice: 24000, minMarginPercent: 55, promoted: true, variantsCount: 2, stockTotal: 45 },
  { id: "prod-6", sku: "SRV-MIG-EXP", name: "Zero-Downtime Data Migration Sprint", category: "Services", costPrice: 4500, sellPrice: 12500, minMarginPercent: 50, promoted: false, variantsCount: 1, stockTotal: 20 }
]

const INITIAL_CATEGORY_CEILINGS: CategoryCeilingItem[] = [
  { id: "ceil-1", category: "Hardware", bronzeMaxDisc: 5, silverMaxDisc: 10, goldMaxDisc: 15, platinumMaxDisc: 20 },
  { id: "ceil-2", category: "Software", bronzeMaxDisc: 10, silverMaxDisc: 18, goldMaxDisc: 25, platinumMaxDisc: 35 },
  { id: "ceil-3", category: "Services", bronzeMaxDisc: 5, silverMaxDisc: 8, goldMaxDisc: 12, platinumMaxDisc: 18 },
  { id: "ceil-4", category: "Add-ons", bronzeMaxDisc: 8, silverMaxDisc: 12, goldMaxDisc: 20, platinumMaxDisc: 25 }
]

const INITIAL_PRICELISTS: PriceListItem[] = [
  { id: "pl-1", name: "Global Standard Enterprise (USD)", code: "PL-STD-USD", currency: "USD", description: "Default benchmark pricing for North American & Global tier deals.", ruleCount: 24, isDefault: true },
  { id: "pl-2", name: "EMEA Direct Accounts (EUR)", code: "PL-EMEA-EUR", currency: "EUR", description: "Currency adjusted with localized SLA multipliers for EU zone.", ruleCount: 18, isDefault: false },
  { id: "pl-3", name: "Strategic Global Partner (USD)", code: "PL-PARTNER", currency: "USD", description: "Wholesale margin schedule for accredited systems integrators.", ruleCount: 30, isDefault: false }
]

const INITIAL_APPROVAL_RULES: ApprovalRuleItem[] = [
  { id: "rule-1", title: "Within Category Ceiling Limit", discountRange: "0% - 15%", minMargin: 40, approverRole: "Auto-Approved", riskLevel: "Low", actionRequired: "Instant deal locking and quotation release" },
  { id: "rule-2", title: "Tier 1 Sales Manager Escalation", discountRange: "15.1% - 25%", minMargin: 32, approverRole: "Sales Manager", riskLevel: "Medium", actionRequired: "Requires manager signature within 24 hours" },
  { id: "rule-3", title: "Tier 2 Finance & Margin Review", discountRange: "25.1% - 40%", minMargin: 25, approverRole: "Sales Manager + Finance", riskLevel: "High", actionRequired: "Dual authorization + Margin justification letter" },
  { id: "rule-4", title: "Critical Exception / Loss Leader", discountRange: "> 40% or Margin < 25%", minMargin: 0, approverRole: "VP of Sales & CFO", riskLevel: "Critical", actionRequired: "Executive committee veto power" }
]

const INITIAL_WAREHOUSES: WarehouseItem[] = [
  { id: "wh-1", code: "US-EAST-01", name: "Dulles Primary Logistics Center", location: "Sterling, VA", capacityPercent: 78, totalSkus: 42, manager: "Dave Miller" },
  { id: "wh-2", code: "US-WEST-02", name: "Silicon Valley Tech Hub", location: "Santa Clara, CA", capacityPercent: 64, totalSkus: 38, manager: "Lisa Chang" },
  { id: "wh-3", code: "EU-CENT-01", name: "Frankfurt Euro Distribution Hub", location: "Frankfurt, Germany", capacityPercent: 52, totalSkus: 29, manager: "Hans Gruber" }
]

const INITIAL_STOCK: StockItem[] = [
  { id: "stk-1", sku: "HW-GPU-H100", productName: "NVIDIA H100 SXM5 80GB Node", warehouseCode: "US-EAST-01", onHand: 12, reserved: 4, available: 8, minThreshold: 5 },
  { id: "stk-2", sku: "HW-GPU-H100", productName: "NVIDIA H100 SXM5 80GB Node", warehouseCode: "US-WEST-02", onHand: 6, reserved: 2, available: 4, minThreshold: 3 },
  { id: "stk-3", sku: "HW-SRV-EPYC9", productName: "Dual AMD EPYC 9654 Compute Blade", warehouseCode: "US-EAST-01", onHand: 20, reserved: 5, available: 15, minThreshold: 8 },
  { id: "stk-4", sku: "HW-SRV-EPYC9", productName: "Dual AMD EPYC 9654 Compute Blade", warehouseCode: "EU-CENT-01", onHand: 14, reserved: 3, available: 11, minThreshold: 5 }
]

const INITIAL_PLANS: SubscriptionPlanItem[] = [
  { id: "plan-1", name: "Growth Engine Scale", code: "PLAN-GROWTH", billingInterval: "Monthly", price: 2400, includedSeats: 10, maxDeals: 250, features: ["Smart Discount Routing", "Basic Kanban Pipeline", "Email Notifications", "Standard Odoo Connector"] },
  { id: "plan-2", name: "Enterprise Autonomous", code: "PLAN-ENT", billingInterval: "Annual", price: 28000, includedSeats: 50, maxDeals: 2000, features: ["Real-time Customer Negotiation Portal", "Multi-warehouse Split Fulfillment", "Automated Approval Matrix", "Deal Health Margin AI", "Priority 24/7 SLA"] },
  { id: "plan-3", name: "Global Dedicated Sovereign", code: "PLAN-SOVEREIGN", billingInterval: "Annual", price: 65000, includedSeats: 200, maxDeals: 10000, features: ["Custom Approval Chains", "Hardware Inventory Reserve Lock", "Audit Trail Vault", "Dedicated Solutions Architect", "Custom ERP Webhooks"] }
]

const INITIAL_UPSELL_RULES: UpsellRuleItem[] = [
  { id: "upsell-1", triggerProduct: "NVIDIA H100 SXM5 80GB Node", recommendedProduct: "Dedicated Enterprise Solutions Architect (160h)", incentiveDiscount: 15, conversionRate: 42.8, active: true },
  { id: "upsell-2", triggerProduct: "DealFlow Distributed Orchestrator (Annual)", recommendedProduct: "Zero-Trust HSM Encryption Suite", incentiveDiscount: 20, conversionRate: 58.4, active: true },
  { id: "upsell-3", triggerProduct: "Dual AMD EPYC 9654 Compute Blade", recommendedProduct: "Zero-Downtime Data Migration Sprint", incentiveDiscount: 10, conversionRate: 31.2, active: false }
]

const INITIAL_SETTINGS: SystemSettings = {
  stalledQuotationDays: 5,
  targetGrossMarginPercent: 45,
  minimumGrossMarginPercent: 28,
  approvalTimeoutHours: 48,
  autoFulfillmentEnabled: true,
  currencyDefault: "USD"
}

const INITIAL_QUOTATIONS: QuotationItem[] = [
  { id: "quot-1", dealRef: "Q-1042", title: "Enterprise AI Compute Stack Deployment", customerName: "Stripe Enterprise", customerTier: "Platinum", repName: "Alex Rivera", totalAmount: 48500, discountPercent: 12.5, grossMarginPercent: 42.8, stage: "Pending Approval", riskLevel: "Medium", itemsCount: 4, createdDate: "2026-09-02", expiryDate: "2026-09-16", notes: "Customer requested expedited shipping on H100 cluster." },
  { id: "quot-2", dealRef: "Q-1043", title: "Core Orchestrator + HSM Security Vault", customerName: "Datadog Cloud Ops", customerTier: "Gold", repName: "Elena Rostova", totalAmount: 27500, discountPercent: 8.0, grossMarginPercent: 68.4, stage: "Approved", riskLevel: "Low", itemsCount: 2, createdDate: "2026-09-03", expiryDate: "2026-09-17" },
  { id: "quot-3", dealRef: "Q-1044", title: "Dual EPYC Infrastructure Expansion", customerName: "Snowflake Computing", customerTier: "Gold", repName: "David Kim", totalAmount: 67200, discountPercent: 18.0, grossMarginPercent: 34.2, stage: "Customer Review", riskLevel: "High", itemsCount: 6, createdDate: "2026-09-01", expiryDate: "2026-09-15", notes: "Negotiating counter-offer on volume tier." },
  { id: "quot-4", dealRef: "Q-1045", title: "Frontend Edge Routing Cluster Upgrade", customerName: "Vercel Frontends", customerTier: "Silver", repName: "Elena Rostova", totalAmount: 18400, discountPercent: 5.0, grossMarginPercent: 52.0, stage: "Accepted", riskLevel: "Low", itemsCount: 3, createdDate: "2026-08-28", expiryDate: "2026-09-12" },
  { id: "quot-5", dealRef: "Q-1046", title: "Autonomous Deal Engine Pilot", customerName: "Linear Systems Inc", customerTier: "Bronze", repName: "Alex Rivera", totalAmount: 12500, discountPercent: 0.0, grossMarginPercent: 78.5, stage: "Done", riskLevel: "Low", itemsCount: 1, createdDate: "2026-08-25", expiryDate: "2026-09-08" },
  { id: "quot-6", dealRef: "Q-1047", title: "High-Frequency Compute Expansion", customerName: "Stripe Enterprise", customerTier: "Platinum", repName: "David Kim", totalAmount: 112000, discountPercent: 22.0, grossMarginPercent: 31.0, stage: "Draft", riskLevel: "High", itemsCount: 8, createdDate: "2026-09-04", expiryDate: "2026-09-20" }
]

const INITIAL_INVOICES: InvoiceItem[] = [
  { id: "inv-1", invoiceNumber: "INV-1042-A", quotationRef: "Q-1045", customerName: "Vercel Frontends", amount: 18400, dueDate: "2026-09-28", status: "Paid", paymentMethod: "ACH Wire Transfer" },
  { id: "inv-2", invoiceNumber: "INV-1043-A", quotationRef: "Q-1046", customerName: "Linear Systems Inc", amount: 12500, dueDate: "2026-09-25", status: "Paid", paymentMethod: "Credit Card (Stripe)" },
  { id: "inv-3", invoiceNumber: "INV-1044-A", quotationRef: "Q-1043", customerName: "Datadog Cloud Ops", amount: 27500, dueDate: "2026-10-03", status: "Sent", paymentMethod: "Net 30 Invoicing" }
]

const INITIAL_FULFILLMENT: FulfillmentItem[] = [
  { id: "ful-1", orderNumber: "ORD-9921", customerName: "Vercel Frontends", warehouseCode: "US-WEST-02", itemsSummary: "2x Dual AMD EPYC Compute Blade", status: "Dispatched", trackingNumber: "FEDEX-8892-0192" },
  { id: "ful-2", orderNumber: "ORD-9922", customerName: "Stripe Enterprise", warehouseCode: "US-EAST-01", itemsSummary: "4x NVIDIA H100 SXM5 Node", status: "Allocated", trackingNumber: "Awaiting Carrier Pickup" },
  { id: "ful-3", orderNumber: "ORD-9923", customerName: "Snowflake Computing", warehouseCode: "EU-CENT-01", itemsSummary: "2x H100 Node (Split Shipment)", status: "Backordered", trackingNumber: "ETA 2 Business Days" }
]

// Singleton In-Memory Store
class DataStore {
  users = [...INITIAL_USERS]
  customers = [...INITIAL_CUSTOMERS]
  products = [...INITIAL_PRODUCTS]
  categoryCeilings = [...INITIAL_CATEGORY_CEILINGS]
  pricelists = [...INITIAL_PRICELISTS]
  approvalRules = [...INITIAL_APPROVAL_RULES]
  warehouses = [...INITIAL_WAREHOUSES]
  stock = [...INITIAL_STOCK]
  plans = [...INITIAL_PLANS]
  upsellRules = [...INITIAL_UPSELL_RULES]
  settings = { ...INITIAL_SETTINGS }
  quotations = [...INITIAL_QUOTATIONS]
  invoices = [...INITIAL_INVOICES]
  fulfillment = [...INITIAL_FULFILLMENT]
  currentRole: Role = "Admin"

  private listeners: Set<() => void> = new Set()

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  notify() {
    this.listeners.forEach(fn => fn())
  }

  resetAll() {
    this.users = [...INITIAL_USERS]
    this.customers = [...INITIAL_CUSTOMERS]
    this.products = [...INITIAL_PRODUCTS]
    this.categoryCeilings = [...INITIAL_CATEGORY_CEILINGS]
    this.pricelists = [...INITIAL_PRICELISTS]
    this.approvalRules = [...INITIAL_APPROVAL_RULES]
    this.warehouses = [...INITIAL_WAREHOUSES]
    this.stock = [...INITIAL_STOCK]
    this.plans = [...INITIAL_PLANS]
    this.upsellRules = [...INITIAL_UPSELL_RULES]
    this.settings = { ...INITIAL_SETTINGS }
    this.quotations = [...INITIAL_QUOTATIONS]
    this.invoices = [...INITIAL_INVOICES]
    this.fulfillment = [...INITIAL_FULFILLMENT]
    this.notify()
  }

  setRole(role: Role) {
    this.currentRole = role
    this.notify()
  }

  // Users CRUD
  addUser(item: Omit<UserItem, "id" | "lastLogin">) {
    const newUser: UserItem = { ...item, id: `usr-${Date.now()}`, lastLogin: "Just now" }
    this.users = [newUser, ...this.users]
    this.notify()
    return newUser
  }

  updateUser(id: string, updates: Partial<UserItem>) {
    this.users = this.users.map(u => u.id === id ? { ...u, ...updates } : u)
    this.notify()
  }

  // Customers CRUD
  addCustomer(item: Omit<CustomerItem, "id" | "totalSpent">) {
    const newCust: CustomerItem = { ...item, id: `cust-${Date.now()}`, totalSpent: 0 }
    this.customers = [newCust, ...this.customers]
    this.notify()
    return newCust
  }

  updateCustomer(id: string, updates: Partial<CustomerItem>) {
    this.customers = this.customers.map(c => c.id === id ? { ...c, ...updates } : c)
    this.notify()
  }

  // Products CRUD
  addProduct(item: Omit<ProductItem, "id">) {
    const newProd: ProductItem = { ...item, id: `prod-${Date.now()}` }
    this.products = [newProd, ...this.products]
    this.notify()
    return newProd
  }

  updateProduct(id: string, updates: Partial<ProductItem>) {
    this.products = this.products.map(p => p.id === id ? { ...p, ...updates } : p)
    this.notify()
  }

  togglePromoted(id: string) {
    this.products = this.products.map(p => p.id === id ? { ...p, promoted: !p.promoted } : p)
    this.notify()
  }

  // Stock Adjustment
  adjustStock(stockId: string, quantityDelta: number) {
    this.stock = this.stock.map(s => {
      if (s.id === stockId) {
        const newOnHand = Math.max(0, s.onHand + quantityDelta)
        return {
          ...s,
          onHand: newOnHand,
          available: Math.max(0, newOnHand - s.reserved)
        }
      }
      return s
    })
    this.notify()
  }

  // Category Ceilings
  updateCeiling(id: string, updates: Partial<CategoryCeilingItem>) {
    this.categoryCeilings = this.categoryCeilings.map(c => c.id === id ? { ...c, ...updates } : c)
    this.notify()
  }

  // Quotation stage progression
  updateQuotationStage(id: string, stage: QuotationItem["stage"]) {
    this.quotations = this.quotations.map(q => q.id === id ? { ...q, stage } : q)
    this.notify()
  }

  // Settings
  updateSettings(updates: Partial<SystemSettings>) {
    this.settings = { ...this.settings, ...updates }
    this.notify()
  }
}

export const mockStore = new DataStore()
