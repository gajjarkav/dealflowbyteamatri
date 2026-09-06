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
  Invoice,
  Payment,
  Pricelist,
  Product,
  Quotation,
  StaffUser,
  StockAdjustment,
  StockLevel,
  SubscriptionPlan,
  UpsellRule,
  User,
  Warehouse,
} from "./types";


export const demoUser: User = {
  id: "u_1",
  name: "Kavya Gajjar",
  email: "kavya@dealflow.io",
  role: "Revenue Operations Lead",
  phone: "+91 98250 11020",
  timezone: "Asia/Kolkata",
  twoFactorEnabled: true,
  avatarInitials: "KG",
};

export const customers: Customer[] = [
  {
    id: "c_1001",
    name: "Northwind Industrials",
    contact: "Marta Kovač",
    email: "marta@northwind.io",
    phone: "+385 1 555 0182",
    segment: "Enterprise",
    tier: "Platinum",
    creditLimit: 480000,
    outstanding: 128400,
    status: "active",
    country: "Croatia",
    createdAt: "2024-03-11",
  },
  {
    id: "c_1002",
    name: "Halden Foodworks",
    contact: "Peter Halden",
    email: "peter@haldenfood.no",
    phone: "+47 22 88 41 02",
    segment: "Mid-market",
    tier: "Gold",
    creditLimit: 210000,
    outstanding: 34980,
    status: "active",
    country: "Norway",
    createdAt: "2024-07-02",
  },
  {
    id: "c_1003",
    name: "Ferro & Sons",
    contact: "Luca Ferro",
    email: "luca@ferroandsons.it",
    phone: "+39 02 4004 1122",
    segment: "SMB",
    tier: "Silver",
    creditLimit: 65000,
    outstanding: 61200,
    status: "on_hold",
    country: "Italy",
    createdAt: "2025-01-19",
  },
  {
    id: "c_1004",
    name: "Kestrel Logistics",
    contact: "Aisha Bello",
    email: "aisha@kestrel.co",
    phone: "+44 20 7946 1188",
    segment: "Enterprise",
    tier: "Platinum",
    creditLimit: 720000,
    outstanding: 0,
    status: "active",
    country: "United Kingdom",
    createdAt: "2023-11-28",
  },
  {
    id: "c_1005",
    name: "Aurora Retail Group",
    contact: "Sven Lindqvist",
    email: "sven@auroraretail.se",
    phone: "+46 8 121 44 90",
    segment: "Mid-market",
    tier: "Gold",
    creditLimit: 300000,
    outstanding: 88750,
    status: "active",
    country: "Sweden",
    createdAt: "2024-09-14",
  },
  {
    id: "c_1006",
    name: "Sandhill Ceramics",
    contact: "Nora Vance",
    email: "nora@sandhill.us",
    phone: "+1 415 555 0119",
    segment: "SMB",
    tier: "Bronze",
    creditLimit: 40000,
    outstanding: 4120,
    status: "prospect",
    country: "United States",
    createdAt: "2025-06-04",
  },
];

export const categories: Category[] = [
  { id: "cat_1", name: "Industrial Fasteners", code: "IND-FST", productCount: 184, marginFloor: 22, ceiling: 18, parent: null },
  { id: "cat_2", name: "Conveyor Systems", code: "CNV-SYS", productCount: 62, marginFloor: 28, ceiling: 12, parent: null },
  { id: "cat_3", name: "Cold Chain Units", code: "CLD-CHN", productCount: 41, marginFloor: 31, ceiling: 10, parent: null },
  { id: "cat_4", name: "Packaging Consumables", code: "PKG-CNS", productCount: 296, marginFloor: 17, ceiling: 25, parent: null },
  { id: "cat_5", name: "Safety & PPE", code: "SFT-PPE", productCount: 128, marginFloor: 24, ceiling: 15, parent: null },
  { id: "cat_6", name: "Spare Parts", code: "SPR-PRT", productCount: 512, marginFloor: 35, ceiling: 8, parent: "Conveyor Systems" },
];

