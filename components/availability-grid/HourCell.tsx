"use client"
import { SegmentedHourCell } from "./SegmentedHourCell"
import { FullySelectedHourCell } from "./FullySelectedHourCell"
import { useState, useEffect } from "react"
import type React from "react"

interface HourCellProps {
  hourIndex: number
  dateIndex: number
  isFullySelected: boolean
  readOnly: boolean
  isDragging: boolean
  dragMode: "select" | "deselect"
  isInDragSelection: (hourIndex: number, quarterIndex: number, dateIndex: number) => boolean
  isCellSelected: (hourIndex: number, quarterIndex: number, dateIndex: number) => boolean
  getHeatColor: (hourIndex: number, quarterIndex: number, dateIndex: number) => string
  onFullHourClick: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void
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
  hasQuarterInRange?: boolean
}

export function HourCell({
  hourIndex,
  dateIndex,
  isFullySelected,
  readOnly,
  isDragging,
  dragMode,
  isInDragSelection,
  isCellSelected,
  getHeatColor,
  onFullHourClick,
  onCellMouseDown,
  onCellMouseEnter,
  wasJustCompleted = false,
  isTouchDevice = false,
  isSlotInRange = () => true,
  hasQuarterInRange = true,
}: HourCellProps) {
  // Track if the cell was just fully selected for animation
  const [wasJustCompletedState, setWasJustCompletedState] = useState(wasJustCompleted)

  // Detect when a cell becomes fully selected for animation
  useEffect(() => {
    if (wasJustCompleted) {
      setWasJustCompletedState(true)
      const timer = setTimeout(() => setWasJustCompletedState(false), 300)
      return () => clearTimeout(timer)
    }
  }, [wasJustCompleted])

  // If no quarters in this hour are in range, render a disabled cell
  if (!hasQuarterInRange && !readOnly) {
    return (
      <td className="p-0">
        <div className="h-16 w-16 bg-gray-100 opacity-50"></div>
      </td>
    )
  }

  return (
    <td key={`hour-cell-${hourIndex}-${dateIndex}`} className="p-0">
      <div className="h-16 w-16 relative bg-gray-200">
        {isFullySelected ? (
          <FullySelectedHourCell
            hourIndex={hourIndex}
            dateIndex={dateIndex}
            readOnly={readOnly}
            onClick={(e) => onFullHourClick(e)}
            animate={wasJustCompletedState && !isDragging}
          />
        ) : (
          <SegmentedHourCell
            hourIndex={hourIndex}
            dateIndex={dateIndex}
            readOnly={readOnly}
            isDragging={isDragging}
            dragMode={dragMode}
            isInDragSelection={isInDragSelection}
            isCellSelected={isCellSelected}
            getHeatColor={getHeatColor}
            onCellMouseDown={onCellMouseDown}
            onCellMouseEnter={onCellMouseEnter}
            wasJustCompleted={wasJustCompletedState}
            isTouchDevice={isTouchDevice}
            isSlotInRange={isSlotInRange}
          />
        )}
      </div>
    </td>
  )
}
