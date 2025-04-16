"use client"

import { Users } from "lucide-react"

interface HeatmapLegendProps {
  showCounts?: boolean
  maxParticipants?: number
  bestTime?: string
}

export function HeatmapLegend({ showCounts = false, maxParticipants = 5, bestTime }: HeatmapLegendProps) {
  return (
    <div className="space-y-4 mt-4">
      {bestTime && (
        <div className="bg-muted p-3 rounded-md flex items-center justify-between">
          <span className="font-medium">Best Time for Everyone:</span>
          <span className="text-primary font-semibold">{bestTime}</span>
        </div>
      )}

      {showCounts && maxParticipants > 1 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Availability Legend</div>
          <div className="grid grid-cols-5 gap-2">
            <div className="flex flex-col items-center">
              <div className="h-4 w-8 bg-gray-200 rounded-sm"></div>
              <div className="text-xs mt-1 text-center">0</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-4 w-8 bg-primary/20 rounded-sm"></div>
              <div className="text-xs mt-1 text-center">1-{Math.max(1, Math.floor(maxParticipants * 0.25))}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-4 w-8 bg-primary/40 rounded-sm"></div>
              <div className="text-xs mt-1 text-center">
                {Math.ceil(maxParticipants * 0.25)}-{Math.floor(maxParticipants * 0.5)}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-4 w-8 bg-primary/60 rounded-sm"></div>
              <div className="text-xs mt-1 text-center">
                {Math.ceil(maxParticipants * 0.5)}-{Math.floor(maxParticipants * 0.75)}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-4 w-8 bg-primary rounded-sm"></div>
              <div className="text-xs mt-1 text-center">
                {Math.ceil(maxParticipants * 0.75)}-{maxParticipants}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>Colors indicate number of participants available at each time</span>
          </div>
        </div>
      )}
    </div>
  )
}
