import Link from "next/link"
import { Playfair_Display } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const playfair = Playfair_Display({ subsets: ["latin"] })

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-between p-6 md:p-12">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-border pb-6 max-w-6xl mx-auto w-full">
        <Link href="/" className="text-xl font-bold tracking-tight">
          DealFlow<span className="text-accent">360</span>
        </Link>
        <span className="font-mono text-xs text-text-muted border border-border px-2.5 py-1 rounded bg-surface">
          STATUS: 404_ROUTE_NOT_FOUND
        </span>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full my-auto py-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/5 text-accent text-xs font-mono font-medium mb-6 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-accent" />
          SIGNAL LOST // OFF-RADAR
        </div>

        <h1 className={`${playfair.className} text-5xl md:text-7xl font-bold tracking-tight text-text-primary mb-4`}>
          Deal Path <span className="text-accent italic">Uncharted</span>
        </h1>

        <p className="text-text-secondary text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          The requested resource, quotation revision, or workflow coordinate does not exist or has been relocated to another ledger.
        </p>

        {/* Quick Route Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10 text-left">
          <Link href="/dashboard" className="group">
            <Card className="p-4 h-full border-border hover:border-accent/60 transition-all bg-surface hover:bg-surface/80">
              <div className="font-mono text-xs text-accent mb-1 group-hover:translate-x-0.5 transition-transform">01 // COMMAND</div>
              <div className="font-semibold text-sm text-text-primary mb-1">Sales Dashboard</div>
              <div className="text-xs text-text-muted">Return to operational overview and fast metrics.</div>
            </Card>
          </Link>

          <Link href="/pipeline" className="group">
            <Card className="p-4 h-full border-border hover:border-accent/60 transition-all bg-surface hover:bg-surface/80">
              <div className="font-mono text-xs text-accent mb-1 group-hover:translate-x-0.5 transition-transform">02 // PIPELINE</div>
              <div className="font-semibold text-sm text-text-primary mb-1">Active Quotations</div>
              <div className="text-xs text-text-muted">View kanban stages, approvals, and deal values.</div>
            </Card>
          </Link>

          <Link href="/portal" className="group">
            <Card className="p-4 h-full border-border hover:border-accent/60 transition-all bg-surface hover:bg-surface/80">
              <div className="font-mono text-xs text-accent mb-1 group-hover:translate-x-0.5 transition-transform">03 // PORTAL</div>
              <div className="font-semibold text-sm text-text-primary mb-1">Customer Portal</div>
              <div className="text-xs text-text-muted">Access client negotiation room and quotation preview.</div>
            </Card>
          </Link>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/">
            <Button variant="primary" className="px-6">
              Return to Safe Harbor
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="px-6">
              Switch User / Sign In
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border pt-6 max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
        <div>DealFlow360 Self-Governing Sales Engine &bull; Odoo Hackathon 2026</div>
        <div className="font-mono">ERR_CODE: 404_PAGE_DISCONNECTED</div>
      </footer>
    </div>
  )
}
