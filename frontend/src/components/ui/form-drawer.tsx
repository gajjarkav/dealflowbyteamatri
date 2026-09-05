"use client"
import React, { useEffect } from "react"
import { Button } from "./button"

interface FormDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footerActions?: React.ReactNode
}

export function FormDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footerActions
}: FormDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-lg bg-surface border-l border-border h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-8 h-8 p-0 rounded-full text-text-muted hover:text-text-primary"
          >
            &times;
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">{children}</div>

        {/* Footer */}
        {footerActions && (
          <div className="p-4 sm:p-6 border-t border-border bg-surface flex items-center justify-end gap-3">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  )
}
