"use client"
import React, { useState } from "react"
import { useDataStore } from "@/lib/data/useDataStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"

export default function CustomerPortalPage() {
  const store = useDataStore()
  const { toast } = useToast()

  const [counterDiscount, setCounterDiscount] = useState(15)
  const [accepted, setAccepted] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  // Target quotation for customer review
  const quotation = store.quotations.find((q) => q.dealRef === "Q-1042") || store.quotations[0]

  const basePrice = quotation.totalAmount / (1 - quotation.discountPercent / 100)
  const counterPrice = basePrice * (1 - counterDiscount / 100)

  const handleAccept = () => {
    store.updateQuotationStage(quotation.id, "Accepted")
    setAccepted(true)
    toast({
      title: "Quotation Accepted!",
      description: "Agreement locked. Invoicing and fulfillment dispatch initiated.",
      type: "success"
    })
  }

  const handleSendCounterOffer = () => {
    store.updateQuotationStage(quotation.id, "Customer Review")
    toast({
      title: "Counter-Offer Submitted",
      description: `Counter-offer at ${counterDiscount}% discount (${counterPrice.toLocaleString()}) transmitted to your account executive.`,
      type: "info"
    })
  }

  const handleExecutePayment = () => {
    setPaymentModalOpen(false)
    toast({
      title: "Payment Authorization Successful",
      description: "Downpayment settled via corporate wire protocol. Hardware allocation locked.",
      type: "success"
    })
  }

  return (
    <div className="space-y-8">
      {/* Quotation Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-accent px-2 py-0.5 rounded bg-accent/10">
              OFFICIAL QUOTATION
            </span>
            <span className="font-mono text-xs text-text-muted">{quotation.dealRef}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            {quotation.title}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Prepared for <strong className="text-text-primary">{quotation.customerName}</strong> by Account Executive {quotation.repName}
          </p>
        </div>

        <Badge
          variant="secondary"
          className={`font-mono text-xs py-1 px-3 ${
            accepted || quotation.stage === "Accepted"
              ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/5"
              : "border-accent text-accent bg-accent/5"
          }`}
        >
          {accepted || quotation.stage === "Accepted" ? "ACCEPTED & LOCKED" : "ACTIVE FOR REVIEW"}
        </Badge>
      </div>

      {/* Main Quotation Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Line Items List */}
        <Card className="p-6 border-border bg-surface lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-text-primary">Quotation Line Items & SLA</h2>

          <div className="border border-border rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-background/80 border-b border-border font-mono text-text-secondary">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit List</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="p-3">
                    <div className="font-semibold text-text-primary">NVIDIA H100 SXM5 80GB Node</div>
                    <div className="text-[11px] text-text-muted font-mono">SKU: HW-GPU-H100 &bull; 3-Year Enterprise Care Pack</div>
                  </td>
                  <td className="p-3 text-center font-mono">1</td>
                  <td className="p-3 text-right font-mono text-text-secondary">$34,500</td>
                  <td className="p-3 text-right font-mono font-bold text-text-primary">$34,500</td>
                </tr>
                <tr>
                  <td className="p-3">
                    <div className="font-semibold text-text-primary">Dedicated Solutions Architect Sprint (160h)</div>
                    <div className="text-[11px] text-text-muted font-mono">SKU: SRV-ARCH-247 &bull; Cluster Deployment & Tuning</div>
                  </td>
                  <td className="p-3 text-center font-mono">1</td>
                  <td className="p-3 text-right font-mono text-text-secondary">$24,000</td>
                  <td className="p-3 text-right font-mono font-bold text-text-primary">$24,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 pt-3 border-t border-border font-mono text-xs max-w-sm ml-auto">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal List:</span>
              <span>${basePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-accent font-semibold">
              <span>Tier Discount Applied ({quotation.discountPercent}%):</span>
              <span>-${(basePrice - quotation.totalAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-border">
              <span>Quoted Net Amount:</span>
              <span className="text-base text-accent">${quotation.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Right: Negotiation & Action Desk */}
        <Card className="p-6 border-border bg-surface flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-1">Commercial Action Desk</h2>
            <p className="text-xs text-text-secondary mb-4">
              Accept quoted terms or submit a calibrated counter-proposal.
            </p>

            {/* Counter-Offer Slider */}
            {!accepted && quotation.stage !== "Accepted" && (
              <div className="p-4 bg-background border border-border rounded-md space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text-primary">Counter-Offer Request</span>
                  <span className="font-mono font-bold text-accent">{counterDiscount}% Discount</span>
                </div>

                <input
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={counterDiscount}
                  onChange={(e) => setCounterDiscount(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-text-muted font-mono">
                  <span>5% (Floor)</span>
                  <span>Calculated: ${counterPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  <span>25% (Max)</span>
                </div>

                <Button
                  variant="secondary"
                  className="w-full text-xs mt-2"
                  onClick={handleSendCounterOffer}
                >
                  Send Counter-Offer (${counterPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })})
                </Button>
              </div>
            )}

            {/* Terms Summary */}
            <div className="space-y-2 text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="text-accent">&#10003;</span>
                <span>Valid until {quotation.expiryDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">&#10003;</span>
                <span>Net-30 Invoicing with ACH & Wire Support</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">&#10003;</span>
                <span>Hardware stock held in reserve for 14 days</span>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-2 pt-4 border-t border-border">
            {accepted || quotation.stage === "Accepted" ? (
              <Button
                variant="primary"
                className="w-full py-3 text-sm"
                onClick={() => setPaymentModalOpen(true)}
              >
                Proceed to Payment & Downpayment &rarr;
              </Button>
            ) : (
              <Button
                variant="primary"
                className="w-full py-3 text-sm"
                onClick={handleAccept}
              >
                Accept Quotation as Written (${quotation.totalAmount.toLocaleString()})
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Payment Settlement Modal */}
      <Dialog
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Payment & Wire Settlement"
        subtitle={`Quotation ${quotation.dealRef} // Total: $${quotation.totalAmount.toLocaleString()}`}
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExecutePayment}>
              Authorize Wire Deposit
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs font-mono">
          <div className="p-3 bg-background border border-border rounded space-y-2">
            <div className="text-text-secondary">Wire Routing Instructions:</div>
            <div className="text-text-primary font-bold">DEALFLOW ESCROW BANK NA</div>
            <div className="text-text-muted text-[11px]">Routing: 021000021 &bull; Account: 8820-1928-3921</div>
          </div>
          <p className="text-text-secondary font-sans text-xs">
            Authorizing will log the transaction against Odoo Invoicing schedule and notify your account manager.
          </p>
        </div>
      </Dialog>
    </div>
  )
}
