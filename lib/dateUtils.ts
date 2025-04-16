/**
 * Formats a date to display in a user-friendly format
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(date)
}

/**
 * Generates an array of dates between start and end dates (inclusive)
 */
export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

/**
 * Generates time slots in 15-minute increments from 6 AM to 11 PM
 */
export function generateTimeSlots(): string[] {
  const slots: string[] = []

  // Generate slots from 6 AM to 11:45 PM
  for (let hour = 6; hour <= 23; hour++) {
    const isPM = hour >= 12
    const hour12 = hour % 12 || 12 // Convert 24-hour to 12-hour format

    for (let minute = 0; minute < 60; minute += 15) {
      const minuteStr = minute.toString().padStart(2, "0")
      const period = isPM ? "PM" : "AM"
      slots.push(`${hour12}:${minuteStr} ${period}`)
    }
  }

  return slots
}

/**
 * Generates hour labels for the availability grid
 */
export function generateHourLabels(): string[] {
  return [
    "6 AM",
    "7 AM",
    "8 AM",
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
    "6 PM",
    "7 PM",
    "8 PM",
    "9 PM",
    "10 PM",
    "11 PM",
  ]
}

/**
 * Formats a time string from 24-hour format to 12-hour format
 */
export function formatTimeDisplay(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const hours12 = hours % 12 || 12
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`
}

/**
 * Checks if a time is in 15-minute increments (00, 15, 30, 45)
 */
export function isValidTimeIncrement(time: string): boolean {
  if (!time) return false

  const [hours, minutes] = time.split(":").map(Number)

  // Check if minutes are in 15-minute increments
  return minutes % 15 === 0
}

/**
 * Rounds a time to the nearest 15-minute increment
 */
export function roundToNearestFifteen(time: string): string {
  if (!time) return "00:00"

  const [hours, minutes] = time.split(":").map(Number)

  // Round minutes to nearest 15
  const roundedMinutes = Math.round(minutes / 15) * 15

  // Handle case where rounding results in 60 minutes
  let adjustedHours = hours
  let adjustedMinutes = roundedMinutes

  if (roundedMinutes === 60) {
    adjustedHours = (hours + 1) % 24
    adjustedMinutes = 0
  }

  return `${adjustedHours.toString().padStart(2, "0")}:${adjustedMinutes.toString().padStart(2, "0")}`
}