export const products: Product[] = [
  {
    id: "p_2001",
    name: "TitanGrip Hex Bolt M12",
    sku: "IND-FST-1201",
    categoryId: "cat_1",
    category: "Industrial Fasteners",
    listPrice: 2.4,
    cost: 1.55,
    uom: "piece",
    status: "active",
    stock: 48200,
    description:
      "Zinc-flake coated hex bolt rated to 10.9 tensile class. Sold in boxes of 250 with batch traceability.",
    variants: [
      { id: "v_1", sku: "IND-FST-1201-Z", label: "Zinc flake · 40mm", price: 2.4, stock: 22400, status: "active" },
      { id: "v_2", sku: "IND-FST-1201-S", label: "Stainless A4 · 40mm", price: 3.9, stock: 14800, status: "active" },
      { id: "v_3", sku: "IND-FST-1201-L", label: "Zinc flake · 65mm", price: 2.95, stock: 11000, status: "active" },
    ],
  },
  {
    id: "p_2002",
    name: "FlexLine Modular Belt 800mm",
    sku: "CNV-SYS-0800",
    categoryId: "cat_2",
    category: "Conveyor Systems",
    listPrice: 1840,
    cost: 1215,
    uom: "metre",
    status: "active",
    stock: 640,
    description: "Food-grade modular belt with quick-release links and 800mm working width.",
    variants: [
      { id: "v_4", sku: "CNV-SYS-0800-STD", label: "Standard pitch", price: 1840, stock: 380, status: "active" },
      { id: "v_5", sku: "CNV-SYS-0800-HD", label: "Heavy duty pitch", price: 2210, stock: 260, status: "active" },
    ],
  },
  {
    id: "p_2003",
    name: "PolarCore Chiller 4T",
    sku: "CLD-CHN-4000",
    categoryId: "cat_3",
    category: "Cold Chain Units",
    listPrice: 12450,
    cost: 8930,
    uom: "unit",
    status: "active",
    stock: 34,
    description: "4-tonne capacity blast chiller with remote telemetry and CO₂ refrigerant loop.",
    variants: [
      { id: "v_6", sku: "CLD-CHN-4000-EU", label: "EU 400V", price: 12450, stock: 22, status: "active" },
      { id: "v_7", sku: "CLD-CHN-4000-US", label: "US 480V", price: 13100, stock: 12, status: "active" },
    ],
  },
  {
    id: "p_2004",
    name: "KraftShield Corrugated Box L",
    sku: "PKG-CNS-0450",
    categoryId: "cat_4",
    category: "Packaging Consumables",
    listPrice: 1.15,
    cost: 0.82,
    uom: "piece",
    status: "active",
    stock: 210400,
    description: "Double-wall corrugated shipper, 450×350×300mm, 60% recycled content.",
    variants: [
      { id: "v_8", sku: "PKG-CNS-0450-P", label: "Plain", price: 1.15, stock: 160400, status: "active" },
      { id: "v_9", sku: "PKG-CNS-0450-B", label: "Branded print", price: 1.42, stock: 50000, status: "active" },
    ],
  },
  {
    id: "p_2005",
    name: "GuardPro Cut-5 Glove",
    sku: "SFT-PPE-0055",
    categoryId: "cat_5",
    category: "Safety & PPE",
    listPrice: 8.6,
    cost: 5.1,
    uom: "pair",
    status: "active",
    stock: 18900,
    description: "EN388 cut level 5 glove with nitrile palm coating and touchscreen fingertips.",
    variants: [
      { id: "v_10", sku: "SFT-PPE-0055-M", label: "Size M", price: 8.6, stock: 7400, status: "active" },
      { id: "v_11", sku: "SFT-PPE-0055-L", label: "Size L", price: 8.6, stock: 8100, status: "active" },
      { id: "v_12", sku: "SFT-PPE-0055-XL", label: "Size XL", price: 8.9, stock: 3400, status: "draft" },
    ],
  },
  {
    id: "p_2006",
    name: "FlexLine Drive Motor 2.2kW",
    sku: "SPR-PRT-2200",
    categoryId: "cat_6",
    category: "Spare Parts",
    listPrice: 985,
    cost: 610,
    uom: "unit",
    status: "discontinued",
    stock: 12,
    description: "Legacy drive motor for FlexLine v2 frames. Replaced by SPR-PRT-2400.",
    variants: [{ id: "v_13", sku: "SPR-PRT-2200-STD", label: "Standard", price: 985, stock: 12, status: "discontinued" }],
  },
];

export const warehouses: Warehouse[] = [
  { id: "w_1", name: "Rotterdam Central", code: "RTM-01", city: "Rotterdam", country: "Netherlands", capacity: 42000, utilisation: 78, manager: "Joost de Vries", status: "operational" },
  { id: "w_2", name: "Milan South", code: "MIL-02", city: "Milan", country: "Italy", capacity: 18500, utilisation: 91, manager: "Giulia Rossi", status: "operational" },
  { id: "w_3", name: "Gothenburg Cold Hub", code: "GOT-03", city: "Gothenburg", country: "Sweden", capacity: 9600, utilisation: 54, manager: "Emil Berg", status: "maintenance" },
  { id: "w_4", name: "Leeds Fulfilment", code: "LDS-04", city: "Leeds", country: "United Kingdom", capacity: 26000, utilisation: 66, manager: "Priya Nair", status: "operational" },
];

