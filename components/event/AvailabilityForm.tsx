"use client"

import { motion } from "framer-motion"
import { RefreshCw, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EventHeader } from "@/components/EventHeader"
import { AvailabilityGrid } from "@/components/AvailabilityGrid"
import type { EventData } from "@/types"
import Link from "next/link"

interface AvailabilityFormProps {
  eventData: EventData
  name: string
  setName: (name: string) => void
  selectedCells: number[]
  timeSlots: string[]
  onCellSelect: (index: number) => void
  onSubmit: () => void
  onReset: () => void
  startTime?: string
  endTime?: string
  eventId: string
  isSubmitting?: boolean
}

export function AvailabilityForm({
  eventData,
  name,
  setName,
  selectedCells,
  timeSlots,
  onCellSelect,
  onSubmit,
  onReset,
  startTime,
  endTime,
  eventId,
  isSubmitting = false,
}: AvailabilityFormProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <EventHeader eventData={eventData} />

      <div className="bg-card border rounded-lg shadow-sm p-6 mb-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="name" className="text-base">
              Your Name
              <span className="text-destructive"> *</span>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-muted-foreground hover:text-foreground"
                title="Reset schedule"
                disabled={isSubmitting}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                <span className="text-sm">Reset</span>
              </Button>
              <Button variant="outline" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link href={`/event/${eventId}/results`}>
                  <BarChart2 className="h-4 w-4 mr-1" />
                  <span className="text-sm">Results</span>
                </Link>
              </Button>
            </div>
          </div>
          <Input
            id="name"
            placeholder="Enter your name"
            className="mt-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base">Select Your Availability</Label>
            <div className="text-xs text-muted-foreground">
              {/* Show appropriate instructions based on screen size */}
              <span className="hidden md:inline">Click to select or drag for multiple slots</span>
              <span className="md:hidden">Tap to select individual time slots</span>
            </div>
          </div>

          {/* Show all dates in a horizontally scrollable view */}
          {eventData.selectedDates && (
            <AvailabilityGrid
              dates={eventData.selectedDates}
              timeSlots={timeSlots}
              selectedCells={selectedCells}
              onCellSelect={onCellSelect}
              startTime={startTime}
              endTime={endTime}
              readOnly={isSubmitting}
            />
          )}
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={onSubmit}
          disabled={!name || selectedCells.length === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Submitting...
            </>
          ) : (
            "Submit Availability"
          )}
        </Button>
      </div>
    </motion.div>
  )
}
