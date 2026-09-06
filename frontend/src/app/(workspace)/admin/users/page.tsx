"use client";
import { useState } from "react";
import { ShieldCheck, UserPlus, Users } from "lucide-react";

import { BentoCard, BentoGrid, BentoHeader, EmptyState, PageHeader, StatCard } from "@/components/bento/bento";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { qk, useApiMutation, useStaffUsers } from "@/hooks/use-dealflow";
import { userService } from "@/lib/api/services";
import type { RoleName } from "@/lib/api/types";
import { initials } from "@/lib/format";

const staffRoles: { value: RoleName; label: string }[] = [
  { value: "sales_rep", label: "Sales rep" },
  { value: "sales_manager", label: "Sales manager" },
  { value: "finance", label: "Finance" },
  { value: "warehouse", label: "Warehouse" },
  { value: "admin", label: "Admin" },
];

const roleLabel = (role: string) =>
  staffRoles.find((r) => r.value === role)?.label ?? (role === "customer" ? "Customer" : role);



export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "sales_rep" as RoleName });

  const { data, isLoading } = useStaffUsers();

  const create = useApiMutation(() => userService.create({ ...form, active: true }), {
    successMessage: "Account created — an invite email was queued",
    invalidate: [qk.staffUsers()],
    onDone: () => {
      setOpen(false);
      setForm({ name: "", email: "", role: "sales_rep" });
    },
  });

  const deactivate = useApiMutation((id: string) => userService.deactivate(id), {
    successMessage: "Account deactivated",
    invalidate: [qk.staffUsers()],
  });

  const rows = (data ?? []).filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const staffCount = (data ?? []).filter((u) => u.role !== "customer").length;
  const inactive = (data ?? []).filter((u) => !u.active).length;
  const mfa = (data ?? []).filter((u) => u.twoFactorEnabled).length;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="User administration"
        description="Sales rep, sales manager, finance and warehouse accounts are created here only — never by self sign-up."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="size-4" />
                New account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create staff account</DialogTitle>
                <DialogDescription>
                  The user receives an activation email and must set a password plus 2FA on first sign-in.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Marcus Reed"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="marcus@dealflow.io"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as RoleName })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {staffRoles.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => create.mutate(undefined)}
                  disabled={!form.name || !form.email || create.isPending}
                >
                  Create account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <BentoGrid>
        <StatCard label="Staff accounts" value={String(staffCount)} icon={Users} tint="ember" />
        <StatCard label="2FA enabled" value={String(mfa)} hint="required for approvers" icon={ShieldCheck} tint="honey" delay={0.05} />
        <StatCard label="Deactivated" value={String(inactive)} hint="retained for audit" tint="sand" delay={0.1} />
        <StatCard label="Portal users" value={String((data ?? []).filter((u) => u.role === "customer").length)} hint="customer contacts" tint="clay" delay={0.15} />
      </BentoGrid>

      <BentoCard padded={false}>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
            className="sm:max-w-xs"
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {staffRoles.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No accounts match" description="Try a different role filter or search term." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last sign-in</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-[11px] font-semibold">
                          {initials(u.name)}
                        </span>
                        <span className="flex flex-col leading-tight">
                          <span className="text-sm font-medium">{u.name}</span>
                          <span className="text-xs text-muted-foreground">{u.email}</span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{roleLabel(u.role)}</TableCell>
                    <TableCell className="text-sm">{u.active ? "Active" : "Deactivated"}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!u.active || deactivate.isPending}
                        onClick={() => deactivate.mutate(u.id)}
                      >
                        Deactivate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </BentoCard>

      <BentoCard tint="sand">
        <BentoHeader title="Why self sign-up is disabled for staff" />
        <p className="text-sm text-muted-foreground">
          Approval authority follows the role. If reps could pick their own role at sign-up, discount ceilings and the
          approval chain would be self-selected — so staff identities are issued here and only deactivated, never deleted,
          to keep the approval audit trail intact.
        </p>
      </BentoCard>
    </>
  );
}
