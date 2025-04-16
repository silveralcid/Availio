"use client"

import { format } from "date-fns"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface SelectedDatesSummaryProps {
  selectedDates: Date[]
  onRemoveDate: (date: Date) => void
}

export function SelectedDatesSummary({ selectedDates, onRemoveDate }: SelectedDatesSummaryProps) {
  if (selectedDates.length === 0) return null

  return (
    <div className="bg-muted p-3 rounded-md">
      <div className="text-sm font-medium mb-2">Selected Dates ({selectedDates.length})</div>
      <div className="flex flex-wrap gap-2">
        {selectedDates
          .sort((a, b) => a.getTime() - b.getTime())
          .map((date) => (
            <Badge key={date.toString()} variant="secondary" className="flex items-center gap-1">
              {format(date, "MMM d, yyyy")}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => onRemoveDate(date)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
      </div>
    </div>
  )
}
