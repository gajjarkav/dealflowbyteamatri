"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { apiListSettings, apiUpdateSetting, type AppSettingResponse } from "@/lib/api/discount"
import { apiChangePassword } from "@/lib/api/users"
import { useCurrentUser } from "@/lib/auth/context"

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
      toast({ title: "Settings Saved" })
      load()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed"
      toast({ title: "Error", description: msg, type: "error" })
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
      toast({ title: "Password Changed" })
      setPwdForm({ old_password: "", new_password: "", confirm: "" })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Change failed"
      toast({ title: "Error", description: msg, type: "error" })
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Platform Settings</h1>
        <p className="text-sm text-text-secondary mt-1">
          System-wide configuration, security, and user preferences.
        </p>
      </div>

      {/* My Profile */}
      <Card className="p-6 border-border bg-surface space-y-4">
        <h2 className="text-base font-semibold text-text-primary">My Profile</h2>
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-text-secondary mb-1">Full Name</div>
              <div className="font-medium text-text-primary">{user.full_name}</div>
            </div>
            <div>
              <div className="text-xs text-text-secondary mb-1">Email</div>
              <div className="font-medium text-text-primary">{user.email}</div>
            </div>
            <div>
              <div className="text-xs text-text-secondary mb-1">Role</div>
              <div className="font-medium text-text-primary capitalize">{user.role.replace(/_/g, " ")}</div>
            </div>
          </div>
        )}
      </Card>

      {/* Change Password */}
      <Card className="p-6 border-border bg-surface space-y-4">
        <h2 className="text-base font-semibold text-text-primary">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Current Password</label>
            <Input
              type="password"
              value={pwdForm.old_password}
              onChange={(e) => setPwdForm({ ...pwdForm, old_password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">New Password</label>
            <Input
              type="password"
              value={pwdForm.new_password}
              onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })}
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Confirm New Password</label>
            <Input
              type="password"
              value={pwdForm.confirm}
              onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" disabled={savingPwd}>
            {savingPwd ? "Updating…" : "Change Password"}
          </Button>
        </form>
      </Card>

      {/* App Settings */}
      {(user?.role === "admin") && (
        <Card className="p-6 border-border bg-surface space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-primary">System Configuration</h2>
              <p className="text-xs text-text-secondary mt-0.5">Global platform settings (Admin only)</p>
            </div>
            <Button onClick={saveSettings} disabled={savingSettings || loading}>
              {savingSettings ? "Saving…" : "Save All Settings"}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-text-muted text-sm">Loading settings…</div>
          ) : settings.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm">No configurable settings found.</div>
          ) : (
            <div className="space-y-4">
              {settings.map((s) => (
                <div key={s.key} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center p-3 border border-border rounded bg-background">
                  <div>
                    <div className="font-mono text-xs font-bold text-text-primary">{s.key}</div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      Last updated: {new Date(s.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      value={editedSettings[s.key] ?? ""}
                      onChange={(e) => setEditedSettings({ ...editedSettings, [s.key]: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
