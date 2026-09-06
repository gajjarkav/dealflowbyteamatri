"use client";
import { motion } from "framer-motion"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Form Side */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </div>
        
        <footer className="absolute bottom-6 left-0 right-0 lg:right-1/2 flex items-center justify-center">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest text-center">
            Built for Odoo Hackathon 2026
          </p>
        </footer>
      </div>

      {/* Right Graphic Side (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 relative bg-surface overflow-hidden border-l border-border/50 items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')`,
            filter: "brightness(0.9) contrast(1.1)"
          }}
        />
        {/* Overlay gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        
        {/* Marketing Content Overlay */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-lg p-12 mt-auto mb-12"
        >
          <div className="space-y-6 text-white">
            <h2 className="text-3xl font-heading font-extrabold leading-tight">
              Powering the next generation of B2B sales operations.
            </h2>
            <p className="text-base text-white/80 font-medium leading-relaxed">
              &quot;DealFlow360 has completely transformed how our enterprise handles approvals, stock reservations, and quoting velocity. It&apos;s the engine behind our revenue.&quot;
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white font-bold">
                J
              </div>
              <div>
                <p className="text-sm font-bold text-white">Jane Director</p>
                <p className="text-xs font-medium text-white/60">VP of Sales, Acme Corp</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
