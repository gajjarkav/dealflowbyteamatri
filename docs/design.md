# DealFlow360 — Design System

> **The visual language of DealFlow360.** Every component, screen, and pixel decision must trace back to this file.
> **Style direction**: Minimal monochrome — Linear / Stripe inspired. Warm off-white background, near-black text, ONE accent color (terracotta), generous whitespace, no decoration without purpose.
> **Philosophy**: Human-first. The interface should look like a craftsperson made it on a Tuesday afternoon, not like an AI dumped every skill it had onto the page.

---

## 1. The Design Brief (One Paragraph)

DealFlow360 is a B2B sales operations platform for finance-minded users (sales reps, managers, finance ops, admins). The interface must feel **trustworthy, precise, and quiet**. Trustworthy because we're handling money and approvals. Precise because every number matters. Quiet because a sales rep is using this 8 hours a day and a loud interface fatigues. We achieve this with: a warm off-white background, a single near-black text color, hairline borders instead of shadows, ONE accent color used sparingly (only on the thing the user should click next), a 4-step type scale, a 4-px spacing rhythm, and no gradients, no glassmorphism, no decorative animation. We borrow from Linear's calm density and Stripe's typographic confidence.

---

## 2. Available Design Skills (From the Z.ai Skill Library)

The user requested "use maximum skills for that." The following skills in the Z.ai environment contain design guidance relevant to this project. **Load these skills (Skill tool) BEFORE writing components** in the corresponding domains:

| Skill | When to load it | What it gives you |
|---|---|---|
| **`design`** | Phase 1, before building UI primitives | Foundational design principles, color theory, typography systems, layout grids, the "design system" mental model |
| **`visual-design-foundations`** | Phase 1, alongside `design` | The concrete building blocks: spacing scales, type scales, contrast rules, visual hierarchy, gestalt principles |
| **`ui-ux-pro-max`** | Phase 2, before building any user-facing screen | UI patterns (forms, tables, modals, kanbans), UX flows, accessibility patterns, error/empty/loading state design |
| **`charts`** | Phase 2 (Dashboard) and Phase 6 (Deal Health) | Chart library choice (Recharts for us), chart styling rules (axis, grid, legend), anti-stacking rules, color rules for data |
| **`fullstack-dev`** | Phase 0 (project setup) | Next.js 16 + Tailwind v4 + TypeScript project scaffolding, file structure conventions |

**Optional skills** (load only if a specific need arises):
- `web-search` — when you need to verify Next.js 16 / Tailwind v4 API details
- `web-reader` — when you need to read a specific documentation page

