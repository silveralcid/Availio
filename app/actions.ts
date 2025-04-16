"use server"

import { sql, dateToISOString, isoStringToDate } from "@/lib/db"
import type { EventData, Participant, BestTime } from "@/types"
import { generateTimeSlots } from "@/lib/dateUtils"
import { revalidatePath } from "next/cache"

// Create a new event
export async function createEvent(eventData: EventData): Promise<string> {
  try {
    // Generate a unique ID if not provided
    const eventId = eventData.id || Math.random().toString(36).substring(2, 8)

    // Insert event into database
    await sql`
      INSERT INTO events (id, name, date_range, time_range, start_time, end_time)
      VALUES (${eventId}, ${eventData.name}, ${eventData.dateRange}, ${eventData.timeRange}, 
              ${eventData.startTime || null}, ${eventData.endTime || null})
    `

    // Insert selected dates
    if (eventData.selectedDates && eventData.selectedDates.length > 0) {
      for (const date of eventData.selectedDates) {
        await sql`
          INSERT INTO event_dates (event_id, date_value)
          VALUES (${eventId}, ${dateToISOString(date)})
        `
      }
    }

    revalidatePath(`/event/${eventId}`)
    revalidatePath(`/event/${eventId}/results`)

    return eventId
  } catch (error) {
    console.error("Error creating event:", error)
    throw new Error("Failed to create event")
  }
}

// Get an event by ID
export async function getEvent(id: string): Promise<EventData | null> {
  try {
    // Get event data
    const eventResult = await sql<
      {
        id: string
        name: string
        date_range: string
        time_range: string
        start_time: string | null
        end_time: string | null
      }[]
    >`
      SELECT id, name, date_range, time_range, start_time, end_time
      FROM events
      WHERE id = ${id}
    `

    if (eventResult.length === 0) {
      return null
    }

    const event = eventResult[0]

    // Get selected dates
    const datesResult = await sql<{ date_value: string }[]>`
      SELECT date_value
      FROM event_dates
      WHERE event_id = ${id}
      ORDER BY date_value
    `

    const selectedDates = datesResult.map((d) => isoStringToDate(d.date_value))

    // Get participants
    const participants = await getParticipants(id)

    return {
      id: event.id,
      name: event.name,
      dateRange: event.date_range,
      timeRange: event.time_range,
      startTime: event.start_time || undefined,
      endTime: event.end_time || undefined,
      selectedDates,
      participants,
    }
  } catch (error) {
    console.error("Error getting event:", error)
    return null
  }
}

// Get participants for an event
export async function getParticipants(eventId: string): Promise<Participant[]> {
  try {
    // Get participants
    const participantsResult = await sql<{ id: number; name: string }[]>`
      SELECT id, name
      FROM participants
      WHERE event_id = ${eventId}
      ORDER BY created_at
    `

    // Get availability for each participant
    const participants: Participant[] = []

    for (const p of participantsResult) {
      const availabilityResult = await sql<{ cell_index: number }[]>`
        SELECT cell_index
        FROM availability
        WHERE participant_id = ${p.id}
      `

      participants.push({
        id: p.id,
        name: p.name,
        availability: availabilityResult.map((a) => a.cell_index),
      })
    }

    return participants
  } catch (error) {
    console.error("Error getting participants:", error)
    return []
  }
}

// Add a participant with availability
export async function addParticipant(eventId: string, name: string, availability: number[]): Promise<boolean> {
  try {
    // Insert participant
    const participantResult = await sql<{ id: number }[]>`
      INSERT INTO participants (event_id, name)
      VALUES (${eventId}, ${name})
      RETURNING id
    `

    const participantId = participantResult[0].id

    // Insert availability
    for (const cellIndex of availability) {
      await sql`
        INSERT INTO availability (participant_id, cell_index)
        VALUES (${participantId}, ${cellIndex})
      `
    }

    revalidatePath(`/event/${eventId}`)
    revalidatePath(`/event/${eventId}/results`)

    return true
  } catch (error) {
    console.error("Error adding participant:", error)
    return false
  }
}

// Get best times for an event
export async function getBestTimes(eventId: string): Promise<BestTime[]> {
  try {
    const event = await getEvent(eventId)
    if (!event || !Array.isArray(event.participants) || event.participants.length === 0 || !event.selectedDates) {
      return []
    }

    const timeSlots = generateTimeSlots()
    const availabilityCounts: Record<string, number> = {}

    // Count availability for each time slot
    event.participants.forEach((participant) => {
      if ("availability" in participant && participant.availability) {
        const availability = participant.availability as number[]
        availability.forEach((cellIndex) => {
          const dateIndex = cellIndex % event.selectedDates!.length
          const timeSlotIndex = Math.floor(cellIndex / event.selectedDates!.length)

          if (dateIndex < event.selectedDates!.length && timeSlotIndex < timeSlots.length) {
            const date = event.selectedDates![dateIndex]
            const timeSlot = timeSlots[timeSlotIndex]

            const key = `${date.toDateString()}-${timeSlot}`
            availabilityCounts[key] = (availabilityCounts[key] || 0) + 1
          }
        })
      }
    })

    // Convert to array and sort by count
    const sortedTimes = Object.entries(availabilityCounts)
      .map(([key, count]) => {
        const [dateStr, timeSlot] = key.split("-")
        const date = new Date(dateStr)
        const day = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
        return { day, time: timeSlot, count }
      })
      .sort((a, b) => {
        // First sort by count (descending)
        if (b.count !== a.count) {
          return b.count - a.count
        }

        // If counts are equal, sort by day (chronologically)
        const dayA = new Date(a.day)
        const dayB = new Date(b.day)
        if (dayA.getTime() !== dayB.getTime()) {
          return dayA.getTime() - dayB.getTime()
        }

        // If days are equal, sort by time (chronologically)
        const timeA = a.time.includes("PM")
          ? Number.parseInt(a.time.split(":")[0]) === 12
            ? 12
            : Number.parseInt(a.time.split(":")[0]) + 12
          : Number.parseInt(a.time.split(":")[0]) === 12
            ? 0
            : Number.parseInt(a.time.split(":")[0])
        const timeB = b.time.includes("PM")
          ? Number.parseInt(b.time.split(":")[0]) === 12
            ? 12
            : Number.parseInt(b.time.split(":")[0]) + 12
          : Number.parseInt(b.time.split(":")[0]) === 12
            ? 0
            : Number.parseInt(b.time.split(":")[0])

        return timeA - timeB
      })
      .slice(0, 3)

    return sortedTimes
  } catch (error) {
    console.error("Error getting best times:", error)
    return []
  }
}
