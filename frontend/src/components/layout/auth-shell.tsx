import Link from "next/link";
import { motion } from "framer-motion";
import { Quote, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

const highlights = [
  { icon: TrendingUp, label: "Margin guardrails", text: "Category ceilings stop discounts before they leak." },
  { icon: ShieldCheck, label: "Approval trails", text: "Every override signed, timestamped and auditable." },
  { icon: Quote, label: "Smart quoting", text: "Suggestions ranked by win-rate, not gut feel." },
];

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-surface-2 p-10 lg:flex">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-honey/35 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 size-80 rounded-full bg-ember/25 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4.5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">DealFlow</span>
        </Link>

        <div className="relative max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-balance-tight"
          >
            Quote faster. Protect every point of margin.
          </motion.h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            DealFlow connects catalog, stock, pricing rules and approvals into one workspace so your team never
            quotes blind.
          </p>
          <div className="mt-8 space-y-3">
            {highlights.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="bento-card flex items-start gap-3 p-4"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <item.icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-muted-foreground">
          Trusted by 240+ distributors across 18 markets.
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4.5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">DealFlow</span>
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-7">{children}</div>
          {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
        </motion.div>
      </div>
    </div>
  );
}
