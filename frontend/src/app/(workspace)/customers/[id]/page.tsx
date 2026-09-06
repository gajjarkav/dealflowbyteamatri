"use client"
import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { apiGetCustomer, apiUpdateCustomer, CustomerResponse, Tier } from "@/lib/api/customers"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentUser } from "@/lib/auth/context"

export default function CustomerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const { user } = useCurrentUser()
  const isAdmin = user && "role" in user && user.role === "admin"
  
  const [customer, setCustomer] = useState<CustomerResponse | null>(null)
  const [formData, setFormData] = useState<Partial<CustomerResponse>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (typeof id !== "string") return
    apiGetCustomer(id)
      .then((data) => {
        setCustomer(data)
        setFormData(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8"><Skeleton className="h-48 w-full" /></div>
  if (error || !customer) {
    return <div className="p-8">Customer not found. <Link href="/customers" className="text-accent">Go back</Link></div>
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof id !== "string") return
    try {
      const updated = await apiUpdateCustomer(id, {
        company_name: formData.company_name,
        tier: formData.tier,
        currency: formData.currency,
        billing_address: formData.billing_address,
        tax_id: formData.tax_id
      })
      setCustomer(updated)
      setFormData(updated)
      toast({ title: "Customer Updated", description: "Changes saved successfully.", type: "success" })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update"
      toast({ title: "Error", description: msg, type: "error" })
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/customers")} className="px-2">&larr; Back</Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {formData.company_name}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Tier: <span className="capitalize">{formData.tier}</span>
            </p>
          </div>
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-border bg-surface">
            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Profile Information</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Company Name</label>
                  <Input value={formData.company_name || ""} onChange={e => setFormData({...formData, company_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Currency</label>
                  <Input value={formData.currency || ""} onChange={e => setFormData({...formData, currency: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Tier</label>
                  {isAdmin ? (
                    <select
                      value={formData.tier || "bronze"}
                      onChange={e => setFormData({...formData, tier: e.target.value as Tier}) }
                      className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
                    >
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  ) : (
                    <div className="w-full h-9 rounded-md border border-border bg-surface px-3 py-1 text-sm capitalize flex items-center text-text-muted cursor-not-allowed">
                      {formData.tier || "bronze"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Tax ID</label>
                  <Input value={formData.tax_id || ""} onChange={e => setFormData({...formData, tax_id: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Billing Address</label>
                <Input value={formData.billing_address || ""} onChange={e => setFormData({...formData, billing_address: e.target.value})} />
              </div>
            </form>
          </Card>
          
          <Card className="p-6 border-border bg-surface">
            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Recent Quotations</h2>
            <div className="text-sm text-text-secondary py-4 text-center">
              Fetching associated quotations...
            </div>
            <Button variant="secondary" className="w-full">Create New Quotation</Button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-border bg-surface">
            <h3 className="text-sm font-semibold mb-4 text-text-primary uppercase tracking-wider">Account Health</h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-text-secondary">Current Tier</div>
                <Badge className="mt-1 capitalize" variant={formData.tier === 'platinum' || formData.tier === 'gold' ? 'default' : 'secondary'}>{formData.tier}</Badge>
              </div>
              <div>
                <div className="text-xs text-text-secondary">Customer Since</div>
                <div className="text-sm font-medium">{new Date(customer.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
