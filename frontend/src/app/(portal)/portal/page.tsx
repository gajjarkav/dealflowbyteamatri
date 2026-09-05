"use client"
import React, { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { apiGetPortalMe, PortalMeResponse } from "@/lib/api/portal"
import { Skeleton } from "@/components/ui/skeleton"

export default function CustomerPortalPage() {
  const [portalData, setPortalData] = useState<PortalMeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    apiGetPortalMe()
      .then(setPortalData)
      .catch((err) => setError(err.message || "Failed to load portal data"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !portalData) {
    return (
      <Card className="p-8 text-center text-danger border-danger/20 bg-danger-soft">
        <p>{error || "Unable to load portal."}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Welcome, {portalData.full_name}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            <strong className="text-text-primary">{portalData.customer_name || "Company"}</strong> Portal
          </p>
        </div>
      </div>

      <Card className="p-8 border-border bg-surface text-center">
        <h2 className="text-lg font-semibold text-text-primary mb-2">No Active Quotations</h2>
        <p className="text-sm text-text-secondary">
          There are currently no active quotations or documents available for your review.
          <br />
          If you are expecting a quotation, please contact your account executive.
        </p>
      </Card>
    </div>
  )
}
