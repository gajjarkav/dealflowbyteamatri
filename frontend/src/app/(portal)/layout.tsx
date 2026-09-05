"use client"
import React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans">
      {/* Portal Top Header */}
      <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/portal" className="flex items-center gap-1.5 font-bold tracking-tight text-lg">
            <span>DealFlow</span>
            <span className="text-accent">360</span>
            <span className="text-xs font-mono font-normal text-text-muted ml-1 border-l border-border pl-2">
              Customer Portal
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-text-secondary border-l border-border pl-4">
            <span>Account:</span>
            <span className="font-semibold text-text-primary">Stripe Enterprise</span>
            <Badge variant="secondary" className="border-accent/40 text-accent text-[10px] font-mono">
              Platinum Tier (20% Max Disc)
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" className="h-8 px-2.5 text-xs text-text-secondary hover:text-accent border border-border">
              &larr; Return to Workspace
            </Button>
          </Link>

          <Link href="/login">
            <Button variant="ghost" className="h-8 px-2.5 text-xs text-text-muted hover:text-danger">
              Sign Out
            </Button>
          </Link>
        </div>
      </header>

      {/* Portal Main Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-5xl w-full mx-auto animate-in fade-in duration-200">
        {children}
      </main>

      {/* Portal Footer */}
      <footer className="border-t border-border bg-surface py-6 px-8 text-center text-xs text-text-muted">
        <div>Secured by DealFlow360 Self-Governing Sales Protocol &bull; Enterprise Quote-to-Cash</div>
      </footer>
    </div>
  )
}
