# DealFlow360 — AI Rules & Constraints

> **This file limits what AI is allowed to do in the frontend.**
> Any AI agent working on this project (Nemotron 3 Ultra, Muse 2, Gemini 3.1 Pro, Gemini 3.8 Lite, or any future model) MUST read this file BEFORE writing any code.
> If an AI output violates any rule here, the human will reject the change and the AI must redo it.
>
> **Hard rules are marked `MUST` / `MUST NOT`.**
> **Soft preferences are marked `SHOULD` / `SHOULD NOT`.**

---

## 1. The Single Most Important Rule: Human-First, Not AI-First

This project is **human-first**. That means the design, code, and content must look like a human craftsperson made them — not like an AI dumped every skill it had onto the page.

### What "AI-first" looks like (FORBIDDEN)

- ❌ Using 5+ colors on a single screen "because we can"
- ❌ Gradient backgrounds on every card
- ❌ Drop shadows on every surface
- ❌ Rounded-2xl + glassmorphism + backdrop-blur everywhere
- ❌ Animated counters, parallax scroll, typewriter effects, scroll-triggered fade-ins
- ❌ Emoji as icons (🚀 🎯 💡 ⚡) — use lucide-react SVG icons instead
- ❌ Generic placeholder copy ("Empower your business with our cutting-edge solution")
- ❌ Decorative stock illustrations from undraw.co or similar
- ❌ "Lorem ipsum" or "Lorem ipsum-like" copy — every word must be specific to DealFlow360
- ❌ Padding and spacing that "looks generous" but has no rhythm (e.g., `p-4` on one card and `p-6` on the next for no reason)
- ❌ Default Tailwind palette (`blue-500`, `purple-600`) used as-is — we have our own tokens (see `design.md`)
- ❌ Any screen that "demonstrates a feature" rather than "enables a task"

### What "human-first" looks like (REQUIRED)

