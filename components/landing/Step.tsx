"use client"

import type React from "react"
import { motion } from "framer-motion"

interface StepProps {
  number: number
  title: string
  description: string
  content: React.ReactNode
  delay: number
  isLast?: boolean
}

export function Step({ number, title, description, content, delay, isLast = false }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`flex flex-col md:flex-row gap-8 ${isLast ? "" : "mb-12"} relative`}
    >
      <div className="md:w-24 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg z-10">
          {number}
        </div>
      </div>
      <div className="flex-1 md:pt-1">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="bg-muted rounded-lg p-4">{content}</div>
      </div>
    </motion.div>
  )
}
