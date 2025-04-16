"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { EventData, BestTime } from "@/types"
import {
  createEvent as createEventAction,
  getEvent as getEventAction,
  addParticipant as addParticipantAction,
  getBestTimes as getBestTimesAction,
} from "@/app/actions"

interface EventContextType {
  events: Record<string, EventData>
  createEvent: (eventData: EventData) => Promise<string>
  getEvent: (id: string) => Promise<EventData | null>
  addParticipant: (eventId: string, name: string, availability: number[]) => Promise<boolean>
  getParticipantCount: (eventId: string) => number
  getBestTimes: (eventId: string) => Promise<BestTime[]>
  cachedEvents: Record<string, EventData>
  setCachedEvent: (id: string, eventData: EventData) => void
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: ReactNode }) {
  // We'll use this to cache events in memory to reduce database calls
  const [cachedEvents, setCachedEvents] = useState<Record<string, EventData>>({})

  // Load events from localStorage on initial render
  useEffect(() => {
    const storedEvents = localStorage.getItem("events")
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents)

        // Convert date strings back to Date objects
        Object.values(parsedEvents).forEach((event: any) => {
          if (event.selectedDates) {
            event.selectedDates = event.selectedDates.map((dateStr: string) => new Date(dateStr))
          }
          if (event.startDate) event.startDate = new Date(event.startDate)
          if (event.endDate) event.endDate = new Date(event.endDate)
        })

        // setEvents(parsedEvents) // This line is removed as we are not using localStorage anymore
      } catch (error) {
        console.error("Failed to parse stored events:", error)
      }
    }
  }, [])

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(cachedEvents).length > 0) {
      localStorage.setItem("events", JSON.stringify(cachedEvents))
    }
  }, [cachedEvents])

  // Create event using server action
  const createEvent = async (eventData: EventData): Promise<string> => {
    const eventId = await createEventAction(eventData)

    // Cache the event
    setCachedEvents((prev) => ({
      ...prev,
      [eventId]: {
        ...eventData,
        id: eventId,
      },
    }))

    return eventId
  }

  // Get event using server action with caching
  const getEvent = async (id: string): Promise<EventData | null> => {
    // Check cache first
    if (cachedEvents[id]) {
      return cachedEvents[id]
    }

    // Fetch from database
    const event = await getEventAction(id)

    // Cache the result
    if (event) {
      setCachedEvents((prev) => ({
        ...prev,
        [id]: event,
      }))
    }

    return event
  }

  // Add participant using server action
  const addParticipant = async (eventId: string, name: string, availability: number[]): Promise<boolean> => {
    const success = await addParticipantAction(eventId, name, availability)

    // Invalidate cache for this event
    if (success) {
      setCachedEvents((prev) => {
        const newCache = { ...prev }
        delete newCache[eventId]
        return newCache
      })
    }

    return success
  }

  // Get participant count
  const getParticipantCount = (eventId: string): number => {
    const event = cachedEvents[eventId]
    if (!event) return 0

    return Array.isArray(event.participants) ? event.participants.length : 0
  }

  // Get best times using server action
  const getBestTimes = async (eventId: string): Promise<BestTime[]> => {
    return await getBestTimesAction(eventId)
  }

  // Helper to set a cached event
  const setCachedEvent = (id: string, eventData: EventData) => {
    setCachedEvents((prev) => ({
      ...prev,
      [id]: eventData,
    }))
  }

  const value = {
    events: cachedEvents, // For backward compatibility
    createEvent,
    getEvent,
    addParticipant,
    getParticipantCount,
    getBestTimes,
    cachedEvents,
    setCachedEvent,
  }

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>
}

export function useEvents() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventProvider")
  }
  return context
}
