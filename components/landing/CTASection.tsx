"use client"

import { motion } from "framer-motion"
import EventNameInput from "./EventNameInput"

interface CTASectionProps {
  eventName: string
  setEventName: (name: string) => void
}

export default function CTASection({ eventName, setEventName }: CTASectionProps) {
  return (
    <section className="py-16 md:py-24 bg-primary/5">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to simplify your scheduling?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create your first event in seconds and discover how easy scheduling can be with Availio.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <EventNameInput eventName={eventName} setEventName={setEventName} animated={true} />
        </motion.div>
      </div>
    </section>
  )
}
