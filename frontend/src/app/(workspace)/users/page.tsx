"use client";
import React, { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import { Users, Plus, Edit2, ShieldAlert, Mail, Lock, Phone, UserCheck, Shield } from "lucide-react"
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
  admin: "border-purple-500/30 text-purple-400 bg-purple-500/10",
  sales_manager: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  sales_rep: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  finance: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  customer: "border-border text-text-secondary bg-surface-hover",
}

const DEFAULT_FORM = { full_name: "", email: "", password: "", mobile_number: "", role: "sales_rep" as Role }

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
}

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
    if (!formData.full_name || !formData.email) return
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
    } catch {
      toast({ title: "Error", description: "Save failed", type: "error" })
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
    } catch {
      toast({ title: "Error", description: "Failed", type: "error" })
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-[1200px] mx-auto pb-12">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-medium">
            Manage internal team members, roles, and platform access controls.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={openCreate} className="font-heading font-bold shadow-md h-10">
            <Plus className="w-4 h-4 mr-2" /> Invite Member
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="premium-card p-5 bg-surface/50 border border-border flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent-soft/20 border border-accent/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-accent" />
            </div>
            <div className="text-[10px] font-heading font-bold text-text-secondary uppercase tracking-widest">Total Active</div>
          </div>
          <div className="text-3xl font-mono font-extrabold text-text-primary">{loading ? "..." : users.filter(u => u.is_active).length}</div>
        </Card>
        
        <Card className="premium-card p-5 bg-surface/50 border border-border flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-[10px] font-heading font-bold text-text-secondary uppercase tracking-widest">Verified Emails</div>
          </div>
          <div className="text-3xl font-mono font-extrabold text-text-primary">{loading ? "..." : users.filter(u => u.is_email_verified).length}</div>
        </Card>

        <Card className="premium-card p-5 bg-surface/50 border border-border flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-[10px] font-heading font-bold text-text-secondary uppercase tracking-widest">Admins</div>
          </div>
          <div className="text-3xl font-mono font-extrabold text-text-primary">{loading ? "..." : users.filter(u => u.role === 'admin').length}</div>
        </Card>

        <Card className="premium-card p-5 bg-surface/50 border border-border flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-[10px] font-heading font-bold text-text-secondary uppercase tracking-widest">Inactive</div>
          </div>
          <div className="text-3xl font-mono font-extrabold text-text-primary">{loading ? "..." : users.filter(u => !u.is_active).length}</div>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}>
        <Card className="premium-card overflow-hidden border-border bg-surface">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-surface-hover/80 border-b border-border">
                <tr className="text-[10px] font-heading font-bold text-text-secondary uppercase tracking-wider">
                  <th className="px-6 py-4">Team Member</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Platform Role</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-text-muted font-medium">Loading roster...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-text-muted font-medium">No users found.</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="interactive-row bg-surface">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xs font-bold text-accent uppercase">
                          {u.full_name.slice(0,2)}
                        </div>
                        <div>
                          <div className="font-bold text-text-primary">{u.full_name}</div>
                          {u.is_system && <Badge variant="secondary" className="text-[9px] uppercase tracking-widest bg-amber-500/10 text-amber-400 border-amber-500/30 mt-1">System Account</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-text-secondary font-medium">
                        <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-text-muted" /> {u.email}</div>
                        {u.mobile_number && <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-text-muted" /> {u.mobile_number}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={`font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 ${ROLE_COLORS[u.role]}`}>
                        {ROLE_LABELS[u.role]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${u.is_email_verified ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                        {u.is_email_verified ? "✓ Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={u.is_active ? "default" : "secondary"} className={`text-[10px] uppercase tracking-wider ${u.is_active ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15" : ""}`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" className="h-8 w-8 p-0 text-text-muted hover:text-accent hover:bg-accent-soft/30 rounded-full transition-colors" onClick={() => openEdit(u)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {u.is_active && !u.is_system && (
                          <Button variant="ghost" className="h-8 w-8 p-0 text-text-muted hover:text-danger hover:bg-danger-soft/50 rounded-full transition-colors" onClick={() => handleDeactivate(u.id, u.full_name)}>
                            <ShieldAlert className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      <FormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "Edit Team Member" : "Invite Team Member"}
        subtitle="Manage internal user profile and platform access level."
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="font-bold shadow-sm">
              {saving ? "Saving..." : editingId ? "Save Changes" : "Send Invite"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Full Name <span className="text-accent">*</span></label>
            <Input 
              value={formData.full_name} 
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
              placeholder="e.g. Jane Smith" 
              className="h-11 bg-surface shadow-sm"
              required 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Work Email <span className="text-accent">*</span></label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                placeholder="jane@company.com" 
                disabled={!!editingId} 
                className="h-11 bg-surface shadow-sm disabled:opacity-50"
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Mobile Number</label>
              <Input 
                value={formData.mobile_number} 
                onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })} 
                placeholder="+1 555 0123" 
                className="h-11 bg-surface shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5 border-t border-border/50 pt-5 mt-5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Platform Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="w-full h-11 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-primary focus:outline-none focus:border-accent shadow-sm"
            >
              {(["admin", "sales_manager", "sales_rep", "finance"] as Role[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          {!editingId && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Temporary Password</label>
              <div className="relative">
                <Input 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  placeholder="Leave blank to auto-generate" 
                  className="h-11 bg-surface shadow-sm pl-10"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              </div>
            </div>
          )}
        </form>
      </FormDrawer>
    </motion.div>
  )
}
