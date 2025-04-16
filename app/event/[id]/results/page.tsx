"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { EventHeader } from "@/components/EventHeader"
import { generateTimeSlots } from "@/lib/dateUtils"
import type { EventData } from "@/types"
import { ResultsHeader } from "@/components/event/ResultsHeader"
import { ResultsContent } from "@/components/event/ResultsContent"
import { useEvents } from "@/context/EventContext"
import { useRouter, useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function ResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getEvent, getBestTimes } = useEvents()
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)

  // Generate time slots
  const timeSlots = generateTimeSlots()

  // Fetch event data
  useEffect(() => {
    async function fetchData() {
      try {
        const event = await getEvent(params.id)
        if (event) {
          // Get best times
          const bestTimes = await getBestTimes(params.id)

          // Update event data with best times
          setEventData({
            ...event,
            bestTimes,
          })
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching event data:", error)
        setLoading(false)
      }
    }

    fetchData()

    // Set up an interval to refresh the data every 30 seconds
    // This ensures the participant list stays up to date
    const intervalId = setInterval(fetchData, 30000)

    return () => clearInterval(intervalId)
  }, [params.id, getEvent, getBestTimes])

  // If event not found, show error
  if (!loading && !eventData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => router.push("/")} className="text-primary hover:underline">
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full max-w-md mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
            <div className="space-y-4 mt-8">
              <Skeleton className="h-[400px] w-full rounded-lg" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Check if we just submitted availability
  const justSubmitted = searchParams.get("submitted") === "true"

  return (
    <div className="min-h-screen flex flex-col">
      <ResultsHeader
        eventId={params.id}
        participantCount={Array.isArray(eventData.participants) ? eventData.participants.length : 0}
      />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <EventHeader eventData={eventData} title="Results" />
          <ResultsContent
            eventData={eventData}
            timeSlots={timeSlots}
            startTime={eventData.startTime}
            endTime={eventData.endTime}
          />
        </motion.div>
      </main>
    </div>
  )
}
