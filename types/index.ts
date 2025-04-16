export interface Participant {
  id: number
  name: string
  availability?: number[] // Add availability property
}

export interface BestTime {
  day: string
  time: string
  count: number
}

export interface EventData {
  id: string
  name: string
  dateRange: string
  timeRange: string
  participants: Participant[] | number
  bestTimes?: BestTime[]
  startDate?: Date
  endDate?: Date
  selectedDates?: Date[] // Added for multi-date selection
  startTime?: string // Added for event time range
  endTime?: string // Added for event time range
}
