"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import {
  apiListUsers,
  apiCreateUser,
  apiUpdateUser,
  apiDeactivateUser,
  type UserResponse,
  type Role,
} from "@/lib/api/users"

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  sales_manager: "Sales Manager",
  sales_rep: "Sales Rep",
  finance: "Finance",
  customer: "Customer",
}

const ROLE_COLORS: Record<Role, string> = {
  admin: "border-purple-500/50 text-purple-600",
  sales_manager: "border-blue-500/50 text-blue-600",
  sales_rep: "border-emerald-500/50 text-emerald-600",
  finance: "border-amber-500/50 text-amber-600",
  customer: "border-border text-text-secondary",
}

const DEFAULT_FORM = { full_name: "", email: "", password: "", mobile_number: "", role: "sales_rep" as Role }

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiListUsers()
      setUsers(res)
    } catch {
      toast({ title: "Error", description: "Failed to load users", type: "error" })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const openCreate = () => {
    setEditingId(null)
    setFormData(DEFAULT_FORM)
    setDrawerOpen(true)
  }

  const openEdit = (u: UserResponse) => {
    setEditingId(u.id)
    setFormData({ full_name: u.full_name, email: u.email, password: "", mobile_number: u.mobile_number || "", role: u.role })
    setDrawerOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.full_name || !formData.email) {
      toast({ title: "Name and email required", type: "error" })
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await apiUpdateUser(editingId, {
          full_name: formData.full_name,
          mobile_number: formData.mobile_number || undefined,
          role: formData.role,
        })
        toast({ title: "User Updated" })
      } else {
        await apiCreateUser({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password || undefined,
          mobile_number: formData.mobile_number || undefined,
          role: formData.role,
        })
        toast({ title: "User Created" })
      }
      setDrawerOpen(false)
      load()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed"
      toast({ title: "Error", description: msg, type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (userId: string, name: string) => {
    if (!confirm(`Deactivate "${name}"?`)) return
    try {
      await apiDeactivateUser(userId)
      toast({ title: "User Deactivated" })
      load()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed"
      toast({ title: "Error", description: msg, type: "error" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">User Management</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage internal team members, roles, and access controls.
          </p>
        </div>
        <Button onClick={openCreate}>+ Invite User</Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface border-b border-border text-xs font-mono text-text-secondary">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Verified</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-text-muted">Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-text-muted">No users found.</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-surface/60">
                <td className="px-4 py-3">
                  <div className="font-semibold text-text-primary">{u.full_name}</div>
                  {u.mobile_number && <div className="text-xs text-text-muted">{u.mobile_number}</div>}
                </td>
                <td className="px-4 py-3 text-text-secondary text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className={`font-mono text-xs ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${u.is_email_verified ? "text-emerald-600" : "text-amber-600"}`}>
                    {u.is_email_verified ? "✓ Verified" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.is_active ? "default" : "secondary"} className="text-xs">
                    {u.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" className="h-7 px-2.5 text-xs" onClick={() => openEdit(u)}>Edit</Button>
                    {u.is_active && !u.is_system && (
                      <Button variant="ghost" className="h-7 px-2.5 text-xs text-danger hover:text-danger" onClick={() => handleDeactivate(u.id, u.full_name)}>Deactivate</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "Edit User" : "Invite Team Member"}
        subtitle="Manage internal user access"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editingId ? "Save Changes" : "Send Invite"}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Full Name *</label>
            <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="Jane Smith" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Work Email *</label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="jane@company.com" disabled={!!editingId} required />
          </div>
          {!editingId && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Temporary Password</label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Leave blank to auto-generate" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Mobile Number</label>
            <Input value={formData.mobile_number} onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })} placeholder="+1 555 0000" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              {(["admin", "sales_manager", "sales_rep", "finance"] as Role[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
