"use client";
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", updateMousePosition)
    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-hidden relative flex flex-col items-center justify-center font-sans selection:bg-accent-soft selection:text-accent">
      
      {/* Interactive Background Glow based on Mouse Position */}
      <motion.div 
        className="pointer-events-none absolute inset-0 z-0 opacity-40 mix-blend-multiply filter blur-[120px]"
        animate={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(194, 65, 12, 0.15), transparent 80%)`
        }}
      />
      
      {/* Animated geometric elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -right-[5%] w-[40%] h-[60%] rounded-full border border-accent/20 border-dashed"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[70%] rounded-full border border-border"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 text-center flex flex-col items-center max-w-lg px-6"
      >
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-glow mb-8 transform -rotate-12">
          <Zap className="text-white h-8 w-8" />
        </div>
        
        <h1 className="font-heading text-8xl md:text-9xl font-extrabold text-text-primary tracking-tighter mb-4">
          404
        </h1>
        
        <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-4 font-heading">
          Lost in the Deal Matrix
        </h2>
        
        <p className="text-text-secondary font-medium leading-relaxed mb-10">
          The page or quotation you are looking for has been moved, deleted, or never existed in the first place.
        </p>

        <Link href="/">
          <Button className="h-12 px-8 rounded-full font-heading font-bold text-base bg-text-primary hover:bg-text-secondary shadow-lg shadow-text-primary/20 hover:scale-105 transition-transform">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Command Center
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
