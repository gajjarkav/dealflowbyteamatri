"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function CustomerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const store = useDataStore()
  const { toast } = useToast()
  
  const customer = store.customers.find(c => c.id === id)
  const [formData, setFormData] = useState(customer || null)

  if (!customer || !formData) {
    return <div className="p-8">Customer not found. <Link href="/customers" className="text-accent">Go back</Link></div>
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    store.updateCustomer(customer.id, formData)
    toast({ title: "Customer Updated", description: "Changes saved successfully.", type: "success" })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/customers")} className="px-2">&larr; Back</Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {formData.name}
            </h1>
            <p className="text-sm text-text-secondary mt-1">{formData.industry} Sector</p>
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
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Industry</label>
                  <Input value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Tier</label>
                  <select
                    value={formData.tier}
                    onChange={e => setFormData({...formData, tier: e.target.value as "Bronze" | "Silver" | "Gold" | "Platinum"}) }
                    className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:border-accent outline-none"
                  >
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Account Manager ID</label>
                  <Input value={formData.accountManagerId} onChange={e => setFormData({...formData, accountManagerId: e.target.value})} />
                </div>
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
                <Badge className="mt-1" variant={formData.tier === 'Platinum' || formData.tier === 'Gold' ? 'default' : 'secondary'}>{formData.tier}</Badge>
              </div>
              <div>
                <div className="text-xs text-text-secondary">Lifetime Value</div>
                <div className="text-lg font-mono font-medium">${(45000).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