export const stockLevels: StockLevel[] = [
  { id: "sl_1", sku: "IND-FST-1201-Z", product: "TitanGrip Hex Bolt M12 · Zinc", warehouse: "Rotterdam Central", warehouseId: "w_1", onHand: 22400, reserved: 4100, available: 18300, reorderPoint: 8000 },
  { id: "sl_2", sku: "CNV-SYS-0800-STD", product: "FlexLine Modular Belt 800mm", warehouse: "Rotterdam Central", warehouseId: "w_1", onHand: 380, reserved: 120, available: 260, reorderPoint: 150 },
  { id: "sl_3", sku: "CLD-CHN-4000-EU", product: "PolarCore Chiller 4T · EU", warehouse: "Gothenburg Cold Hub", warehouseId: "w_3", onHand: 22, reserved: 9, available: 13, reorderPoint: 15 },
  { id: "sl_4", sku: "PKG-CNS-0450-P", product: "KraftShield Box L · Plain", warehouse: "Leeds Fulfilment", warehouseId: "w_4", onHand: 160400, reserved: 42000, available: 118400, reorderPoint: 60000 },
  { id: "sl_5", sku: "SFT-PPE-0055-L", product: "GuardPro Cut-5 Glove · L", warehouse: "Milan South", warehouseId: "w_2", onHand: 8100, reserved: 2600, available: 5500, reorderPoint: 3000 },
  { id: "sl_6", sku: "SPR-PRT-2200-STD", product: "FlexLine Drive Motor 2.2kW", warehouse: "Milan South", warehouseId: "w_2", onHand: 12, reserved: 10, available: 2, reorderPoint: 20 },
];

export const stockAdjustments: StockAdjustment[] = [
  { id: "sa_1", reference: "ADJ-2026-0412", sku: "IND-FST-1201-Z", warehouse: "Rotterdam Central", quantity: -320, reason: "Cycle count variance", createdBy: "Joost de Vries", createdAt: "2026-09-03 09:12", status: "posted" },
  { id: "sa_2", reference: "ADJ-2026-0411", sku: "CLD-CHN-4000-EU", warehouse: "Gothenburg Cold Hub", quantity: 4, reason: "Return to stock", createdBy: "Emil Berg", createdAt: "2026-09-02 16:40", status: "posted" },
  { id: "sa_3", reference: "ADJ-2026-0410", sku: "SFT-PPE-0055-L", warehouse: "Milan South", quantity: -85, reason: "Damaged in transit", createdBy: "Giulia Rossi", createdAt: "2026-09-01 11:05", status: "draft" },
];

export const pricelists: Pricelist[] = [
  { id: "pl_1", name: "EU Enterprise 2026", currency: "EUR", segment: "Enterprise", validFrom: "2026-01-01", validTo: "2026-12-31", items: 1284, status: "active" },
  { id: "pl_2", name: "Nordics Mid-market", currency: "SEK", segment: "Mid-market", validFrom: "2026-04-01", validTo: "2027-03-31", items: 642, status: "active" },
  { id: "pl_3", name: "UK Distributor", currency: "GBP", segment: "Distributor", validFrom: "2026-10-01", validTo: "2027-09-30", items: 918, status: "scheduled" },
  { id: "pl_4", name: "Legacy SMB 2025", currency: "EUR", segment: "SMB", validFrom: "2025-01-01", validTo: "2025-12-31", items: 410, status: "expired" },
];

export const discountTiers: DiscountTier[] = [
  { id: "dt_1", name: "Volume Tier 1", minQty: 100, maxQty: 499, discountPct: 4, appliesTo: "All categories", requiresApproval: false },
  { id: "dt_2", name: "Volume Tier 2", minQty: 500, maxQty: 1999, discountPct: 8, appliesTo: "All categories", requiresApproval: false },
  { id: "dt_3", name: "Volume Tier 3", minQty: 2000, maxQty: 9999, discountPct: 13, appliesTo: "Fasteners, Packaging", requiresApproval: true },
  { id: "dt_4", name: "Strategic Override", minQty: 10000, maxQty: null, discountPct: 19, appliesTo: "Negotiated accounts", requiresApproval: true },
];

export const categoryCeilings: CategoryCeiling[] = [
  { id: "cc_1", category: "Industrial Fasteners", maxDiscountPct: 18, marginFloorPct: 22, owner: "Pricing Council" },
  { id: "cc_2", category: "Conveyor Systems", maxDiscountPct: 12, marginFloorPct: 28, owner: "Marcus Lin" },
  { id: "cc_3", category: "Cold Chain Units", maxDiscountPct: 10, marginFloorPct: 31, owner: "Marcus Lin" },
  { id: "cc_4", category: "Packaging Consumables", maxDiscountPct: 25, marginFloorPct: 17, owner: "Pricing Council" },
  { id: "cc_5", category: "Safety & PPE", maxDiscountPct: 15, marginFloorPct: 24, owner: "Dana Ortiz" },
];

