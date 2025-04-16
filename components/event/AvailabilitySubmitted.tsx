"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AvailabilityGrid } from "@/components/AvailabilityGrid"
import { HeatmapLegend } from "@/components/HeatmapLegend"
import type { EventData } from "@/types"
import { useEvents } from "@/context/EventContext"
// Import formatTimeDisplay
import { formatTimeDisplay } from "@/lib/dateUtils"

interface AvailabilitySubmittedProps {
  name: string
  eventData: EventData
  timeSlots: string[]
  eventId: string
  startTime?: string
  endTime?: string
}

export function AvailabilitySubmitted({
  name,
  eventData,
  timeSlots,
  eventId,
  startTime,
  endTime,
}: AvailabilitySubmittedProps) {
  const { getBestTimes, getEvent } = useEvents()
  const bestTimes = getBestTimes(eventId)
  const bestTime = bestTimes.length > 0 ? `${bestTimes[0].day} at ${bestTimes[0].time}` : undefined

  // Generate heatmap data based on participant availability
  const generateHeatmapData = () => {
    if (!Array.isArray(eventData.participants) || !eventData.selectedDates) return []

    const totalCells = timeSlots.length * eventData.selectedDates.length
    const heatmapData = new Array(totalCells).fill(0)

    eventData.participants.forEach((participant) => {
      if ("availability" in participant && participant.availability) {
        participant.availability.forEach((cellIndex) => {
          if (cellIndex < totalCells) {
            heatmapData[cellIndex]++
          }
        })
      }
    })

    return heatmapData
  }

  const heatmapData = generateHeatmapData()
  const participantCount = Array.isArray(eventData.participants) ? eventData.participants.length : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="mb-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Thanks, {name}!</h1>
        <p className="text-muted-foreground">Your availability has been recorded.</p>
      </div>

      <div className="bg-card border rounded-lg shadow-sm p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">{eventData.name}</h2>
          <div className="flex flex-col md:flex-row justify-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center justify-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{eventData.dateRange}</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{eventData.timeRange}</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Users className="h-4 w-4" />
              <span>{participantCount} participants</span>
            </div>
          </div>
        </div>
        {/* Add a note about the time range - centered */}
        <div className="mb-2 text-sm text-muted-foreground text-center">
          {startTime && endTime && (
            <p className="flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              Showing availability from {formatTimeDisplay(startTime)} to {formatTimeDisplay(endTime)}
            </p>
          )}
        </div>

        <h3 className="text-lg font-medium mb-4">Current Availability Heatmap</h3>

        {/* Show all dates in a horizontally scrollable view */}
        {eventData.selectedDates && (
          <AvailabilityGrid
            dates={eventData.selectedDates}
            timeSlots={timeSlots}
            readOnly={true}
            heatmapData={heatmapData}
            maxParticipants={participantCount}
            startTime={startTime}
            endTime={endTime}
          />
        )}

        <HeatmapLegend bestTime={bestTime} maxParticipants={participantCount} />
      </div>

      <div className="flex flex-col gap-4 items-center">
        <Button asChild>
          <Link href={`/event/${eventId}/results`}>View Detailed Results</Link>
        </Button>

        <Link href="/" className="text-sm text-primary hover:underline">
          Back to Home
        </Link>
      </div>
    </motion.div>
  )
}
