"use client"

import { motion } from "framer-motion"
import VisualizationGrid from "./VisualizationGrid"
import EventNameInput from "./EventNameInput"

interface HeroSectionProps {
  eventName: string
  setEventName: (name: string) => void
}

export default function HeroSection({ eventName, setEventName }: HeroSectionProps) {
  return (
    <section className="py-16 md:py-24 container mx-auto px-4">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Find the <span className="text-primary">perfect time</span> for your next meeting
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Availio makes scheduling group events simple. No more endless email chains or chat messages. Just create,
            share, and decide.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <EventNameInput eventName={eventName} setEventName={setEventName} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mt-16 md:mt-24 relative max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-1">
          <div className="bg-card rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-destructive/70"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-400/70"></div>
                <div className="h-3 w-3 rounded-full bg-green-400/70"></div>
                <div className="flex-1 text-center font-medium text-sm">
                  {eventName ? eventName : "Team Project Planning"}
                </div>
              </div>
              <VisualizationGrid eventName={eventName} />
            </div>
          </div>
        </div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-background shadow-lg rounded-full px-6 py-2 border min-w-[280px] text-center">
          <div className="text-sm font-medium whitespace-nowrap">Best time: Wednesday at 2:00 PM</div>
        </div>
      </motion.div>
    </section>
  )
}
