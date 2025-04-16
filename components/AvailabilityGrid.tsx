"use client"
import { GridContainer } from "./availability-grid/GridContainer"
import { useState, useEffect } from "react"

interface AvailabilityGridProps {
  dates: Date[]
  timeSlots: string[]
  selectedCells?: number[]
  onCellSelect?: (index: number) => void
  readOnly?: boolean
  heatmapData?: number[]
  maxParticipants?: number
  startTime?: string
  endTime?: string
  isIndividualView?: boolean
}

export function AvailabilityGrid({
  dates,
  timeSlots,
  selectedCells = [],
  onCellSelect,
  readOnly = false,
  heatmapData = [],
  maxParticipants = 5,
  startTime,
  endTime,
  isIndividualView = false,
}: AvailabilityGridProps) {
  // Detect if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window || navigator.maxTouchPoints > 0)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="space-y-2">
      {/* Device-specific instructions */}
      {!readOnly && (
        <div className="text-xs text-muted-foreground text-center mb-2">
          <span className="hidden md:inline">Click and drag to select multiple time slots</span>
          <span className="md:hidden">Tap individual time slots to select your availability</span>
        </div>
      )}

      <GridContainer
        dates={dates}
        timeSlots={timeSlots}
        selectedCells={selectedCells}
        onCellSelect={onCellSelect}
        readOnly={readOnly}
        heatmapData={heatmapData}
        maxParticipants={maxParticipants}
        startTime={startTime}
        endTime={endTime}
        isIndividualView={isIndividualView}
      />
    </div>
  )
}
