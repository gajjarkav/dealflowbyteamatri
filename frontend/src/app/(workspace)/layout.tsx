"use client"
import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCurrentUser } from "@/lib/auth/context"
import { useDataStore } from "@/lib/data/useDataStore"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Role } from "@/lib/data/mockStore"

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useCurrentUser()
  const store = useDataStore()
  const { toast } = useToast()
  const [backendMenuOpen, setBackendMenuOpen] = useState(false)

  const currentRole = store.currentRole

  // Matrix of role permissions for workspace navigation
  const canAccess = (item: string) => {
    switch (item) {
      case "dashboard":
      case "quotations":
      case "pipeline":
        return true // All roles can access
      case "approvals":
        return ["Admin", "Manager", "Finance"].includes(currentRole)
      case "fulfillment":
        return ["Admin", "Finance", "Rep"].includes(currentRole)
      case "billing":
        return ["Admin", "Finance", "Rep"].includes(currentRole)
      case "deal-health":
        return ["Admin", "Manager", "Rep"].includes(currentRole)
      case "reports":
        return ["Admin", "Manager", "Finance"].includes(currentRole)
      case "users":
      case "settings":
      case "plans":
      case "upsell-rules":
      case "pricelists":
      case "products":
        return currentRole === "Admin"
      case "discount-tiers":
      case "approval-rules":
        return ["Admin", "Manager"].includes(currentRole)
      case "warehouses":
        return ["Admin", "Finance"].includes(currentRole)
      case "customers":
        return true // All roles
      default:
        return true
    }
  }

  const handleReloadData = () => {
    store.resetAll()
    toast({
      title: "Data Store Reloaded",
      description: "In-memory database has been reset to initial seed state.",
      type: "info"
    })
  }

  const handleRoleChange = (newRole: Role) => {
    store.setRole(newRole)
    toast({
      title: `Role Switched to ${newRole}`,
      description: `Navigation and permission rules updated for ${newRole}.`,
      type: "success"
    })
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", id: "dashboard" },
    { href: "/pipeline", label: "Quotations", id: "quotations" },
    { href: "/approvals", label: "Approvals", id: "approvals" },
    { href: "/fulfillment", label: "Fulfillment", id: "fulfillment" },
    { href: "/billing", label: "Billing", id: "billing" },
    { href: "/deal-health", label: "Deal Health", id: "deal-health" },
    { href: "/reports", label: "Reports", id: "reports" }
  ].filter((item) => canAccess(item.id))

  const backendLinks = [
    { href: "/products", label: "Products & Catalog", id: "products" },
    { href: "/pricelists", label: "Price Lists", id: "pricelists" },
    { href: "/discount-tiers", label: "Discount Tiers & Ceilings", id: "discount-tiers" },
    { href: "/approval-rules", label: "Approval Rules", id: "approval-rules" },
    { href: "/warehouses", label: "Warehouses & Stock", id: "warehouses" },
    { href: "/customers", label: "Customers", id: "customers" },
    { href: "/plans", label: "Subscription Plans", id: "plans" },
    { href: "/upsell-rules", label: "Upsell Rules", id: "upsell-rules" },
    { href: "/users", label: "Users Management", id: "users" },
    { href: "/settings", label: "Settings", id: "settings" }
  ].filter((item) => canAccess(item.id))

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-border bg-surface sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Brand + Nav Links */}
        <div className="flex items-center gap-6 overflow-x-auto py-1">
          <Link href="/dashboard" className="flex items-center gap-1 font-bold tracking-tight text-lg shrink-0">
            <span>DealFlow</span>
            <span className="text-accent">360</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-accent/10 text-accent font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-background"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}

            {/* Backend Config Dropdown */}
            {backendLinks.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setBackendMenuOpen(!backendMenuOpen)}
                  className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                    backendLinks.some((l) => pathname === l.href)
                      ? "bg-accent/10 text-accent font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-background"
                  }`}
                >
                  <span>Backend Config</span>
                  <span className="text-[10px]">&blacktriangledown;</span>
                </button>

                {backendMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setBackendMenuOpen(false)} />
                    <div className="absolute left-0 mt-1 w-56 bg-surface border border-border rounded-md shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-1.5 text-[11px] font-mono text-text-muted uppercase tracking-wider border-b border-border">
                        Configuration Modules
                      </div>
                      {backendLinks.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setBackendMenuOpen(false)}
                          className={`block px-3 py-2 text-xs transition-colors ${
                            pathname === sub.href
                              ? "bg-accent/10 text-accent font-semibold"
                              : "text-text-secondary hover:bg-background hover:text-text-primary"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* Right: Actions, Role Switcher, Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Reload Data Button */}
          <Button
            variant="ghost"
            onClick={handleReloadData}
            className="h-8 px-2.5 text-xs text-text-secondary hover:text-accent border border-border"
            title="Reset in-memory data to defaults"
          >
            <span className="text-xs mr-1">&#8635;</span> Reload Data
          </Button>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-background border border-border rounded px-2 py-1">
            <span className="text-[11px] text-text-muted font-mono hidden sm:inline">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value as Role)}
              className="bg-transparent text-xs font-semibold text-accent focus:outline-none cursor-pointer"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Sales Manager</option>
              <option value="Finance">Finance / Ops</option>
              <option value="Rep">Sales Rep</option>
            </select>
          </div>

          {/* Portal Switcher Link */}
          <Link href="/portal" className="hidden lg:inline-flex">
            <Badge variant="outline" className="text-[11px] border-accent/40 text-accent hover:bg-accent/10 cursor-pointer">
              Customer Portal &rarr;
            </Badge>
          </Link>

          {/* User Sign Out */}
          <Button
            variant="ghost"
            onClick={async () => {
              await logout()
              router.push("/login")
            }}
            className="h-8 px-2 text-xs text-text-muted hover:text-danger"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-b border-border bg-surface px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-2.5 py-1 rounded text-xs font-medium shrink-0 ${
              pathname === link.href ? "bg-accent text-white" : "bg-background text-text-secondary"
            }`}
          >
            {link.label}
          </Link>
        ))}
        {backendLinks.length > 0 && (
          <Link
            href="/products"
            className={`px-2.5 py-1 rounded text-xs font-medium shrink-0 ${
              pathname.startsWith("/products") || pathname.startsWith("/users")
                ? "bg-accent text-white"
                : "bg-background text-text-secondary"
            }`}
          >
            Config
          </Link>
        )}
      </div>

      {/* Main Workspace Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
        {children}
      </main>
    </div>
  )
}