export const approvalRules: ApprovalRule[] = [
  { id: "ar_1", name: "Discount above ceiling", trigger: "Line discount > category ceiling", threshold: "> ceiling", approvers: ["Pricing Council", "Regional Director"], slaHours: 12, active: true },
  { id: "ar_2", name: "Large deal review", trigger: "Quote total exceeds threshold", threshold: "> €250,000", approvers: ["CFO"], slaHours: 24, active: true },
  { id: "ar_3", name: "Margin floor breach", trigger: "Blended margin below floor", threshold: "< 18%", approvers: ["Pricing Council"], slaHours: 8, active: true },
  { id: "ar_4", name: "Credit hold override", trigger: "Customer over credit limit", threshold: "Outstanding > limit", approvers: ["Credit Control", "CFO"], slaHours: 6, active: false },
];

export const quotations: Quotation[] = [
  {
    id: "q_5001",
    number: "QT-2026-0198",
    customer: "Northwind Industrials",
    customerId: "c_1001",
    owner: "Kavya Gajjar",
    status: "pending_approval",
    currency: "EUR",
    subtotal: 286400,
    discount: 34368,
    total: 252032,
    marginPct: 19.4,
    riskScore: 72,
    validUntil: "2026-09-30",
    createdAt: "2026-09-01",
    lines: [
      { id: "ql_1", sku: "CNV-SYS-0800-STD", product: "FlexLine Modular Belt 800mm", qty: 120, unitPrice: 1840, discountPct: 12, total: 194304, marginPct: 18.2 },
      { id: "ql_2", sku: "IND-FST-1201-Z", product: "TitanGrip Hex Bolt M12 · Zinc", qty: 24000, unitPrice: 2.4, discountPct: 14, total: 49536, marginPct: 24.8 },
      { id: "ql_3", sku: "SFT-PPE-0055-L", product: "GuardPro Cut-5 Glove · L", qty: 1000, unitPrice: 8.6, discountPct: 8, total: 7912, marginPct: 34.1 },
    ],
    timeline: [
      { id: "t_1", label: "Quote drafted", actor: "Kavya Gajjar", at: "01 Sep · 10:14", state: "done" },
      { id: "t_2", label: "Pricing validated", actor: "System", at: "01 Sep · 10:16", state: "done" },
      { id: "t_3", label: "Sent to Pricing Council", actor: "Kavya Gajjar", at: "02 Sep · 08:40", state: "current" },
      { id: "t_4", label: "Customer acceptance", actor: "Northwind Industrials", at: "Pending", state: "upcoming" },
    ],
    suggestions: [
      { id: "s_1", title: "Attach 24-month service plan", detail: "Northwind accepted service bundles on 4 of last 5 conveyor orders.", impact: "+€18,400 ARR", kind: "upsell" },
      { id: "s_2", title: "Belt discount breaches ceiling", detail: "Conveyor ceiling is 12% — line 1 sits exactly at the limit with 18.2% margin.", impact: "Approval required", kind: "risk" },
      { id: "s_3", title: "Switch to EU Enterprise 2026 list", detail: "Customer is still priced from the legacy list on 2 lines.", impact: "+1.8% margin", kind: "pricing" },
    ],
  },
  {
    id: "q_5002",
    number: "QT-2026-0197",
    customer: "Kestrel Logistics",
    customerId: "c_1004",
    owner: "Dana Ortiz",
    status: "approved",
    currency: "GBP",
    subtotal: 91200,
    discount: 6384,
    total: 84816,
    marginPct: 27.6,
    riskScore: 24,
    validUntil: "2026-09-22",
    createdAt: "2026-08-27",
    lines: [
      { id: "ql_4", sku: "PKG-CNS-0450-B", product: "KraftShield Box L · Branded", qty: 48000, unitPrice: 1.42, discountPct: 7, total: 63398, marginPct: 24.2 },
      { id: "ql_5", sku: "SFT-PPE-0055-M", product: "GuardPro Cut-5 Glove · M", qty: 2600, unitPrice: 8.6, discountPct: 5, total: 21242, marginPct: 33.4 },
    ],
    timeline: [
      { id: "t_5", label: "Quote drafted", actor: "Dana Ortiz", at: "27 Aug · 14:02", state: "done" },
      { id: "t_6", label: "Approved by CFO", actor: "M. Achebe", at: "28 Aug · 09:31", state: "done" },
      { id: "t_7", label: "Sent to customer", actor: "Dana Ortiz", at: "28 Aug · 10:00", state: "current" },
    ],
    suggestions: [
      { id: "s_4", title: "Offer quarterly replenishment plan", detail: "Order cadence is predictable — convert to subscription.", impact: "+£4,100 MRR", kind: "upsell" },
    ],
  },
  {
    id: "q_5003",
    number: "QT-2026-0196",
    customer: "Aurora Retail Group",
    customerId: "c_1005",
    owner: "Kavya Gajjar",
    status: "draft",
    currency: "SEK",
    subtotal: 412000,
    discount: 20600,
    total: 391400,
    marginPct: 22.1,
    riskScore: 41,
    validUntil: "2026-10-05",
    createdAt: "2026-08-30",
    lines: [
      { id: "ql_6", sku: "CLD-CHN-4000-EU", product: "PolarCore Chiller 4T · EU", qty: 3, unitPrice: 129000, discountPct: 5, total: 367650, marginPct: 21.4 },
      { id: "ql_7", sku: "SPR-PRT-2200-STD", product: "FlexLine Drive Motor 2.2kW", qty: 2, unitPrice: 11875, discountPct: 0, total: 23750, marginPct: 33.0 },
    ],
    timeline: [{ id: "t_8", label: "Quote drafted", actor: "Kavya Gajjar", at: "30 Aug · 16:22", state: "current" }],
    suggestions: [
      { id: "s_5", title: "Stock risk on chillers", detail: "Only 13 units available in Gothenburg and one is reserved elsewhere.", impact: "Check lead time", kind: "risk" },
    ],
  },
  {
    id: "q_5004",
    number: "QT-2026-0195",
    customer: "Halden Foodworks",
    customerId: "c_1002",
    owner: "Marcus Lin",
    status: "won",
    currency: "EUR",
    subtotal: 68400,
    discount: 4104,
    total: 64296,
    marginPct: 25.8,
    riskScore: 18,
    validUntil: "2026-09-12",
    createdAt: "2026-08-18",
    lines: [
      { id: "ql_8", sku: "IND-FST-1201-S", product: "TitanGrip Hex Bolt M12 · Stainless", qty: 16000, unitPrice: 3.9, discountPct: 6, total: 58656, marginPct: 25.1 },
    ],
    timeline: [
      { id: "t_9", label: "Quote drafted", actor: "Marcus Lin", at: "18 Aug · 09:00", state: "done" },
      { id: "t_10", label: "Customer accepted", actor: "Peter Halden", at: "21 Aug · 12:44", state: "done" },
    ],
    suggestions: [],
  },
  {
    id: "q_5005",
    number: "QT-2026-0194",
    customer: "Ferro & Sons",
    customerId: "c_1003",
    owner: "Dana Ortiz",
    status: "lost",
    currency: "EUR",
    subtotal: 24100,
    discount: 3615,
    total: 20485,
    marginPct: 14.2,
    riskScore: 88,
    validUntil: "2026-08-31",
    createdAt: "2026-08-05",
    lines: [
      { id: "ql_9", sku: "PKG-CNS-0450-P", product: "KraftShield Box L · Plain", qty: 18000, unitPrice: 1.15, discountPct: 15, total: 17595, marginPct: 13.1 },
    ],
    timeline: [
      { id: "t_11", label: "Quote drafted", actor: "Dana Ortiz", at: "05 Aug · 11:10", state: "done" },
      { id: "t_12", label: "Lost to competitor", actor: "Luca Ferro", at: "29 Aug · 15:02", state: "done" },
    ],
    suggestions: [],
  },
];

