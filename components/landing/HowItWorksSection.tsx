"use client"

import { motion } from "framer-motion"
import { LucideLink, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Step } from "@/components/landing/Step"

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Availio: How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Find the perfect time for your group with Availio in just a few simple steps
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-muted-foreground/20 hidden md:block"></div>

            <Step
              number={1}
              title="Create an Event"
              description="Enter your event name and select a date range for potential meeting times."
              delay={0}
              content={
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">Event Name</div>
                  <div className="h-10 bg-card rounded border px-3 flex items-center text-sm text-muted-foreground">
                    Team Project Planning
                  </div>
                  <div className="text-sm font-medium mt-2">Date Range</div>
                  <div className="h-10 bg-card rounded border px-3 flex items-center text-sm text-muted-foreground">
                    May 10 - May 17, 2025
                  </div>
                </div>
              }
            />

            <Step
              number={2}
              title="Share the Link"
              description="A unique link is generated for your event. Share it with all participants."
              delay={0.1}
              content={
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-card rounded border px-3 py-2 text-sm text-muted-foreground overflow-hidden">
                    availio.app/event/team-project-planning-x7y9z
                  </div>
                  <Button size="sm" variant="outline">
                    <LucideLink className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              }
            />

            <Step
              number={3}
              title="Participants Select Availability"
              description="Each participant visits the link and selects times they're available by clicking and dragging."
              delay={0.2}
              content={
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const selected = [3, 4, 10, 11, 17, 18, 24, 25].includes(i)
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-sm ${selected ? "bg-primary" : "bg-card border"}`}
                      ></div>
                    )
                  })}
                </div>
              }
            />

            <Step
              number={4}
              title="Find the Best Time"
              description="The system automatically highlights the times that work best for everyone."
              delay={0.3}
              content={
                <>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <div key={day} className="text-center text-xs font-medium">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 35 }).map((_, i) => {
                      let bgColor = "bg-card border"
                      if (i === 10) bgColor = "bg-primary"
                      else if ([3, 4, 11, 17, 24].includes(i)) bgColor = "bg-primary/60"
                      else if ([18, 25].includes(i)) bgColor = "bg-primary/30"
                      return <div key={i} className={`aspect-square rounded-sm ${bgColor}`}></div>
                    })}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-primary rounded-sm"></div>
                      <span className="text-xs">Best match</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Tuesday at 10:00 AM</span>
                    </div>
                  </div>
                </>
              }
              isLast={true}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
