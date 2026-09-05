# DealFlow360 — Frontend Architecture

> **How the Next.js 16 frontend is structured, routed, and connected.**
> Read this before writing any new file. Every new file must go in the location this doc specifies.

---

## 1. Tech Stack (Locked)

| Layer | Choice | Version | Why |
|---|---|---|---|
| Framework | **Next.js** | 16.x (App Router) | Required by user; latest stable |
| Language | **TypeScript** | 5.x strict | Type safety on a complex business domain |
| React | **React** | 19.x | Ships with Next 16 |
| Styling | **Tailwind CSS** | v4.x (CSS-first config) | Hand-rolled components, no UI library (user preference) |
| Lint | **ESLint** | 9.x (flat config) | `next lint` + strict rules |
| Format | **Prettier** | 3.x | Consistent code style |
| Hooks | **React 19 hooks** + custom hooks in `lib/hooks/` | — | No external data hooks lib |
| Data fetching | **Native `fetch` + React `cache` + Server Components** | — | No TanStack Query for MVP (adds complexity); can add later |
| Form | **Native `<form>` + `useFormState` / `useFormStatus` (React 19)** | — | No react-hook-form for MVP |
| Validation | **Zod** | 3.x | Schema validation at API + client boundaries |
| Mock API | **MSW (Mock Service Worker)** | 2.x | Swappable for real backend; typed contract |
| Charts | **Recharts** | 2.x | Only on Dashboard + Deal Health screens |
| Icons | **lucide-react** | latest | Tree-shakeable, monochrome icons |
| Fonts | **Inter (sans) + JetBrains Mono (code)** via `next/font/google` | — | Single sans family + 1 mono for data; no display font (minimal monochrome rule) |
| Date | **date-fns** | 3.x | Lightweight date math for billing schedules |
| State | **React Context + `useState`** | — | No Zustand/Redux for MVP; Context is enough for auth + cart |
| Testing | **Vitest + Testing Library** (optional, only if time) | 1.x | Skip for MVP — manual demo is the test |

### Forbidden (do NOT add)

- ❌ Any UI component library (MUI, Chakra, Ant Design, Mantine, shadcn/ui) — user explicitly wants hand-rolled Tailwind
- ❌ Any CSS-in-JS library (styled-components, emotion) — Tailwind v4 only
- ❌ Any CSS framework (Bootstrap, Bulma) — Tailwind v4 only
- ❌ jQuery, lodash (use native)
- ❌ Moment.js (use date-fns)
- ❌ Redux, MobX, Zustand for MVP (Context is enough)
- ❌ TanStack Query for MVP (adds boilerplate; can add later if real backend warrants it)

---

## 2. Project Location in the Monorepo

The hackathon repo is `https://github.com/gajjarkav/dealflowbyteamatri.git` and has:

```
dealflowbyteamatri/
├── backend/         # Other team — Odoo custom module
├── frontend/        # ← YOU ARE HERE
└── docs/            # All .md files live here, shared between teams
    ├── project-requirements.md
    ├── architecture.md
    ├── rules.md
    ├── phase.md
    ├── design.md
    ├── memory.md
    ├── git-commands.md
    ├── install-commands.md
    └── .gitignore
```

**Rule**: All `.md` plan files live in `docs/` at the repo root, NOT inside `frontend/`. This way the backend team can read the same context and the frontend AI models can `cat docs/*.md` to load context in one command.

---

## 3. Frontend Folder Structure (Next.js 16 App Router)

Inside `frontend/`, the structure MUST be:

