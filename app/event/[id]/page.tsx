"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Users } from "lucide-react"
import Link from "next/link"
import { generateTimeSlots } from "@/lib/dateUtils"
import type { EventData } from "@/types"
import { AvailabilityForm } from "@/components/event/AvailabilityForm"
import { useEvents } from "@/context/EventContext"
import { useRouter } from "next/navigation"

export default function EventPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getEvent, addParticipant } = useEvents()
  const [name, setName] = useState("")
  const [selectedCells, setSelectedCells] = useState<number[]>([])
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Generate time slots
  const timeSlots = generateTimeSlots()

  // Fetch event data
  useEffect(() => {
    async function fetchEvent() {
      try {
        const event = await getEvent(params.id)
        if (event) {
          setEventData(event)
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching event:", error)
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params.id, getEvent])

  // Handle cell selection
  const handleCellSelect = (index: number) => {
    setSelectedCells((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!eventData || isSubmitting) return

    setIsSubmitting(true)

    try {
      // Add participant with availability
      const success = await addParticipant(params.id, name, selectedCells)

      if (success) {
        // Redirect to results page with submitted parameter
        router.push(`/event/${params.id}/results?submitted=true`)
      } else {
        alert("Failed to submit availability. Please try again.")
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting availability:", error)
      alert("Failed to submit availability. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Handle reset
  const handleReset = () => {
    setSelectedCells([])
  }

  // If event not found, show error
  if (!loading && !eventData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {Array.isArray(eventData.participants)
                ? `${eventData.participants.length} participants`
                : "0 participants"}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <AvailabilityForm
          eventData={eventData}
          name={name}
          setName={setName}
          selectedCells={selectedCells}
          timeSlots={timeSlots}
          onCellSelect={handleCellSelect}
          onSubmit={handleSubmit}
          onReset={handleReset}
          startTime={eventData.startTime}
          endTime={eventData.endTime}
          eventId={params.id}
          isSubmitting={isSubmitting}
        />
      </main>
    </div>
  )
}