export const invoices: Invoice[] = [
  { id: "i_1", number: "INV-2026-1044", customer: "Northwind Industrials", issuedAt: "2026-08-02", dueAt: "2026-09-01", amount: 128400, paid: 128400, currency: "EUR", status: "paid" },
  { id: "i_2", number: "INV-2026-1051", customer: "Aurora Retail Group", issuedAt: "2026-08-14", dueAt: "2026-09-13", amount: 88750, paid: 40000, currency: "SEK", status: "partial" },
  { id: "i_3", number: "INV-2026-1058", customer: "Ferro & Sons", issuedAt: "2026-07-20", dueAt: "2026-08-19", amount: 61200, paid: 0, currency: "EUR", status: "overdue" },
  { id: "i_4", number: "INV-2026-1062", customer: "Halden Foodworks", issuedAt: "2026-08-28", dueAt: "2026-09-27", amount: 34980, paid: 0, currency: "EUR", status: "open" },
  { id: "i_5", number: "INV-2026-1066", customer: "Kestrel Logistics", issuedAt: "2026-09-01", dueAt: "2026-10-01", amount: 84816, paid: 0, currency: "GBP", status: "open" },
];

export const payments: Payment[] = [
  { id: "pay_1", reference: "PMT-88214", invoice: "INV-2026-1044", method: "bank_transfer", amount: 128400, currency: "EUR", receivedAt: "2026-08-30 09:12", status: "settled" },
  { id: "pay_2", reference: "PMT-88231", invoice: "INV-2026-1051", method: "card", amount: 40000, currency: "SEK", receivedAt: "2026-09-02 14:03", status: "settled" },
  { id: "pay_3", reference: "PMT-88240", invoice: "INV-2026-1058", method: "sepa", amount: 61200, currency: "EUR", receivedAt: "2026-09-04 08:45", status: "failed" },
  { id: "pay_4", reference: "PMT-88246", invoice: "INV-2026-1062", method: "bank_transfer", amount: 15000, currency: "EUR", receivedAt: "2026-09-05 11:20", status: "pending" },
];