```
frontend/
├── docs/                          # Symlink to /docs at repo root (or copy)
├── public/
│   ├── favicon.ico
│   ├── logo.svg                   # DealFlow360 wordmark (text-only, no icon for MVP)
│   └── og-image.png               # Open Graph image (optional)
├── src/
│   ├── app/                       # App Router — every route is a folder
│   │   ├── (auth)/                # Route group: unauthenticated (no layout shell)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx          # Centered card layout, no nav
│   │   │
│   │   ├── (workspace)/           # Route group: internal users (sales rep, manager, finance, admin)
│   │   │   ├── layout.tsx         # Top nav + sidebar shell; auth-guarded
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Screen 2: Sales Dashboard
│   │   │   ├── quotations/
│   │   │   │   ├── page.tsx       # Screen 3: Quotation List / Kanban
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx   # Screen 4 (create mode): Quotation Builder
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx   # Screen 4 (view mode): Quotation Detail
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx  # Screen 4 (edit mode): Quotation Builder
│   │   │   ├── pipeline/
│   │   │   │   └── page.tsx       # Kanban-only view of all quotations by stage
│   │   │   ├── approvals/
│   │   │   │   ├── page.tsx       # Screen 8: Approvals List
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Screen 7: Approval Detail
│   │   │   ├── fulfillment/
│   │   │   │   ├── page.tsx       # Screen 6: Fulfillment & Stock List
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Screen 5: Fulfillment Detail (with warehouse split)
│   │   │   ├── subscriptions/
│   │   │   │   ├── page.tsx       # Screen 9: Subscriptions List
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Screen 10: Billing Detail
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx       # Screen 12: Invoices List
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Screen 13: Invoice Detail
│   │   │   ├── deal-health/
│   │   │   │   └── page.tsx       # Screen 14: Deal Health & Anomaly Dashboard
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx       # Screen 15: Admin / Reporting Dashboard
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx   # Screen 16: Product Catalog
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── pricelists/
│   │   │   │   │   └── page.tsx   # Screen 17: Product & Pricelist
│   │   │   │   └── discount-tiers/
│   │   │   │       └── page.tsx   # Screen 18: Discount Tiers & Approval Chains
│   │   │   └── settings/
│   │   │       └── page.tsx       # User profile, preferences, dark mode toggle
│   │   │
│   │   ├── (portal)/              # Route group: CUSTOMER-FACING portal (separate shell)
│   │   │   ├── layout.tsx          # Completely different layout; separate auth context
│   │   │   ├── quote/
│   │   │   │   └── [token]/
│   │   │   │       └── page.tsx   # Screen 11: Customer Portal Negotiation Screen
│   │   │   └── orders/
│   │   │       └── [token]/
│   │   │           └── page.tsx   # Customer-facing order confirmation
│   │   │
│   │   ├── api/                   # Next.js Route Handlers (BFF layer)
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── signup/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── me/route.ts    # Current user
│   │   │   ├── quotations/
│   │   │   │   ├── route.ts       # GET list, POST create
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts  # GET, PATCH, DELETE
│   │   │   │       ├── approve/route.ts
│   │   │   │       ├── reject/route.ts
│   │   │   │       └── submit/route.ts
│   │   │   ├── approvals/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── fulfillment/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── products/route.ts
│   │   │   ├── pricelists/route.ts
│   │   │   ├── discount-tiers/route.ts
│   │   │   ├── warehouses/route.ts
│   │   │   ├── subscriptions/route.ts
│   │   │   ├── invoices/route.ts
│   │   │   ├── portal/
│   │   │   │   └── [token]/route.ts   # Public portal endpoints
│   │   │   └── reports/route.ts
│   │   │
│   │   ├── layout.tsx             # Root layout: <html>, <body>, font loading, theme provider
│   │   ├── page.tsx               # Landing page (redirect to /dashboard if logged in)
│   │   ├── loading.tsx            # Global loading skeleton
│   │   ├── error.tsx              # Global error boundary
│   │   ├── not-found.tsx          # 404
│   │   └── globals.css            # Tailwind v4 @theme tokens + global resets
│   │
│   ├── components/                # Reusable UI components — hand-rolled, NO library
│   │   ├── ui/                    # Primitive components (button, input, card, etc.)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── error-state.tsx
│   │   │   ├── spinner.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── pagination.tsx
│   │   │   └── stepper.tsx        # For approval chain visualization
│   │   ├── layout/                # App shell pieces
│   │   │   ├── top-nav.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── workspace-shell.tsx
│   │   │   ├── portal-shell.tsx
│   │   │   ├── footer.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── data/                  # Data display components
│   │   │   ├── data-table.tsx
│   │   │   ├── kpi-card.tsx
│   │   │   ├── kanban-board.tsx
│   │   │   ├── kanban-column.tsx
│   │   │   ├── kanban-card.tsx
│   │   │   ├── timeline.tsx
│   │   │   ├── audit-trail.tsx
│   │   │   └── status-badge.tsx
│   │   ├── quotations/            # Quotation-domain components
│   │   │   ├── quotation-builder.tsx
│   │   │   ├── line-item-row.tsx
│   │   │   ├── line-item-editor.tsx
│   │   │   ├── discount-input.tsx
│   │   │   ├── margin-indicator.tsx
│   │   │   ├── blended-risk-score.tsx
│   │   │   ├── upsell-panel.tsx
│   │   │   ├── upsell-card.tsx
│   │   │   ├── fulfillment-split.tsx
│   │   │   └── billing-schedule.tsx
│   │   ├── approvals/
│   │   │   ├── approval-stepper.tsx
│   │   │   ├── approval-action.tsx
│   │   │   └── approval-history.tsx
│   │   ├── portal/               # Customer portal-specific
│   │   │   ├── portal-header.tsx
│   │   │   ├── line-comment-thread.tsx
│   │   │   └── counter-offer-form.tsx
│   │   └── charts/                # Recharts wrappers (Dashboard + Deal Health only)
│   │       ├── deals-by-stage-chart.tsx
│   │       ├── revenue-trend-chart.tsx
│   │       ├── discount-anomaly-chart.tsx
│   │       └── fulfillment-slippage-chart.tsx
│   │
│   ├── lib/                       # Non-UI utilities and core logic
│   │   ├── api/                   # Typed API client + endpoints
│   │   │   ├── client.ts          # Base fetch with auth + error handling
│   │   │   ├── quotations.ts
│   │   │   ├── approvals.ts
│   │   │   ├── products.ts
│   │   │   ├── fulfillment.ts
│   │   │   ├── subscriptions.ts
│   │   │   ├── invoices.ts
│   │   │   ├── reports.ts
│   │   │   └── portal.ts
│   │   ├── auth/                  # Auth context + helpers
│   │   │   ├── context.tsx
│   │   │   ├── hooks.ts
│   │   │   ├── guard.tsx
│   │   │   └── mock.ts
│   │   ├── domain/                # Pure business logic (NO React, NO fetch)
│   │   │   ├── discount.ts         # Blended risk score calculation
│   │   │   ├── approval-routing.ts # Which level approves which score
│   │   │   ├── warehouse-split.ts # Auto-split algorithm
│   │   │   ├── proration.ts        # Mid-cycle subscription proration
│   │   │   ├── margin.ts          # Margin + margin delta calc
│   │   │   └── billing-schedule.ts # Recurring billing schedule generation
│   │   ├── hooks/                 # React hooks
│   │   │   ├── use-current-user.ts
│   │   │   ├── use-quotation.ts
│   │   │   ├── use-quotations.ts
│   │   │   ├── use-debounce.ts
│   │   │   ├── use-media-query.ts
│   │   │   └── use-toast.ts
│   │   ├── mock/                  # MSW setup + mock data
│   │   │   ├── handlers/
│   │   │   │   ├── quotations.ts
│   │   │   │   ├── approvals.ts
│   │   │   │   ├── products.ts
│   │   │   │   └── ...
│   │   │   ├── data/              # Seed data (Acme Corp, Q-1042, etc.)
│   │   │   │   ├── products.ts
│   │   │   │   ├── quotations.ts
│   │   │   │   ├── customers.ts
│   │   │   │   ├── warehouses.ts
│   │   │   │   └── users.ts
│   │   │   └── browser.ts        # MSW worker setup
│   │   ├── utils/
│   │   │   ├── cn.ts              # clsx + tailwind-merge
│   │   │   ├── format-currency.ts
│   │   │   ├── format-date.ts
│   │   │   ├── format-percent.ts
│   │   │   └── slug.ts
│   │   ├── validations/          # Zod schemas
│   │   │   ├── quotation.ts
│   │   │   ├── auth.ts
│   │   │   └── product.ts
│   │   └── constants/
│   │       ├── nav.ts             # Top nav items
│   │       ├── mock.ts           # Mock user types
│   │       └── stages.ts          # Quotation stages (Draft, Pending Approval, etc.)
│   │
│   ├── types/                    # Shared TypeScript types (mirror backend schema)
│   │   ├── api.ts                # API request/response types
│   │   ├── domain.ts             # Domain types (Quotation, LineItem, Approval, etc.)
│   │   ├── user.ts
│   │   └── next-auth.d.ts        # (if we add next-auth later)
│   │
│   └── styles/                   # (empty for MVP — Tailwind v4 only)
│
├── .env.local                    # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_MSW_ENABLED, etc.
├── .env.example
├── .eslintrc.json                 # Or eslint.config.js (flat config for ESLint 9)
├── .prettierrc
├── .gitignore                    # See docs/.gitignore
├── next.config.ts                # Next.js 16 config
├── tsconfig.json
├── tailwind.config.ts            # Tailwind v4 (minimal — most config in CSS)
├── postcss.config.mjs
├── package.json
├── README.md
└── components.json              # (only if we add shadcn later — we will NOT for MVP)
```

