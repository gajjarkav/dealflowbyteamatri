"use client"
import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { useParams, useRouter } from "next/navigation"

export default function PlanDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    id: id as string,
    name: "Enterprise Cloud Subscription",
    billingCycle: "Monthly",
    price: 4999,
    features: "Unlimited API calls\n24/7 Support\nDedicated Account Manager",
    active: true
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast({ title: "Subscription Plan Updated", description: "SaaS plan saved.", type: "success" })
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
            <p className="text-sm text-text-secondary mt-1">{formData.billingCycle} Billing</p>
          </div>
        </div>
        <Button onClick={handleSave}>Save Plan</Button>
      </div>

      <Card className="p-6 border-border bg-surface">
        <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Plan Details</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Plan Name</label>
            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Base Price ($)</label>
              <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Billing Cycle</label>
              <select
                value={formData.billingCycle}
                onChange={e => setFormData({...formData, billingCycle: e.target.value})}
                className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Features Included (one per line)</label>
            <textarea 
              value={formData.features}
              onChange={e => setFormData({...formData, features: e.target.value})}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-accent outline-none min-h-[120px]"
            />
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="active" 
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <label htmlFor="active" className="text-sm">Available for new subscriptions</label>
          </div>
        </form>
      </Card>
    </div>
  )
}