export const approvalRequests: ApprovalRequest[] = [
  {
    id: "ap_1",
    reference: "APR-2026-0331",
    subject: "QT-2026-0198 · Northwind Industrials",
    type: "quotation",
    requestedBy: "Kavya Gajjar",
    requestedAt: "2026-09-02 08:40",
    amount: 252032,
    currency: "EUR",
    riskScore: 72,
    slaHoursLeft: 6,
    status: "pending",
    notes: "Conveyor line sits at the 12% category ceiling; customer is comparing against a Dutch distributor.",
    steps: [
      { id: "st_1", name: "Pricing validation", approver: "System", state: "approved", actedAt: "02 Sep · 08:41" },
      { id: "st_2", name: "Pricing Council", approver: "Marcus Lin", state: "pending" },
      { id: "st_3", name: "Regional Director", approver: "M. Achebe", state: "upcoming" },
    ],
  },
  {
    id: "ap_2",
    reference: "APR-2026-0330",
    subject: "Discount override · Aurora Retail Group",
    type: "discount",
    requestedBy: "Dana Ortiz",
    requestedAt: "2026-09-01 15:22",
    amount: 391400,
    currency: "SEK",
    riskScore: 44,
    slaHoursLeft: 19,
    status: "pending",
    notes: "Requesting 5% on cold chain units to protect a three-unit rollout.",
    steps: [
      { id: "st_4", name: "Pricing Council", approver: "Marcus Lin", state: "pending" },
      { id: "st_5", name: "CFO", approver: "M. Achebe", state: "upcoming" },
    ],
  },
  {
    id: "ap_3",
    reference: "APR-2026-0328",
    subject: "Credit hold override · Ferro & Sons",
    type: "credit",
    requestedBy: "Credit Control",
    requestedAt: "2026-08-29 10:05",
    amount: 61200,
    currency: "EUR",
    riskScore: 91,
    slaHoursLeft: -4,
    status: "returned",
    notes: "Returned for a payment plan proposal before release.",
    steps: [
      { id: "st_6", name: "Credit Control", approver: "Ines Duarte", state: "approved", actedAt: "29 Aug · 10:40" },
      { id: "st_7", name: "CFO", approver: "M. Achebe", state: "returned", actedAt: "30 Aug · 09:15", comment: "Need a written payment plan first." },
    ],
  },
  {
    id: "ap_4",
    reference: "APR-2026-0326",
    subject: "QT-2026-0197 · Kestrel Logistics",
    type: "quotation",
    requestedBy: "Dana Ortiz",
    requestedAt: "2026-08-27 14:10",
    amount: 84816,
    currency: "GBP",
    riskScore: 24,
    slaHoursLeft: 0,
    status: "approved",
    steps: [
      { id: "st_8", name: "Pricing Council", approver: "Marcus Lin", state: "approved", actedAt: "27 Aug · 16:02" },
      { id: "st_9", name: "CFO", approver: "M. Achebe", state: "approved", actedAt: "28 Aug · 09:31", comment: "Healthy margin, approved." },
    ],
  },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  { id: "sp_1", name: "Replenish Essentials", interval: "monthly", price: 490, currency: "EUR", seats: 5, subscribers: 142, mrr: 69580, status: "active", features: ["Auto replenishment", "Standard SLA", "Email support"] },
  { id: "sp_2", name: "Replenish Plus", interval: "monthly", price: 1290, currency: "EUR", seats: 20, subscribers: 68, mrr: 87720, status: "active", features: ["Priority stock hold", "4h SLA", "Dedicated CSM", "Quarterly pricing review"] },
  { id: "sp_3", name: "Enterprise Care", interval: "annual", price: 24000, currency: "EUR", seats: 100, subscribers: 19, mrr: 38000, status: "active", features: ["Named engineer", "1h SLA", "On-site audits", "Custom pricelists"] },
  { id: "sp_4", name: "Cold Chain Watch", interval: "quarterly", price: 2100, currency: "EUR", seats: 10, subscribers: 7, mrr: 4900, status: "draft", features: ["Telemetry monitoring", "Preventive maintenance"] },
];

export const upsellRules: UpsellRule[] = [
  { id: "ur_1", name: "Essentials → Plus on volume", trigger: "3 months above 120% of plan volume", action: "Suggest plan upgrade in quote", planFrom: "Replenish Essentials", planTo: "Replenish Plus", conversion: 34, active: true },
  { id: "ur_2", name: "Attach service on conveyor deals", trigger: "Quote contains conveyor category", action: "Add 24-month service line", planFrom: "—", planTo: "Enterprise Care", conversion: 22, active: true },
  { id: "ur_3", name: "Cold chain telemetry attach", trigger: "Chiller unit purchased", action: "Offer Cold Chain Watch trial", planFrom: "—", planTo: "Cold Chain Watch", conversion: 41, active: false },
];

