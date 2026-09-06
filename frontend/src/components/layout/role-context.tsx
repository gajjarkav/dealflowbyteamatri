"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { tokenStore } from "@/lib/api/client";
import { demoUser } from "@/lib/api/mock";
import { isRoleKey, panels, type PanelConfig, type RoleKey } from "@/lib/roles";

const STORAGE_KEY = "dealflow.panel";

type SessionUser = { name: string; email: string; initials: string };

type RoleContextValue = {
  role: RoleKey;
  panel: PanelConfig;
  setRole: (role: RoleKey) => void;
  /** True once a real access token exists (a live backend session). */
  isAuthenticated: boolean;
  /** True while browsing without a backend session. */
  isDemoSession: boolean;
  user: SessionUser;
  signOut: () => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<RoleKey>("admin");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SessionUser>({
    name: demoUser.name,
    email: demoUser.email,
    initials: demoUser.avatarInitials ?? "DF",
  });

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isRoleKey(stored)) setRoleState(stored);
    setIsAuthenticated(!!tokenStore.access);
    const live = tokenStore.getUser<{ name?: string; email?: string }>();
    if (live?.email) {
      const name = live.name ?? live.email;
      setUser({
        name,
        email: live.email,
        initials: name
          .split(" ")
          .map((part) => part[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase(),
      });
    }
  }, []);

  const setRole = useCallback((next: RoleKey) => {
    setRoleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const signOut = useCallback(() => {
    tokenStore.clear();
    setIsAuthenticated(false);
  }, []);

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      panel: panels[role],
      setRole,
      isAuthenticated,
      isDemoSession: !isAuthenticated,
      user,
      signOut,
    }),
    [role, setRole, isAuthenticated, user, signOut],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}