---

## 4. Routing & Layout Strategy

### Route Groups (Parentheses = Layout, Not URL)

| Group | URL prefix | Layout | Auth | Purpose |
|---|---|---|---|---|
| `(auth)` | `/login`, `/signup` | Centered card, no nav | Public | Authentication |
| `(workspace)` | `/dashboard`, `/quotations`, etc. | Top nav + sidebar | Required | Workspace layout |
| `(portal)` | `/quote/[token]`, `/orders/[token]` | Customer-facing portal shell | Required (customer token) | Customer negotiation + order confirmation |
| `api/` | `/api/*` | None (route handlers) | Per-endpoint | BFF layer (calls backend or returns mock) |

### Why three route groups?

The problem statement explicitly requires:
> The customer-facing negotiation screen must be a **real, separate, restricted view**, not just another internal screen with a different label.

Three route groups enforce this at the file system level — `(portal)` has its own `layout.tsx`, its own auth context, its own color cues, and cannot accidentally inherit the workspace nav. If a developer ever tries to reuse a workspace component inside `(portal)`, the import path will make it obvious that they're crossing boundaries.

### Auth Strategy (MVP)

- **Internal users**: email + password + phone (signup → login → JWT in httpOnly cookie → `/dashboard` redirect).
- **Customer portal**: magic link token in URL (`/quote/[token]`). No persistent login — token is short-lived (24h) and signed. Customer enters name + email to confirm.
- **Auth context**: React Context at root layout. Server Components read cookie via `next/headers` and pass initial user to client.

