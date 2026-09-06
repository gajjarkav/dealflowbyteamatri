"use client";
import React, { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { ShieldCheck, Lock, Sliders, User as UserIcon, Save, KeyRound, AlertCircle } from "lucide-react"
import { apiListSettings, apiUpdateSetting, type AppSettingResponse } from "@/lib/api/discount"
import { apiChangePassword } from "@/lib/api/users"
import { useCurrentUser } from "@/lib/auth/context"

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
}

export default function SettingsPage() {
  const { toast } = useToast()
  const { user } = useCurrentUser()
  const [settings, setSettings] = useState<AppSettingResponse[]>([])
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [pwdForm, setPwdForm] = useState({ old_password: "", new_password: "", confirm: "" })
  const [savingPwd, setSavingPwd] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiListSettings()
      setSettings(res)
      const map: Record<string, string> = {}
      res.forEach((s) => { map[s.key] = s.value })
      setEditedSettings(map)
    } catch {
      toast({ title: "Error", description: "Failed to load settings", type: "error" })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const saveSettings = async () => {
    setSavingSettings(true)
    try {
      await Promise.all(
        settings.map((s) =>
          editedSettings[s.key] !== s.value
            ? apiUpdateSetting(s.key, editedSettings[s.key])
            : Promise.resolve()
        )
      )
      toast({ title: "Settings Saved", description: "System configuration updated successfully." })
      load()
    } catch {
      toast({ title: "Error", description: "Save failed", type: "error" })
    } finally {
      setSavingSettings(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwdForm.new_password.length < 8) {
      toast({ title: "Password too short", description: "Min. 8 characters", type: "error" })
      return
    }
    if (pwdForm.new_password !== pwdForm.confirm) {
      toast({ title: "Passwords don't match", type: "error" })
      return
    }
    setSavingPwd(true)
    try {
      await apiChangePassword(pwdForm.old_password, pwdForm.new_password)
      toast({ title: "Password Changed", description: "Your password has been successfully updated." })
      setPwdForm({ old_password: "", new_password: "", confirm: "" })
    } catch {
      toast({ title: "Error", description: "Change failed", type: "error" })
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-[1000px] mx-auto pb-12">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="border-b border-border/50 pb-6">
        <h1 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight">
          Platform Settings
        </h1>
        <p className="text-sm text-text-secondary mt-1 font-medium">
          System-wide configuration, security options, and user preferences.
        </p>
      </motion.div>

      {/* My Profile */}
      <motion.div variants={itemVariants}>
        <Card className="premium-card overflow-hidden">
          <div className="p-6 border-b border-border bg-surface flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <UserIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-text-primary">My Profile</h2>
              <p className="text-xs font-medium text-text-secondary">Your personal account details</p>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            {user ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-background p-4 rounded-xl border border-border">
                  <div className="text-[10px] font-heading font-bold text-text-secondary uppercase tracking-widest mb-1">Full Name</div>
                  <div className="font-bold text-text-primary text-base">{user.full_name}</div>
                </div>
                <div className="bg-background p-4 rounded-xl border border-border">
                  <div className="text-[10px] font-heading font-bold text-text-secondary uppercase tracking-widest mb-1">Email Address</div>
                  <div className="font-bold text-text-primary text-base truncate">{user.email}</div>
                </div>
                <div className="bg-background p-4 rounded-xl border border-border">
                  <div className="text-[10px] font-heading font-bold text-text-secondary uppercase tracking-widest mb-1">Account Role</div>
                  <div>
                    <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {user.role.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-text-muted text-sm font-medium">Loading profile...</div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Change Password */}
      <motion.div variants={itemVariants}>
        <Card className="premium-card overflow-hidden">
          <div className="p-6 border-b border-border bg-surface flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-text-primary">Change Password</h2>
              <p className="text-xs font-medium text-text-secondary">Update your account access credentials</p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={changePassword} className="max-w-md space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Current Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    value={pwdForm.old_password}
                    onChange={(e) => setPwdForm({ ...pwdForm, old_password: e.target.value })}
                    placeholder="••••••••"
                    className="h-11 bg-background shadow-sm pl-10"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    value={pwdForm.new_password}
                    onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })}
                    placeholder="Min. 8 characters"
                    className="h-11 bg-background shadow-sm pl-10"
                    required
                    minLength={8}
                  />
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    value={pwdForm.confirm}
                    onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                    placeholder="••••••••"
                    className="h-11 bg-background shadow-sm pl-10"
                    required
                    minLength={8}
                  />
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                </div>
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={savingPwd || !pwdForm.old_password || !pwdForm.new_password} className="font-bold shadow-md w-full sm:w-auto">
                  {savingPwd ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </motion.div>

      {/* App Settings */}
      {(user?.role === "admin") && (
        <motion.div variants={itemVariants}>
          <Card className="premium-card overflow-hidden">
            <div className="p-6 border-b border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Sliders className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold text-text-primary">System Configuration</h2>
                  <p className="text-xs font-medium text-text-secondary">Global platform variables and limits</p>
                </div>
              </div>
              <Button onClick={saveSettings} disabled={savingSettings || loading} variant="secondary" className="font-bold border border-border shadow-sm">
                <Save className="w-4 h-4 mr-2" />
                {savingSettings ? "Saving..." : "Save All Settings"}
              </Button>
            </div>

            <div className="p-6 md:p-8">
              {loading ? (
                <div className="text-center py-12 text-text-muted font-medium bg-surface/30 rounded-xl border border-dashed border-border">Loading settings...</div>
              ) : settings.length === 0 ? (
                <div className="text-center py-12 text-text-muted font-medium bg-surface/30 rounded-xl border border-dashed border-border">
                  No configurable global settings found.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-800">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-sm font-medium">
                      <strong>Admin Warning:</strong> Changes to these global configuration variables may immediately affect all users and operational limits across the platform.
                    </div>
                  </div>
                  
                  {settings.map((s) => (
                    <div key={s.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start md:items-center p-5 border border-border rounded-xl bg-background hover:border-accent/40 transition-colors">
                      <div className="md:col-span-1">
                        <div className="font-mono text-sm font-bold text-text-primary tracking-tight">{s.key}</div>
                        <div className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-bold">
                          Updated: {new Date(s.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          value={editedSettings[s.key] ?? ""}
                          onChange={(e) => setEditedSettings({ ...editedSettings, [s.key]: e.target.value })}
                          className="font-mono text-sm shadow-sm h-11 bg-surface focus:bg-background transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
