/**
 * Calculate cell index from hour, quarter, and date indices
 */
export function getCellIndex(hourIndex: number, quarterIndex: number, dateIndex: number, dateCount: number): number {
  return (hourIndex * 4 + quarterIndex) * dateCount + dateIndex
}

/**
 * Get color based on heat intensity
 */
export function getHeatColor(
  hourIndex: number,
  quarterIndex: number,
  dateIndex: number,
  readOnly: boolean,
  heatmapData: number[],
  maxParticipants: number,
  isIndividualView: boolean,
  getCellIndex: (hourIndex: number, quarterIndex: number, dateIndex: number) => number,
): string {
  if (!readOnly || !heatmapData || heatmapData.length === 0) return ""

  const intensity = heatmapData[getCellIndex(hourIndex, quarterIndex, dateIndex)] || 0

  // For individual view, we use a binary approach (available or not)
  if (isIndividualView || maxParticipants === 1) {
    return intensity > 0 ? "bg-black" : "bg-gray-200"
  }

  // For group view, we use a gradient
  const percentage = maxParticipants > 0 ? intensity / maxParticipants : 0

  if (percentage === 0) return "bg-gray-200"
  if (percentage < 0.25) return "bg-primary/20"
  if (percentage < 0.5) return "bg-primary/40"
  if (percentage < 0.75) return "bg-primary/60"
  if (percentage < 1) return "bg-primary/80"
  return "bg-primary"
}

/**
 * Convert time string to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  if (!time) return 0

  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

/**
 * Convert 12-hour format time to 24-hour format minutes
 */
export function timeSlotToMinutes(timeSlot: string): number {
  const [hourMinute, period] = timeSlot.split(" ")
  const [hourStr, minuteStr] = hourMinute.split(":")
  let hour = Number.parseInt(hourStr, 10)
  const minute = Number.parseInt(minuteStr, 10)

  // Convert 12-hour to 24-hour
  if (period === "PM" && hour < 12) hour += 12
  if (period === "AM" && hour === 12) hour = 0

  return hour * 60 + minute
}

/**
 * Filter time slots based on event start and end times
 */
export function filterTimeSlots(timeSlots: string[], startTime?: string, endTime?: string): string[] {
  if (!startTime || !endTime) return timeSlots

  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  return timeSlots.filter((slot) => {
    const slotMinutes = timeSlotToMinutes(slot)
    return slotMinutes >= startMinutes && slotMinutes < endMinutes
  })
}

/**
 * Group time slots by hour
 */
export function groupTimeSlotsByHour(timeSlots: string[]): { [hour: string]: string[] } {
  const hourGroups: { [hour: string]: string[] } = {}

  timeSlots.forEach((slot) => {
    const hourLabel = slot.split(":")[0] + (slot.includes("PM") ? " PM" : " AM")
    if (!hourGroups[hourLabel]) {
      hourGroups[hourLabel] = []
    }
    hourGroups[hourLabel].push(slot)
  })

  return hourGroups
}

/**
 * Check if a time slot is within the event's time range
 */
export function isTimeSlotInRange(
  hourIndex: number,
  quarterIndex: number,
  startTime?: string,
  endTime?: string,
): boolean {
  if (!startTime || !endTime) return true

  // Convert hour index to actual hour (starting from 6 AM)
  const hour = hourIndex + 6
  // Convert quarter index to minutes
  const minute = quarterIndex * 15

  // Convert to minutes since midnight
  const slotMinutes = hour * 60 + minute
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  return slotMinutes >= startMinutes && slotMinutes < endMinutes
}
