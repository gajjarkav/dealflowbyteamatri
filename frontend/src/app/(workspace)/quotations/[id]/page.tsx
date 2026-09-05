"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { useParams, useRouter } from "next/navigation"

export default function QuotationBuilderPage() {
  const { id } = useParams()
  const router = useRouter()
  const store = useDataStore()
  const { toast } = useToast()
  
  const quotation = store.quotations.find(q => q.id === id)
  const customer = quotation ? store.customers.find(c => c.id === quotation.customerId) : null
  const [formData] = useState(quotation || null)

  const [activeTab, setActiveTab] = useState<"builder" | "risk" | "suggestions" | "history">("builder")

  if (!quotation || !formData || !customer) {
    return <div className="p-8">Quotation not found. <Button variant="ghost" onClick={() => router.push("/pipeline")}>Go back</Button></div>
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    store.updateQuotation(quotation.id, formData)
    toast({ title: "Quotation Updated", description: "Draft saved.", type: "success" })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/pipeline")} className="px-2">&larr; Back</Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-3">
              Quote {formData.id.split("-")[0].toUpperCase()}
              <Badge className="text-xs">{formData.status}</Badge>
            </h1>
            <p className="text-sm text-text-secondary mt-1">For <span className="font-semibold text-text-primary">{customer.name}</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleSave}>Save Draft</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Send for Approval</Button>
        </div>
      </div>

      <div className="flex border-b border-border">
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'builder' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          onClick={() => setActiveTab('builder')}
        >Line Items</button>
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'risk' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          onClick={() => setActiveTab('risk')}
        >Risk Assessment</button>
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'suggestions' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          onClick={() => setActiveTab('suggestions')}
        >Smart Suggestions ✨</button>
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'history' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          onClick={() => setActiveTab('history')}
        >Audit History</button>
      </div>

      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 border-border bg-surface">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                <h2 className="text-lg font-semibold text-text-primary">Products & Services</h2>
                <Button variant="secondary" className="h-8 text-xs">+ Add Item</Button>
              </div>
              <div className="space-y-4">
                {formData.items.map((item, i) => {
                  const product = store.products.find(p => p.id === item.productId)
                  return (
                    <div key={i} className="flex items-center justify-between p-3 border border-border rounded bg-background">
                      <div className="flex-1">
                        <div className="font-medium text-text-primary text-sm">{product?.name || "Unknown"}</div>
                        <div className="text-xs text-text-secondary">List: ${product?.sellPrice} &bull; Disc: {item.discountPercent}%</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-16">
                          <label className="text-[10px] text-text-muted">Qty</label>
                          <Input type="number" className="h-7 text-xs" value={item.quantity} readOnly />
                        </div>
                        <div className="text-right w-24">
                          <div className="text-[10px] text-text-muted">Ext. Price</div>
                          <div className="font-mono text-sm font-medium">${item.finalPrice * item.quantity}</div>
                        </div>
                        <Button variant="ghost" className="h-7 px-2 text-danger hover:text-danger text-xs">Remove</Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-border bg-surface">
              <h3 className="text-sm font-semibold mb-4 text-text-primary uppercase tracking-wider">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>${formData.totalValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Discount</span>
                  <span className="text-emerald-600">-${(formData.totalValue * 0.1).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-2">
                  <span>Total</span>
                  <span>${(formData.totalValue * 0.9).toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <div className="text-xs text-text-secondary mb-1">Blended Margin</div>
                <div className="text-lg font-mono font-medium text-amber-600">32.4%</div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <Card className="p-6 border-border bg-surface">
          <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Deal Risk Assessment</h2>
          <div className="space-y-6">
            <div className="p-4 rounded-md border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-2 text-amber-600 font-semibold mb-1">
                <span>⚠️</span> Margin Degradation Warning
              </div>
              <p className="text-sm text-text-secondary">The blended margin of 32.4% falls below the recommended floor of 35% for {customer.tier} tier clients.</p>
            </div>
            <div className="p-4 rounded-md border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold mb-1">
                <span>✅</span> Stock Availability
              </div>
              <p className="text-sm text-text-secondary">All hardware items are fully allocated from Warehouse A. No supply chain delays detected.</p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'suggestions' && (
        <Card className="p-6 border-border bg-surface">
          <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">AI Upsell & Cross-sell</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded bg-background">
              <div>
                <div className="font-medium text-text-primary">Premium 24/7 Support Care Pack</div>
                <p className="text-sm text-text-secondary mt-1">Historically, 85% of customers buying Hardware nodes also buy support packs.</p>
              </div>
              <Button size="sm" variant="secondary" className="text-accent border-accent text-xs">Add to Quote</Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded bg-background">
              <div>
                <div className="font-medium text-text-primary">Implementation Services (100 hrs)</div>
                <p className="text-sm text-text-secondary mt-1">Recommended for {customer.tier} accounts to ensure smooth deployment.</p>
              </div>
              <Button size="sm" variant="secondary" className="text-accent border-accent text-xs">Add to Quote</Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card className="p-6 border-border bg-surface">
          <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Audit Timeline</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
             <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-surface shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                   <div className="w-2 h-2 rounded-full bg-accent"></div>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-border bg-background">
                   <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-text-primary text-sm">Quote Created</div>
                      <time className="text-xs font-mono text-text-muted">Today, 10:00 AM</time>
                   </div>
                   <div className="text-sm text-text-secondary">Draft created by Sales Rep.</div>
                </div>
             </div>
          </div>
        </Card>
      )}
    </div>
  )
}
