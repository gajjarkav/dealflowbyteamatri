# DealFlow360 — Memory File (Read This First When Switching Models)

> **THIS FILE IS YOUR ENTRY POINT.** When you switch AI models (Nemotron 3 Ultra ↔ Muse 2 ↔ Gemini 3.1 Pro ↔ Gemini 3.8 Lite), the new model should read THIS file first — not the whole project. It tells you what state the project is in, what to do next, and where to look.
>
> **If you're a new AI agent picking up this project**: Read this file top-to-bottom. It links to the 5 other .md files you should load only if you need them. This saves you ~30 minutes of context loading.
>
> **Update this file after every phase** with: (a) current phase status, (b) what's done, (c) what's next, (d) any blockers, (e) any decisions made since the last phase.

---

## 0. Quick Context (30-Second Read)

- **Project**: DealFlow360 — a B2B sales operations platform (quotation-to-cash with discount governance, approval routing, warehouse splitting, hybrid billing, customer portal)
- **Hackathon**: Odoo Hackathon 2026 — Final Round
- **My role**: Frontend (Next.js 16 + React 19 + TypeScript + Tailwind v4, hand-rolled components, NO UI library)
- **Repo**: https://github.com/gajjarkav/dealflowbyteamatri
- **Demo deadline**: 2026-09-06 10:00 AM IST (Asia/Calcutta, UTC+5:30)
- **Start time**: 2026-09-05 ~06:30 IST
- **Total budget**: ~27.5 hours including 4h sleep
- **Backend**: Other team is doing Odoo custom module — I integrate via REST or use MSW mock for the demo
- **Design direction**: Minimal monochrome (Linear/Stripe inspired), warm off-white bg + near-black text + ONE accent color (terracotta `#C2410C`), no gradients, no glassmorphism, no shadows on cards
- **Models in use**: Nemotron 3 Ultra (planning), Muse 2 (building), Gemini 3.1 Pro (long-context review), Gemini 3.8 Lite (chat/copy)

---

## 1. The 6 Source-of-Truth Documents (Load ONLY When Needed)

| Document | What's in it | When to load it |
|---|---|---|
| `project-requirements.md` | What we're building, who for, all 9 feature modules (A1–A7, B1–B9), the 18 screens, the Quick Test Flow, the blended risk score logic | When you're not sure WHAT to build or WHY a feature exists |
| `architecture.md` | Next.js 16 folder structure, route groups, data flow (BFF + MSW), state management, dependency direction rules, file placement cheat sheet | When you're not sure WHERE to put a file or HOW data flows |
| `rules.md` | The HARD limits on AI: no AI-first colors, no gradients, no shadows on cards, type scale, spacing scale, accessibility, commit rules, the "stop and ask" rule | BEFORE writing any UI code (load this every session) |
| `phase.md` | The 24-hour build plan, 8 phases, hour-by-hour clock, MVP vs stretch, model assignments per phase | When you need to know WHAT to do next and which model to use |
| `design.md` | Tailwind v4 tokens, component specs (button, input, card, table, badge, modal, kanban, KPI, empty/loading/error states), layout patterns, mobile rules, dark mode rules, the "does this look AI-made?" test | BEFORE building any component or screen |
| `memory.md` | (this file) — current status, what's done, what's next | ALWAYS read first |

### Plus the helper files

| File | What's in it |
|---|---|
| `git-commands.md` | Predefined git add/commit/push shortcuts so you don't type them repeatedly |
| `install-commands.md` | The exact `npm install` commands to set up the project, plus the model role assignment summary |
| `.gitignore` | The gitignore for the Next.js + Node + IDE + OS files |

---

## 2. Current Phase Status (UPDATE THIS AFTER EVERY PHASE)

> **LAST UPDATED**: 2026-09-05 ~06:30 IST (before any code is written — planning files just created)
> **STATUS**: Planning complete, ready to start Phase 0

### Phase Tracker