export const dashboardStats: DashboardStats = {
  pipelineValue: 1284900,
  quotesOpen: 38,
  winRate: 46.5,
  avgMargin: 23.8,
  pendingApprovals: 2,
  overdueInvoices: 1,
  mrr: 200200,
  revenueSeries: [
    { month: "Mar", revenue: 412000, quotes: 24 },
    { month: "Apr", revenue: 468000, quotes: 28 },
    { month: "May", revenue: 501000, quotes: 31 },
    { month: "Jun", revenue: 474000, quotes: 27 },
    { month: "Jul", revenue: 552000, quotes: 35 },
    { month: "Aug", revenue: 614000, quotes: 38 },
  ],
  marginByCategory: [
    { category: "Fasteners", margin: 24.8 },
    { category: "Conveyor", margin: 18.2 },
    { category: "Cold chain", margin: 21.4 },
    { category: "Packaging", margin: 17.6 },
    { category: "Safety", margin: 33.4 },
  ],
};

export const staffUsers: StaffUser[] = [
  { id: "u_1", name: "Kavya Gajjar", email: "kavya@dealflow.io", role: "admin", active: true, createdAt: "2025-01-12", lastLoginAt: "2026-09-04T08:12:00Z", twoFactorEnabled: true },
  { id: "u_2", name: "Marcus Reed", email: "marcus@dealflow.io", role: "sales_rep", active: true, createdAt: "2025-02-04", lastLoginAt: "2026-09-04T07:40:00Z" },
  { id: "u_3", name: "Ilse Bakker", email: "ilse@dealflow.io", role: "sales_rep", active: true, createdAt: "2025-03-19", lastLoginAt: "2026-09-03T16:05:00Z" },
  { id: "u_4", name: "Devon Clarke", email: "devon@dealflow.io", role: "sales_manager", active: true, createdAt: "2025-01-28", lastLoginAt: "2026-09-04T06:55:00Z", twoFactorEnabled: true },
  { id: "u_5", name: "Priya Nair", email: "priya@dealflow.io", role: "finance", active: true, createdAt: "2025-02-14", lastLoginAt: "2026-09-03T18:22:00Z", twoFactorEnabled: true },
  { id: "u_6", name: "Tom Okafor", email: "tom@dealflow.io", role: "warehouse", active: true, createdAt: "2025-04-02", lastLoginAt: "2026-09-04T05:10:00Z" },
  { id: "u_7", name: "Lena Fischer", email: "ops@northwind.example", role: "customer", active: true, createdAt: "2025-06-11", lastLoginAt: "2026-09-02T11:31:00Z" },
  { id: "u_8", name: "Ravi Menon", email: "ravi@dealflow.io", role: "sales_rep", active: false, createdAt: "2025-05-06" },
];

export const fulfillmentOrders: FulfillmentOrder[] = [
  {
    id: "f_1",
    reference: "FUL-2041",
    quotationId: "q-1",
    customer: "Northwind Industrial",
    confirmedAt: "2026-09-03T09:20:00Z",
    status: "awaiting_stock",
    lines: [
      { id: "fl_1", sku: "FST-M12-SS", product: "Stainless bolt M12", warehouse: "Rotterdam DC", required: 4200, available: 3100 },
      { id: "fl_2", sku: "CNV-BLT-800", product: "Conveyor belt 800mm", warehouse: "Rotterdam DC", required: 12, available: 12 },
    ],
  },
  {
    id: "f_2",
    reference: "FUL-2042",
    quotationId: "q-2",
    customer: "Halden Foods",
    confirmedAt: "2026-09-02T14:05:00Z",
    status: "ready",
    lines: [
      { id: "fl_3", sku: "CLD-SNS-02", product: "Cold chain sensor", warehouse: "Lyon Hub", required: 260, available: 340 },
    ],
  },
  {
    id: "f_3",
    reference: "FUL-2039",
    quotationId: "q-3",
    customer: "Vega Packaging",
    confirmedAt: "2026-08-28T10:45:00Z",
    status: "fulfilled",
    lines: [
      { id: "fl_4", sku: "PKG-STR-45", product: "Stretch film 45µ", warehouse: "Rotterdam DC", required: 900, available: 900 },
    ],
  },
];

export const counterOffers: CounterOffer[] = [
  { id: "co_1", lineId: "l_1", sku: "FST-M12-SS", product: "Stainless bolt M12", quotedPrice: 1.42, requestedPrice: 1.28, qty: 4200, state: "proposed", note: "Matching our Q3 framework price." },
  { id: "co_2", lineId: "l_2", sku: "CNV-BLT-800", product: "Conveyor belt 800mm", quotedPrice: 1180, requestedPrice: 1120, qty: 12, state: "declined" },
];

