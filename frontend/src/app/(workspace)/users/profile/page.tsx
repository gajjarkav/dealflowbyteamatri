"use client"
import React, { useState } from "react"
import { useCurrentUser } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { apiChangePassword } from "@/lib/api/users"

export default function UserProfilePage() {
  const { user } = useCurrentUser()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", type: "error" })
      return
    }
    if (formData.newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", type: "error" })
      return
    }
    
    try {
      await apiChangePassword(formData.currentPassword, formData.newPassword)
      toast({ title: "Success", description: "Password updated successfully.", type: "success" })
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password."
      toast({ title: "Error", description: msg, type: "error" })
    }
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Your Profile</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your account settings and change your password.</p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Email Address</label>
            <div className="text-sm font-medium text-text-primary p-2 bg-background border border-border rounded">{user.email}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Assigned Role</label>
            <div className="mt-1 flex items-center gap-2"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-xs font-medium">{"role" in user ? (user as unknown as {role: string}).role : "Admin"}</span></div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Current Password</label>
            <Input 
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">New Password</label>
              <Input 
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Confirm New Password</label>
              <Input 
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <Button type="submit">Update Password</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
