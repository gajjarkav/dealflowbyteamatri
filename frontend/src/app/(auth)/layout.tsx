export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
      <footer className="border-t border-border bg-surface py-8 px-8 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-lg font-bold tracking-tight">DealFlow<span className="text-accent">360</span></div>
          <p className="text-xs text-text-muted uppercase tracking-wider">Built for Odoo Hackathon 2026</p>
        </div>
      </footer>
    </div>
  )
}
