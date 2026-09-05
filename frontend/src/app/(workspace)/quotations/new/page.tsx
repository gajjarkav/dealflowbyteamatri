"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { ArrowLeft, Save } from "lucide-react"
import { apiCreateQuotation } from "@/lib/api/quotations"
import { apiListCustomers, type CustomerResponse } from "@/lib/api/customers"
import { Skeleton } from "@/components/ui/skeleton"

export default function NewQuotationPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [customers, setCustomers] = useState<CustomerResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ customer_id: "", notes: "", promised_date: "" })

  useEffect(() => {
    apiListCustomers({ size: 100 })
      .then(res => setCustomers(res.items))
      .catch(() => toast({ title: "Error", description: "Failed to load customers", type: "error" }))
      .finally(() => setLoading(false))
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.customer_id) {
      toast({ title: "Validation", description: "Select a customer", type: "error" })
      return
    }
    setSaving(true)
    try {
      const q = await apiCreateQuotation({
        customer_id: formData.customer_id,
        notes: formData.notes || undefined,
        promised_date: formData.promised_date || undefined,
      })
      toast({ title: "Quotation Created", description: "Deal successfully created.", type: "success" })
      router.push(`/quotations/${q.id}`)
    } catch {
      toast({ title: "Error", description: "Failed to create deal", type: "error" })
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 border-b border-border/50 pb-6">
        <Link href="/pipeline" className="p-2 rounded-full hover:bg-surface-hover text-text-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight">
            New Deal
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-medium">
            Start a new quotation and deal process.
          </p>
        </div>
      </div>

      <Card className="premium-card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Customer <span className="text-accent">*</span></label>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              className="w-full h-11 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
              required
            >
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Initial context, deal terms, or special requirements..."
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm min-h-[100px]"
            />
          </div>
          
          <div className="space-y-1.5 max-w-sm">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Target Promised Date</label>
            <Input
              type="date"
              value={formData.promised_date}
              onChange={(e) => setFormData({ ...formData, promised_date: e.target.value })}
              className="h-11 bg-surface shadow-sm text-sm"
            />
          </div>

          <div className="pt-6 border-t border-border/50 flex justify-end gap-3">
            <Link href="/pipeline">
              <Button type="button" variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" disabled={saving} className="font-bold">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Creating..." : "Create Deal"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
