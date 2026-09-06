"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Check, ChevronsUpDown, LogIn, Plus, Search, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

import { AppSidebar } from "./app-sidebar";
import { useRole } from "./role-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { panelOrder, panels } from "@/lib/roles";
import { cn } from "@/lib/utils";

function useCrumb(nav: ReturnType<typeof useRole>["panel"]["nav"]) {
  const pathname = usePathname();
  for (const group of nav) {
    for (const item of group.items) {
      if (pathname === item.to) return { group: group.label, page: item.title };
    }
  }
  for (const group of nav) {
    const match = group.items.find((item) => item.to !== "/" && pathname.startsWith(item.to));
    if (match) return { group: group.label, page: `${match.title} · detail` };
  }
  return { group: nav[0]?.label ?? "Overview", page: "Panel home" };
}

function PanelSwitcher() {
  const { panel, setRole } = useRole();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 rounded-full border-border bg-surface-2 px-3 font-mono text-[11px] uppercase tracking-[0.1em]"
        >
          <span className="size-1.5 rounded-full bg-gold" />
          {panel.label}
          <ChevronsUpDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="mono-label">Demo panel switcher</DropdownMenuLabel>
        <p className="px-2 pb-2 text-[11px] leading-relaxed text-muted-foreground">
          In production these accounts are created by an admin. This switcher exists so you can walk the whole
          flow without a live login.
        </p>
        <DropdownMenuSeparator />
        {panelOrder.map((key) => {
          const item = panels[key];
          return (
            <DropdownMenuItem key={key} onSelect={() => setRole(key)} className="items-start gap-2 py-2">
              <Check className={cn("mt-0.5 size-3.5", panel.key === key ? "opacity-100 text-gold" : "opacity-0")} />
              <span className="flex flex-col">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-[11px] leading-snug text-muted-foreground">{item.purpose}</span>
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { panel, isAuthenticated, user, signOut } = useRole();
  const crumb = useCrumb(panel.nav);
  const showNewQuote = panel.key === "rep" || panel.key === "admin";

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-background">
        <div className="pointer-events-none absolute inset-0 pattern-grid opacity-[0.55]" aria-hidden />
        <AppSidebar />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-3 backdrop-blur-md sm:px-5">
            <SidebarTrigger className="shrink-0" />
            <div className="hidden items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground md:flex">
              <span>{panel.label}</span>
              <span className="opacity-40">/</span>
              <span>{crumb.group}</span>
              <span className="opacity-40">/</span>
              <span className="text-foreground">{crumb.page}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search quotes, customers, SKUs"
                  className="h-9 w-48 rounded-full bg-surface-2 pl-8 text-sm lg:w-64"
                />
              </div>
              <PanelSwitcher />
              <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
                <Bell className="size-4" />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-gold" />
              </Button>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 rounded-full px-2">
                      <span className="flex size-7 items-center justify-center rounded-md bg-charcoal font-mono text-[11px] font-semibold text-charcoal-foreground">
                        {user.initials}
                      </span>
                      <span className="hidden text-sm sm:inline">{user.name.split(" ")[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile & security</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={signOut}>Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href="/login">
                    <LogIn className="size-3.5" />
                    <span className="hidden sm:inline">Sign in</span>
                  </Link>
                </Button>
              )}
              {showNewQuote ? (
                <Button asChild size="sm" className="rounded-full">
                  <Link href="/quotations/new">
                    <Plus className="size-4" />
                    <span className="hidden sm:inline">New quote</span>
                  </Link>
                </Button>
              ) : null}
            </div>
          </header>

          {!isAuthenticated ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-gold/30 bg-gold/10 px-3 py-2 text-xs text-foreground sm:px-5">
              <ShieldAlert className="size-3.5 text-bronze" />
              <span>
                No live session - you&apos;re browsing sample data. Sign in to read and write against your API.
              </span>
              <Link href="/login" className="font-medium underline underline-offset-4">
                Sign in
              </Link>
            </div>
          ) : null}

          <main className="flex-1 px-3 pb-10 pt-4 sm:px-5 lg:px-7">
            <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4">{children}</div>
          </main>

          <footer className="border-t border-border bg-surface/80 px-3 py-5 sm:px-5 lg:px-7">
            <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                DealFlow360 · {panel.title}
              </p>
              <p className="max-w-lg text-xs text-muted-foreground">{panel.purpose}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <Link href="/profile" className="hover:text-foreground">
                  Security
                </Link>
                <Link href="/portal" className="hover:text-foreground">
                  Customer portal
                </Link>
                <span>v1.0</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
