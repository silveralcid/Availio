"use client"

import { motion } from "framer-motion"
import { Calendar, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { format } from "date-fns"

interface EventCreatedSuccessProps {
  eventName: string
  selectedDates: Date[]
  timeRange: string
  eventLink: string
  onCopyLink: () => void
}

export function EventCreatedSuccess({
  eventName,
  selectedDates,
  timeRange,
  eventLink,
  onCopyLink,
}: EventCreatedSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border rounded-lg shadow-sm p-6"
    >
      <div className="flex items-center justify-center mb-6">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-xl font-bold mb-2">Event Created!</h1>
        <p className="text-muted-foreground">Share this link with your participants</p>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-muted rounded-md">
          <div className="font-medium mb-1">Event Details</div>
          <div className="text-sm text-muted-foreground mb-3">{eventName}</div>
          <div className="text-sm">
            <span className="text-muted-foreground">Dates: </span>
            {selectedDates.length > 0 ? (
              <div className="mt-1">
                {selectedDates
                  .sort((a, b) => a.getTime() - b.getTime())
                  .map((date) => (
                    <div key={date.toString()} className="text-xs py-1">
                      {format(date, "EEEE, MMMM d, yyyy")}
                    </div>
                  ))}
              </div>
            ) : (
              ""
            )}
          </div>
          <div className="text-sm mt-2">
            <span className="text-muted-foreground">Time Range: </span>
            {timeRange}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Event Link</Label>
          <div className="flex items-center gap-2">
            <Input value={eventLink} readOnly className="font-mono text-sm" />
            <Button size="icon" variant="outline" onClick={onCopyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link href={eventLink}>Go to Event</Link>
          </Button>

          <div className="text-center">
            <Link href="/" className="text-sm text-primary hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