### Navigation

Top nav (workspace only) — left to right, matching the Excalidraw mockup:

```
Dashboard | Quotations | Approvals | Fulfillment | Subscriptions | Invoices | Deal Health | Reports | Products
```

Active state: underline + slightly darker text (no background fill — minimal monochrome rule).

Mobile: top nav collapses to a hamburger that opens a left drawer.

---

## 5. Data Flow Architecture

### Three Modes (swappable via `NEXT_PUBLIC_DATA_MODE` env var)

1. **`mock`** (default for hackathon demo) — MSW intercepts `fetch` in the browser; route handlers in `/api/*` return mock data server-side. No backend needed.
2. **`backend`** — Route handlers proxy to the Odoo backend at `BACKEND_URL`. The frontend never calls the backend directly from the browser (CORS + auth).
3. **`hybrid`** — Some endpoints from backend, some from mock. Useful when the backend team delivers one endpoint at a time.

### Request Flow (browser → server)

```
Browser (Client Component)
   ↓ fetch('/api/quotations')
Next.js Route Handler (/api/quotations/route.ts)
   ↓ if DATA_MODE === 'backend': fetch(`${BACKEND_URL}/quotations`, { headers: { Authorization: `Bearer ${session}` } })
   ↓ if DATA_MODE === 'mock':    return mockData
   ↓
Response → typed via Zod schema → returned to browser
```

### Why a BFF layer?

Even though the demo uses mock data, the BFF layer (route handlers) means:

- The frontend never knows whether it's talking to mock or real backend — same code, different env var
- The backend team can ship endpoints one at a time and we flip them via env vars
- Auth + cookie handling is server-side only — no token leakage to the browser
- Zod validation happens at the BFF boundary — bad backend data never reaches a component

---

## 6. State Management (Minimal)

| State | Where it lives | How it's accessed |
|---|---|---|
| Current user (auth) | React Context at root | `useCurrentUser()` hook |
| Theme (light/dark) | `next-themes` (or simple Context + `localStorage`) | `useTheme()` |
| Quotation builder cart (current draft) | URL search params + Context (for cross-page persistence) | `useQuotationBuilder()` hook |
| Toasts | Custom Context | `useToast()` |
| Server data (lists, details) | Server Components + `cache()` + revalidate | No client state needed for MVP |
| Form state | React 19 `useFormState` + `useFormStatus` | Native, no library |

No Redux. No Zustand. No TanStack Query for MVP.

---

## 7. The Blended Risk Score — Frontend Architecture

The blended risk score calculation MUST be in `src/lib/domain/discount.ts` as a **pure function**:

