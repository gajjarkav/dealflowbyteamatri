import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tint = "plain" | "ember" | "honey" | "clay" | "sand" | "moss";

const tintClass: Record<Tint, string> = {
  plain: "",
  ember: "bento-tint-ember",
  honey: "bento-tint-honey",
  clay: "bento-tint-clay",
  sand: "bento-tint-sand",
  moss: "bento-tint-moss",
};

export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4", className)}>
      {children}
    </div>
  );
}

export function BentoCard({
  children,
  className,
  tint = "plain",
  interactive = false,
  delay = 0,
  padded = true,
}: {
  children: ReactNode;
  className?: string | undefined;
  tint?: Tint | undefined;
  interactive?: boolean | undefined;
  delay?: number | undefined;
  padded?: boolean | undefined;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "premium-card overflow-hidden group",
        tintClass[tint],
        interactive && "cursor-pointer",
        padded && "p-5",
        className,
      )}
    >
      {children}
    </motion.section>
  );
}

export function BentoHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}: {
  title: string;
  subtitle?: string | undefined;
  icon?: LucideIcon | undefined;
  action?: ReactNode | undefined;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="size-4.5" />
          </span>
        ) : null}
        <div>
          <h2 className="text-base font-semibold leading-tight group-hover:text-primary transition-colors">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
  tint = "plain",
  delay = 0,
  className,
}: {
  label: string;
  value: string;
  hint?: string | undefined;
  delta?: number | undefined;
  icon?: LucideIcon | undefined;
  tint?: Tint | undefined;
  delay?: number | undefined;
  className?: string | undefined;
}) {
  return (
    <BentoCard tint={tint} interactive delay={delay} className={className}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-primary">{label}</p>
        {Icon ? <Icon className="size-4 text-muted-foreground transition-colors group-hover:text-primary" /> : null}
      </div>
      <p className="mt-3 font-display text-2xl font-semibold tracking-tight tabular-nums sm:text-[1.75rem]">{value}</p>
      <div className="mt-1.5 flex items-center gap-2">
        {typeof delta === "number" ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
              delta >= 0 ? "bg-success/15 text-success" : "bg-danger/12 text-danger",
            )}
          >
            {delta >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {Math.abs(delta)}%
          </span>
        ) : null}
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
    </BentoCard>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: ReactNode | undefined;
  title: string;
  description?: string | undefined;
  actions?: ReactNode | undefined;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground text-balance-tight">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </motion.header>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string | undefined; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface-2/60 px-6 py-12 text-center">
      <p className="font-medium">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}

export function MiniBar({ value, tone = "primary" }: { value: number; tone?: "primary" | "honey" | "clay" | "moss" }) {
  const toneClass = {
    primary: "bg-primary",
    honey: "bg-honey",
    clay: "bg-clay",
    moss: "bg-moss",
  }[tone];
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <motion.div
        className={cn("h-full rounded-full", toneClass)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
