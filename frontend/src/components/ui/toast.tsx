"use client";
import React, { createContext, useContext, useState, useCallback } from "react"

export interface ToastMessage {
  id: string
  title: string
  description?: string
  type?: "success" | "info" | "warning" | "error"
}

interface ToastContextType {
  toast: (options: Omit<ToastMessage, "id">) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const toast = useCallback(({ title, description, type = "success" }: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    setToasts((prev) => [...prev, { id, title, description, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-surface border border-border px-4 py-3 rounded shadow-md flex items-start justify-between gap-3 text-sm animate-in slide-in-from-bottom-2 fade-in duration-200"
          >
            <div>
              <div className="font-medium text-text-primary flex items-center gap-2">
                {t.type === "success" && <span className="text-accent">&#10003;</span>}
                {t.type === "error" && <span className="text-danger">&#9888;</span>}
                {t.type === "warning" && <span className="text-warning">&#9888;</span>}
                {t.title}
              </div>
              {t.description && <div className="text-xs text-text-secondary mt-0.5">{t.description}</div>}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-text-muted hover:text-text-primary transition-colors text-xs"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
