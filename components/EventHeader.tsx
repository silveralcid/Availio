import { Calendar, Clock, Users } from "lucide-react"
import type { EventData } from "@/types"

interface EventHeaderProps {
  eventData: EventData
  title?: string
}

export function EventHeader({ eventData, title }: EventHeaderProps) {
  const participantCount = Array.isArray(eventData.participants) ? eventData.participants.length : 0

  return (
    <div className="mb-8 text-center">
      <h1 className="text-2xl font-bold mb-2">{title ? `${eventData.name} - ${title}` : eventData.name}</h1>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{eventData.dateRange}</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{eventData.timeRange}</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <Users className="h-4 w-4" />
          <span>{participantCount} participants</span>
        </div>
      </div>
    </div>
  )
}