```typescript
// signature (do NOT implement — plan only)
export function calculateBlendedRiskScore(
  lines: LineItem[],
  customerTier: CustomerTier,
  categoryCeilings: Record<ProductCategory, DiscountPercent>,
): {
  perLine: Array<{ lineId: string; given: number; ceiling: number; overBy: number }>;
  blendedScore: number;
  requiresApproval: boolean;
  approvalLevel: 'none' | 'manager' | 'manager+finance';
  reason: string;
}
```

This function:

- Is called from the Quotation Builder on every line change (debounced 150ms)
- Is called from the Approval Detail screen to show the audit trail
- Is called from the Customer Portal to determine if a counter-offer re-enters approval
- Has 100% unit test coverage (vitest) — it's the most important business logic
- Is shared between client and server (pure TS, no React, no fetch)

The backend team will implement the same logic; we mirror it client-side for instant feedback and verify the contract via Zod.

---

## 8. Component Composition Rules

1. **Server Components by default.** Only mark `'use client'` when the component needs state, effects, event handlers, or browser APIs.
2. **Data fetching in Server Components.** Client Components receive data as props.
3. **One responsibility per file.** A component file should export one default component.
4. **Co-locate types.** Domain types live in `src/types/domain.ts`; component prop types live in the component file.
5. **No prop drilling past 2 levels.** If you need to pass props through 2+ components, use Context.
6. **No inline styles.** All styling via Tailwind classes. Exception: dynamic CSS custom properties for things like chart dimensions.
7. **No `any` types.** ESLint rule: `@typescript-eslint/no-explicit-any: error`. Use `unknown` + Zod parse if you genuinely don't know the shape.
8. **File naming: kebab-case for files, PascalCase for component exports.** `button.tsx` exports `Button`.

---

## 9. Performance Budget (Per Route)

| Metric | Budget | Why |
|---|---|---|
| First Contentful Paint | < 1.2s on 4G | Demo must feel instant |
| Time to Interactive | < 2.5s on 4G | Demo flow must not stall |
| JS bundle per route | < 200 KB gzipped | Tailwind v4 + Inter font + page code |
| LCP image | < 100 KB | No heavy hero images; CSS-rendered visuals |
| Total images per page | ≤ 3 | Use SVG icons (lucide) instead of PNGs |

Enforced via:

- `next/font` for font subsetting
- Dynamic imports for charts (Recharts is heavy — only load on Dashboard + Deal Health)
- `next/image` for any photo (probably zero for MVP)
- Tailwind v4 JIT — only ships used classes
- Code-splitting per route (App Router does this by default)

---

## 10. Folder-Placement Cheat Sheet

| You're adding a... | It goes in... |
|---|---|
| New page/route | `src/app/<route-group>/<path>/page.tsx` |
| New API endpoint | `src/app/api/<resource>/route.ts` |
| New reusable UI primitive (button, input, card) | `src/components/ui/` |
| New domain component (quotation-related, approval-related) | `src/components/<domain>/` |
| New layout piece (nav, sidebar) | `src/components/layout/` |
| New chart | `src/components/charts/` |
| Pure business logic | `src/lib/domain/` |
| React hook | `src/lib/hooks/` |
| API client function | `src/lib/api/` |
| Zod schema | `src/lib/validations/` |
| TypeScript type | `src/types/` |
| Mock handler | `src/lib/mock/handlers/` |
| Mock seed data | `src/lib/mock/data/` |
| Constant (nav items) | `src/lib/constants/` |
| Utility (cn, format-currency) | `src/lib/utils/` |

**Rule**: If a file doesn't have an obvious home in this table, STOP and ask whether the file should exist at all. Ad-hoc file placement is the #1 cause of frontend rot.

---

## 11. Dependency Direction (Enforced)

```
types/  ←  lib/domain/  ←  lib/api/  ←  app/api/  ←  app/(routes)/  ←  components/
                                                           ↑
                                                       lib/hooks/
```

- `types/` imports from nothing
- `lib/domain/` imports from `types/` only — NEVER from React, fetch, or components
- `lib/api/` imports from `types/` + `lib/domain/` (for response shaping)
- `app/api/` (route handlers) import from `lib/api/` + `lib/domain/`
- `app/(routes)/` (pages) import from `components/` + `lib/hooks/` + `lib/api/`
- `components/` import from `types/` + `lib/hooks/` + `lib/utils/` + other `components/`
- `lib/hooks/` import from `lib/api/` + `types/`

**Forbidden**:
- A `component/` importing from `app/api/` (circular)
- `lib/domain/` importing React (must stay pure)
- `app/(routes)/` importing directly from `lib/mock/` (must go through `lib/api/`)
