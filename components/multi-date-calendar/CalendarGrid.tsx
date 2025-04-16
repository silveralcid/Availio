"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { format, isSameDay } from "date-fns"
import { Button } from "@/components/ui/button"

interface CalendarGridProps {
  currentMonth: Date
  selectedDates: Date[]
  dayNames: string[]
  startDay: number
  daysInMonth: Date[]
  isDragging: boolean
  dragSelectMode: "select" | "deselect"
  isInDragRange: (date: Date) => boolean
  onDateMouseDown: (date: Date, e: React.MouseEvent) => void
  onDateMouseEnter: (date: Date) => void
}

export function CalendarGrid({
  currentMonth,
  selectedDates,
  dayNames,
  startDay,
  daysInMonth,
  isDragging,
  dragSelectMode,
  isInDragRange,
  onDateMouseDown,
  onDateMouseEnter,
}: CalendarGridProps) {
  return (
    <div className="p-3">
      {/* Day names header */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the start of the month */}
        {Array.from({ length: startDay }).map((_, index) => (
          <div key={`empty-start-${index}`} className="h-10" />
        ))}

        {/* Actual days of the month */}
        {daysInMonth.map((day) => {
          const isSelected = selectedDates.some((date) => isSameDay(date, day))
          const inDragRange = isInDragRange(day)

          // Determine the visual state based on selection and drag
          const isVisuallySelected =
            (isSelected && (!isDragging || dragSelectMode === "select")) ||
            (inDragRange && dragSelectMode === "select") ||
            (isSelected && !inDragRange && dragSelectMode === "deselect")

          return (
            <Button
              key={day.toString()}
              variant="ghost"
              className={cn(
                "h-10 w-full rounded-md transition-colors",
                isVisuallySelected &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                inDragRange && "ring-2 ring-primary/30",
                isDragging && "cursor-grabbing",
              )}
              onMouseDown={(e) => onDateMouseDown(day, e)}
              onMouseEnter={() => onDateMouseEnter(day)}
            >
              {format(day, "d")}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
