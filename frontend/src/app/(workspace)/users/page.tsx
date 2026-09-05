"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { DataTable, Column } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FormDrawer } from "@/components/ui/form-drawer"
import { useToast } from "@/components/ui/toast"
import type { UserItem, Role } from "@/lib/data/mockStore"

export default function UsersPage() {
  const store = useDataStore()
  const { toast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Rep" as Role,
    status: "Active" as "Active" | "Deactivated"
  })

  const openCreateDrawer = () => {
    setEditingUser(null)
    setFormData({ name: "", email: "", phone: "", role: "Rep", status: "Active" })
    setDrawerOpen(true)
  }

  const openEditDrawer = (user: UserItem) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    })
    setDrawerOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast({ title: "Validation Error", description: "Name and email are required.", type: "error" })
      return
    }

    if (editingUser) {
      store.updateUser(editingUser.id, formData)
      toast({ title: "User Updated", description: `${formData.name} was successfully updated.` })
    } else {
      store.addUser(formData)
      toast({ title: "User Created", description: `Internal account for ${formData.name} created.` })
    }
    setDrawerOpen(false)
  }

  const toggleUserStatus = (user: UserItem) => {
    const nextStatus = user.status === "Active" ? "Deactivated" : "Active"
    store.updateUser(user.id, { status: nextStatus })
    toast({
      title: `User ${nextStatus}`,
      description: `${user.name} is now ${nextStatus.toLowerCase()}.`,
      type: nextStatus === "Active" ? "success" : "warning"
    })
  }

  const columns: Column<UserItem>[] = [
    {
      key: "name",
      header: "User Details",
      render: (u) => (
        <div>
          <div className="font-medium text-text-primary">{u.name}</div>
          <div className="text-xs text-text-secondary font-mono">{u.email}</div>
        </div>
      )
    },
    {
      key: "phone",
      header: "Phone",
      render: (u) => <span className="font-mono text-xs">{u.phone}</span>
    },
    {
      key: "role",
      header: "System Role",
      render: (u) => {
        const colors: Record<Role, string> = {
          Admin: "border-accent text-accent bg-accent/5",
          Manager: "border-blue-500/40 text-blue-600 bg-blue-500/5",
          Finance: "border-emerald-500/40 text-emerald-600 bg-emerald-500/5",
          Rep: "border-border text-text-secondary bg-surface"
        }
        return (
          <Badge variant="outline" className={`font-mono text-xs ${colors[u.role]}`}>
            {u.role}
          </Badge>
        )
      }
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Badge variant={u.status === "Active" ? "default" : "secondary"} className="text-xs">
          {u.status}
        </Badge>
      )
    },
    {
      key: "lastLogin",
      header: "Last Active",
      render: (u) => <span className="text-xs text-text-muted">{u.lastLogin}</span>
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (u) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => openEditDrawer(u)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            className={`h-7 px-2 text-xs ${u.status === "Active" ? "text-danger hover:text-danger" : "text-accent"}`}
            onClick={() => toggleUserStatus(u)}
          >
            {u.status === "Active" ? "Deactivate" : "Activate"}
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Internal Users & Governance</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage sales representatives, managers, finance officers, and administrator credentials.
          </p>
        </div>

        <Button onClick={openCreateDrawer} className="sm:w-auto">
          + Add New User
        </Button>
      </div>

      <DataTable
        data={store.users}
        columns={columns}
        searchPlaceholder="Search users by name or email..."
        searchKey={(u) => `${u.name} ${u.email} ${u.role}`}
        title="Active Team Directory"
        subtitle={`${store.users.length} total registered internal members`}
      />

      {/* User Form Drawer */}
      <FormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingUser ? "Edit User Record" : "Provision Internal User"}
        subtitle="Configure role hierarchy and authorization parameters"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingUser ? "Save Changes" : "Create Account"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Full Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Jordan Hayes"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Work Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jordan.hayes@dealflow360.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Contact Phone</label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Assigned Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="Admin">Administrator (Full Access & Settings)</option>
              <option value="Manager">Sales Manager (Approvals & Ceilings)</option>
              <option value="Finance">Finance & Operations (Fulfillment & Invoices)</option>
              <option value="Rep">Sales Representative (Deals & Pipeline)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Account Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Deactivated" })}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="Active">Active (Permitted Login)</option>
              <option value="Deactivated">Deactivated (Locked Out)</option>
            </select>
          </div>
        </form>
      </FormDrawer>
    </div>
  )
}
