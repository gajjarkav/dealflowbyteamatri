"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"
import { ArrowRight, CheckCircle2, ChevronLeft, PackagePlus, Percent, UserSearch } from "lucide-react"

const steps = [
  { id: 1, title: "Customer Info", icon: <UserSearch className="w-5 h-5" /> },
  { id: 2, title: "Products & Pricing", icon: <PackagePlus className="w-5 h-5" /> },
  { id: 3, title: "Review & Submit", icon: <CheckCircle2 className="w-5 h-5" /> }
]

export default function NewQuotationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form State
  const [customer, setCustomer] = useState("")
  const [products, setProducts] = useState([{ name: "", qty: 1, price: 0 }])
  const [discount, setDiscount] = useState(0)

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
    else router.push("/dashboard")
  }

  const handleSubmit = () => {
    toast({
      title: "Quotation Created",
      description: "The quotation has been generated and sent for approval.",
      type: "success"
    })
    router.push("/dashboard")
  }

  const addProduct = () => {
    setProducts([...products, { name: "", qty: 1, price: 0 }])
  }

  const subtotal = products.reduce((acc, p) => acc + (p.qty * p.price), 0)
  const total = subtotal * (1 - discount / 100)

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack} className="p-2 -ml-2 hover:bg-surface-hover">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight">New Quotation</h1>
          <p className="text-text-secondary text-sm font-medium mt-1">Configure deal specifics and run margin checks.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="relative flex items-center justify-between before:absolute before:inset-0 before:top-1/2 before:-translate-y-1/2 before:h-0.5 before:bg-border before:-z-10">
        {steps.map((step) => {
          const isActive = step.id === currentStep
          const isPast = step.id < currentStep
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-4 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                isActive ? "bg-accent text-white shadow-glow" :
                isPast ? "bg-text-primary text-white" : "bg-surface-hover text-text-muted border border-border"
              }`}>
                {step.icon}
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? "text-accent" : isPast ? "text-text-primary" : "text-text-muted"}`}>
                {step.title}
              </span>
            </div>
          )
        })}
      </div>

      <Card className="premium-card p-6 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-xl font-heading font-bold">Select Customer</h2>
              <div className="grid gap-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Search Client</label>
                  <Select
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                  >
                    <option value="">Select a customer...</option>
                    <option value="acme">Acme Corp (Platinum)</option>
                    <option value="globex">Globex Inc (Gold)</option>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-heading font-bold">Line Items & Pricing</h2>
                <Button variant="secondary" onClick={addProduct} className="text-xs h-8"><PackagePlus className="w-4 h-4 mr-2" /> Add Item</Button>
              </div>
              
              <div className="space-y-4">
                {products.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-4 p-4 border border-border rounded-xl bg-surface-hover items-end">
                    <div className="col-span-12 sm:col-span-6">
                      <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">Product</label>
                      <Input value={p.name} onChange={(e) => {
                        const newP = [...products]; newP[idx].name = e.target.value; setProducts(newP);
                      }} placeholder="e.g. Enterprise License" />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">Qty</label>
                      <Input type="number" min="1" value={p.qty} onChange={(e) => {
                        const newP = [...products]; newP[idx].qty = parseInt(e.target.value) || 0; setProducts(newP);
                      }} />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">Unit Price ($)</label>
                      <Input type="number" value={p.price} onChange={(e) => {
                        const newP = [...products]; newP[idx].price = parseFloat(e.target.value) || 0; setProducts(newP);
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">Global Discount (%)</label>
                <div className="flex items-center gap-4 max-w-xs">
                  <Input type="number" min="0" max="100" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
                  <Percent className="w-5 h-5 text-text-muted" />
                </div>
                {discount > 20 && (
                  <div className="mt-2 text-xs font-bold text-amber-500 flex items-center gap-1 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
                    Warning: Discount exceeds 20%. Will require Manager Approval.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-xl font-heading font-bold">Review Quotation</h2>
              <div className="grid grid-cols-2 gap-6 bg-surface-hover p-6 rounded-xl border border-border">
                <div>
                  <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-1">Customer</p>
                  <p className="font-semibold text-lg">{customer ? (customer === "acme" ? "Acme Corp" : "Globex Inc") : "Not selected"}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-1">Status</p>
                  <Badge variant="secondary" className="border-accent text-accent bg-accent-soft/30">Draft</Badge>
                </div>
              </div>

              <div className="bg-surface rounded-xl border border-border p-6">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
                  <span className="font-medium text-text-secondary">Subtotal</span>
                  <span className="font-mono font-bold">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
                  <span className="font-medium text-text-secondary">Discount ({discount}%)</span>
                  <span className="font-mono font-bold text-red-500">-${(subtotal - total).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-heading font-extrabold text-text-primary">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-8 pt-6 border-t border-border flex justify-end gap-3">
          {currentStep < 3 ? (
            <Button onClick={handleNext} className="bg-text-primary text-white hover:bg-text-secondary font-bold shadow-md">
              Next Step <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-accent text-white hover:bg-accent-hover font-bold shadow-glow">
              Submit Quotation <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