- ✅ **One accent color** — used only for primary actions, key data, and focus rings
- ✅ **Near-black text on near-white background** for light mode; the inverse for dark mode
- ✅ **Type scale of 4-5 sizes max** — see `design.md`
- ✅ **Spacing scale of 4-5 values max** — 4, 8, 12, 16, 24, 32 (Tailwind's `1, 2, 3, 4, 6, 8`)
- ✅ **Every screen does ONE task clearly** — Quotation Builder builds a quote, it doesn't also sell the product
- ✅ **Real domain copy** — "Acme Corp, Q-1042, $15,000, 12% on laptop, 18% on setup service" not "Customer Name, $XXX, X% on Product"
- ✅ **Real human wording** — "Approve this quote" not "Submit approval request"
- ✅ **Empty states with a clear next action** — not "No data" but "No quotations yet. Create your first quote →"
- ✅ **Loading states that match the content layout** — skeleton, not spinner-in-the-middle-of-the-page
- ✅ **Error states that explain what happened AND what to do** — "Couldn't load quotations. Check your connection and [try again]."

---

## 2. Color Rules (HARD CONSTRAINTS)

### The Allowed Palette (see `design.md` for full spec)

| Token | Value (Light) | Value (Dark) | Used for |
|---|---|---|---|
| `--background` | `#FFFFFF` | `#0A0A0B` | Page background |
| `--surface` | `#FAFAFA` | `#18181B` | Cards, panels |
| `--surface-hover` | `#F4F4F5` | `#27272A` | Card hover, table row hover |
| `--border` | `#E4E4E7` | `#27272A` | Hairline borders |
| `--text-primary` | `#09090B` | `#FAFAFA` | Body text |
| `--text-secondary` | `#52525B` | `#A1A1AA` | Labels, helper text |
| `--text-muted` | `#71717A` | `#71717A` | Timestamps, metadata |
| `--accent` | `#C2410C` (Terracotta) | `#E96B56` (Warm terracotta for dark mode contrast) | Primary buttons, links, focus rings, key data |
| `--accent-hover` | `#9A3412` | `#F87171` | Hover state of accent |
| `--success` | `#15803D` | `#22C55E` | Approved, completed |
| `--warning` | `#B45309` | `#F59E0B` | Pending, in negotiation |
| `--danger` | `#B91C1C` | `#EF4444` | Rejected, overdue |
| `--radius` | `6px` | `6px` | Cards, buttons, inputs (ONE radius) |

### Hard Color Rules

1. **MUST use only the tokens above.** No `#3B82F6` hardcoded anywhere except the `--accent` dark-mode value (which is itself a token).
2. **MUST NOT introduce a 6th color** beyond: background, surface, border, text (3 shades), accent, success, warning, danger. Status colors (success/warning/danger) are ONLY for status badges and alert banners — never for primary UI.
3. **MUST NOT use gradients.** Zero `bg-gradient-*` Tailwind classes. Zero `linear-gradient` CSS.
4. **MUST NOT use glassmorphism.** Zero `backdrop-blur`, zero `bg-white/50`, zero `bg-black/30`.
5. **MUST NOT use drop shadows except for:**
   - Modals (subtle: `shadow-lg` Tailwind = `0 10px 15px -3px rgba(0,0,0,0.1)`)
   - Dropdown menus (subtle: `shadow-md`)
   - Toast notifications (subtle: `shadow-md`)
   - **Cards MUST NOT have shadows** — they have a 1px border instead. This is the Linear/Stripe look.
6. **MUST NOT use color to encode information that isn't already in text.** A status badge says "Pending" in text AND has a yellow dot. Never color alone.
7. **MUST meet WCAG AA contrast (4.5:1) for all body text.** The tokens above are pre-verified. Don't change them without re-verifying.
8. **SHOULD NOT use the accent color on more than ~10% of any screen's pixels.** If the accent is everywhere, it's nowhere. The accent is for ONE thing per screen that you want the user to click.

### Why Terracotta (`#C2410C`)?

The user explicitly specified a warm theme with a Terracotta accent (`#C2410C` light / `#E96B56` dark) and a warm off-white background (`#FDFBF7`).

- It provides a human-first, warm aesthetic unlike generic AI defaults.
- It works on both white (`#C2410C` on `#FDFBF7`) and dark (`#E96B56` on `#0A0A0B`) while maintaining good contrast.

**To change**: edit `--color-accent` and `--color-accent-hover` in `src/app/globals.css`. Do NOT change anything else without explicit human approval.

---

## 3. Typography Rules

### Allowed Fonts (only these two)

1. **Inter** — sans-serif, for ALL text (headings, body, labels, buttons, inputs, data tables)
2. **JetBrains Mono** — monospace, ONLY for: code snippets (we likely have zero), quotation IDs (`Q-1042`), invoice IDs (`INV-1042`), amounts in data-dense tables if you want tabular figures, and error logs in dev

### Forbidden Fonts

- ❌ Any display/serif font (Playfair, Merriweather, etc.) — this is not an editorial product
- ❌ Any "personality" sans font (Poppins, Nunito, Quicksand) — too friendly for B2B finance
- ❌ System fonts (Arial, Helvetica) — too generic
- ❌ Multiple sans families — Inter only

### Type Scale (LOCKED)

| Token | Tailwind | Used for |
|---|---|---|
| `text-xs` | 12px / 16px line-height | Helper text, metadata, timestamps |
| `text-sm` | 14px / 20px line-height | Body small, table rows, labels |
| `text-base` | 16px / 24px line-height | Body, default for all prose |
| `text-lg` | 18px / 28px line-height | Sub-headings, card titles |
| `text-xl` | 20px / 28px line-height | Page section headings |
| `text-2xl` | 24px / 32px line-height | Page titles (one per page) |
| `text-3xl` | 30px / 36px line-height | Landing page hero only — used 2x max on landing, 0x elsewhere |

**MUST NOT use `text-4xl`, `text-5xl`, `text-6xl`, `text-7xl`** — they break the minimal scale.

### Font Weights

| Weight | Tailwind class | Used for |
|---|---|---|
| 400 (regular) | `font-normal` | Body text |
| 500 (medium) | `font-medium` | Labels, buttons, table headers |
| 600 (semibold) | `font-semibold` | Page titles, card titles |
| 700 (bold) | `font-bold` | Landing hero only — used 1x max per page |

**MUST NOT use `font-extrabold` or `font-black`.**

---

## 4. Spacing & Layout Rules

### Allowed Spacing Scale (Tailwind)

Only these `p-*`, `m-*`, `gap-*` values are allowed:

| Token | px | Used for |
|---|---|---|
| `1` | 4 | Tight icon-text gaps inside badges |
| `2` | 8 | Default inline gap (icon + label) |
| `3` | 12 | Tight element gaps inside a card |
| `4` | 16 | Default card padding, default grid gap |
| `6` | 24 | Section gap inside a page |
| `8` | 32 | Card-to-card gap, page margin from nav |
| `12` | 48 | Section gap on landing page |
| `16` | 64 | Landing hero top padding |
| `24` | 96 | Landing hero bottom padding (mobile) |

**MUST NOT use `p-5`, `p-7`, `p-10`, `p-14`, `p-20`** — these break the 4-px rhythm.

### Border Radius

| Token | Tailwind | Used for |
|---|---|---|
| `rounded` (4px) | Buttons, badges, inputs (compact) |
| `rounded-md` (6px) | Cards, modals, dropdowns (default) |
| `rounded-full` | Avatars, status dots, toggle pills |

**MUST NOT use `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-3xl` (24px).**

Wait — that's wrong. We use `rounded-md` = 6px as the default. Let me clarify the rule:

**ONLY these radii: `rounded` (4px), `rounded-md` (6px), `rounded-full`.** No `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`. The product should look architectural, not toy-like.

### Border Width

- `border` (1px) for all hairlines — `border` Tailwind class
- `border-2` ONLY for active focus state (paired with accent color)
- **MUST NOT use `border-4`, `border-8`** — those are for marketing landing pages, not apps

### Max Width

- App pages (workspace): `max-w-[1400px] mx-auto` — full width within sidebar
- Detail pages (quotation detail): `max-w-4xl mx-auto` — readable column
- Landing page sections: `max-w-6xl mx-auto` — wider marketing column
- Long-form text (help, terms): `max-w-2xl mx-auto` — book-width

---

## 5. Animation Rules

### Allowed (subtle, functional)

- `transition-colors duration-150` on hover states (button, card, nav item)
- `transition-opacity duration-200` on modal/dialog open-close
- `animate-in fade-in` and `animate-in slide-in-from-bottom` from `tailwindcss-animate` for modals/toasts
- Skeleton shimmer: a single `animate-pulse` on gray blocks during load

### Forbidden (decorative, AI-first)

- ❌ Typewriter effects
- ❌ Animated number counters (just show the number; if it changes, show the new number — no count-up)
- ❌ Parallax scroll
- ❌ Scroll-triggered fade-in-up
- ❌ Bouncing dots loaders (use a `Spinner` or `Skeleton`)
- ❌ Hover scale-105 on cards (hover should change background color, not size)
- ❌ Spring animations on drag (kanban card drag should follow the cursor; no overshoot bounce)
- ❌ Any `motion.*` from framer-motion for MVP — we're not adding framer-motion for MVP

### Kanban Drag (Special Case)

The Quotation Pipeline kanban allows drag-and-drop. The drag should:

- Follow the cursor 1:1 (no spring physics)
- Highlight the drop zone with a dashed border
- Snap to grid on drop (no spring overshoot)
- Be disabled on touch devices (use buttons instead — move-to-stage menu on the card)

---

## 6. Code Rules

### Must Run Before Committing (HARD GATE)

The user explicitly said: *"I will use the AI models like nimotron 3 ultra and muse 2 from opencode and in chats I will use the gemini 3.1pro and 3.8 lite now also suggest which model is for building and which is for planing and give plans accordingly and keep all the .md files separate and use maximum skills for that and also if u have any doubts please ask me the question first and after that give e the output understood ? don't write the code only make plans"*

And: *"want also to use command every time npm run lint and npm run build every time once after AI complete the work after i will run this 2 commands and also git commands"*

So the workflow is:

1. AI completes a unit of work (one screen, one component, one fix)
2. **Human runs**:
   ```bash
   npm run lint
   npm run build
   ```
3. If both pass, human runs git commands (see `git-commands.md`)
4. If either fails, human pastes the error back to the AI, AI fixes, repeat

**The AI MUST NOT claim work is "done" until `npm run lint` AND `npm run build` both pass.** If the AI cannot run these (e.g., it's a chat-only model), the AI MUST say "Work is complete pending `npm run lint && npm run build` — please run these and paste any errors."

### ESLint Rules (in `eslint.config.js`)

The flat ESLint 9 config must enforce:

```javascript
// Required rules (set to "error")
'@typescript-eslint/no-explicit-any': 'error',
'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
'react/no-unescaped-entities': 'error',
'react/jsx-key': 'error',
'no-console': ['error', { allow: ['warn', 'error'] }],  // no console.log in production code
'prefer-const': 'error',
'no-var': 'error',
'eqeqeq': ['error', 'always'],
// Forbidden Tailwind classes (custom rule via eslint-plugin-tailwindcss):
// - rounded-lg, rounded-xl, rounded-2xl, rounded-3xl
// - p-5, p-7, p-10, p-14, p-20
// - text-4xl, text-5xl, text-6xl, text-7xl
// - font-extrabold, font-black
// - bg-gradient-*
// - backdrop-blur, bg-white/50, bg-black/30
```

### TypeScript Rules

- `strict: true` in `tsconfig.json`
- `noUncheckedIndexedAccess: true`
- `noImplicitOverride: true`
- `exactOptionalPropertyTypes: true`
- `noFallthroughCasesInSwitch: true`
- `isolatedModules: true`
- `verbatimModuleSyntax: true` — forces `import type` for types

### Naming Rules

| Type | Convention | Example |
|---|---|---|
| Files (components, pages) | kebab-case | `quotation-builder.tsx` |
| Files (utilities, hooks) | kebab-case | `format-currency.ts` |
| Files (types) | kebab-case | `domain.ts` |
| React components | PascalCase | `QuotationBuilder` |
| Functions | camelCase | `calculateBlendedRiskScore` |
| Variables | camelCase | `blendedScore` |
| Constants | UPPER_SNAKE | `MAX_DISCOUNT_PERCENT` |
| Types/Interfaces | PascalCase | `Quotation`, `LineItem` |
| Zod schemas | camelCase | `quotationSchema` |
| Zod inferred types | PascalCase | `Quotation = z.infer<typeof quotationSchema>` |
| CSS custom properties | kebab-case | `--accent-color` |
| Tailwind class names (custom) | kebab-case | `text-primary`, `bg-surface` |

### Import Order (enforced by `eslint-plugin-import` or `simple-import-sort`)

```
1. React + Next imports
2. Third-party libraries (zod, lucide-react, recharts, date-fns)
3. `@/types/*`
4. `@/lib/*`
5. `@/components/*`
6. `@/app/*` (only in cross-route imports)
7. Relative imports (./, ../) — should be RARE
```

### Forbidden Patterns

- ❌ `console.log` in committed code (use `console.warn` or `console.error`)
- ❌ `any` type — use `unknown` + Zod parse
- ❌ `// @ts-ignore` — fix the type, don't suppress it
- ❌ Default exports for non-component files (utilities, hooks, types use named exports; components may use default exports)
- ❌ React class components — function components only
- ❌ `useEffect` for derived state — compute in render
- ❌ `useEffect` for fetching — use Server Components or a `useAsync`-style hook
- ❌ Inline event handlers in JSX for non-trivial logic (extract to a named function)
- ❌ Conditional rendering with `&&` and a non-boolean left side (use ternary or `Boolean(x) && ...`)

### Required Patterns

- ✅ Every public-facing function (in `lib/`) has a JSDoc comment with `@param` and `@returns`
- ✅ Every component file has a 1-line comment at top describing what it does
- ✅ Every page route has a `metadata` export (title + description for SEO + browser tab)
- ✅ Every API route handler validates input with Zod and returns a typed response
- ✅ Every error path returns a structured error: `{ error: string; code: string; details?: unknown }`

---

## 7. Accessibility Rules (HARD)

- All interactive elements MUST be keyboard accessible (tab + enter + escape)
- All form inputs MUST have associated `<label>` (or `aria-label` if label is hidden)
- All icon-only buttons MUST have `aria-label`
- All modals MUST trap focus and restore focus on close
- All color-coded information MUST have a text alternative
- All images MUST have `alt` text (or `alt=""` for decorative)
- All status updates MUST use `aria-live="polite"` for non-critical, `aria-live="assertive"` for critical
- All pages MUST have a single `<h1>` (page title)
- All pages MUST have a logical heading hierarchy (no `h3` before `h2`)
- All pages MUST pass `axe-core` with zero serious or critical violations

We're not building a WCAG AAA site, but AA is the floor. B2B finance products get sued for accessibility.

---

## 8. Data Rules (Mock vs Real)

### For the hackathon demo (MVP)

- Use MSW (Mock Service Worker) for ALL API calls
- Mock data lives in `src/lib/mock/data/`
- Mock data MUST be **realistic and consistent** — Acme Corp, Q-1042, $15,000, 12% on laptop, 18% on setup service, etc. (the same deal flows through every screen for demo continuity)
- Mock handlers MUST return data shaped by the same Zod schemas as the real backend
- Mock handlers MUST simulate latency (200-500ms) so loading states show
- Mock handlers MUST simulate errors (5% of `/api/quotations` requests return 500) so error states are demonstrable

### For real backend integration (later)

- The user (or backend team) flips `NEXT_PUBLIC_DATA_MODE=backend` in `.env.local`
- Route handlers proxy to `${BACKEND_URL}/<endpoint>` with the session cookie/token
- The frontend code does NOT change — same Zod schemas, same components, same hooks

### Forbidden

- ❌ Hardcoded mock data in components (always go through `lib/api/`)
- ❌ Real backend calls from client components (always go through route handlers)
- ❌ Skipping Zod validation on API responses (the backend WILL send wrong data at some point)

---

## 9. Git Commit Rules

See `git-commands.md` for the exact commands. Rules:

1. **Commit message format**: `<type>(<scope>): <subject>` where type is one of `feat`, `fix`, `refactor`, `style`, `chore`, `docs`, `test`, `perf`, `build`, `ci`, `revert`
2. **Scope**: the route group or component group, e.g., `feat(quotations): add builder screen`, `fix(auth): redirect after login`
3. **Subject**: imperative mood, lowercase, no period, max 72 chars
4. **Body (optional)**: wrapped at 100 chars, explains WHY not WHAT
5. **One commit per logical change** — do not bundle unrelated changes
6. **No `--no-verify`** — if pre-commit hooks fail, fix the issue, don't bypass
7. **No commits directly to `main`** — work on a feature branch, PR to main (for solo dev, can merge own PRs)

---

## 10. Time Budget Rules (24-Hour Hackathon)

- The user has ~24 hours (Sept 5 ~6 AM IST → Sept 6 10 AM IST demo)
- Sleep is required (the user is human)
- See `phase.md` for the exact hour-by-hour plan
- **The AI MUST NOT scope-creep.** If a phase says "MVP only," the AI does not add the nice-to-have. If there's time at the end, the human decides what to add.
- **The AI MUST NOT skip `npm run lint && npm run build`.** If the AI is a chat-only model, the AI MUST remind the human to run them after each phase.
- **The AI MUST NOT introduce new dependencies.** Only the dependencies listed in `architecture.md` are allowed. Any new dependency requires explicit human approval.

---

## 11. Skill Usage Rules (For AI Agents)

The user said "use maximum skills for that" — meaning use the skills available in the Z.ai environment (or wherever) to do the work. The relevant skills for this project are:

- **`fullstack-dev`** — for Next.js 16 scaffolding and project initialization
- **`charts`** — for the Dashboard + Deal Health charts (Recharts wrappers)
- **`design`** — for the design system reference and tokens
- **`ui-ux-pro-max`** — for the human-first UI patterns
- **`visual-design-foundations`** — for typography, spacing, color theory baseline
- **`web-search`** — for looking up Next.js 16 / Tailwind v4 best practices if needed
- **`web-reader`** — for reading the Excalidraw mockup if access is needed

### How to use skills (for the AI)

1. When you start a phase that involves charts, load `charts` skill first
2. When you start a phase that involves design system questions, load `design` + `visual-design-foundations` + `ui-ux-pro-max`
3. When you start the Next.js setup, load `fullstack-dev`
4. Skills are READ for guidance — they don't auto-write code. Use their guidance to inform what you write.

### Forbidden

- ❌ Loading `pptx`, `docx`, `pdf`, `xlsx` skills — we're not generating documents
- ❌ Loading `image-generation` — we're not generating images (use lucide-react SVG icons)
- ❌ Loading `TTS`, `ASR`, `VLM` (after the initial mockup read) — we don't need voice or vision at runtime

---

## 12. The "Stop and Ask" Rule

If the AI encounters ANY of the following, it MUST STOP and ask the human before proceeding:

1. A new dependency is needed (any `npm install <pkg>` not in `architecture.md`)
2. A new file location is needed (not in the folder structure in `architecture.md`)
3. A new color or font is needed (not in this file or `design.md`)
4. A new route or route group is needed (not in `architecture.md` Section 4)
5. A new Zod schema field or type that changes the contract with the backend
6. A business logic decision not covered by `project-requirements.md` (e.g., "What happens if a customer rejects a counter-offer twice?")
7. A design decision not covered by `design.md` (e.g., "Should the kanban card show margin or amount first?")
8. Any rule in this file that conflicts with a request from the human — the human wins, but the AI must flag the conflict

The human said "if u have any doubts please ask me the question first" — this rule enforces that.

---

## 13. Self-Check Before Claiming Work Is Done

Before any AI says "this phase is complete," it must self-check:

- [ ] All files are in their correct location per `architecture.md` Section 3
- [ ] No new dependencies added (or human-approved)
- [ ] No new colors/fonts (only tokens from this file)
- [ ] No `any` types, no `console.log`, no `@ts-ignore`
- [ ] All components have a single responsibility
- [ ] All routes have a `metadata` export
- [ ] All API routes have Zod input validation
- [ ] `npm run lint` passes (or the AI has flagged that the human must run it)
- [ ] `npm run build` passes (or the AI has flagged that the human must run it)
- [ ] The screen does ONE task clearly (not 5 tasks on one screen)
- [ ] The accent color is used sparingly (≤10% of screen)
- [ ] Empty states, loading states, and error states are all implemented
- [ ] Mobile responsive (test at 375px width)
- [ ] Dark mode toggles cleanly (test by switching)

If any box is unchecked, the work is NOT done. The AI must either fix it or flag it explicitly to the human.
