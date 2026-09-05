"use client"
import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { useParams, useRouter } from "next/navigation"
import { apiGetPlan, apiUpdatePlan, PlanResponse } from "@/lib/api/subscriptions"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function PlanDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<Partial<PlanResponse>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (typeof id !== "string") return
    apiGetPlan(id)
      .then(res => setFormData(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8"><Skeleton className="h-48 w-full" /></div>
  if (error || !formData.id) return <div className="p-8">Plan not found. <Link href="/plans" className="text-accent">Go back</Link></div>

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof id !== "string") return
    try {
      const updated = await apiUpdatePlan(id, {
        name: formData.name,
        description: formData.description || undefined,
        price: formData.price,
        currency: formData.currency,
        billing_interval: formData.billing_interval,
        is_active: formData.is_active
      })
      setFormData(updated)
      toast({ title: "Subscription Plan Updated", type: "success" })
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Error", type: "error" })
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/plans")} className="px-2">&larr; Back</Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {formData.name}
            </h1>
            <p className="text-sm text-text-secondary mt-1 capitalize">{formData.billing_interval?.replace("_", " ")} Billing</p>
          </div>
        </div>
        <Button onClick={handleSave}>Save Plan</Button>
      </div>

      <Card className="p-6 border-border bg-surface">
        <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Plan Details</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Plan Name</label>
            <Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Base Price</label>
              <Input type="number" value={formData.price ?? ""} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Currency</label>
              <select
                value={formData.currency || "USD"}
                onChange={e => setFormData({...formData, currency: e.target.value})}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Billing Cycle</label>
              <select
                value={formData.billing_interval || "monthly"}
                onChange={e => setFormData({...formData, billing_interval: e.target.value as "monthly" | "yearly" | "one_time"})}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Annually</option>
                <option value="one_time">One Time</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Description (Features)</label>
            <textarea 
              value={formData.description || ""}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-accent outline-none min-h-[120px]"
            />
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="is_active" 
              checked={formData.is_active || false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <label htmlFor="is_active" className="text-sm">Available for new subscriptions</label>
          </div>
        </form>
      </Card>
    </div>
  )
}