**Forbidden skills** (do NOT load — they're for other task types):
- `pptx`, `docx`, `pdf`, `xlsx` — we're not generating documents
- `image-generation` — we use SVG icons (lucide-react), not generated images
- `TTS`, `ASR` — no voice features
- `VLM` — only used once to read the Excalidraw mockup (already done)

---

## 3. Tailwind v4 Theme Tokens (Copy-Paste into `globals.css`)

This is the FULL design system as CSS. Paste this into `src/app/globals.css` (after `@import "tailwindcss";`):

```css
@import "tailwindcss";

@theme {
  /* === FONTS === */
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;

  /* === LIGHT MODE COLORS (default) === */
  --color-background: #FFFFFF;
  --color-surface: #FAFAFA;
  --color-surface-hover: #F4F4F5;
  --color-border: #E4E4E7;
  --color-border-strong: #D4D4D8;
  --color-text-primary: #09090B;
  --color-text-secondary: #52525B;
  --color-text-muted: #71717A;
  --color-accent: #C2410C;
  --color-accent-hover: #9A3412;
  --color-accent-soft: #FFEDD5;
  --color-success: #15803D;
  --color-success-soft: #F0FDF4;
  --color-warning: #B45309;
  --color-warning-soft: #FFFBEB;
  --color-danger: #B91C1C;
  --color-danger-soft: #FEF2F2;

  /* === RADIUS === */
  --radius: 4px;
  --radius-md: 6px;
  --radius-full: 9999px;

  /* === TYPE SCALE === */
  --text-xs: 0.75rem;       /* 12px */
  --text-xs--line-height: 1rem;     /* 16px */
  --text-sm: 0.875rem;      /* 14px */
  --text-sm--line-height: 1.25rem;  /* 20px */
  --text-base: 1rem;       /* 16px */
  --text-base--line-height: 1.5rem; /* 24px */
  --text-lg: 1.125rem;      /* 18px */
  --text-lg--line-height: 1.75rem;  /* 28px */
  --text-xl: 1.25rem;       /* 20px */
  --text-xl--line-height: 1.75rem;  /* 28px */
  --text-2xl: 1.5rem;       /* 24px */
  --text-2xl--line-height: 2rem;    /* 32px */
  --text-3xl: 1.875rem;     /* 30px */
  --text-3xl--line-height: 2.25rem; /* 36px */

  /* === SHADOWS (only for modals, dropdowns, toasts) === */
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.075), 0 2px 4px -2px rgba(0, 0, 0, 0.075);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

/* === DARK MODE OVERRIDES === */
[data-theme="dark"] {
  --color-background: #0A0A0B;
  --color-surface: #18181B;
  --color-surface-hover: #27272A;
  --color-border: #27272A;
  --color-border-strong: #3F3F46;
  --color-text-primary: #FAFAFA;
  --color-text-secondary: #A1A1AA;
  --color-text-muted: #71717A;
  --color-accent: #E96B56;
  --color-accent-hover: #F87171;
  --color-accent-soft: #7F1D1D;
  --color-success: #22C55E;
  --color-success-soft: #052E16;
  --color-warning: #F59E0B;
  --color-warning-soft: #422006;
  --color-danger: #EF4444;
  --color-danger-soft: #450A0A;
}

/* === GLOBAL BASE STYLES === */
@layer base {
  * {
    border-color: var(--color-border);
  }
  body {
    background-color: var(--color-background);
    color: var(--color-text-primary);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  ::selection {
    background-color: var(--color-accent-soft);
    color: var(--color-accent);
  }
  :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}

/* === SCROLLBAR (subtle, applies to overflow containers) === */
@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: var(--color-border-strong) transparent;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: var(--color-border-strong);
    border-radius: var(--radius-full);
  }
}
```

### How to use these tokens in components

```tsx
// Good — using tokens
<div className="bg-surface text-text-primary border border-border rounded-md p-4">
  Card content
</div>

// Good — using accent sparingly (1 element per screen)
<Button variant="primary">Submit for Approval</Button>
// where Button primary uses: bg-accent text-white hover:bg-accent-hover

// Bad — hardcoded colors (FORBIDDEN by rules.md)
<div className="bg-white text-gray-900 border-gray-200 rounded-lg p-5">
```

Wait — Tailwind v4 will auto-generate utility classes from `@theme` tokens. So `bg-surface` works automatically when you define `--color-surface` in `@theme`. Verify this in the Tailwind v4 docs (load `web-search` skill if unsure).

---

## 4. Color Usage Rules (Quick Reference)

| Token | When to use | When NOT to use |
|---|---|---|
| `bg-background` | Page background | Cards (use `bg-surface`) |
| `bg-surface` | Cards, panels, dropdowns | Page background (use `bg-background`) |
| `bg-surface-hover` | Hover state of cards, table rows | Default state |
| `border-border` | All hairline borders | Strong dividers (use `border-border-strong`) |
| `text-text-primary` | Body text, headings | Labels (use `text-text-secondary`) |
| `text-text-secondary` | Labels, helper text, table headers | Body text (use `text-text-primary`) |
| `text-text-muted` | Timestamps, metadata | Anything the user must read |
| `bg-accent` | Primary buttons, active nav item, focus ring | More than 1 element per screen |
| `text-accent` | Links (rare — prefer buttons) | Body text |
| `bg-accent-soft` | Active filter chip, highlighted row in a table | Default backgrounds |
| `bg-success-soft` / `text-success` | Approved, completed, success toast | Default UI |
| `bg-warning-soft` / `text-warning` | Pending, in negotiation, warning banner | Default UI |
| `bg-danger-soft` / `text-danger` | Rejected, overdue, error state, delete button | Default UI |

### The "One Accent Per Screen" Rule

Every screen has **at most one element** that uses `bg-accent`. That element is what you want the user to click next.

- Dashboard: the "New Quotation" button
- Quotation Builder: the "Submit for Approval" button (or "Save as Draft" — pick one as primary per state)
- Approval Detail: the "Approve" button
- Customer Portal: the "Confirm Quotation" button
- Deal Health: the most critical alert's "View" button

If you find yourself wanting to use `bg-accent` on two elements on one screen, you have a hierarchy problem. Demote one to secondary (`border border-accent text-accent` instead).

---

## 5. Typography Rules (Quick Reference)

| Element | Class | Where used |
|---|---|---|
| Page title (h1) | `text-2xl font-semibold` | One per page, top of content area |
| Section heading (h2) | `text-xl font-semibold` | Card titles, section dividers |
| Card title (h3) | `text-lg font-semibold` | Inside cards |
| Body | `text-base` | Default prose |
| Body small | `text-sm` | Table rows, dense lists, form labels |
| Helper text | `text-xs text-text-secondary` | Form hints, metadata |
| Mono | `text-sm font-mono` | Quote IDs (Q-1042), invoice IDs (INV-1042), amounts in dense tables |
| Landing hero | `text-3xl font-bold` | Landing page only, 1x max |

### Forbidden

- `text-4xl` through `text-7xl` (too big, breaks minimal scale)
- `font-extrabold`, `font-black` (too heavy, only `font-bold` for landing hero)
- `uppercase` on body text (only on tiny labels like `text-xs uppercase tracking-wider` for section dividers, and sparingly)
- `tracking-widest` except on `text-xs` labels
- `italic` for emphasis (use weight or color instead — `font-medium` for subtle, `text-accent` for strong)

### Line Height

Use Tailwind's defaults (they come from the `--text-*--line-height` tokens above). Don't override with `leading-*` classes unless you have a specific reason (e.g., `leading-tight` for tight badge text).

---

## 6. Spacing Rules (Quick Reference)

| Class | px | Used for |
|---|---|---|
| `gap-1`, `p-1` | 4 | Tight icon-text inside badges |
| `gap-2`, `p-2` | 8 | Inline gap (icon + label) |
| `gap-3`, `p-3` | 12 | Tight element gaps inside a card |
| `gap-4`, `p-4` | 16 | Default card padding, default grid gap |
| `gap-6`, `p-6` | 24 | Section gap inside a page |
| `gap-8`, `p-8` | 32 | Card-to-card gap, page edge padding |
| `gap-12`, `p-12` | 48 | Landing page section gap |
| `gap-16`, `p-16` | 64 | Landing hero top padding |
| `gap-24`, `p-24` | 96 | Landing hero bottom (mobile) |

### Forbidden Spacing

- `p-5`, `p-7`, `p-10`, `p-14`, `p-20` — break the 4-px rhythm
- `gap-5`, `gap-7`, `gap-9` — same
- Arbitrary values like `p-[14px]` unless there's a specific reason (and even then, prefer the closest token)

### Section Layout (within a page)

```
[ page padding: p-8 (desktop) / p-4 (mobile) ]
  [ section: mb-8 ]
    [ section title: text-2xl font-semibold mb-6 ]
    [ section content ]
  [ section: mb-8 ]
    ...
```

### Card Layout (inside a section)

```
[ card: bg-surface border border-border rounded-md p-4 ]
  [ card title: text-lg font-semibold mb-4 ]
  [ card content: text-sm text-text-secondary ]
```

---

## 7. Component Specs (Each UI Primitive)

### Button (`src/components/ui/button.tsx`)

**Variants** (4 only):

| Variant | Classes | Use |
|---|---|---|
| `primary` | `bg-accent text-white hover:bg-accent-hover rounded px-4 py-2 text-sm font-medium` | ONE per screen — the main action |
| `secondary` | `bg-surface text-text-primary border border-border hover:bg-surface-hover rounded px-4 py-2 text-sm font-medium` | Secondary actions (Cancel, Back) |
| `ghost` | `bg-transparent text-text-primary hover:bg-surface-hover rounded px-4 py-2 text-sm font-medium` | Tertiary actions, nav items |
| `danger` | `bg-danger text-white hover:bg-danger/90 rounded px-4 py-2 text-sm font-medium` | Delete, Reject |

**Sizes** (2 only):

| Size | Padding |
|---|---|
| `sm` | `px-3 py-1.5 text-xs` |
| `md` (default) | `px-4 py-2 text-sm` |

**States**:
- Default: as above
- Hover: as above
- Focus: `focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2`
- Disabled: `opacity-50 cursor-not-allowed`
- Loading: replace text with `<Spinner size="sm" />` + keep width to prevent layout shift

**Forbidden**:
- ❌ `rounded-lg`, `rounded-xl`, `rounded-2xl` (only `rounded` = 4px)
- ❌ Gradient buttons
- ❌ Shadow on buttons
- ❌ Icon-only buttons without `aria-label`

### Input (`src/components/ui/input.tsx`)

```tsx
<input
  className={cn(
    "w-full bg-background border border-border rounded px-3 py-2 text-sm text-text-primary",
    "placeholder:text-text-muted",
    "focus:border-accent focus:outline-none",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "transition-colors duration-150"
  )}
/>
```

**Rules**:
- Height: ~36px (`py-2` + `text-sm` line-height)
- Border: 1px `border-border`; focus: 1px `border-accent` (no shadow, just color change)
- Background: `bg-background` (white in light mode, near-black in dark — slightly darker than the surface card behind it, creating subtle depth)
- Placeholder: `text-text-muted`
- Error state: add `border-danger` + `text-danger` on the helper text below

### Card (`src/components/ui/card.tsx`)

```tsx
<div className="bg-surface border border-border rounded-md p-4">
  {children}
</div>
```

**Rules**:
- NO shadow. Ever. Hairline border only.
- `bg-surface` (not `bg-background` — surface is one step darker in light mode, one step lighter in dark mode, creating subtle elevation)
- `rounded-md` (6px — slightly more than buttons to distinguish)
- `p-4` default; `p-6` for larger cards (e.g., KPI cards)

### Table (`src/components/ui/table.tsx`)

```tsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-border">
      <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-4 py-3">
        Column Header
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border hover:bg-surface-hover transition-colors">
      <td className="px-4 py-3 text-text-primary">Cell content</td>
    </tr>
  </tbody>
</table>
```

**Rules**:
- Header: `text-xs font-medium text-text-secondary uppercase tracking-wider` — small, muted, slightly tracked out (this is the ONE place we use uppercase)
- Rows: `text-sm`, hover background `bg-surface-hover`
- Row borders: `border-b border-border` — hairline only, no vertical borders
- Cell padding: `px-4 py-3`
- Right-align numeric columns: `text-right tabular-nums` (use `font-mono` only for IDs)
- Sort indicator: a tiny `▲` or `▼` icon next to the header text (lucide `ChevronUp` / `ChevronDown`)

### Badge / Status Pill (`src/components/ui/badge.tsx`)

```tsx
// Neutral (default)
<span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium bg-surface text-text-secondary border border-border">
  Draft
</span>

// Success (Approved, Completed)
<span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium bg-success-soft text-success">
  Approved
</span>

// Warning (Pending, In Negotiation)
<span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium bg-warning-soft text-warning">
  Pending
</span>

// Danger (Rejected, Overdue)
<span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium bg-danger-soft text-danger">
  Rejected
</span>
```

**Rules**:
- Always have a colored dot before the text: `<span className="w-1.5 h-1.5 rounded-full bg-current" />` (the dot uses `bg-current` so it inherits the text color)
- Text + dot (never just color — see accessibility rule in `rules.md` Section 7)
- `text-xs` (12px) — small but readable
- Soft background (`-soft` token) so the badge doesn't dominate

### Modal / Dialog (`src/components/ui/modal.tsx`)

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  <div className="absolute inset-0 bg-black/40" onClick={onClose} />
  <div className="relative bg-surface border border-border rounded-md shadow-lg w-full max-w-md mx-4 p-6">
    {children}
  </div>
</div>
```

**Rules**:
- Overlay: `bg-black/40` — the ONLY place we use opacity (it's the backdrop, not a content surface)
- Modal: `bg-surface` (not `bg-background`), `shadow-lg` (the ONLY component allowed shadow besides dropdowns and toasts)
- Max width: `max-w-md` (28rem / 448px) for confirm dialogs, `max-w-lg` for forms, `max-w-2xl` for complex
- Close on: Escape key, overlay click, close button (top-right, ghost icon button)
- Focus trap: tab cycles within modal; first focusable element gets focus on open
- Animation: `animate-in fade-in` + `animate-in slide-in-from-bottom-4` (subtle, 150ms)

### Kanban Card (`src/components/data/kanban-card.tsx`)

```tsx
<div
  draggable
  onDragStart={handleDragStart}
  className="bg-surface border border-border rounded-md p-3 cursor-grab active:cursor-grabbing hover:border-border-strong transition-colors"
>
  <div className="flex items-center justify-between mb-2">
    <span className="text-xs font-mono text-text-muted">Q-1042</span>
    <StatusBadge status="pending" />
  </div>
  <div className="text-sm font-medium text-text-primary mb-1">Acme Corp</div>
  <div className="flex items-center justify-between text-xs text-text-secondary">
    <span>$15,000</span>
    <span>Updated 2h ago</span>
  </div>
</div>
```

**Rules**:
- Card padding: `p-3` (smaller than default `p-4` because kanban cards are dense)
- Hover: change border to `border-strong` (don't scale, don't shadow)
- Drag: cursor changes to `grab` / `grabbing`
- Drop: the column shows a dashed border where the card will land
- ID uses `font-mono` for tabular alignment down the column

### KPI Card (`src/components/data/kpi-card.tsx`)

```tsx
<div className="bg-surface border border-border rounded-md p-6">
  <div className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
    Pending Approvals
  </div>
  <div className="flex items-baseline gap-2">
    <span className="text-2xl font-semibold text-text-primary tabular-nums">12</span>
    <span className="text-xs text-text-secondary">quotes</span>
  </div>
  <div className="text-xs text-text-muted mt-2">
    <span className="text-success">↓ 3</span> from yesterday
  </div>
</div>
```

**Rules**:
- Label: `text-xs uppercase tracking-wider` (the small-cap label pattern)
- Number: `text-2xl font-semibold tabular-nums` (large but not huge; tabular for alignment when stacked)
- Trend: `text-xs` with color (green for good, red for bad — but always with the arrow `↑` or `↓` AND the number, never color alone)

### Empty State (`src/components/ui/empty-state.tsx`)

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <FileTextIcon className="w-12 h-12 text-text-muted mb-4" />
  <h3 className="text-lg font-semibold text-text-primary mb-2">No quotations yet</h3>
  <p className="text-sm text-text-secondary mb-6 max-w-sm">
    When you create your first quotation, it'll show up here.
  </p>
  <Button variant="primary">Create your first quote</Button>
</div>
```

**Rules**:
- Icon: 48px (`w-12 h-12`), `text-text-muted` (NOT accent — accent is for action, this is illustrative)
- Title: `text-lg font-semibold`
- Description: `text-sm text-text-secondary max-w-sm` (constrained width for readability)
- Action: ONE primary button (or a link) — never leave the user without a next step

### Loading State (Skeleton)

```tsx
<div className="bg-surface border border-border rounded-md p-4 animate-pulse">
  <div className="h-4 bg-border rounded w-1/3 mb-3" />
  <div className="h-3 bg-border rounded w-full mb-2" />
  <div className="h-3 bg-border rounded w-2/3" />
</div>
```

**Rules**:
- Skeleton shape matches the content shape (a card skeleton has card padding; a table skeleton has rows)
- Use `bg-border` (NOT `bg-surface-hover`) for the shimmer blocks — slightly darker for visibility
- `animate-pulse` (Tailwind built-in) — subtle 1s pulse, not aggressive

### Error State (`src/components/ui/error-state.tsx`)

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <AlertCircleIcon className="w-12 h-12 text-danger mb-4" />
  <h3 className="text-lg font-semibold text-text-primary mb-2">
    Couldn't load quotations
  </h3>
  <p className="text-sm text-text-secondary mb-6 max-w-sm">
    Something went wrong on our end. Check your connection and try again.
  </p>
  <Button variant="secondary" onClick={retry}>
    <RefreshCwIcon className="w-4 h-4 mr-2" />
    Try again
  </Button>
</div>
```

**Rules**:
- Icon: `text-danger` (this is one of the few non-accent colored UI elements)
- Always explain what happened (in plain language, no jargon) AND what to do (retry button)
- Never show a raw error message or stack trace to the user (log it to console.error for dev)

---

## 8. Layout Patterns

### Workspace Layout (top nav + content)

```
┌─────────────────────────────────────────────────────┐
│  Top Nav: Logo | Dashboard | Quotations | ... | Dark │   ← 56px height
├─────────────────────────────────────────────────────┤
│                                                     │
│  Content area: max-w-[1400px] mx-auto p-8          │   ← page content
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

- Top nav height: 56px (`h-14`)
- Content max width: `max-w-[1400px]` (centered on large screens, full-width on small)
- Content padding: `p-8` desktop, `p-4` mobile

### Quotation Builder Layout (2-column)

```
┌──────────────────────────────┬─────────────────────┐
│  Line Items Table            │  Upsell Panel       │
│  (60% width)                 │  Risk Score Panel   │
│                              │  Margin Indicator   │
│  + Add Line button           │                     │
│                              │                     │
├──────────────────────────────┴─────────────────────┤
│  Footer: Save Draft | Submit for Approval | Cancel │
└─────────────────────────────────────────────────────┘
```

- Desktop: `grid grid-cols-5 gap-6` with left col `col-span-3` and right col `col-span-2`
- Mobile: stacks vertically (`grid-cols-1`); the right column becomes a collapsible drawer accessed via a "Suggestions" tab at the top

### Dashboard Layout (KPIs + activity + chart)

```
┌──────────────────────────────────────────────────────┐
│  3 KPI Cards: grid-cols-3 gap-4 (or stack on mobile) │
├──────────────────────────────────────┬───────────────┤
│  Recent Activity feed (60%)          │  Quick Actions │
│                                      │  (40%)         │
│                                      │               │
├──────────────────────────────────────┴───────────────┤
│  Quotations by Stage chart (full width)              │
└──────────────────────────────────────────────────────┘
```

### Kanban Board Layout (5 columns)

```
┌──────┬──────┬──────┬──────┬──────┐
│Draft │Pend. │Sent  │Confrm│Fulfl │  ← column header: text-xs uppercase tracking-wider
│      │Approv│      │      │      │
│ card │ card │ card │ card │ card │  ← cards: p-3, mb-3
│ card │ card │      │ card │      │
│      │ card │      │      │      │
└──────┴──────┴──────┴──────┴──────┘
```

- 5 columns: `grid grid-cols-5 gap-4` (desktop)
- On mobile: horizontal scroll (`overflow-x-auto`), each column `min-w-[280px]`
- Column header: `text-xs font-medium text-text-secondary uppercase tracking-wider mb-3`
- Card spacing: `mb-3` (cards stack vertically in each column)

---

## 9. Iconography Rules

**Library**: `lucide-react` (tree-shakeable, monochrome, 1px stroke)

**Usage**:
```tsx
import { Plus, ChevronRight, AlertCircle } from 'lucide-react';

<Button variant="primary">
  <Plus className="w-4 h-4 mr-2" />
  New Quotation
</Button>
```

**Sizes** (3 only):
- `w-3.5 h-3.5` (14px) — inside badges, inline with `text-xs`
- `w-4 h-4` (16px) — default, inside buttons with `text-sm`
- `w-5 h-5` (20px) — inside larger UI, like empty states with `text-lg`

**Stroke**: keep the default 1.5px stroke from lucide. Don't override with `stroke-2`.

**Color**: inherits from parent text color (`text-text-primary`, `text-text-secondary`, etc.). For accent icons, wrap in a `text-accent` span.

**Forbidden**:
- ❌ Emoji icons (🚀 🎯 💡 ⚡) — see `rules.md` Section 1
- ❌ Custom SVGs (unless absolutely necessary and matches the 1.5px stroke style)
- ❌ Icons from `react-icons` (use only `lucide-react` for consistency)
- ❌ Filled icons (lucide is stroke-only; don't import from a filled icon set)
- ❌ Icons larger than `w-6 h-6` (use illustration instead — but we have NO illustrations for MVP)

---

## 10. Motion & Animation Rules

### Allowed (functional, subtle)

- `transition-colors duration-150` — hover state on buttons, cards, nav items, table rows
- `transition-opacity duration-200` — modal/dialog open and close
- `animate-pulse` — skeleton loading shimmer
- `animate-in fade-in` — modal/toast entrance (via `tailwindcss-animate` if installed, or CSS keyframes inline)
- `animate-in slide-in-from-bottom-4` — modal entrance (subtle 16px slide + fade)
- Kanban drag follows cursor 1:1 (no spring physics — set `transform: translate(x, y)` directly)

### Forbidden (decorative, AI-first)

- ❌ Typewriter effects on text
- ❌ Animated number counters (just show the final number; if it changes, show the new number)
- ❌ Parallax scroll on any element
- ❌ Scroll-triggered fade-in-up (`whileInView` from framer-motion)
- ❌ Bouncing dots loaders (use `Spinner` or `Skeleton`)
- ❌ Hover `scale-105` on cards (hover should change background color, not size)
- ❌ Spring animations on drag (kanban card snaps to grid on drop, no overshoot)
- ❌ `framer-motion` for MVP (don't install it)
- ❌ Any animation longer than 200ms (it feels slow)

### Reduced Motion

Honor the user's OS preference:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Add this to `globals.css` at the end.

---

## 11. Mobile Responsive Strategy

### Breakpoints (Tailwind defaults)

| Prefix | Width | Target |
|---|---|---|
| (default) | < 640px | Mobile |
| `sm:` | ≥ 640px | Large phone / small tablet |
| `md:` | ≥ 768px | Tablet |
| `lg:` | ≥ 1024px | Laptop |
| `xl:` | ≥ 1280px | Desktop |
| `2xl:` | ≥ 1536px | Large desktop |

### Strategy: Mobile-First with Two Major Breakpoints

We design for **3 layouts**:

1. **Mobile** (< 768px): single column, hamburger nav, horizontal scroll for tables/kanban
2. **Tablet + Desktop** (≥ 768px): multi-column, full nav, normal layouts

We don't need a separate tablet layout — 768px is the breakpoint where everything "unfolds" to multi-column.

### Specific Mobile Rules

| Element | Mobile behavior |
|---|---|
| Top nav | Hamburger icon (left) → opens left drawer with nav items |
| Sidebar (if any) | Hidden on mobile — content goes full width |
| KPI cards | `grid-cols-1` (stacked) on mobile, `grid-cols-3` on `md:` |
| Tables | Horizontal scroll (`overflow-x-auto`), first column (usually ID or name) sticky |
| Kanban | Horizontal scroll, each column `min-w-[280px]` |
| Quotation Builder | Right panel becomes a bottom sheet/drawer; "Suggestions" tab toggles it |
| Modals | Full-width with `mx-4`, max height `90vh` with internal scroll |
| Forms | Single column, full-width inputs, labels above inputs (never side-by-side on mobile) |

### Forbidden

- ❌ Hiding content on mobile (every screen must be fully functional on mobile — demo judges may try)
- ❌ Using `cursor-*` classes on mobile (no cursor on touch)
- ❌ Tap targets smaller than 44x44px (Apple HIG) — minimum button height is 36px in our system, which is below 44px... so on mobile, use `py-2.5` instead of `py-2` to bump height to ~40px (close enough)

---

## 12. Dark Mode Strategy

### Implementation

Use `next-themes` with `attribute="class"` and `defaultTheme="system"`:

```tsx
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes';

<html lang="en" suppressHydrationWarning>
  <body>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  </body>
</html>
```

### Toggle

In the workspace top nav, a button that toggles between `light` / `dark` / `system`:

```tsx
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

const { theme, setTheme } = useTheme();
// Cycle: light → dark → system → light
<Button variant="ghost" size="sm" onClick={() => setTheme(nextTheme)}>
  {theme === 'light' && <Sun className="w-4 h-4" />}
  {theme === 'dark' && <Moon className="w-4 h-4" />}
  {theme === 'system' && <Monitor className="w-4 h-4" />}
</Button>
```

### Color Adjustments in Dark Mode

The tokens in Section 3 already handle dark mode via the `[data-theme="dark"]` (or `.dark` with next-themes) override. Key adjustments:

| Element | Light | Dark | Why |
|---|---|---|---|
| Background | `#FFFFFF` | `#0A0A0B` | True black for OLED; near-white for paper feel |
| Surface | `#FAFAFA` | `#18181B` | One step lighter than bg in dark (subtle elevation) |
| Border | `#E4E4E7` | `#27272A` | Visible but not loud |
| Text primary | `#09090B` | `#FAFAFA` | Inverted |
| Text secondary | `#52525B` | `#A1A1AA` | Lighter so it's readable on dark |
| Accent | `#C2410C` (terracotta) | `#E96B56` (lighter) | Terracotta adjusted for dark mode contrast |
| Status colors | Deep variants | Lighter variants | All `-soft` backgrounds invert to deep tints |

### Forbidden in Dark Mode

- ❌ Pure black (`#000000`) for surfaces — too harsh; use `#0A0A0B` or `#18181B`
- ❌ Pure white text — use `#FAFAFA` (slightly off-white, easier on eyes)
- ❌ Keeping the same accent color (deep blue on dark = poor contrast; switch to lighter blue)
- ❌ Removing borders in dark mode (borders are MORE important in dark mode — they define edges)

---

## 13. Accessibility Checklist (Per Component)

Before declaring any component done, verify:

- [ ] Keyboard accessible (tab to focus, enter/escape for actions)
- [ ] Focus ring visible (`focus-visible:outline-2 outline-accent outline-offset-2`)
- [ ] ARIA labels on icon-only buttons (`aria-label="Close"`)
- [ ] ARIA roles on custom widgets (`role="dialog"`, `aria-modal="true"` on modals)
- [ ] Form inputs have `<label>` (or `aria-label`)
- [ ] Color isn't the only signal (status badges have text + dot)
- [ ] Contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI components
- [ ] `prefers-reduced-motion` respected (animations disabled)
- [ ] No `tabIndex` > 0 (use 0 for custom tabbable elements, -1 for programmatically focusable)
- [ ] Modal traps focus (tab cycles within modal)
- [ ] Modal restores focus to trigger on close

---

## 14. The "Does This Look AI-Made?" Final Test

Before committing any screen, step back and ask:

1. **Does it use more than 1 accent color on screen?** If yes, demote one.
2. **Does any card have a shadow?** If yes (except modals/dropdowns/toasts), remove it and use a border instead.
3. **Does any element use a gradient?** If yes, remove it.
4. **Does any element use glassmorphism / backdrop-blur?** If yes, replace with a solid surface.
5. **Are there 5+ different colors visible?** If yes, consolidate.
6. **Does any animation take longer than 200ms or feel decorative?** If yes, remove it.
7. **Is there emoji anywhere?** If yes, replace with lucide icon.
8. **Is there generic copy ("Lorem ipsum", "Your business here")?** If yes, write real copy ("Acme Corp, Q-1042, $15,000").
9. **Is the spacing irregular (mixing `p-4` and `p-5` and `p-6` randomly)?** If yes, pick a rhythm and stick to it.
10. **Does it feel like Linear or Stripe — or does it feel like a WordPress theme?** If the latter, simplify.

If you answer "yes" to any 1-9, fix it. If you answer "Linear or Stripe" to 10, you're done.

---

## 15. Where to Look for Inspiration (Reference, Don't Copy)

- **Linear** (linear.app) — the canonical "calm density" reference. Notice the hairline borders, the type scale, the muted colors, the absence of shadows on cards.
- **Stripe Dashboard** (dashboard.stripe.com) — the canonical "B2B finance" reference. Notice the data density, the tabular numbers, the clear hierarchy.
- **Mercury** (mercury.com) — the canonical "premium fintech" reference. Notice the generous whitespace, the typography confidence.
- **Vercel Dashboard** (vercel.com/dashboard) — the canonical "developer B2B" reference. Notice the monochrome + accent pattern.

**NOT for inspiration** (too loud, too AI-default):
- ❌ Modern AI startup landing pages with gradient heroes
- ❌ MUI / Material Design examples (we're not using MUI)
- ❌ Bootstrap admin templates
- ❌ Dribbble "dashboard concept" shots (mostly decoration, not real product)

---

## 16. Design Decisions Log (Update As We Make Calls)

This section captures design decisions made during the build that aren't in the original spec. Append-only.

| Date | Decision | Why |
|---|---|---|
| 2026-09-05 | Accent color: `#1E40AF` (deep blue) | User didn't specify; deep blue is the B2B finance default and works on both light/dark |
| 2026-09-05 | Font: Inter only (no display serif) | Minimal monochrome rule; Inter is the Linear/Stripe/Vercel default |
| 2026-09-05 | Card radius: 6px (`rounded-md`); button radius: 4px (`rounded`) | Slight distinction; cards feel architectural, buttons feel precise |
| 2026-09-05 | No shadows on cards; hairline border only | Linear-style; shadows feel "Web 2.0" |
| 2026-09-05 | One accent per screen max | Forces hierarchy; prevents the "everything is highlighted so nothing is" problem |
| 2026-09-05 | Status colors (`success`/`warning`/`danger`) only on status badges and alert banners | Status colors are not part of the brand palette; they're signal-only |
| 2026-09-05 | JetBrains Mono for IDs and amounts in dense tables | Tabular figures; distinguishes "data" from "prose" |
