const currencySymbols: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" };

/** Deterministic compact form so server and client render identical text. */
function compactValue(value: number) {
  const abs = Math.abs(value);
  const unit = abs >= 1e9 ? 1e9 : abs >= 1e6 ? 1e6 : abs >= 1e3 ? 1e3 : 1;
  const suffix = unit === 1e9 ? "B" : unit === 1e6 ? "M" : unit === 1e3 ? "K" : "";
  const scaled = value / unit;
  const text = unit === 1 ? String(Math.round(scaled)) : scaled.toFixed(1).replace(/\.0$/, "");
  return `${text}${suffix}`;
}

export function money(value: number, currency = "EUR", compact = false) {
  if (compact) {
    const symbol = currencySymbols[currency] ?? `${currency} `;
    return `${value < 0 ? "-" : ""}${symbol}${compactValue(Math.abs(value))}`;
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function num(value: number, compact = false) {
  if (compact) return compactValue(value);
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(value);
}


export function pct(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function titleCase(value: string) {
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function dateLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
