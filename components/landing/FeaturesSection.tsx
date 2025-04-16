"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Calendar, Clock, Users } from "lucide-react"

export default function FeaturesSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Why Choose Availio?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Our simple, intuitive platform makes scheduling group events effortless
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          <FeatureCard
            icon={<Calendar className="h-6 w-6 text-primary" />}
            title="No Login Required"
            description="Create events instantly without signing up. Just enter your event details and share the link."
            variants={item}
          />
          <FeatureCard
            icon={<Users className="h-6 w-6 text-primary" />}
            title="Visual Availability"
            description="See everyone's availability at a glance with our intuitive heatmap visualization."
            variants={item}
          />
          <FeatureCard
            icon={<Clock className="h-6 w-6 text-primary" />}
            title="Real-time Updates"
            description="Watch as the best meeting time emerges in real-time as participants add their availability."
            variants={item}
          />
        </motion.div>
      </div>
    </section>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  variants: any
}

function FeatureCard({ icon, title, description, variants }: FeatureCardProps) {
  return (
    <motion.div variants={variants} className="bg-card rounded-lg p-6 shadow-sm">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}
