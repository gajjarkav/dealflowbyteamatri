"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LogIn, LogOut } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRole } from "./role-context";
import { useCurrentUser } from "@/lib/auth/context";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = usePathname();
  const { panel } = useRole();
  const { user: realUser, logout } = useCurrentUser();
  
  const isAuthenticated = !!realUser;
  
  // Format initials from real user
  const initials = realUser?.full_name 
    ? realUser.full_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "DF";
  const userName = realUser?.full_name || "User";

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <Link href={panel.landing} className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-gold/40 bg-gold/12 font-mono text-[13px] font-semibold text-gold">
            DF
          </span>
          {!collapsed && (
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="font-display text-[15px] font-semibold tracking-tight">DealFlow360</span>
              <span className="truncate text-[11px] text-sidebar-foreground/60">{panel.label} panel</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1.5">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {panel.nav.map((group) => {
                const groupActive = group.items.some((item) => isActive(item.to, item.exact));
                return (
                  <Collapsible key={group.label} defaultOpen={groupActive} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={group.label}
                          isActive={groupActive}
                          className={cn(
                            "font-medium transition-all duration-200", 
                            groupActive 
                              ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_0_hsl(var(--primary))] hover:bg-primary/20" 
                              : "hover:bg-surface-hover hover:text-foreground"
                          )}
                        >
                          <group.icon className="size-4" />
                          <span>{group.label}</span>
                          <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {group.items.map((item) => {
                            const isItemActive = isActive(item.to, item.exact);
                            return (
                              <SidebarMenuSubItem key={item.to}>
                                <SidebarMenuSubButton asChild isActive={isItemActive}
                                  className={cn(
                                    "transition-colors duration-200",
                                    isItemActive ? "text-primary font-medium" : "hover:text-foreground"
                                  )}
                                >
                                  <Link href={item.to}>{item.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={userName} className="h-auto py-2">
              <Link href="/profile" className="flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent font-mono text-[11px] font-semibold">
                  {initials}
                </span>
                {!collapsed && (
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-sm font-medium">{userName}</span>
                    <span className="truncate text-[11px] text-sidebar-foreground/60">{panel.title}</span>
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            {isAuthenticated ? (
              <SidebarMenuButton tooltip="Sign out" onClick={logout} className="text-sidebar-foreground/70">
                <LogOut className="size-4" />
                <span>Sign out</span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton asChild tooltip="Sign in">
                <Link href="/login" className="text-sidebar-foreground/70">
                  <LogIn className="size-4" />
                  <span>Sign in</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
