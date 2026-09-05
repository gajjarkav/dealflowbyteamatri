import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: "default" | "success" | "warning" | "danger"
  variant?: "default" | "secondary" | "outline" | "destructive" | (string & {})
}

function Badge({ className, status = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium border",
        {
          "bg-surface text-text-secondary border-border": status === "default",
          "bg-success-soft text-success border-transparent": status === "success",
          "bg-warning-soft text-warning border-transparent": status === "warning",
          "bg-danger-soft text-danger border-transparent": status === "danger",
        },
        className
      )}
      {...props}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}

export { Badge }
