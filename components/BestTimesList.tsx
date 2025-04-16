import { cn } from "@/lib/utils"
import type { BestTime } from "@/types"
import { Users, Check } from "lucide-react"

interface BestTimesListProps {
  bestTimes: BestTime[]
  participantCount: number
}

export function BestTimesList({ bestTimes, participantCount }: BestTimesListProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-sm font-medium">Top {bestTimes.length} Times</div>
        {bestTimes.map((time, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-3 rounded-md",
              index === 0 ? "bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            <div className="flex items-center gap-2">
              {index === 0 && <div className="text-lg font-bold">1.</div>}
              {index === 1 && <div className="text-base">2.</div>}
              {index === 2 && <div className="text-base">3.</div>}
              <div>
                <div className={cn("font-medium", index === 0 ? "" : "text-foreground")}>
                  {time.day} at {time.time}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Users
                    className={cn("h-3 w-3", index === 0 ? "text-primary-foreground/80" : "text-muted-foreground")}
                  />
                  <div className={cn("text-sm", index === 0 ? "text-primary-foreground/80" : "text-muted-foreground")}>
                    {time.count} of {participantCount} participants available
                  </div>
                </div>
              </div>
            </div>
            {index === 0 && (
              <div className="flex items-center gap-1 text-xs font-medium bg-primary-foreground text-primary px-2 py-1 rounded">
                <Check className="h-3 w-3" />
                Best Match
              </div>
            )}
          </div>
        ))}
      </div>

      {bestTimes.length === 0 && (
        <div className="text-center p-6 text-muted-foreground">
          No best times available yet. Wait for more participants to submit their availability.
        </div>
      )}
    </div>
  )
}
