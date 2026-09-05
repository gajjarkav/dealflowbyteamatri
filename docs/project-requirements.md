# DealFlow360 — Project Requirements Document

> **Source of truth for the entire frontend build.** Every screen, route, and component must trace back to a requirement listed here.
> **Hackathon**: Odoo Hackathon 2026 — Final Round
> **Repo**: https://github.com/gajjarkav/dealflowbyteamatri
> **Frontend Owner**: Kav Gajjar (you)
> **Demo deadline**: 2026-09-06 10:00 AM IST (Asia/Calcutta)

---

## 1. What is DealFlow360? (One-Paragraph Pitch)

DealFlow360 is an **Intelligent, Self-Governing Sales Operations Platform** — a B2B quotation-to-cash system that goes beyond a simple "quote → invoice" form. It enforces multi-tier discount governance, routes approvals automatically based on a blended risk score, reacts to live inventory by splitting orders across warehouses, reconciles one-time products and recurring subscription lines on the same order, and gives the customer a living, negotiable document through a portal instead of an emailed PDF. The product is a "self-governing deal engine": pricing discipline, inventory reality, and recurring billing are enforced by the system, not by the rep's memory.

The core shift this product makes: a sales quote stops being a static PDF that gets emailed back and forth, and becomes a **living, negotiable, rule-enforced document** that both the sales rep and the customer can act on in real time.

---

## 2. The Core Problem We Solve

Most simple sales tools handle the basics well: create a quote, confirm an order, invoice it. Real B2B sales teams operate in messier conditions:

- **Multi-level discount approvals** — a 12% discount on hardware is fine, but 18% on services needs manager sign-off, and the rep should not have to remember this.
- **Partial stock spread across warehouses** — a 50-unit order might need 30 from the Main Warehouse and 20 from the East Depot, with the system picking the cheapest shipment count.
- **Bundled subscriptions mixed with one-time hardware** — a single order can have a laptop (one-time) plus a 2-year care plan (recurring), and the billing must reconcile both.
- **Customers who want to negotiate inside a portal** instead of over email — they should be able to comment on a line, counter a discount, and confirm terms in one click.
- **Managers who only find out a deal is stuck after it has already lost momentum** — the dashboard must surface stalled quotes, discount anomalies, and delivery slippage *before* the deal dies.

DealFlow360 solves all of these in one coherent system.

---

## 3. Target Customers (Who Will Buy This)

| Segment | Profile | Pain We Solve |
|---|---|---|
| **Mid-market B2B sales teams (50–500 reps)** | SaaS, hardware, industrial, distribution companies | Discount chaos, margin leakage, slow approval cycles |
| **Subscription-first companies** | SaaS + services + hardware bundles (e.g., "device + care plan") | Hybrid billing reconciliation on a single order |
| **Multi-warehouse distributors** | Companies with 2+ stocking locations | Manual stock-split decisions, over-shipment costs |
| **Sales-led GTM teams moving to product-led** | Companies transitioning from email-based quoting to portal-based quoting | Customer-facing negotiation, audit trail |
| **Secondary: Channel partners / resellers** | Indirect sales orgs needing the same governance | Configurable discount tiers per reseller tier |

**ICP (Ideal Customer Profile)**: A B2B company doing 50–500 quotes/month, with at least 2 warehouses, mixing one-time + subscription revenue, and having 2-tier approval (manager + finance). Anything smaller than this is overkill; anything larger needs custom enterprise work.

---

## 4. User Roles (3 Personas)

| Role | What They Do in DealFlow360 | Primary Screens |
|---|---|---|
| **User** | Builds quotations, applies discounts, adds upsell items, tracks approval + fulfillment, responds to customer negotiation requests | Dashboard, Quotation Builder, Quotation List, Fulfillment Detail |
| **Manager / Admin** | Manages backend setup, approvals, product catalog | Admin/Reporting Dashboard, Fulfillment & Stock, Subscriptions, Invoices |
| **Customer (Portal User)** | Views quotation online, requests line-level changes, counters a discount, confirms final terms with one click | Customer Portal Negotiation Screen |

---

## 5. Feature Modules (Full Scope)

### A. Sales Backend (Configuration Area)

| Module | Code | Description |
|---|---|---|
| Authentication | A1 | Users sign up/login with credentials (email, password, phone number); customers access portal via magic link or email/password |
| Product & Price List Management | A2 | General info (Name, Category, Price, Unit, Tax, Description); Variants (attribute + values + extra prices); Price lists (customer-tier-based, currency-specific rules) |
| Discount Tier & Approval Chain Setup | A3 | Discount ceilings per customer tier (Bronze 5%, Silver 10%, Gold 15%); category-specific ceilings; approval chain config (manager-only vs. manager+finance); **blended risk score** computation across mixed-category quotes; full audit log (user, timestamp, reason) |
| Warehouse & Fulfillment Setup | A4 | Create/manage warehouses; configure stock levels + replenishment rules; define shipping cost weighting for auto-split logic |
| Subscription / Recurring Plan Setup | A5 | Define recurring plans (monthly/quarterly/yearly); proration rules for mid-cycle changes; cancellation + partial refund rules |
| Upsell / Cross-Sell Rule Setup (Optional) | A6 | Product pairings from co-purchase history; mark products as "currently promoted"; minimum margin thresholds so only healthy-margin suggestions surface |
| Reporting & Dashboard Configuration | A7 | Filters: Period (today/week/custom range), Sales Team/Rep, Approval Status (pending/approved/rejected), Product/Category; Export: PDF / XLSX |