export const appSettings: AppSetting[] = [
  { key: "risk_threshold", label: "Risk escalation threshold", value: 70, type: "number", description: "Quotes above this score always require manager review." },
  { key: "manager_discount_cap", label: "Manager discount cap", value: 18, type: "number", description: "Maximum discount a sales manager can approve alone (%)." },
  { key: "approval_sla_hours", label: "Approval SLA", value: 24, type: "number", description: "Hours before a pending approval breaches SLA." },
  { key: "allow_counter_offers", label: "Customer counter-offers", value: true, type: "boolean", description: "Let portal customers propose line prices (never auto-applied)." },
  { key: "invoice_terms", label: "Default invoice terms", value: "Net 30", type: "text", description: "Applied to invoices created from confirmed quotes." },
];

/** Offline sample-data resolver used when the API host is unreachable. */
export function mockResolve<T>(
  path: string,
  method: string,
  body?: unknown,
  query?: Record<string, unknown>,
): T | undefined {
  const raw = path.replace(/^\//, "").split("?")[0] ?? "";
  // Router prefixes (/catalog, /pricing, ...) are stripped so one map serves both shapes.
  const prefixes = ["catalog", "pricing", "discount", "billing", "warehouse", "subscriptions", "portal"];
  const parts = raw.split("/");
  const p = prefixes.includes(parts[0] ?? "") && parts.length > 1 ? parts.slice(1).join("/") : raw;
  const seg = p.split("/");

  if (method !== "GET") {
    // Optimistic echo so create/update flows still complete in demo mode.
    if (raw.startsWith("auth/")) {
      return {
        access_token: "demo-access-token",
        refresh_token: "demo-refresh-token",
        user: demoUser,
        message: "ok",
      } as T;
    }
    return { ok: true, id: `demo_${Date.now()}`, ...(body as object) } as T;
  }

  if (raw === "portal/me") return (customers[0] ?? null) as T;
  if (seg[0] === "quotations" && seg[2] === "counter-offers") return counterOffers as T;
  if (seg[0] === "quotations" && seg[2] === "timeline") return (quotations[0]?.timeline ?? []) as T;
  if (seg[0] === "quotations" && seg[2] === "suggestions") return (quotations[0]?.suggestions ?? []) as T;
  if (seg[0] === "quotations" && seg[2] === "risk-preview")
    return { riskScore: quotations[0]?.riskScore ?? 0, factors: [] } as T;

  switch (seg[0]) {
    case "auth":
      return demoUser as T;
    case "users":
      return (seg[1] === "me" ? demoUser : seg[1] ? staffUsers.find((u) => u.id === seg[1]) ?? staffUsers[0] : staffUsers) as T;
    case "dashboard":
      return dashboardStats as T;
    case "customers":
      return (seg[1] ? customers.find((c) => c.id === seg[1]) ?? customers[0] : customers) as T;
    case "categories":
      return categories as T;
    case "products":
      return (seg[1] ? products.find((x) => x.id === seg[1]) ?? products[0] : products) as T;
    case "variants":
      return products.flatMap((x) => x.variants) as T;
    case "warehouses":
      return (seg[1] ? warehouses.find((w) => w.id === seg[1]) ?? warehouses[0] : warehouses) as T;
    case "stock":
    case "stock-levels":
      return (
        query?.["warehouseId"]
          ? stockLevels.filter((s) => s.warehouseId === query["warehouseId"])
          : stockLevels
      ) as T;
    case "stock-adjustments":
      return stockAdjustments as T;
    case "fulfillment":
      return (
        seg[1] ? fulfillmentOrders.find((f) => f.id === seg[1]) ?? fulfillmentOrders[0] : fulfillmentOrders
      ) as T;
    case "pricelists":
      return pricelists as T;
    case "resolve":
      return { price: products[0]?.listPrice ?? 0, source: "pricelist" } as T;
    case "discount-tiers":
      return discountTiers as T;
    case "category-ceilings":
      return categoryCeilings as T;
    case "approval-rules":
      return approvalRules as T;
    case "settings":
      return appSettings as T;
    case "discount-policy":
      return { maxDiscountPct: 18, source: "category_ceiling" } as T;
    case "quotations":
      return (seg[1] ? quotations.find((q) => q.id === seg[1]) ?? quotations[0] : quotations) as T;
    case "invoices":
      return invoices as T;
    case "payments":
      return payments as T;
    case "approvals":
      return (
        seg[1] ? approvalRequests.find((a) => a.id === seg[1]) ?? approvalRequests[0] : approvalRequests
      ) as T;
    case "plans":
    case "subscription-plans":
      return subscriptionPlans as T;
    case "upsell-rules":
      return upsellRules as T;
    default:
      return undefined;
  }
}

