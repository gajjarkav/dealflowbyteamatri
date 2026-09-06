import { cn } from "@/lib/utils";
import { titleCase } from "@/lib/format";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneMap: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground border-border",
  success: "bg-moss/12 text-moss border-moss/25",
  warning: "bg-honey/25 text-honey-foreground border-honey/45",
  danger: "bg-destructive/12 text-destructive border-destructive/25",
  info: "bg-primary/12 text-primary border-primary/25",
};

const statusTone: Record<string, Tone> = {
  active: "success",
  operational: "success",
  paid: "success",
  settled: "success",
  approved: "success",
  won: "success",
  posted: "success",
  done: "success",
  pending: "warning",
  pending_approval: "warning",
  partial: "warning",
  scheduled: "warning",
  maintenance: "warning",
  on_hold: "warning",
  current: "warning",
  draft: "neutral",
  prospect: "info",
  open: "info",
  sent: "info",
  upcoming: "neutral",
  expired: "neutral",
  retired: "neutral",
  discontinued: "neutral",
  overdue: "danger",
  failed: "danger",
  rejected: "danger",
  lost: "danger",
  returned: "danger",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = statusTone[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        toneMap[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {titleCase(status)}
    </span>
  );
}

export function RiskBadge({ score }: { score: number }) {
  const tone: Tone = score >= 70 ? "danger" : score >= 40 ? "warning" : "success";
  const label = score >= 70 ? "High risk" : score >= 40 ? "Watch" : "Low risk";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        toneMap[tone],
      )}
    >
      {label} · {score}
    </span>
  );
}
