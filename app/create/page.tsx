"use client"

import { useState, useEffect } from "react"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useSearchParams } from "next/navigation"
import { EventCreationForm } from "@/components/event/EventCreationForm"
import { EventCreatedSuccess } from "@/components/event/EventCreatedSuccess"
import { useEvents } from "@/context/EventContext"
import type { EventData } from "@/types"

export default function CreateEventPage() {
  const searchParams = useSearchParams()
  const [eventName, setEventName] = useState("")
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [timeRange, setTimeRange] = useState({ start: "09:00", end: "17:00" })
  const [isCreated, setIsCreated] = useState(false)
  const [eventLink, setEventLink] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { createEvent } = useEvents()
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // Get event name from URL if provided - only on initial load
  useEffect(() => {
    if (!initialLoadDone) {
      const nameFromUrl = searchParams.get("name")
      if (nameFromUrl) {
        setEventName(nameFromUrl)
      }
      setInitialLoadDone(true)
    }
  }, [searchParams, initialLoadDone])

  // Handler for updating event name
  const handleEventNameChange = (name: string) => {
    setEventName(name)
  }

  const handleCreateEvent = async () => {
    if (isCreating) return
    setIsCreating(true)

    try {
      // Format the date range for display
      const dateRange = formatDateRange()

      // Format the time range for display
      const formattedTimeRange = formatTimeRange()

      // Create the event data
      const eventData: EventData = {
        id: "", // Will be set by createEvent
        name: eventName,
        dateRange,
        timeRange: formattedTimeRange,
        participants: [],
        selectedDates,
        startDate: selectedDates.length > 0 ? new Date(Math.min(...selectedDates.map((d) => d.getTime()))) : undefined,
        endDate: selectedDates.length > 0 ? new Date(Math.max(...selectedDates.map((d) => d.getTime()))) : undefined,
        startTime: timeRange.start, // Store the start time
        endTime: timeRange.end, // Store the end time
      }

      // Store the event and get the ID
      const eventId = await createEvent(eventData)

      // Set the event link
      const link = `${window.location.origin}/event/${eventId}`
      setEventLink(link)
      setIsCreated(true)
    } catch (error) {
      console.error("Error creating event:", error)
      alert("Failed to create event. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  // Format the selected dates for display
  const formatDateRange = () => {
    if (selectedDates.length === 0) return ""

    // Sort dates chronologically
    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime())

    if (selectedDates.length === 1) {
      return format(sortedDates[0], "MMMM d, yyyy")
    }

    return `${format(sortedDates[0], "MMM d")} - ${format(sortedDates[selectedDates.length - 1], "MMM d, yyyy")}`
  }

  // Convert 24-hour time format to 12-hour format with AM/PM
  const formatTimeRange = () => {
    const formatTime = (time24: string) => {
      const [hours, minutes] = time24.split(":").map(Number)
      const period = hours >= 12 ? "PM" : "AM"
      const hours12 = hours % 12 || 12
      return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`
    }

    return `${formatTime(timeRange.start)} - ${formatTime(timeRange.end)}`
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-md">
        {!isCreated ? (
          <EventCreationForm
            key="event-creation-form"
            eventName={eventName}
            setEventName={handleEventNameChange}
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            onCreateEvent={handleCreateEvent}
            isCreating={isCreating}
          />
        ) : (
          <EventCreatedSuccess
            eventName={eventName}
            selectedDates={selectedDates}
            timeRange={formatTimeRange()}
            eventLink={eventLink}
            onCopyLink={() => navigator.clipboard.writeText(eventLink)}
          />
        )}
      </main>
    </div>
  )
}
