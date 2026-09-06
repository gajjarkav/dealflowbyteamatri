import {
  BadgePercent,
  Boxes,
  CheckCircle2,
  CreditCard,
  FileText,
  Gauge,
  LayoutDashboard,
  Package,
  Repeat,
  Settings2,
  ShieldCheck,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RoleKey = "admin" | "rep" | "manager" | "finance" | "warehouse" | "customer";

export type NavItem = { title: string; to: string; exact?: boolean };
export type NavGroup = { label: string; icon: LucideIcon; items: NavItem[] };

export type PanelConfig = {
  key: RoleKey;
  /** Short label used in the panel switcher. */
  label: string;
  /** Job title shown in the sidebar footer. */
  title: string;
  /** Sentence explaining what this panel is for. */
  purpose: string;
  landing: string;
  external?: boolean;
  nav: NavGroup[];
};

const overview: NavGroup = {
  label: "Overview",
  icon: LayoutDashboard,
  items: [
    { title: "Panel home", to: "/", exact: true },
    { title: "Profile & security", to: "/profile" },
  ],
};

export const panels: Record<RoleKey, PanelConfig> = {
  admin: {
    key: "admin",
    label: "Admin",
    title: "Platform administrator",
    purpose: "Creates staff accounts, owns pricing policy and reads platform-wide reporting.",
    landing: "/",
    nav: [
      overview,
      {
        label: "People",
        icon: Users,
        items: [
          { title: "Users & roles", to: "/admin/users" },
          { title: "Customers", to: "/customers", exact: true },
          { title: "Add customer", to: "/customers/new" },
        ],
      },
      {
        label: "Catalog",
        icon: Package,
        items: [
          { title: "Categories", to: "/catalog/categories" },
          { title: "Products", to: "/catalog/products", exact: true },
          { title: "Variants", to: "/catalog/variants" },
        ],
      },
      {
        label: "Policy",
        icon: BadgePercent,
        items: [
          { title: "Pricelists", to: "/pricing/pricelists" },
          { title: "Discount tiers", to: "/pricing/discounts" },
          { title: "Category ceilings", to: "/pricing/ceilings" },
          { title: "Approval rules", to: "/pricing/approval-rules" },
          { title: "App settings", to: "/admin/settings" },
        ],
      },
      {
        label: "Reporting",
        icon: Gauge,
        items: [{ title: "Admin reporting", to: "/admin/reporting" }],
      },
    ],
  },

  rep: {
    key: "rep",
    label: "Sales rep",
    title: "Sales representative",
    purpose: "Builds quotes, watches risk before submitting and owns the customer relationship.",
    landing: "/",
    nav: [
      overview,
      {
        label: "Quotations",
        icon: FileText,
        items: [
          { title: "My quotes", to: "/quotations", exact: true },
          { title: "New quote", to: "/quotations/new" },
        ],
      },
      {
        label: "Customers",
        icon: Users,
        items: [
          { title: "All customers", to: "/customers", exact: true },
          { title: "Add customer", to: "/customers/new" },
        ],
      },
      {
        label: "Catalog lookup",
        icon: Boxes,
        items: [
          { title: "Products", to: "/catalog/products", exact: true },
          { title: "Variants", to: "/catalog/variants" },
          { title: "Stock availability", to: "/warehouse/stock" },
        ],
      },
    ],
  },

  manager: {
    key: "manager",
    label: "Sales manager",
    title: "Sales manager",
    purpose: "First-stage approver: signs off discounts, returns weak quotes and watches team health.",
    landing: "/",
    nav: [
      overview,
      {
        label: "Approvals",
        icon: CheckCircle2,
        items: [{ title: "Approval queue", to: "/approvals", exact: true }],
      },
      {
        label: "Team pipeline",
        icon: FileText,
        items: [
          { title: "All quotes", to: "/quotations", exact: true },
          { title: "Deal health", to: "/manager/deal-health" },
        ],
      },
      {
        label: "Guardrails",
        icon: BadgePercent,
        items: [
          { title: "Discount tiers", to: "/pricing/discounts" },
          { title: "Category ceilings", to: "/pricing/ceilings" },
        ],
      },
    ],
  },

  finance: {
    key: "finance",
    label: "Finance",
    title: "Finance controller",
    purpose: "Second-stage approver above the blended-risk limit, owns invoicing and recurring revenue.",
    landing: "/",
    nav: [
      overview,
      {
        label: "Approvals",
        icon: ShieldCheck,
        items: [{ title: "Escalated queue", to: "/approvals", exact: true }],
      },
      {
        label: "Billing",
        icon: CreditCard,
        items: [
          { title: "Invoices", to: "/billing/invoices" },
          { title: "Payments", to: "/billing/payments" },
        ],
      },
      {
        label: "Recurring",
        icon: Repeat,
        items: [
          { title: "Plans", to: "/subscriptions", exact: true },
          { title: "Upsell rules", to: "/subscriptions/upsell-rules" },
        ],
      },
    ],
  },

  warehouse: {
    key: "warehouse",
    label: "Warehouse",
    title: "Warehouse operator",
    purpose: "Fulfilment only — no pricing, margin or customer money data is exposed here.",
    landing: "/",
    nav: [
      {
        label: "Overview",
        icon: LayoutDashboard,
        items: [
          { title: "Panel home", to: "/", exact: true },
          { title: "Profile & security", to: "/profile" },
        ],
      },
      {
        label: "Fulfilment",
        icon: Truck,
        items: [
          { title: "Orders to fulfil", to: "/fulfillment", exact: true },
        ],
      },
      {
        label: "Stock",
        icon: Warehouse,
        items: [
          { title: "Warehouses", to: "/warehouse", exact: true },
          { title: "Stock levels", to: "/warehouse/stock" },
          { title: "Adjustments", to: "/warehouse/adjustments" },
        ],
      },
    ],
  },

  customer: {
    key: "customer",
    label: "Customer portal",
    title: "Customer contact",
    purpose: "External surface: review quotes, counter-offer per line, pay invoices, manage subscriptions.",
    landing: "/portal",
    external: true,
    nav: [
      {
        label: "My account",
        icon: LayoutDashboard,
        items: [
          { title: "Negotiation", to: "/portal", exact: true },
          { title: "Profile & security", to: "/profile" },
        ],
      },
      {
        label: "Documents",
        icon: FileText,
        items: [
          { title: "My quotes", to: "/portal/quotes" },
          { title: "My invoices", to: "/portal/invoices" },
          { title: "My subscriptions", to: "/portal/subscriptions" },
        ],
      },
    ],
  },
};

export const panelOrder: RoleKey[] = ["admin", "rep", "manager", "finance", "warehouse", "customer"];

export const roleSettingsIcon = Settings2;

/** Roles that may act on an approval step. */
export const approverRoles: RoleKey[] = ["manager", "finance", "admin"];

export function isRoleKey(value: unknown): value is RoleKey {
  return typeof value === "string" && value in panels;
}
