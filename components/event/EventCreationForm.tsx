"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Calendar, Info, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiDateCalendar } from "@/components/MultiDateCalendar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect, useRef, useState } from "react"
import { isValidTimeIncrement, roundToNearestFifteen } from "@/lib/dateUtils"

interface EventCreationFormProps {
  eventName: string
  setEventName: (name: string) => void
  selectedDates: Date[]
  setSelectedDates: (dates: Date[]) => void
  timeRange: { start: string; end: string }
  setTimeRange: (range: { start: string; end: string }) => void
  onCreateEvent: () => void
  isCreating?: boolean
}

export function EventCreationForm({
  eventName,
  setEventName,
  selectedDates,
  setSelectedDates,
  timeRange,
  setTimeRange,
  onCreateEvent,
  isCreating = false,
}: EventCreationFormProps) {
  // Create a ref for the input element
  const inputRef = useRef<HTMLInputElement>(null)

  // Local state for the input value
  const [localEventName, setLocalEventName] = useState(eventName)

  // State for time validation errors
  const [timeErrors, setTimeErrors] = useState({
    start: false,
    end: false,
  })

  // Update local state when prop changes
  useEffect(() => {
    setLocalEventName(eventName)
  }, [eventName])

  // Focus the input and select all text when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  // Direct handler for input changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalEventName(newValue)
    setEventName(newValue)
  }

  // Handler for start time changes
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value

    if (newTime === "") {
      setTimeRange({ ...timeRange, start: newTime })
      setTimeErrors({ ...timeErrors, start: false })
      return
    }

    // Always update the time value to show what the user typed
    setTimeRange({ ...timeRange, start: newTime })

    // Validate if the time is in 15-minute increments
    setTimeErrors({ ...timeErrors, start: !isValidTimeIncrement(newTime) })
  }

  // Handler for end time changes
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value

    if (newTime === "") {
      setTimeRange({ ...timeRange, end: newTime })
      setTimeErrors({ ...timeErrors, end: false })
      return
    }

    // Always update the time value to show what the user typed
    setTimeRange({ ...timeRange, end: newTime })

    // Validate if the time is in 15-minute increments
    setTimeErrors({ ...timeErrors, end: !isValidTimeIncrement(newTime) })
  }

  // Handler for time input blur - rounds to nearest 15 minutes
  const handleTimeBlur = (field: "start" | "end") => (e: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = e.target.value

    if (currentValue && !isValidTimeIncrement(currentValue)) {
      const roundedTime = roundToNearestFifteen(currentValue)
      setTimeRange({ ...timeRange, [field]: roundedTime })
      setTimeErrors({ ...timeErrors, [field]: false })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border rounded-lg shadow-sm p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Create a New Event</h1>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="event-name">
            Event Name
            <span className="text-destructive"> *</span>
          </Label>
          <Input
            id="event-name"
            ref={inputRef}
            placeholder="Team Meeting, Study Group, etc."
            value={localEventName}
            onChange={handleNameChange}
            className="focus:border-primary focus:ring-primary"
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label>
            Select Dates
            <span className="text-destructive"> *</span>
          </Label>

          <Alert className="mb-2">
            <Calendar className="h-4 w-4" />
            <AlertTitle>Quick Selection Tip</AlertTitle>
            <AlertDescription>Click and drag to select multiple dates at once.</AlertDescription>
          </Alert>

          <MultiDateCalendar selectedDates={selectedDates} onDateSelect={setSelectedDates} />
        </div>

        {/* Time selection section */}
        <div className="space-y-4">
          {/* Mobile time selection - single row with "to" in between */}
          <div className="sm:hidden space-y-4">
            <Label className="block text-center mb-2">Time Range</Label>
            <div className="flex items-center justify-center space-x-3">
              <div className="relative w-[130px] flex flex-col items-end">
                <div className="flex items-center">
                  <select
                    value={timeRange.start.split(":")[0]}
                    onChange={(e) => {
                      const [_, minutes] = timeRange.start.split(":")
                      setTimeRange({ ...timeRange, start: `${e.target.value}:${minutes}` })
                    }}
                    className="appearance-none bg-background border rounded-l-md py-2 pl-3 pr-2 text-right focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i
                      const display = hour === 0 || hour === 12 ? 12 : hour % 12
                      return (
                        <option key={hour} value={hour.toString().padStart(2, "0")}>
                          {display}
                        </option>
                      )
                    })}
                  </select>
                  <span className="mx-0.5">:</span>
                  <select
                    value={timeRange.start.split(":")[1]}
                    onChange={(e) => {
                      const [hours, _] = timeRange.start.split(":")
                      setTimeRange({ ...timeRange, start: `${hours}:${e.target.value}` })
                    }}
                    className="appearance-none bg-background border-y border-r rounded-r-md py-2 pl-1 pr-2 focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="00">00</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                  </select>
                  <div className="ml-1 text-xs font-medium">
                    {Number.parseInt(timeRange.start.split(":")[0]) < 12 ? "AM" : "PM"}
                  </div>
                </div>
              </div>

              <span className="text-sm font-medium text-muted-foreground px-1">to</span>

              <div className="relative w-[130px] flex flex-col items-start">
                <div className="flex items-center">
                  <div className="mr-1 text-xs font-medium">
                    {Number.parseInt(timeRange.end.split(":")[0]) < 12 ? "AM" : "PM"}
                  </div>
                  <select
                    value={timeRange.end.split(":")[0]}
                    onChange={(e) => {
                      const [_, minutes] = timeRange.end.split(":")
                      setTimeRange({ ...timeRange, end: `${e.target.value}:${minutes}` })
                    }}
                    className="appearance-none bg-background border rounded-l-md py-2 pl-3 pr-2 text-left focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i
                      const display = hour === 0 || hour === 12 ? 12 : hour % 12
                      return (
                        <option key={hour} value={hour.toString().padStart(2, "0")}>
                          {display}
                        </option>
                      )
                    })}
                  </select>
                  <span className="mx-0.5">:</span>
                  <select
                    value={timeRange.end.split(":")[1]}
                    onChange={(e) => {
                      const [hours, _] = timeRange.end.split(":")
                      setTimeRange({ ...timeRange, end: `${hours}:${e.target.value}` })
                    }}
                    className="appearance-none bg-background border-y border-r rounded-r-md py-2 pl-1 pr-2 focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="00">00</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile validation errors */}
            {(timeErrors.start || timeErrors.end) && (
              <div className="text-xs text-red-500 flex items-center justify-center mt-2">
                <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>Time must be in 15-minute increments</span>
              </div>
            )}
          </div>

          {/* Desktop time selection - with labels */}
          <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4">
            <div className="space-y-2 flex flex-col items-start">
              <Label htmlFor="start-time" className="self-start">
                Start Time
              </Label>
              <div className="relative w-full max-w-[140px]">
                <Input
                  id="start-time"
                  type="time"
                  value={timeRange.start}
                  onChange={handleStartTimeChange}
                  onBlur={handleTimeBlur("start")}
                  className={`pr-8 time-input text-center ${timeErrors.start ? "border-red-500" : ""}`}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              {timeErrors.start && (
                <div className="text-xs text-red-500 flex items-center mt-1 text-left">
                  <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span>Time must be in 15-minute increments</span>
                </div>
              )}
            </div>

            <div className="space-y-2 flex flex-col items-start">
              <Label htmlFor="end-time" className="self-start">
                End Time
              </Label>
              <div className="relative w-full max-w-[140px]">
                <Input
                  id="end-time"
                  type="time"
                  value={timeRange.end}
                  onChange={handleEndTimeChange}
                  onBlur={handleTimeBlur("end")}
                  className={`pr-8 time-input text-center ${timeErrors.end ? "border-red-500" : ""}`}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              {timeErrors.end && (
                <div className="text-xs text-red-500 flex items-center mt-1 text-left">
                  <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span>Time must be in 15-minute increments</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
          <Info className="h-4 w-4 flex-shrink-0" />
          <p>Participants will be able to select their availability for each selected date.</p>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={onCreateEvent}
          disabled={!localEventName || selectedDates.length === 0 || isCreating || timeErrors.start || timeErrors.end}
        >
          {isCreating ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Creating Event...
            </>
          ) : (
            "Create Event"
          )}
        </Button>
      </div>
    </motion.div>
  )
}
