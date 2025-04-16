"use client"

import { useState, useEffect } from "react"
import { Calendar, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AvailabilityGrid } from "@/components/AvailabilityGrid"
import { HeatmapLegend } from "@/components/HeatmapLegend"
import { BestTimesList } from "@/components/BestTimesList"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ParticipantSelector } from "@/components/event/ParticipantSelector"
import type { EventData, Participant } from "@/types"
import { format } from "date-fns"
import { formatTimeDisplay } from "@/lib/dateUtils"

interface ResultsContentProps {
  eventData: EventData
  timeSlots: string[]
  startTime?: string
  endTime?: string
}

export function ResultsContent({ eventData, timeSlots, startTime, endTime }: ResultsContentProps) {
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("participants")

  const participants = Array.isArray(eventData.participants) ? (eventData.participants as Participant[]) : []
  const participantCount = participants.length

  // Reset selected participant if they no longer exist (e.g., data refresh)
  useEffect(() => {
    if (selectedParticipantId !== null && !participants.some((p) => p.id === selectedParticipantId)) {
      setSelectedParticipantId(null)
    }
  }, [participants, selectedParticipantId])

  // Generate heatmap data based on participant availability
  const generateHeatmapData = (specificParticipantId: number | null = null) => {
    if (!eventData.selectedDates) return []

    const totalCells = timeSlots.length * eventData.selectedDates.length
    const heatmapData = new Array(totalCells).fill(0)

    participants.forEach((participant) => {
      // Skip if we're looking for a specific participant and this isn't it
      if (specificParticipantId !== null && participant.id !== specificParticipantId) {
        return
      }

      if ("availability" in participant && participant.availability) {
        participant.availability.forEach((cellIndex) => {
          if (cellIndex < totalCells) {
            // For individual participant view, we use 1 for selected cells
            // For group view, we increment the count
            heatmapData[cellIndex] += 1
          }
        })
      }
    })

    return heatmapData
  }

  const heatmapData = generateHeatmapData(selectedParticipantId)

  // Format dates for display
  const formatSelectedDates = () => {
    if (!eventData.selectedDates || eventData.selectedDates.length === 0) return "No dates selected"

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
        {eventData.selectedDates.map((date, index) => (
          <div key={index} className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(date, "EEEE, MMMM d, yyyy")}</span>
          </div>
        ))}
      </div>
    )
  }

  // Get the selected participant
  const selectedParticipant =
    selectedParticipantId !== null ? participants.find((p) => p.id === selectedParticipantId) : null

  const handleParticipantSelect = (id: number | null) => {
    setSelectedParticipantId(id)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Comprehensive information about this event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Event Name</h3>
              <p className="text-lg">{eventData.name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium">Date Range</h3>
              <p>{eventData.dateRange}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium">Time Range</h3>
              <p>{eventData.timeRange}</p>
              {startTime && endTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing availability from {formatTimeDisplay(startTime)} to {formatTimeDisplay(endTime)}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium">Selected Dates</h3>
              {formatSelectedDates()}
            </div>

            <div>
              <h3 className="text-sm font-medium">Participants</h3>
              <p>{participantCount} people have submitted their availability</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="participants">
            <Users className="h-4 w-4 mr-2" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="best-times">
            <Calendar className="h-4 w-4 mr-2" />
            Best Times
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Participant Availability</CardTitle>
                <CardDescription>View individual or combined availability</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {participantCount > 0 ? (
                  <>
                    <ParticipantSelector
                      participants={participants}
                      selectedParticipantId={selectedParticipantId}
                      onSelectParticipant={handleParticipantSelect}
                    />

                    {eventData.selectedDates && (
                      <AvailabilityGrid
                        dates={eventData.selectedDates}
                        timeSlots={timeSlots}
                        readOnly={true}
                        heatmapData={heatmapData}
                        maxParticipants={selectedParticipantId !== null ? 1 : participantCount}
                        startTime={startTime}
                        endTime={endTime}
                        isIndividualView={selectedParticipantId !== null}
                      />
                    )}

                    {selectedParticipantId === null ? (
                      <HeatmapLegend showCounts={true} maxParticipants={participantCount} />
                    ) : (
                      <div className="text-sm text-center text-muted-foreground mt-2">
                        Black cells indicate times when {selectedParticipant?.name} is available
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-6 text-muted-foreground">
                    No participants have submitted their availability yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="best-times" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Best Times for Everyone</CardTitle>
              <CardDescription>Times that work for most participants</CardDescription>
            </CardHeader>
            <CardContent>
              {eventData.bestTimes && eventData.bestTimes.length > 0 ? (
                <BestTimesList bestTimes={eventData.bestTimes} participantCount={participantCount} />
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  No best times available yet. Wait for more participants to submit their availability.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
