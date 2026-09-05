# DealFlow360 — Phase Plan (24-Hour Hackathon Build)

> **Current phase status is tracked in `memory.md`**. After every phase, update `memory.md` Section "Current Phase".
> **Demo deadline**: 2026-09-06 10:00 AM IST (Asia/Calcutta, UTC+5:30)
> **Start time**: 2026-09-05 ~06:30 AM IST
> **Total available time**: ~27.5 hours (with 4h sleep buffer)
> **MVP definition**: Login → Dashboard → Quotation List (Kanban) → Quotation Detail (Builder + Upsell Panel + Discount Risk Score) → Customer Portal — enough to demo the Quick Test Flow steps 1, 2, 3, 4, 7

---

## Model Assignments (Per User Request)

| Model | Role | When to use |
|---|---|---|
| **Nemotron 3 Ultra** (OpenCode) | **PLANNING** | Architecture decisions, business logic design, this phase plan, debugging strategy, refactoring plans, edge-case enumeration. Strong reasoning, slow output. Use BEFORE writing code. |
| **Muse 2** (OpenCode) | **BUILDING** | Writing the actual components, pages, hooks, utilities once the plan is clear. Fast iterative coding. Use AFTER Nemotron has produced a clear plan. |
| **Gemini 3.1 Pro** (Chat) | **LONG-CONTEXT PLANNING** | When you need to feed it ALL the .md files + the mockup image + a complex question. Use for "given everything, what should I do next?" type queries. |
| **Gemini 3.8 Lite** (Chat) | **QUICK CHAT** | Quick questions, copy refinement, naming suggestions, error message wording. Don't use for code generation — keep it for human-language tasks. |

### The Mental Model

- **Nemotron** = your **architect** (thinks deeply, plans)
- **Muse 2** = your **builder** (writes fast, follows the plan)
- **Gemini 3.1 Pro** = your **reviewer / strategist** (sees the whole picture)
- **Gemini 3.8 Lite** = your **copywriter / rubber duck** (quick back-and-forth)

**Forbidden combination**: Do NOT use Gemini 3.8 Lite to write production code. It's for chat only. Code quality will be lower than Muse 2.

---

## Phase Overview (8 Phases, 27.5 Hours)

| Phase | Hours | Clock (IST) | Goal | MVP-critical? | Status |
|---|---|---|---|---|---|
| **Phase 0** | 1.5h | 06:30–08:00 | Project setup: Next.js 16, Tailwind v4, ESLint, folder structure, git init | ✅ | ✅ Completed |
| **Phase 1** | 3h | 08:00–15:40 | App shells & plumbing, role matrix, 10+ CRUD & governance screens, Customer Portal, 404 page | ✅ | ✅ Completed |
| **Phase 2** | 3h | 15:40–18:00 | Quotation Builder detailed line item discounting, dynamic margins, blended risk scores | ✅ | ⏳ Up next |
| **Phase 3** | 4h | 18:00–21:00 | Real-time negotiation portal synchronization and Odoo webhook handlers | ✅ | ⏳ Queue |
| **Phase 4** | 3h | 18:00–21:00 | Approvals + Fulfillment (Screens 5, 6, 7, 8) | Stretch |
| **Phase 5** | 2h | 21:00–23:00 | Subscriptions + Invoices (Screens 9, 10, 12, 13) | Stretch |
| — | 4h | 23:00–03:00 | **SLEEP** (mandatory — no skipping) | — |
| **Phase 6** | 3h | 03:00–06:00 | Customer Portal + Deal Health (Screens 11, 14) | ✅ |
| **Phase 7** | 2.5h | 06:00–08:30 | Admin/Reporting + Product Catalog + Discount Tiers (Screens 15, 16, 17, 18) + Mobile responsive + Dark mode polish | Stretch |
| **Phase 8** | 1.5h | 08:30–10:00 | Final `npm run lint && npm run build`, bug fixes, demo dry run, final git push | ✅ |

**Total**: 27.5 hours including 4h sleep buffer.

**MVP phases (must complete even if everything else slips)**: 0, 1, 2, 3, 6, 8. These get you to the demo with: Login + Dashboard + Quotation Builder + Quotation List/Kanban + Customer Portal + working build.

**Stretch phases (only after MVP is solid)**: 4, 5, 7. If you're behind schedule, SKIP these and use the time to polish MVP.

---

## Phase 0 — Project Setup (1.5 hours)

**Clock**: 06:30–08:00 IST, Sept 5
**Model**: Muse 2 (building — straightforward setup)
**Goal**: A clean, runnable Next.js 16 project with all tooling configured.

### Tasks

1. **Clone or pull the repo** to local
   ```bash
   git clone https://github.com/gajjarkav/dealflowbyteamatri.git
   cd dealflowbyteamatri
   ```
2. **Copy the 6 .md files + git-commands.md + install-commands.md + .gitignore** into `docs/` at repo root (created in Phase 0 by you, before coding)
3. **Create the frontend Next.js 16 app** (run from repo root):
   ```bash
   npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
   ```
   - Accept defaults for any prompts that match the flags above
   - This creates `frontend/` with Next.js 16 + React 19 + Tailwind v4 + ESLint 9 + App Router + src dir
