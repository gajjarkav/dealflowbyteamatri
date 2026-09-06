"use client";
import { useState } from "react";
import { KeyRound, Loader2, ShieldCheck, User as UserIcon } from "lucide-react";

import { BentoCard, BentoHeader, PageHeader } from "@/components/bento/bento";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { useCurrentUser } from "@/lib/auth/context";
import { apiChangePassword } from "@/lib/api/users";

export default function ProfilePage() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [twoFactor, setTwoFactor] = useState(false);

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "DF";

  const roleLabel = user?.role === "admin" ? "Administrator"
    : user?.role === "sales_manager" ? "Sales Manager"
    : user?.role === "finance" ? "Finance"
    : user?.role === "sales_rep" ? "Sales Representative"
    : user?.role === "customer" ? "Customer"
    : "User";

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    if (passwords.next.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", type: "error" });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast({ title: "Error", description: "New passwords do not match.", type: "error" });
      return;
    }
    setSaving(true);
    try {
      await apiChangePassword(passwords.current, passwords.next);
      setPasswords({ current: "", next: "", confirm: "" });
      toast({ title: "Password Updated", description: "Your password has been changed successfully.", type: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not change the password";
      toast({ title: "Error", description: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile & Security"
        description="Your identity and security settings across the DealFlow360 platform."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5 mt-6">
        {/* Profile Card */}
        <BentoCard className="lg:col-span-2">
          <BentoHeader title="Personal Information" subtitle="Your account details" icon={UserIcon} />
          
          <div className="flex items-center gap-4 mb-6">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20 font-heading text-xl font-bold text-accent">
              {initials}
            </span>
            <div>
              <p className="text-lg font-heading font-bold text-text-primary">{user.full_name}</p>
              <p className="text-sm text-text-secondary">{user.email}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Full Name</Label>
              <div className="h-10 rounded-lg border border-border bg-surface px-3 flex items-center text-sm font-medium text-text-primary">
                {user.full_name}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email Address</Label>
              <div className="h-10 rounded-lg border border-border bg-surface px-3 flex items-center text-sm font-medium text-text-primary">
                {user.email}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Platform Role</Label>
              <div className="h-10 rounded-lg border border-border bg-surface px-3 flex items-center text-sm">
                <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider border border-accent/20">
                  {roleLabel}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Mobile Number</Label>
              <div className="h-10 rounded-lg border border-border bg-surface px-3 flex items-center text-sm font-medium text-text-primary">
                {user.mobile_number || "Not set"}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email Verified</Label>
              <div className="h-10 rounded-lg border border-border bg-surface px-3 flex items-center text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                  user.is_email_verified 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}>
                  {user.is_email_verified ? "✓ Verified" : "Pending"}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Account Status</Label>
              <div className="h-10 rounded-lg border border-border bg-surface px-3 flex items-center text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                  user.is_active 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                }`}>
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Right Column */}
        <div className="flex flex-col gap-4 lg:gap-5">
          {/* 2FA Card */}
          <BentoCard tint="honey" delay={0.05}>
            <BentoHeader title="Two-Factor Auth" subtitle="Extra layer of security" icon={ShieldCheck} />
            <div className="flex items-center justify-between rounded-xl bg-surface/70 border border-border p-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Email-based 2FA</p>
                <p className="text-xs text-text-secondary">{twoFactor ? "Enabled — codes via email" : "Not configured"}</p>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>
          </BentoCard>

          {/* Password Card */}
          <BentoCard delay={0.1}>
            <BentoHeader title="Change Password" subtitle="Rotate regularly for security" icon={KeyRound} />
            <form onSubmit={changePassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="current" className="text-xs font-bold text-text-secondary uppercase tracking-wider">Current Password</Label>
                <Input
                  id="current"
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                  className="bg-surface border-border"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="next" className="text-xs font-bold text-text-secondary uppercase tracking-wider">New Password</Label>
                <Input
                  id="next"
                  type="password"
                  value={passwords.next}
                  onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                  className="bg-surface border-border"
                  placeholder="Min. 6 characters"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-xs font-bold text-text-secondary uppercase tracking-wider">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                  className="bg-surface border-border"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full font-bold shadow-sm" disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </form>
          </BentoCard>
        </div>
      </div>
    </>
  );
}