### B. Sales Frontend (Rep Workspace)

| Module | Code | Description |
|---|---|---|
| Sales Workspace, Top Menu | B1 | Top nav: Quotations, Pipeline; Actions: Reload Data, Go to Back-end, Close Workspace |
| Quotation List / Pipeline View | B2 | Cards showing customer, amount, stage (Draft, Pending Approval, Sent, Confirmed, etc.); **Kanban-style deal pipeline view** |
| Quotation Builder Screen | B3 | Pick products across categories (Hardware/Services/Subscriptions); adjust quantities; apply line-level or order-level discounts; live margin indicator; confirm → approval or direct to fulfillment |
| Discount Approval Screen | B4 | Blended risk score; approval steps list (Sales Manager → Finance if required); approve/reject/return for revision; full audit trail entry |
| Upsell & Cross-Sell Panel | B5 | Ranked suggestion list (co-purchase + active promotions); shows suggested product, margin delta, promotion tag; "Add to Quote" / "Dismiss" buttons; updates margin indicator live |
| Fulfillment & Warehouse Split Screen | B6 | Recommended split based on live stock; shows warehouse name, qty fulfilled, shipment count + cost; "Accept Suggested Split" / "Manual Override"; "Consolidate Remaining Backorder" prompt when stock arrives mid-fulfillment |
| Subscription & Billing Screen | B7 | One-time and recurring lines shown separately in same order; upcoming billing schedule; mid-cycle proration; cancel/modify controls with auto partial refund or credit note |
| Customer Portal Negotiation Screen | B8 | **Separate, restricted view** (not just an internal screen with a different label); shows quotation details + status (Sent/Under Negotiation/Confirmed); line-level comments + change requests; counter discount proposal field; "Submit Request" / "Confirm Quotation"; if final terms exceed thresholds, auto re-enters approval flow |
| Deal Health & Anomaly Dashboard | B9 | Stalled deals (inactive > N days); discount anomaly alerts (above rep's historical average); delivery promise slippage; click alert → opens related quotation; automated nudge/escalation action |

---

## 6. The 18 Screens from the Excalidraw Mockup

These are the screens visible in the mockup at https://app.excalidraw.com/l/65VNwvy7c4X/7Fb5SR3WKu2 — they form the **canonical screen list** for the frontend:

| # | Screen | Category | MVP? |
|---|---|---|---|
| 1 | Login / Signup | Auth | ✅ Yes |
| 2 | Sales Dashboard / Home | Dashboard | ✅ Yes |
| 3 | Quotations (List / Kanban) | Quotations | ✅ Yes |
| 4 | Quotation Detail: Q-1042 (Acme Corp) | Quotations | ✅ Yes |
| 5 | Fulfillment Detail: Q-1042 (Acme Corp) | Fulfillment | Phase 4 |
| 6 | Fulfillment and Stock List | Fulfillment | Phase 4 |
| 7 | Approval Detail: Q-1042 (Acme Corp) | Approvals | Phase 4 |
| 8 | Approvals (List) | Approvals | Phase 4 |
| 9 | Subscriptions (List) | Subscriptions | Phase 5 |
| 10 | Billing Detail: Acme Corp — Care Plan 2yr | Subscriptions | Phase 5 |
| 11 | Customer Portal Negotiation Screen | Customer Portal | Phase 6 |
| 12 | Invoices (List) | Invoices | Phase 5 |
| 13 | Invoice Detail: INV-1042 (Acme Corp) | Invoices | Phase 5 |
| 14 | Deal Health and Anomaly Dashboard | Analytics | Phase 6 |
| 15 | Admin / Reporting Dashboard | Admin | Phase 7 |
| 16 | Product Catalog | Admin Config | Phase 7 |
| 17 | Product and Pricelist | Admin Config | Phase 7 |
| 18 | Discount Tiers and Approval Chains | Admin Config | Phase 7 |

**Note**: The mockup follows a single deal (Acme Corp, Q-1042, Care Plan 2yr, ~$15,000) through the entire lifecycle for demo continuity. The frontend demo should do the same.

---

## 7. The Quick Test Flow (Login → Payment) — Demo Script

This is the exact 8-step flow from the problem statement that the demo must show working end-to-end. Each step should produce a visible, correct result before moving to the next:

1. Sign up or log in, and set up basic backend data: a discount tier, a warehouse, and a subscription plan
2. Create a quotation and add a product line with a discount that is higher than what is normally allowed
3. Confirm the quotation **automatically** asks for manager approval, without the rep having to request it manually
4. While building the quote, accept one upsell suggestion and confirm the order total and margin update right away
5. Get the quotation approved, then confirm that stock is being pulled from the correct warehouse, splitting across two warehouses if needed
6. Check that a one-time product and a recurring subscription on the same order are billed correctly and separately
7. Open the customer portal view and request a bigger discount as the customer, then confirm the quote goes back for approval automatically
8. Confirm the order, record a payment, and check that the invoice status updates correctly

If all 8 steps work smoothly and each result matches what is expected, the core flow is solid.

---

## 8. The Blended Discount Risk Score (Critical Business Logic)

This is the single most important piece of business logic the frontend must surface clearly. The simplest way to think about it: **different products are allowed different discount limits, and the system checks every line against its own limit, not just one overall limit for the whole order.**

### Example

A Gold customer is normally allowed up to 15% discount. But within that same order:

- **Hardware items** are allowed up to 15% (healthy margins)
- **Service items** are allowed only up to 10% (thin margins)

If a rep builds this quote:

- Laptop (Hardware): 12% discount given, 15% allowed → **this line is fine**
- Setup Service (Service): 18% discount given, only 10% allowed → **this line is 8 points over its limit**

Even though the customer is Gold and 15% sounds fine on paper, the Service line broke its own stricter limit. So the **whole quotation gets flagged for approval**, because of that one line.

### Why "blended"?

Sometimes no single line is badly over its limit, but many lines are each a little over. One line 2 points over, another 3 points over, another 2 points over — none of them look alarming alone, but added together across the order, the rep has quietly given away a lot of margin. The blended score looks at the **total pattern across the order**, not just the single worst line, so small violations spread across many lines cannot slip through unnoticed.

### Why this matters for the frontend

The Quotation Builder screen (B3) and the Approval Screen (B4) must both **visually surface**:

- Per-line: discount given vs. category ceiling (with a clear visual indicator when a line is over its own limit)
- Whole-quote: blended risk score (with a clear visual indicator when the whole quote needs approval)
- Approval routing: which level based on the blended score
- The audit trail entry when the quote is approved/rejected/returned

---

## 9. Deliverables (From the Problem Statement)

The hackathon requires:

- ✅ A working application (backend + frontend) with sample seed data — **frontend half is your job**
- ✅ A 5-minute live demo covering at least 2 full flows end-to-end (quotation → fulfillment, and quotation → billing)
- ✅ A one-page architecture diagram showing the data model and how the major modules connect — **see `architecture.md`**
- ✅ A short note on what the team would build next with more time — **see `memory.md` "Future Work" section**

---

## 10. Technical Guidelines (From the Problem Statement)

- Teams may use any tech stack — we are using **Next.js 16 + React 19 + TypeScript + Tailwind v4**
- Core business rules (approval routing, discount governance, warehouse splitting, billing proration) must be implemented in application logic, **not hardcoded or faked for the demo**. Frontend must call real backend endpoints OR use a typed mock layer (e.g., MSW) that mirrors the real contract.
- The customer-facing negotiation screen must be a **real, separate, restricted view** — not just another internal screen with a different label. Frontend must enforce this via separate route group, separate layout, separate auth context.
- Multi-currency or multi-company support is a **bonus, not a requirement** — skip for MVP.

---

## 11. Out of Scope (Explicit Non-Goals for MVP)

To protect the 24-hour timeline, the following are **explicitly out of scope** for the hackathon MVP:

- Multi-currency support (single USD)
- Multi-company / multi-tenant isolation (single tenant)
- SSO / SAML / enterprise IdP (just email/password + Google OAuth if time)
- Email delivery infrastructure (mock the magic link as a logged URL)
- Real payment processing (mock payment recording)
- Real-time WebSocket sync (poll every 30s is fine)
- Internationalization / i18n (English only)
- E2E test suite (manual demo is the test)
- Storybook (skip — components are documented inline)
- Backend implementation (other team owns this; we integrate via REST or MSW mock)

---

## 12. Success Criteria for the Demo

The demo is successful if, in 5 minutes, the audience sees:

1. A rep logs in, builds a quote, applies an over-limit discount, and the system **auto-routes to approval** without the rep asking
2. The rep accepts an upsell suggestion and the **margin updates live** on screen
3. The manager approves the quote and the system **suggests a 2-warehouse split** with shipment count + cost
4. The order contains a one-time product + a recurring subscription and the **billing schedule is correct** for both
5. The customer opens the portal link, **counters the discount**, and the quote **auto-re-enters approval**
6. The manager checks the **Deal Health Dashboard** and sees the stalled-deal alert with one-click drill-in

If all 6 of these play out visually in the demo, we win.