| Phase | Status | Started | Ended | Notes |
|---|---|---|---|---|
| Phase 0 — Setup | ⏳ Not started | — | — | Run `install-commands.md` first |
| Phase 1 — Foundation | ⏳ Not started | — | — | |
| Phase 2 — Auth + Dashboard | ⏳ Not started | — | — | |
| Phase 3 — Quotations | ⏳ Not started | — | — | **Demo centerpiece** |
| Phase 4 — Approvals + Fulfillment | ⏳ Not started | — | — | STRETCH |
| Phase 5 — Subscriptions + Invoices | ⏳ Not started | — | — | STRETCH |
| — SLEEP — | ⏳ Not started | — | — | 4h mandatory |
| Phase 6 — Customer Portal + Deal Health | ⏳ Not started | — | — | **MVP-critical** |
| Phase 7 — Admin + Polish | ⏳ Not started | — | — | STRETCH |
| Phase 8 — Final + Dry Run | ⏳ Not started | — | — | **MVP-critical** |

### Status Legend

- ⏳ Not started
- 🟡 In progress
- ✅ Complete
- ⚠️ Blocked
- ⏭️ Skipped (reallocate time to MVP)

---

## 3. What's Done (Append After Every Phase)

> This section helps a new model understand what already exists in the repo without re-reading every file.

### As of 2026-09-05 ~06:30 IST (planning phase complete)

**Done**:
- ✅ Read the DealFlow360 problem statement (provided by user as text after PDF corruption)
- ✅ Analyzed the Excalidraw mockup (vision model identified 18 screens with layouts and flows)
- ✅ Cloned the GitHub repo (verified: empty `frontend/README.md` and `backend/README.md`)
- ✅ Wrote 6 planning documents + 3 helper files in `/home/z/my-project/download/dealflow360-docs/`

**Not done yet**:
- ❌ The 6+3 .md files have NOT been committed to the GitHub repo yet — copy them into `docs/` at repo root during Phase 0
- ❌ The Next.js 16 frontend has NOT been scaffolded yet
- ❌ No code has been written

### After Phase 0 (paste the checklist from `phase.md` here when done)

(To be filled in)

### After Phase 1

(To be filled in)

### After Phase 2

(To be filled in)

### After Phase 3

(To be filled in)

### After Phase 6

(To be filled in)

### After Phase 8

(To be filled in)

---

## 4. What's Next (The Next 3 Actions)

> Whatever phase is currently "in progress" or "next up," this section tells the next model exactly what to do first.

### Right now (just starting), the next 3 actions are:

1. **Copy the 9 .md files** from `/home/z/my-project/download/dealflow360-docs/` into the user's local clone of `https://github.com/gajjarkav/dealflowbyteamatri.git` under `docs/` (create the folder).
2. **Follow `install-commands.md`** to scaffold the Next.js 16 frontend in `frontend/`.
3. **Follow Phase 0 in `phase.md`** to verify the setup, run `npm run lint && npm run build`, and commit.

### If you're picking up mid-build:

1. Read this `memory.md` file top-to-bottom (you're here)
2. Read `phase.md` to find the current phase
3. Read `rules.md` to refresh the AI limits (ALWAYS do this)
4. Read `design.md` if you're building UI; `architecture.md` if you're adding a new file/route
5. Run `npm run lint && npm run build` to verify the current state of the repo
6. Continue from the next unfinished task in the current phase

---

## 5. Key Decisions Made So Far (Append-Only)

| Date | Decision | Why | Reversible? |
|---|---|---|---|
| 2026-09-05 | Next.js 16 + React 19 + TS + Tailwind v4, hand-rolled components, NO UI library | User requirement | Hard to reverse (rewrite) |
| 2026-09-05 | Removed Role field | User requested replacing role selection with phone number in auth | Easy |
| 2026-09-05 | Setup Landing Page | Generated sliding auth panel according to requirements | Moderate | Lets us demo without backend; lets backend integrate without frontend changes | Easy (flip env var) |
| 2026-09-05 | Single accent color: terracotta `#C2410C` (light) / `#E96B56` (dark) | User requested warm theme with terracotta accent | Easy |
| 2026-09-05 | Three route groups: `(auth)`, `(workspace)`, `(portal)` | Problem statement requires customer portal to be a "real, separate, restricted view" | Hard (file restructure) |
| 2026-09-05 | Tailwind v4 CSS-first config (`@theme` in `globals.css`); no `tailwind.config.ts` complexity | Latest Tailwind; cleaner tokens | Medium (migrate config to TS) |
| 2026-09-05 | Mock data: Acme Corp, Q-1042, $15,000, laptop (12% disc) + setup service (18% disc) + care plan 2yr (no disc), 2 warehouses (Main + East Depot), 3 tiers (Bronze/Silver/Gold) | Mockup continuity — same deal flows through all 18 screens | Easy (edit mock data) |
| 2026-09-05 | ESLint 9 flat config + strict TypeScript (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | Catches bugs at compile time, not at demo time | Medium (loosen rules) |
| 2026-09-05 | Run `npm run lint && npm run build` after EVERY phase; never commit if either fails | User requirement | Hard (always enforce) |
| 2026-09-05 | Commit format: `<type>(<scope>): <subject>` (Conventional Commits) | Standard, readable history | Easy (revert format) |
| 2026-09-05 | Sleep 4 hours (23:00–03:00 IST) — non-negotiable | User is human; tired code is bad code | None (mandatory) |
| 2026-09-05 | Phase 4 (Approvals) and Phase 5 (Subscriptions/Invoices) are STRETCH — skip if behind | MVP (Phases 0,1,2,3,6,8) is enough for the demo | Easy (re-prioritize) |

---

## 6. Blockers & Risks (Update Live)

> Anything that could derail the demo goes here. If you discover a blocker, add it. If you resolve one, mark it ✅.

### Active Blockers

| Date found | Blocker | Impact | Mitigation | Status |
|---|---|---|---|---|
| 2026-09-05 | Original `DealFlow360.pdf` is corrupted (qpdf, pikepdf, pdftotext, pdftoppm, gs all fail) | Could not extract PDF content programmatically | User pasted the full text content as chat input — recovered 100% | ✅ Resolved |

### Risks (Not yet materialized)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Backend team delivers API contract late | High | We can't integrate; stuck on mock | BFF + MSW architecture means we demo on mock and flip env vars to integrate |
| Tailwind v4 + Next.js 16 has a breaking change I don't know about | Medium | Lost 1-2 hours debugging | Load `web-search` skill to verify; load `fullstack-dev` skill for scaffolding guidance |
| Time slippage in Phase 3 (Quotations is complex) | Medium | Phases 4, 5, 7 get skipped | That's OK — MVP is Phases 0,1,2,3,6,8 |
| Demo laptop doesn't have Node.js installed | Low | Can't run `npm dev` at venue | Test on demo laptop the night before; install Node if missing |
| Dark mode toggle visually broken on some screen | Medium | Looks unpolished in demo | Phase 7 dark mode audit catches it; if Phase 7 is skipped, demo in light mode only |
| Customer portal token auth has a bug | Medium | Customer portal demo fails | Phase 6 is MVP-critical; budget 3 hours for it; if it slips, drop Phase 7 entirely |

---

## 7. Model Usage Cheat Sheet (Print This)

| You're doing... | Use this model | Why |
|---|---|---|
| Planning a complex screen (e.g., Quotation Builder) | Nemotron 3 Ultra | Deep reasoning; plans the state, the layout, the interactions |
| Writing the actual component code | Muse 2 | Fast iteration; follows the plan from Nemotron |
| Reviewing the whole project for gaps | Gemini 3.1 Pro | Long context; can read all 6 .md files + the codebase at once |
| Writing copy / refining wording / quick questions | Gemini 3.8 Lite | Quick chat; not for code |
| Debugging a tricky bug | Nemotron 3 Ultra | Reasoning through the root cause |
| Asking "what's the Next.js 16 best practice for X?" | Gemini 3.1 Pro | Latest knowledge; broad context |
| Triaging which bug to fix first | Gemini 3.1 Pro | Sees the whole demo flow |
| Writing the demo script (what to say out loud) | Gemini 3.8 Lite | Concise copywriting |

### Forbidden Combinations

- ❌ Don't use Gemini 3.8 Lite to write production code (it's for chat)
- ❌ Don't use Nemotron 3 Ultra for repetitive component scaffolding (waste of its reasoning power)
- ❌ Don't switch models mid-task — finish the task with the model you started with, then switch

### How to Use Multiple Models in a Single Task

**Example: building the Quotation Builder (Phase 3)**

1. **Nemotron 3 Ultra** (30 min): "Plan the Quotation Builder screen. Inputs: project-requirements.md Section B3, the blended risk score logic from Section 8, the design.md component specs, the architecture.md folder structure. Output: a plan document with (a) component tree, (b) state management approach, (c) data flow, (d) edge cases to handle."
2. Save the plan to a scratch file (e.g., `docs/scratch/quotation-builder-plan.md`)
3. **Muse 2** (3 hours): "Implement the Quotation Builder per the plan at `docs/scratch/quotation-builder-plan.md`. Follow `rules.md` strictly. After each component, run `npm run lint` to verify."
4. If Muse 2 gets stuck on a specific bug: **Nemotron 3 Ultra** for the root cause analysis
5. If the whole screen feels off: **Gemini 3.1 Pro** — paste the screen + design.md + rules.md, ask "what's wrong here and how do I fix it without breaking the rules?"

---

## 8. The Demo Flow (What We're Optimizing For)

> Every decision should serve the 5-minute demo. If a feature isn't in this flow, it's a stretch goal.

### The 5-Minute Demo Script (Draft)

**Minute 0-1: Login + Dashboard**
- "Welcome to DealFlow360. I'll log in as a sales rep." (click "Continue as demo user")
- "On my dashboard, I see 12 pending approvals, 28 open quotations, and 3 at-risk deals. Let me create a new quotation."

**Minute 1-3: Quotation Builder + Risk Score + Upsell**
- "I'll create a quote for Acme Corp." (search + select customer)
- "I add a laptop — $1500, 12% discount. The blended risk score shows green: 12% is within the hardware ceiling of 15%."
- "I add a setup service — $800, 18% discount. The risk score turns yellow: the service category has a 10% ceiling, so this line is 8 points over."
- "Even though Acme Corp is a Gold customer with a 15% overall allowance, the system flags this quote for manager approval — automatically."
- "In the upsell panel, I see a suggestion: Care Plan 2yr, +$300 margin. I'll add it. The margin updates immediately."

**Minute 3-4: Approval + Fulfillment**
- "I submit the quote. It routes to my manager automatically."
- (Switch to manager view) "As the manager, I see the approval in my queue with the blended risk score breakdown. I'll approve it."
- "The system now suggests a warehouse split: 30 laptops from Main Warehouse, 20 from East Depot, with 2 shipments at minimum cost."

**Minute 4-5: Customer Portal + Deal Health**
- "I send the quote to Acme Corp. They open the customer portal link."
- (Open new tab to portal URL) "The customer sees the quote, comments on the service line asking for a lower rate, and submits a counter-offer of 25% off total."
- "Because 25% exceeds the Gold ceiling, the quote automatically re-enters the approval flow."
- "Back on the Deal Health Dashboard, I see Acme Corp flagged as 'In Negotiation' with a discount anomaly alert. I can nudge the rep or escalate with one click."

**Close**: "That's DealFlow360 — the self-governing sales engine. Quotations to cash, with the rules enforced by the system, not by the rep's memory."

### Demo-Critical Path (must work, in this order)

1. Login (Phase 2)
2. Dashboard with KPIs (Phase 2)
3. Quotation Builder with line items + risk score + upsell panel (Phase 3) — **the centerpiece**
4. Submit for approval (Phase 3)
5. Manager approval action (Phase 4 — STRETCH, but include if possible; if not, mock as "auto-approved" with a banner explaining the routing)
6. Warehouse split display (Phase 4 — STRETCH, include the display only on the Fulfillment tab of Quotation Detail if Phase 4 is skipped)
7. Customer portal (Phase 6) — **MVP-critical**
8. Counter-offer re-enters approval (Phase 6)
9. Deal Health dashboard with the Acme Corp alert (Phase 6)

If items 1-5 + 7-9 work, we have a solid demo. Item 6 can be skipped (just show the suggested split as a static display on the Quotation Detail page).

---

## 9. Future Work (For the Hackathon "What Would You Build Next?" Note)

> The hackathon requires a "short note on what the team would build next with more time." Save these for the README.

### What We'd Build Next (If We Had More Time)

1. **Real backend integration** — Replace MSW mock with the actual Odoo backend REST endpoints; flip `NEXT_PUBLIC_DATA_MODE=backend`.
2. **Real WebSocket sync** — Replace 30s polling with WebSocket for live updates (deal health alerts, approval status changes, customer portal comments).
3. **Real email delivery** — Send the customer portal link via email (SendGrid/Postmark), with proper magic-link expiry and re-issue flow.
4. **Multi-currency** — Support USD, EUR, GBP, INR with proper FX rate handling and currency display per customer.
5. **Multi-tenant** — Isolate data per company for SaaS deployment; per-tenant discount tier configuration.
6. **E2E test suite** — Playwright tests for the full Quick Test Flow, run on every PR.
7. **Storybook** — Document every component in isolation; required for any team >1 frontend dev.
8. **PDF generation** — Server-side PDF generation for quotations and invoices (using `@react-pdf/renderer` or Puppeteer).
9. **Audit trail export** — Export the full audit trail of any quote as a CSV or signed PDF for compliance.
10. **Mobile app** — React Native app for sales reps on the go (the web app is responsive, but a native app has push notifications and offline support).
11. **AI-powered deal insights** — "This deal looks similar to 3 deals that closed last quarter. Here's what worked." (But keep it as a suggestion, not a decision-maker — human-first.)
12. **Approval SLA tracking** — Show how long each approval step took vs. the SLA, with escalation on breach.
13. **Customer-facing subscription management** — Let customers self-manage their subscriptions (upgrade, downgrade, cancel with proration preview).
14. **Multi-language** — i18n with at least English + Hindi + Spanish for global B2B teams.

### What We Explicitly Would NOT Build (Anti-Vision)

- ❌ An AI chatbot in the workspace — reps don't want to chat with an AI while quoting; they want a fast, deterministic UI
- ❌ "Smart suggestions" that override rep decisions — surface insights, don't auto-apply them
- ❌ Animated, gamified dashboard — this is finance, not a video game
- ❌ Mobile-first design at the cost of desktop UX — sales reps are on laptops 90% of the time
- ❌ A separate "admin app" — admin is just a role with extra nav items; same codebase

---

## 10. Where to Look When Stuck

| You're stuck on... | Look at... |
|---|---|
| "What is this screen supposed to do?" | `project-requirements.md` Section 5 (modules) or Section 6 (18 screens) |
| "Where does this file go?" | `architecture.md` Section 3 (folder structure) or Section 10 (cheat sheet) |
| "Can I use this color / font / spacing?" | `rules.md` Section 2 (colors), Section 3 (typography), Section 4 (spacing) |
| "How should this component look?" | `design.md` Section 7 (component specs) |
| "Is this dark mode right?" | `design.md` Section 12 (dark mode strategy) |
| "What do I do next?" | `phase.md` — find the current phase, find the next unchecked task |
| "Why is `npm run lint` failing?" | `rules.md` Section 6 (code rules) — likely a forbidden class or `any` type |
| "What should I tell the user about the demo?" | This file, Section 8 (demo flow) |
| "How do I structure this git commit?" | `git-commands.md` |
| "Which npm packages do I install?" | `install-commands.md` |
| "I have a question for the human" | Ask it! Don't decide unilaterally. The human said "if u have any doubts please ask me the question first." |

---

## 11. Session Start Checklist (For The Next Model/AI Agent)

When a new AI session starts (especially after a model switch), do these in order:

- [ ] Read this `memory.md` file completely
- [ ] Read `phase.md` to find the current phase
- [ ] Read `rules.md` to refresh the AI limits
- [ ] Check the git log: `git log --oneline -20` to see what's been committed
- [ ] Run `npm run lint && npm run build` in `frontend/` to verify the current state compiles
- [ ] If a phase is in progress, read `design.md` (if building UI) or `architecture.md` (if adding files)
- [ ] Update the "Last updated" timestamp at the top of this file when you start
- [ ] Continue from the next unchecked task in the current phase

When the session ends:

- [ ] Update the "Last updated" timestamp
- [ ] Update the Phase Tracker table in Section 2
- [ ] Append to "What's Done" in Section 3
- [ ] Update "What's Next" in Section 4
- [ ] Add any new decisions to Section 5
- [ ] Add/resolve any blockers in Section 6
- [ ] Commit `memory.md` along with the work: `git add docs/memory.md && git commit -m "docs(memory): update status after phase X"`

---

## 12. Final Reminder

**This is a hackathon.** The goal is a 5-minute demo of the Quick Test Flow, not a production system. Make decisions that serve the demo:

- If a feature isn't on the demo path and time is short, SKIP it.
- If a feature is on the demo path but can be done with mock data instead of real logic, use mock data (as long as the demo LOOKS real).
- If a design decision has two options and one is faster, pick the faster one — unless it violates `rules.md`.
- If `npm run lint` fails on a rule that you can't easily fix, ask the human before bypassing the rule.
- If you have 1 hour before the demo and 3 minor bugs, fix the 2 that affect the demo flow and leave the third. Don't polish, ship.

**You've got this. Now go build it.**
