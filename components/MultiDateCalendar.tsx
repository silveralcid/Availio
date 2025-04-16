"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  addMonths,
  subMonths,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isBefore,
  isAfter,
  isSameMonth,
} from "date-fns"
import { CalendarHeader } from "@/components/multi-date-calendar/CalendarHeader"
import { CalendarGrid } from "@/components/multi-date-calendar/CalendarGrid"
import { SelectedDatesSummary } from "@/components/multi-date-calendar/SelectedDatesSummary"

interface MultiDateCalendarProps {
  selectedDates: Date[]
  onDateSelect: (dates: Date[]) => void
}

export function MultiDateCalendar({ selectedDates, onDateSelect }: MultiDateCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null)
  const [dragEndDate, setDragEndDate] = useState<Date | null>(null)
  const [dragSelectMode, setDragSelectMode] = useState<"select" | "deselect">("select")
  const calendarRef = useRef<HTMLDivElement>(null)

  // Handle drag selection outside the calendar
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        finishDragSelection()
      }
    }

    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const toggleDate = (date: Date, isMultiSelect = false) => {
    const isSelected = selectedDates.some((selectedDate) => isSameDay(selectedDate, date))

    if (isMultiSelect) {
      // For keyboard multi-select (e.g., with Shift key)
      if (isSelected) {
        onDateSelect(selectedDates.filter((selectedDate) => !isSameDay(selectedDate, date)))
      } else {
        onDateSelect([...selectedDates, date])
      }
      return
    }

    // Start drag operation
    setIsDragging(true)
    setDragStartDate(date)
    setDragEndDate(date)

    // Determine if we're selecting or deselecting based on the first clicked date
    if (isSelected) {
      setDragSelectMode("deselect")
    } else {
      setDragSelectMode("select")
    }
  }

  const handleDateMouseEnter = (date: Date) => {
    if (isDragging && dragStartDate) {
      setDragEndDate(date)
    }
  }

  const finishDragSelection = () => {
    if (!isDragging || !dragStartDate || !dragEndDate) {
      setIsDragging(false)
      return
    }

    // Determine the date range to select/deselect
    const start = isBefore(dragStartDate, dragEndDate) ? dragStartDate : dragEndDate
    const end = isAfter(dragStartDate, dragEndDate) ? dragStartDate : dragEndDate

    // Get all dates in the range
    const datesInRange = eachDayOfInterval({ start, end })

    if (dragSelectMode === "select") {
      // Add all dates in range that aren't already selected
      const newDates = datesInRange.filter(
        (date) => !selectedDates.some((selectedDate) => isSameDay(selectedDate, date)),
      )
      onDateSelect([...selectedDates, ...newDates])
    } else {
      // Remove all dates in range
      onDateSelect(selectedDates.filter((selectedDate) => !datesInRange.some((date) => isSameDay(date, selectedDate))))
    }

    // Reset drag state
    setIsDragging(false)
    setDragStartDate(null)
    setDragEndDate(null)
  }

  const removeDate = (dateToRemove: Date) => {
    onDateSelect(selectedDates.filter((date) => !isSameDay(date, dateToRemove)))
  }

  const handleDateMouseDown = (date: Date, e: React.MouseEvent) => {
    e.preventDefault() // Prevent text selection during drag
    toggleDate(date)
  }

  // Generate days for the current month view
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate the starting day of the week (0 = Sunday, 1 = Monday, etc.)
  const startDay = getDay(monthStart)

  // Day names for the header
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Check if a date is in the drag selection range
  const isInDragRange = (date: Date) => {
    if (!isDragging || !dragStartDate || !dragEndDate) return false

    const start = isBefore(dragStartDate, dragEndDate) ? dragStartDate : dragEndDate
    const end = isAfter(dragStartDate, dragEndDate) ? dragStartDate : dragEndDate

    return (
      (isAfter(date, start) || isSameDay(date, start)) &&
      (isBefore(date, end) || isSameDay(date, end)) &&
      isSameMonth(date, currentMonth)
    )
  }

  return (
    <div className="space-y-4">
      <div
        className="bg-card border rounded-lg shadow-sm"
        ref={calendarRef}
        onMouseUp={finishDragSelection}
        onMouseLeave={() => {
          if (isDragging) {
            finishDragSelection()
          }
        }}
      >
        <CalendarHeader currentMonth={currentMonth} onPrevMonth={prevMonth} onNextMonth={nextMonth} />

        <CalendarGrid
          currentMonth={currentMonth}
          selectedDates={selectedDates}
          dayNames={dayNames}
          startDay={startDay}
          daysInMonth={daysInMonth}
          isDragging={isDragging}
          dragSelectMode={dragSelectMode}
          isInDragRange={isInDragRange}
          onDateMouseDown={handleDateMouseDown}
          onDateMouseEnter={handleDateMouseEnter}
        />
      </div>

      <SelectedDatesSummary selectedDates={selectedDates} onRemoveDate={removeDate} />
    </div>
  )
}
