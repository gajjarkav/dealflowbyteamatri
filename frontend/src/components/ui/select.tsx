import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex w-full rounded border bg-background px-3 py-2 text-sm text-text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
          error ? "border-danger focus-visible:border-danger" : "border-border",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Select.displayName = "Select"

export { Select }