4. **Install runtime dependencies** (see `install-commands.md` for exact versions):
   ```bash
   cd frontend
   npm install zod lucide-react date-fns recharts clsx tailwind-merge next-themes
   npm install -D msw prettier eslint-plugin-import @simple-import-sort typescript @types/node
   ```
5. **Configure ESLint flat config** (`eslint.config.js`) per `rules.md` Section 6
6. **Configure Prettier** (`.prettierrc`)
7. **Configure Tailwind v4** (`src/app/globals.css` — Tailwind v4 uses CSS-first config; `tailwind.config.ts` should be minimal)
8. **Set up the folder structure** from `architecture.md` Section 3 — create empty folders + placeholder `.gitkeep` files
9. **Set up `.env.local`** with:
   ```
   NEXT_PUBLIC_API_URL=/api
   NEXT_PUBLIC_DATA_MODE=mock
   NEXT_PUBLIC_MSW_ENABLED=true
   ```
10. **Set up `next.config.ts`** with image domains (none for MVP), experimental flags if needed
11. **Set up `tsconfig.json`** with strict options per `rules.md` Section 6
12. **Copy `.gitignore`** from `docs/.gitignore` to `frontend/.gitignore` (and also keep at repo root)
13. **Initial git commit**:
    ```bash
    git add .
    git commit -m "chore(setup): initialize Next.js 16 frontend with Tailwind v4 + ESLint + folder structure"
    git push origin main
    ```
14. **Run lint + build to verify setup**:
    ```bash
    npm run lint
    npm run build
    ```
    Both must pass. If they fail, fix before moving to Phase 1.

### Exit Criteria (Phase 0 is done when)

