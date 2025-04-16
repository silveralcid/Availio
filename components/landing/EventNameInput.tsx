"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface EventNameInputProps {
  eventName: string
  setEventName: (name: string) => void
  animated?: boolean
}

export default function EventNameInput({ eventName, setEventName, animated = false }: EventNameInputProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md mx-auto">
      <Input
        placeholder="Enter meeting name"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        className="h-11"
        aria-label="Event name (you can edit this later)"
      />
      <Link href={eventName ? `/create?name=${encodeURIComponent(eventName)}` : "/create"}>
        <Button
          size="lg"
          className="w-full sm:w-auto whitespace-nowrap"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {animated ? (
            <>
              <motion.span animate={{ x: isHovered ? -4 : 0 }} transition={{ duration: 0.2 }}>
                Create an Event
              </motion.span>
              <motion.span animate={{ x: isHovered ? 4 : 0 }} transition={{ duration: 0.2 }}>
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.span>
            </>
          ) : (
            <>
              Create an Event
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </Link>
    </div>
  )
}
