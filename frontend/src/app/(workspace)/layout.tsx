"use client";
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCurrentUser } from "@/lib/auth/context"
import { motion } from "framer-motion"
import { LogOut, Settings, LayoutDashboard, FileText, CheckSquare, PackageOpen, CreditCard, Activity, Menu, X, Zap } from "lucide-react"

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user, isLoading } = useCurrentUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Auth guard: redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [isLoading, user, router])

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false)
  }, [pathname])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="h-10 w-10 rounded-xl bg-accent-soft flex items-center justify-center animate-pulse mb-4">
          <Zap className="h-5 w-5 text-accent" />
        </div>
        <div className="text-text-muted text-sm font-mono tracking-widest uppercase">Initializing Command Center...</div>
      </div>
    )
  }

  const roleAlias = user?.role === "admin" ? "Admin"
    : user?.role === "sales_manager" ? "Manager"
    : user?.role === "finance" ? "Finance"
    : user?.role === "sales_rep" ? "Rep"
    : "Rep"

  const currentRole = roleAlias

  const canAccess = (item: string) => {
    switch (item) {
      case "dashboard":
      case "quotations":
      case "pipeline":
        return true 
      case "customers":
      case "billing":
        return ["Admin", "Manager", "Rep"].includes(currentRole)
      case "approvals":
      case "reports":
        return ["Admin", "Manager", "Finance"].includes(currentRole)
      case "fulfillment":
        return ["Admin", "Finance", "Rep"].includes(currentRole)
      case "deal-health":
        return ["Admin", "Manager", "Rep"].includes(currentRole)
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
      default:
        return true
    }
  }

  const mainLinks = [
    { href: "/dashboard", label: "Dashboard", id: "dashboard", icon: <LayoutDashboard size={16} /> },
    { href: "/pipeline", label: "Pipeline", id: "pipeline", icon: <FileText size={16} /> },
    { href: "/approvals", label: "Approvals", id: "approvals", icon: <CheckSquare size={16} /> },
    { href: "/fulfillment", label: "Fulfillment", id: "fulfillment", icon: <PackageOpen size={16} /> },
    { href: "/billing", label: "Billing", id: "billing", icon: <CreditCard size={16} /> },
    { href: "/customers", label: "Customers", id: "customers", icon: <Activity size={16} /> },
    { href: "/deal-health", label: "Deal Health", id: "deal-health", icon: <Activity size={16} /> },
    { href: "/reports", label: "Reports", id: "reports", icon: <FileText size={16} /> },
  ].filter(l => canAccess(l.id))

  const adminLinks = [
    { href: "/products", label: "Catalog", id: "products" },
    { href: "/pricelists", label: "Price Lists", id: "pricelists" },
    { href: "/discount-tiers", label: "Discount Tiers", id: "discount-tiers" },
    { href: "/approval-rules", label: "Approval Matrix", id: "approval-rules" },
    { href: "/warehouses", label: "Hubs & Stock", id: "warehouses" },
    { href: "/users", label: "Access & Users", id: "users" },
    { href: "/settings", label: "Settings", id: "settings" },
  ].filter(l => canAccess(l.id))

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-lg sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-glow">
              <Zap className="text-white h-4 w-4" />
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight hidden sm:block">
              DealFlow<span className="text-accent">360</span>
            </span>
          </Link>
        </div>

        {/* Center: Desktop Main Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {mainLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-text-primary text-surface shadow-md"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right: User Menu */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold leading-none text-text-primary">{user.full_name}</span>
            <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest mt-1">{currentRole}</span>
          </div>
          
          <div className="h-10 w-10 rounded-full bg-surface-hover border border-border flex items-center justify-center text-text-primary font-heading font-bold shadow-sm">
            {user.full_name.charAt(0)}
          </div>
          
          <button
            onClick={async () => { await logout() }}
            className="p-2 text-text-muted hover:text-danger hover:bg-danger-soft rounded-full transition-colors"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Admin Secondary Bar */}
      {adminLinks.length > 0 && (
        <div className="hidden lg:block border-b border-border/50 bg-surface/50 backdrop-blur-sm sticky top-16 z-30">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center gap-1 h-10 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest mr-3 shrink-0">Config</span>
            {adminLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 pt-16 bg-surface border-b border-border shadow-2xl flex flex-col">
          <div className="p-6 flex-1 overflow-y-auto space-y-8">
            <div>
              <div className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">Core Modules</div>
              <div className="grid gap-2">
                {mainLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 p-3 rounded-xl font-semibold transition-colors ${
                      pathname.startsWith(link.href) ? "bg-accent text-white" : "bg-surface-hover text-text-primary"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            
            {adminLinks.length > 0 && (
              <div>
                <div className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">Admin Config</div>
                <div className="grid gap-2">
                  {adminLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 p-3 rounded-xl font-medium text-sm bg-background border border-border text-text-secondary hover:text-text-primary"
                    >
                      <Settings size={16} className="text-text-muted" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <motion.main 
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1400px] w-full mx-auto"
      >
        {children}
      </motion.main>

    </div>
  )
}