- [ ] `npm run dev` starts without errors on `localhost:3000`
- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run build` produces a `.next/` folder
- [ ] The folder structure from `architecture.md` Section 3 exists (empty folders OK)
- [ ] Initial commit is pushed to `main` on GitHub
- [ ] `docs/` folder at repo root has all 9 .md files

### Model to use

- **Muse 2** for the actual file creation and configuration. It's fast at boilerplate.
- If you hit a config issue (e.g., Tailwind v4 setup differs from your knowledge), use **Gemini 3.1 Pro** in chat to ask "how do I configure Tailwind v4 in Next.js 16?" — it has the latest docs in its training data.

---

## Phase 1 — Foundation (3 hours)

**Clock**: 08:00–11:00 IST, Sept 5
**Model**: Nemotron 3 Ultra for the design tokens + types + Zod schemas planning (first 30 min), then Muse 2 for the actual implementation (2.5h)
**Goal**: The app shell, design system, mock data layer, and type contracts are all in place. No screens yet, but every screen can be built on top of this foundation.

### Tasks

1. **Design tokens** in `src/app/globals.css` — copy the full token block from `design.md` Section "Tailwind v4 Theme Tokens". Use Tailwind v4 `@theme` directive. Define light + dark mode via `[data-theme="dark"]` or `prefers-color-scheme`.
2. **Font loading** — Inter + JetBrains Mono via `next/font/google` in `src/app/layout.tsx`. Set CSS variables `--font-sans` and `--font-mono`. Apply to `<body>` via Tailwind `font-sans` and `font-mono` classes.
3. **Theme provider** — install `next-themes`, wrap app in `<ThemeProvider attribute="class">`. Add a dark mode toggle in the workspace shell (Phase 2).
4. **Layout shells** — create:
   - `src/app/(auth)/layout.tsx` — centered card, no nav, white background
   - `src/app/(workspace)/layout.tsx` — top nav + optional sidebar + content area, auth-guarded
   - `src/app/(portal)/layout.tsx` — customer-facing, different nav, different color cues (slight tint difference), token-based auth
5. **Navigation component** — `src/components/layout/top-nav.tsx` with the 9 nav items from `architecture.md` Section 4. Active state: underline + slightly darker text. Mobile: hamburger → drawer.
6. **UI primitives** — build all components in `src/components/ui/` (button, input, textarea, select, checkbox, badge, card, table, tabs, modal, tooltip, skeleton, empty-state, error-state, spinner, avatar, dropdown-menu, dialog, alert, breadcrumb, pagination, stepper). These are hand-rolled — no library. Follow the patterns in `design.md`.
7. **Auth context** — `src/lib/auth/context.tsx` with `useCurrentUser()` hook, login/logout/signup methods. For MVP, store user in React Context + httpOnly cookie (mock). Implement `src/lib/auth/guard.tsx` for route protection.
8. **API client** — `src/lib/api/client.ts` with base `fetch` wrapper, auth header injection, Zod response validation, typed errors. Implement the BFF pattern from `architecture.md` Section 5.
9. **MSW setup** — `src/lib/mock/browser.ts` (worker), `src/lib/mock/handlers/` (one file per resource). Enable MSW only when `NEXT_PUBLIC_MSW_ENABLED=true`.
10. **Seed data** — `src/lib/mock/data/` with the Acme Corp deal: 1 customer (Acme Corp), 1 quotation (Q-1042), 5 line items (Laptop, Setup Service, Care Plan 2yr, etc.), 2 warehouses (Main, East Depot), 3 discount tiers (Bronze/Silver/Gold), 3 product categories (Hardware/Service/Subscription). Use this consistently across ALL screens (mockup continuity).
11. **Zod schemas** — `src/lib/validations/` with `quotation.ts`, `auth.ts`, `product.ts`. Mirror the backend contract. Every API request and response is validated.
12. **TypeScript types** — `src/types/domain.ts` with all domain types: `User`, `Quotation`, `LineItem`, `Approval`, `Warehouse`, `Subscription`, `Invoice`, `Product`, `PriceList`, `DiscountTier`, `CustomerTier`, etc. All Zod-inferred where possible.
13. **Pure domain logic** — `src/lib/domain/discount.ts` with `calculateBlendedRiskScore()` (see `architecture.md` Section 7 signature). This is the most important business logic. Plan it with Nemotron 3 Ultra first, then implement with Muse 2.
14. **Utility functions** — `src/lib/utils/cn.ts` (clsx + tailwind-merge), `format-currency.ts`, `format-date.ts`, `format-percent.ts`.
15. **Landing page placeholder** — `src/app/page.tsx` with a minimal "DealFlow360" hero (just the name + tagline + "Get Started" button). Will be polished in Phase 2.
16. **Run lint + build**:
    ```bash
    npm run lint
    npm run build
    ```
17. **Git commit**:
    ```bash
    git add .
    git commit -m "feat(foundation): design tokens, layout shells, UI primitives, MSW mock layer, domain logic"
    git push origin main
    ```

### Exit Criteria

- [ ] `npm run dev` shows a landing page placeholder at `/`
- [ ] `/login` shows the auth layout (centered card) — empty form OK
- [ ] `/dashboard` shows the workspace shell (top nav + content area) — empty content OK
- [ ] `/quote/test-token` shows the portal layout — different nav cue, empty content OK
- [ ] Dark mode toggle in workspace shell works (no content yet, but background switches)
- [ ] MSW intercepts `/api/quotations` and returns the Acme Corp seed data (verify in Network tab)
- [ ] `calculateBlendedRiskScore()` is unit-tested with at least 3 cases (within limit, single line over, blended over)
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Commit pushed

### Model to use

- **Nemotron 3 Ultra** for the first 30 min: plan the `calculateBlendedRiskScore` function signature + logic, the Zod schema shapes, the auth context flow, the MSW handler structure. Output: a clear plan document (in your head or in a scratch file).
- **Muse 2** for the next 2.5h: implement everything based on the plan. Fast iteration.
- **Gemini 3.1 Pro** if you get stuck on a Next.js 16 / Tailwind v4 specific question (e.g., "how do I configure dark mode with Tailwind v4 @theme?").

---

## Phase 2 — Auth + Landing + Dashboard (3 hours)

**Clock**: 11:00–14:00 IST, Sept 5
**Model**: Muse 2 (building) — the plan is clear from Phase 1
**Goal**: Screens 1 (Login/Signup) and 2 (Sales Dashboard) are fully functional. Landing page is polished enough to show in the demo.

### Tasks

1. **Landing page** (`src/app/page.tsx`)
   - Hero: "DealFlow360 — the self-governing sales engine" + tagline + "Get Started" CTA → `/login`
   - 3 feature blocks (no icons, just typography): "Discounts that route themselves", "Stock that splits itself", "Customers that negotiate in real time"
   - Footer: minimal — "Built for Odoo Hackathon 2026"
   - Mobile responsive: hero stacks, features stack
   - Dark mode: hero text inverts, no other changes
2. **Login page** (`src/app/(auth)/login/page.tsx`)
   - Email + password fields (use `src/components/ui/input.tsx`)
   - "Log in" button (primary, accent color)
   - "Don't have an account? Sign up" link → `/signup`
   - "Continue as demo user" button (auto-fills `demo@dealflow360.com` / `demo123`) — saves time in the demo
   - Form validation with Zod (`src/lib/validations/auth.ts`)
   - On submit: POST `/api/auth/login` → set cookie → redirect `/dashboard`
   - Error state: "Incorrect email or password" with retry
3. **Signup page** (`src/app/(auth)/signup/page.tsx`)
   - Name, email, password, phone number
   - "Create account" button → POST `/api/auth/signup` → auto-login → redirect `/dashboard`
   - "Already have an account? Log in" link
4. **Auth API routes**
   - `src/app/api/auth/login/route.ts` — validates input, returns mock user + token (MSW handles the actual data)
   - `src/app/api/auth/signup/route.ts`
   - `src/app/api/auth/logout/route.ts` — clears cookie
   - `src/app/api/auth/me/route.ts` — returns current user from cookie
5. **Dashboard page** (`src/app/(workspace)/dashboard/page.tsx`)
   - 3 KPI cards at top: "Pending Approvals" (count), "Open Quotations" (count), "At Risk Deals" (count with trend)
   - Below: "Recent Activity" feed (list of last 10 events: quote created, approved, fulfilled, etc. — from mock data)
   - Right rail: "Quick Actions" — "New Quotation", "View Pipeline", "Approvals Queue"
   - Below: A simple bar chart of quotations by stage (use `recharts` BarChart, 5 stages: Draft, Pending Approval, Sent, Confirmed, Fulfilled)
   - Mobile: KPIs stack to 1 column, activity feed full width, quick actions wrap
6. **Auth guard** — wrap `(workspace)/layout.tsx` in `AuthGuard`. If no session → redirect `/login`.
7. **Dark mode toggle** — in the workspace top nav, a sun/moon icon button. Uses `next-themes` `useTheme()`. Persists to localStorage.
8. **Toast system** — `src/lib/hooks/use-toast.ts` + a `<Toaster />` component at root layout. Used for: "Quote saved", "Approval submitted", "Logged in".
9. **Run lint + build**:
   ```bash
   npm run lint && npm run build
   ```
10. **Git commit**:
    ```bash
    git add .
    git commit -m "feat(auth+dashboard): login, signup, landing, dashboard with KPIs and activity feed"
    git push origin main
    ```

### Exit Criteria

- [ ] User can sign up with any email/password (mock) and land on `/dashboard`
- [ ] User can log in with `demo@dealflow360.com` / `demo123` (button)
- [ ] Logging out clears the session and redirects to `/login`
- [ ] Dashboard shows 3 KPI cards with numbers from mock data
- [ ] Dashboard shows "Recent Activity" feed with 10 events
- [ ] Dashboard shows a bar chart of quotations by stage
- [ ] Dark mode toggle works on the dashboard
- [ ] All 3 auth pages are mobile responsive (test at 375px width)
- [ ] Empty states: if KPI counts are 0, show "No data yet" instead of "0"
- [ ] Error states: if `/api/auth/me` fails, show error toast and redirect to `/login`
- [ ] `npm run lint && npm run build` pass
- [ ] Commit pushed

### Model to use

- **Muse 2** throughout. The plan is clear; just build.
- If you need a chart pattern, load `charts` skill first for guidance.

---

## Phase 3 — Quotations: List, Builder, Detail (4 hours)

**Clock**: 14:00–18:00 IST, Sept 5
**Model**: Nemotron 3 Ultra for the Quotation Builder UX plan (first 30 min) — this is the most complex screen and needs careful thought. Then Muse 2 for 3.5h of building.
**Goal**: Screens 3 (Quotation List / Kanban) and 4 (Quotation Detail + Builder) are fully functional, including the Upsell Panel and the Blended Risk Score visualization. This is the demo's centerpiece.

### Tasks

1. **Quotation List page** (`src/app/(workspace)/quotations/page.tsx`)
   - Toggle: "List" / "Kanban" view (default Kanban)
   - **Kanban view**: 5 columns (Draft, Pending Approval, Sent, Confirmed, Fulfilled). Cards show: customer name, quote ID (Q-1042), amount, last updated. Drag-and-drop between columns (using HTML5 drag API — no dnd-kit library, keep it simple). On drop, PATCH `/api/quotations/[id]` with new stage.
   - **List view**: data table with columns: Quote ID, Customer, Amount, Stage, Discount %, Last Updated, Actions (View, Edit, Delete)
   - Top: search input (filters by customer or quote ID), stage filter (multi-select), rep filter
   - "New Quotation" button (primary) → `/quotations/new`
2. **Quotation Builder page** (`src/app/(workspace)/quotations/new/page.tsx`)
   - **Header**: Customer select (Acme Corp default), Quote ID (auto-generated Q-XXXX), Date, Status badge
   - **Left column (60%)**: Line items table
     - Each row: Product select, Quantity (+/-), Unit price, Discount % (input), Line total, Remove button
     - "Add line" button at the bottom
     - "Add subscription line" button (separate) — opens a different product picker for recurring items
     - Below the table: Order-level discount input + "Apply to all lines" checkbox
   - **Right column (40%)**: Three panels stacked
     - **Panel 1: Upsell & Cross-Sell** (from feature B5)
       - Ranked suggestion list (3-5 suggestions from mock co-purchase data)
       - Each card: product name, margin delta (+/- $), promotion tag if applicable
       - Buttons: "Add to Quote" (primary outline), "Dismiss" (text only)
       - After adding, margin indicator on the quotation updates immediately
     - **Panel 2: Blended Risk Score** (from feature B4 + Section 8 of project-requirements.md)
       - Per-line breakdown: "Laptop: 12% given / 15% ceiling ✓", "Setup Service: 18% given / 10% ceiling ⚠️ 8pts over"
       - Whole-quote score: a number + visual indicator (green/yellow/red)
       - Routing decision: "No approval needed" / "Manager approval required" / "Manager + Finance approval required"
       - Reasoning text: "Service line is 8 points over its category ceiling"
     - **Panel 3: Live Margin**
       - Big number: total margin $ and %
       - Below: "If you approve all upsells, margin increases by $X"
   - **Footer**: "Save as Draft" (secondary), "Submit for Approval" (primary, disabled if no approval needed AND no lines), "Cancel"
   - On submit: POST `/api/quotations` with the quote → if blended score > threshold, response includes `requiresApproval: true` and the UI shows a toast "Quote submitted for manager approval" → redirect to `/quotations/[id]`
   - On "Save as Draft": same POST but `status: 'draft'` → redirect to `/quotations/[id]`
3. **Quotation Detail page** (`src/app/(workspace)/quotations/[id]/page.tsx`)
   - Header: Quote ID, Customer, Date, Status badge, Total
   - Tabs: "Line Items" (default), "Approvals", "Fulfillment", "Billing", "Audit Trail"
   - **Line Items tab**: read-only table of line items (same columns as builder but no inputs). Buttons: "Edit Quote" → `/quotations/[id]/edit`, "Send to Customer" (generates portal link + copies to clipboard), "Print PDF" (uses `window.print()` with print CSS, no library)
   - **Approvals tab**: shows the approval stepper (Submitted → Manager → Finance → Completed) with current step highlighted. If pending, shows "Approve" / "Reject" buttons (only if current user has the right role). Shows approval history below.
   - **Fulfillment tab**: shows the warehouse split recommendation (from mock data) with "Accept Suggested Split" / "Manual Override" buttons. For MVP, this tab just displays the mock split; full fulfillment is Phase 4.
   - **Billing tab**: shows one-time lines and recurring lines separately. Shows the upcoming billing schedule for recurring lines.
   - **Audit Trail tab**: a timeline of all actions on this quote (created, edited, submitted, approved, sent to customer, etc.) with user + timestamp + reason.
4. **Quotation Edit page** (`src/app/(workspace)/quotations/[id]/edit/page.tsx`) — same as Builder but pre-filled with existing quote data
5. **Quotation API routes**
   - `GET /api/quotations` — list (with filters in query params)
   - `POST /api/quotations` — create
   - `GET /api/quotations/[id]` — detail
   - `PATCH /api/quotations/[id]` — update (stage, line items, etc.)
   - `POST /api/quotations/[id]/submit` — submit for approval
   - All validated with Zod
6. **Upsell panel component** — `src/components/quotations/upsell-panel.tsx`. On "Add to Quote", it calls a callback that adds the product to the line items table and re-renders the Blended Risk Score.
7. **Blended Risk Score component** — `src/components/quotations/blended-risk-score.tsx`. Calls `calculateBlendedRiskScore()` from `src/lib/domain/discount.ts` on every line change. Visualizes per-line status + whole-quote score + routing decision.
8. **Margin indicator component** — `src/components/quotations/margin-indicator.tsx`. Shows total margin in $ and %, updates live as lines change.
9. **Mock data expansion** — add to `src/lib/mock/data/quotations.ts`:
   - 8-10 quotations in various stages (so the kanban has cards in every column)
   - The Acme Corp Q-1042 quote with the laptop (12% disc) + setup service (18% disc) + care plan (no disc) example
   - Upsell suggestions: 5 products with margin deltas and promotion flags
10. **Run lint + build**:
    ```bash
    npm run lint && npm run build
    ```
11. **Git commit**:
    ```bash
    git add .
    git commit -m "feat(quotations): list/kanban view, builder with upsell panel + blended risk score, detail page with tabs"
    git push origin main
    ```

### Exit Criteria

- [ ] `/quotations` shows 5 kanban columns with cards from mock data
- [ ] Dragging a card from "Draft" to "Pending Approval" works and persists on refresh (mock)
- [ ] "New Quotation" button opens the builder with empty line items
- [ ] Adding a laptop line with 12% discount shows green in the risk score panel
- [ ] Adding a setup service line with 18% discount shows the per-line warning + flags the quote for manager approval
- [ ] Adding 3 lines each 2-3 points over their ceiling shows the blended score as "needs approval" with reason "small violations across multiple lines"
- [ ] Accepting an upsell suggestion adds the product to the line items AND updates the margin indicator live
- [ ] Submitting a quote that needs approval shows the toast and redirects to the detail page
- [ ] The detail page's Approvals tab shows the stepper with current step highlighted
- [ ] The Audit Trail tab shows all actions taken on the quote
- [ ] Mobile responsive: builder's 2-column layout collapses to 1-column on mobile, with the upsell panel as a collapsible drawer
- [ ] Dark mode works on all quotation screens
- [ ] Empty state: kanban with no cards shows "No quotations yet. Create your first quote →"
- [ ] Error state: if `/api/quotations` fails, kanban shows error with retry button
- [ ] `npm run lint && npm run build` pass
- [ ] Commit pushed

### Model to use

- **Nemotron 3 Ultra** for the first 30 min: plan the Quotation Builder's state management (line items, discounts, upsell acceptance, blended score recalculation), the drag-and-drop pattern for kanban (HTML5 native vs library — go native), the right-panel composition.
- **Muse 2** for 3.5h of building.
- **Gemini 3.1 Pro** if you get stuck on a complex state interaction — paste the whole builder file and ask "where is the bug?"

---

## Phase 4 — Approvals + Fulfillment (3 hours, STRETCH)

**Clock**: 18:00–21:00 IST, Sept 5
**Model**: Muse 2 (building)
**Goal**: Screens 5, 6, 7, 8 (Fulfillment Detail, Fulfillment & Stock List, Approval Detail, Approvals List) are functional. This phase is STRETCH — only do it if Phase 3 is solid.

### Tasks

1. **Approvals List** (`src/app/(workspace)/approvals/page.tsx`)
   - Filter bar: Pending / Approved / Rejected / Returned
   - Table: Quote ID, Customer, Rep, Blended Score, Submitted Date, Status, Actions (Review → detail page)
   - Bulk: select + "Approve all" (for low-risk ones)
2. **Approval Detail** (`src/app/(workspace)/approvals/[id]/page.tsx`)
   - Header: Quote ID, Customer, Rep, Blended Score badge
   - Approval stepper: Submitted → Sales Manager → Finance → Completed
   - Line items table (read-only) with per-line discount vs ceiling
   - Audit trail of all approvals so far
   - Actions: "Approve" (primary), "Reject" (danger), "Return for Revision" (secondary) — each opens a modal with reason textarea
3. **Fulfillment & Stock List** (`src/app/(workspace)/fulfillment/page.tsx`)
   - Table of all fulfillment records: Order ID, Customer, Status (Pending/Awaiting Stock/Partial/Complete), Warehouses, Estimated Shipments
   - Filter by status
   - Click row → fulfillment detail
4. **Fulfillment Detail** (`src/app/(workspace)/fulfillment/[id]/page.tsx`)
   - Shows the warehouse split recommendation: 2 cards (Main Warehouse 30 units, East Depot 20 units), shipment count, estimated cost
   - "Accept Suggested Split" (primary) and "Manual Override" (secondary)
   - Manual override: a small table where you can move units between warehouses
   - "Consolidate Remaining Backorder" prompt (modal) if stock arrives mid-fulfillment
5. **API routes**: `/api/approvals/*`, `/api/fulfillment/*` with mock data
6. **Mock data expansion**: 5-6 approval records, 4-5 fulfillment records
7. **Lint + build + commit**

### Exit Criteria (Stretch — skip if Phase 3 ran long)

- [ ] Approvals list shows 5-6 records from mock
- [ ] Approving a quote updates its stage to "Approved" and creates a fulfillment record
- [ ] Fulfillment list shows split recommendations
- [ ] Manual override of warehouse split works (move units between warehouses, see shipment count update)

---

## Phase 5 — Subscriptions + Invoices (2 hours, STRETCH)

**Clock**: 21:00–23:00 IST, Sept 5
**Model**: Muse 2
**Goal**: Screens 9, 10, 12, 13 (Subscriptions List, Billing Detail, Invoices List, Invoice Detail)

### Tasks

1. **Subscriptions List** — table of all active subscriptions: Customer, Plan, Start Date, Next Billing, MRR, Status
2. **Billing Detail** — for the Acme Corp Care Plan 2yr: shows line, billing schedule (24 monthly entries), proration calculator (if quantity changes mid-cycle, shows prorated amount), cancel button with partial refund modal
3. **Invoices List** — table: Invoice ID, Customer, Amount, Status (Draft/Sent/Paid/Overdue), Issue Date, Due Date, Actions (View)
4. **Invoice Detail** — shows line items, totals, payment status, "Record Payment" button (mock)
5. **API routes + mock data**
6. **Lint + build + commit**

### Exit Criteria (Stretch)

- [ ] All 4 screens render with mock data
- [ ] Recording a payment updates the invoice status to "Paid"

---

## — SLEEP (4 hours) —

**Clock**: 23:00–03:00 IST, Sept 5 → 6
**Mandatory**. The user is human. Do not skip this. If you skipped Phase 4 or 5 to save time, sleep the full 4 hours. If you're behind, sleep at least 3 hours.

---

## Phase 6 — Customer Portal + Deal Health (3 hours, MVP-CRITICAL)

**Clock**: 03:00–06:00 IST, Sept 6
**Model**: Nemotron 3 Ultra for Customer Portal UX plan (first 30 min — separate, restricted view is a hard requirement), then Muse 2 for 2.5h
**Goal**: Screens 11 (Customer Portal Negotiation) and 14 (Deal Health & Anomaly Dashboard). The customer portal is the second-most important demo flow (after the quotation builder).

### Tasks

1. **Customer Portal Negotiation Screen** (`src/app/(portal)/quote/[token]/page.tsx`)
   - **Separate layout**: NO workspace top nav. Instead, a portal-specific header: "DealFlow360 Customer Portal" + customer name + logout
   - Auth: token in URL is checked against mock token store. If invalid → "This quote link has expired" page with "Request new link" button.
   - Header: Quote ID, Customer, Total, Status (Sent / Under Negotiation / Confirmed)
   - Body: Line items table (read-only) with TWO additions per line:
     - Comment button (opens a thread under that line — customer can ask "Can we reduce the discount on this service?")
     - Counter-offer input (customer can propose a different discount for that line)
   - Bottom: Order-level counter-offer input ("I'd like a 20% discount on the total") + "Submit Request" button
   - "Confirm Quotation" button (primary) — only enabled if customer has no outstanding counter-offers
   - On submit counter-offer: POST `/api/portal/[token]/counter` → response includes `reEntersApproval: true/false` → show toast "Your request was submitted. We'll review and respond within 24h."
   - On confirm: POST `/api/portal/[token]/confirm` → if final terms exceed thresholds, response includes `requiresReapproval: true` → show "Quote sent for re-approval" message
2. **Customer Portal API routes** (separate from internal `/api/quotations/*`):
   - `GET /api/portal/[token]` — get quote by portal token
   - `POST /api/portal/[token]/counter` — submit counter-offer
   - `POST /api/portal/[token]/confirm` — confirm quote
3. **Deal Health Dashboard** (`src/app/(workspace)/deal-health/page.tsx`)
   - Top: 3 alert cards: "Stalled Deals" (count), "Discount Anomalies" (count), "Delivery Slippage" (count)
   - Below: A list of alerts, each with: alert type (icon), description, related quote ID, "View Quote" button (links to `/quotations/[id]`), "Nudge" / "Escalate" action buttons
   - Right rail: a small line chart of "deal health score over time" (mock)
4. **Mock data for portal**: a token `acme-q1042-token` that returns the Acme Corp Q-1042 quote. Add 2-3 line-level comments and one counter-offer in the seed.
5. **Mock data for deal health**: 6-8 alerts of different types
6. **Lint + build + commit**

### Exit Criteria

- [ ] Visiting `/quote/acme-q1042-token` shows the customer portal (no workspace nav)
- [ ] Customer can add a line-level comment
- [ ] Customer can submit a counter-offer (e.g., "20% on total")
- [ ] Submitting a counter-offer that exceeds thresholds shows the "re-enters approval" message
- [ ] Customer can confirm the quote (if no pending counter-offers)
- [ ] Deal Health dashboard shows 3 alert cards with counts from mock
- [ ] Clicking "View Quote" on an alert navigates to the quotation detail
- [ ] "Nudge" button shows a confirmation toast (mock action)
- [ ] Portal page is mobile responsive (most customers will open on phone)
- [ ] Dark mode works on both screens
- [ ] Lint + build pass
- [ ] Commit pushed

### Model to use

- **Nemotron 3 Ultra** for the first 30 min: plan the portal's separate auth flow (token vs cookie), the line-level comment UX (inline thread vs modal), the counter-offer state management.
- **Muse 2** for 2.5h of building.
- The customer portal is the **#1 thing the problem statement calls out as "must be real, separate, restricted"** — get this right.

---

## Phase 7 — Admin + Mobile Polish (2.5 hours, STRETCH)

**Clock**: 06:00–08:30 IST, Sept 6
**Model**: Muse 2 (mostly) + Gemini 3.1 Pro (for final review)
**Goal**: Screens 15, 16, 17, 18 (Admin Dashboard, Product Catalog, Product & Pricelist, Discount Tiers) + a full mobile + dark mode polish pass.

### Tasks

1. **Admin / Reporting Dashboard** (`src/app/(workspace)/admin/page.tsx`) — high-level metrics, filter bar (Period, Sales Team/Rep, Approval Status, Product/Category), export buttons (PDF/XLSX mock)
2. **Product Catalog** (`src/app/(workspace)/admin/products/page.tsx`) — table of products, CRUD modals (Add Product, Edit Product)
3. **Product & Pricelist** (`src/app/(workspace)/admin/pricelists/page.tsx`) — manage price lists per customer tier
4. **Discount Tiers & Approval Chains** (`src/app/(workspace)/admin/discount-tiers/page.tsx`) — Bronze 5%, Silver 10%, Gold 15%; per-category ceilings; approval chain config (Manager only vs Manager + Finance)
5. **Mobile responsive audit** — open every screen at 375px width. Fix any layout breaks. Common fixes: switch 2-column to 1-column, hide sidebar (replace with hamburger drawer), make tables horizontally scrollable, reduce font sizes on small screens.
6. **Dark mode audit** — toggle dark mode on every screen. Fix any contrast issues. Common fixes: borders become lighter (use `--border` token which already switches), shadows removed in dark mode, accent color changes from `#1E40AF` to `#3B82F6`.
7. **Empty/loading/error state audit** — every list page should have all 3 states. Every detail page should have loading + error. Add a skeleton to every async-loaded component.
8. **Lint + build + commit**

### Exit Criteria (Stretch — skip if Phase 6 ran long)

- [ ] All 4 admin screens render with mock data
- [ ] Every screen works at 375px width
- [ ] Dark mode toggle works on every screen with no contrast issues
- [ ] Every list page has empty + loading + error states

---

## Phase 8 — Final Polish + Demo Dry Run (1.5 hours, MVP-CRITICAL)

**Clock**: 08:30–10:00 IST, Sept 6
**Model**: Nemotron 3 Ultra (for the demo script + final bug triage) + Gemini 3.1 Pro (for "what's missing?" review)
**Goal**: A clean, working build. The 5-minute demo flow runs end-to-end without errors.

### Tasks

1. **Final `npm run lint && npm run build`** — must both pass. If they fail, fix the errors.
2. **Run the Quick Test Flow** (from `project-requirements.md` Section 7) end-to-end as a dry run:
   1. Log in as `demo@dealflow360.com`
   2. Open `/dashboard` — verify KPIs load
   3. Click "New Quotation" — verify builder opens
   4. Add a laptop line, set 12% discount — verify risk score is green
   5. Add a setup service line, set 18% discount — verify risk score flags for manager approval
   6. Accept an upsell suggestion — verify margin updates
   7. Submit for approval — verify toast + redirect to detail
   8. Open the Approvals tab — verify the stepper
   9. (Mock-approve as manager — switch to a manager role or use a "Force approve" dev button)
   10. Open the Fulfillment tab — verify the warehouse split
   11. Open the customer portal link — verify it opens in a new tab with the portal layout
   12. As the customer, submit a counter-offer — verify it re-enters approval
   13. Open the Deal Health Dashboard — verify alerts show
3. **Fix any bugs found in the dry run**. Prioritize by demo impact:
   - Critical (blocks demo): fix immediately
   - Major (visible in demo): fix if time
   - Minor (not visible): leave it
4. **Final git commit + push**:
   ```bash
   git add .
   git commit -m "chore(pre-demo): final polish, lint pass, build pass, demo dry run complete"
   git push origin main
   ```
5. **Write the demo script** — a 5-minute walkthrough you'll actually say out loud. Print it. Practice it once.
6. **Open the demo URL** in your browser — make sure it loads. Clear your browser cache first.

### Exit Criteria (MUST all pass before declaring done)

- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run build` produces a working build
- [ ] All 13 dry-run steps work without errors
- [ ] No `console.log` in committed code (only `console.warn` / `console.error`)
- [ ] No `any` types
- [ ] Every screen is mobile responsive (re-test at 375px)
- [ ] Dark mode toggle works on every screen
- [ ] Final commit is pushed to `main`
- [ ] The demo URL works in an incognito window (clean cache)

### Model to use

- **Nemotron 3 Ultra** to triage bugs: paste each bug + the relevant code, ask "what's the root cause and the minimal fix?"
- **Gemini 3.1 Pro** for the final review: paste all 6 .md files + the list of screens, ask "what's missing from this build for a 5-minute demo of the Quick Test Flow?"
- **Gemini 3.8 Lite** for the demo script wording: paste the script draft, ask "make this more concise and punchy."

---

## What To Do If You Fall Behind

If at any checkpoint you're more than 30 minutes behind:

1. **Stop the current phase** at the next natural stopping point (don't leave a half-finished screen)
2. **Commit what you have** (with `wip:` prefix in commit message)
3. **Skip the next stretch phase** (Phase 4, 5, or 7)
4. **Re-allocate that time to polishing MVP** (Phases 0, 1, 2, 3, 6, 8)
5. **Update `memory.md`** with the new plan

The demo with 5 polished screens beats a demo with 10 broken screens. Always.

---

## What To Do If `npm run lint` or `npm run build` Fails

1. **Read the error**. Most errors are ESLint rule violations (a forbidden class, a missing type) or TypeScript strict-mode catches.
2. **Paste the error to Muse 2** with the offending file. Ask "fix this error without changing the structure or breaking other rules."
3. **If Muse 2 can't fix it**, escalate to **Nemotron 3 Ultra** — paste the error + the file + the relevant rule from `rules.md`. Ask "what's the minimal fix?"
4. **Re-run lint + build**. Do not commit until both pass.
5. **If a rule in `rules.md` is the actual blocker** (e.g., you genuinely need a `p-5` for some reason), STOP and ask the human. The human may approve a rule exception, but the AI cannot unilaterally decide to break a rule.

---

## Phase Summary (One-Liner Per Phase)

| Phase | One-liner |
|---|---|
| 0 | Set up Next.js 16 + Tailwind v4 + ESLint + folder structure |
| 1 | Design tokens, layout shells, UI primitives, mock data, domain logic |
| 2 | Login, signup, landing, dashboard |
| 3 | Quotation list/kanban, builder with upsell + risk score, detail page |
| 4 | Approvals list/detail, fulfillment list/detail (STRETCH) |
| 5 | Subscriptions, billing, invoices (STRETCH) |
| — | SLEEP 4 hours |
| 6 | Customer portal negotiation, deal health dashboard |
| 7 | Admin screens + mobile/dark polish (STRETCH) |
| 8 | Final lint/build, dry run, demo prep |

---

## Current Phase Tracker

**Update this section in `memory.md` after every phase**, not here. This file is the canonical plan; `memory.md` is the live status.
