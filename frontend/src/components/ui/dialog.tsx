"use client"
import React, { useEffect } from "react"
import { Button } from "./button"

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footerActions?: React.ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl"
}

export function Dialog({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footerActions,
  maxWidth = "md"
}: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl"
  }[maxWidth]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog box */}
      <div
        className={`relative w-full ${widthClasses} bg-surface border border-border rounded-lg shadow-xl z-10 overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-text-primary">{title}</h3>
            {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-7 h-7 p-0 rounded-full text-text-muted hover:text-text-primary"
          >
            &times;
          </Button>
        </div>

        {/* Content */}
        <div className="p-5">{children}</div>

        {/* Footer */}
        {footerActions && (
          <div className="p-4 border-t border-border bg-background/50 flex items-center justify-end gap-3">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  )
}
