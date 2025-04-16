"use client"

import type React from "react"
import { TimeSegment } from "./TimeSegment"

interface SegmentedHourCellProps {
  hourIndex: number
  dateIndex: number
  readOnly: boolean
  isDragging: boolean
  dragMode: "select" | "deselect"
  isInDragSelection: (hourIndex: number, quarterIndex: number, dateIndex: number) => boolean
  isCellSelected: (hourIndex: number, quarterIndex: number, dateIndex: number) => boolean
  getHeatColor: (hourIndex: number, quarterIndex: number, dateIndex: number) => string
  onCellMouseDown: (
    hourIndex: number,
    quarterIndex: number,
    dateIndex: number,
    e: React.MouseEvent | React.TouchEvent,
  ) => void
  onCellMouseEnter: (hourIndex: number, quarterIndex: number, dateIndex: number) => void
  wasJustCompleted?: boolean
  isTouchDevice?: boolean
  isSlotInRange?: (hourIndex: number, quarterIndex: number) => boolean
}

export function SegmentedHourCell({
  hourIndex,
  dateIndex,
  readOnly,
  isDragging,
  dragMode,
  isInDragSelection,
  isCellSelected,
  getHeatColor,
  onCellMouseDown,
  onCellMouseEnter,
  wasJustCompleted = false,
  isTouchDevice = false,
  isSlotInRange = () => true,
}: SegmentedHourCellProps) {
  return (
    <div className="absolute inset-0 grid grid-rows-4 divide-y divide-gray-300">
      {[0, 1, 2, 3].map((quarterIndex) => {
        const isSelected = isCellSelected(hourIndex, quarterIndex, dateIndex)
        const inDragSelection = isInDragSelection(hourIndex, quarterIndex, dateIndex)
        const heatColor = getHeatColor(hourIndex, quarterIndex, dateIndex)
        const inRange = isSlotInRange(hourIndex, quarterIndex)

        // If this quarter is not in range, render a disabled segment
        if (!inRange && !readOnly) {
          return (
            <div
              key={`segment-${hourIndex}-${quarterIndex}-${dateIndex}`}
              className="w-full h-full bg-gray-100 opacity-50"
            />
          )
        }

        return (
          <TimeSegment
            key={`segment-${hourIndex}-${quarterIndex}-${dateIndex}`}
            hourIndex={hourIndex}
            quarterIndex={quarterIndex}
            dateIndex={dateIndex}
            isSelected={isSelected}
            isInDragSelection={inDragSelection}
            dragMode={dragMode}
            isDragging={isDragging}
            readOnly={readOnly}
            heatColor={heatColor}
            onMouseDown={(e) => onCellMouseDown(hourIndex, quarterIndex, dateIndex, e)}
            onMouseEnter={() => onCellMouseEnter(hourIndex, quarterIndex, dateIndex)}
            animate={false} // Disable individual segment animations
            isTouchDevice={isTouchDevice}
          />
        )
      })}
    </div>
  )
}
