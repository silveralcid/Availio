"use client"

import type React from "react"
import { HourCell } from "./HourCell"

interface HourRowProps {
  hourLabel: string
  hourIndex: number
  dates: Date[]
  readOnly: boolean
  isDragging: boolean
  dragMode: "select" | "deselect"
  isIndividualView: boolean
  isHourFullySelected: (hourIndex: number, dateIndex: number) => boolean
  isInDragSelection: (hourIndex: number, quarterIndex: number, dateIndex: number) => boolean
  isCellSelected: (hourIndex: number, quarterIndex: number, dateIndex: number) => boolean
  getCellHeatIntensity: (hourIndex: number, quarterIndex: number, dateIndex: number) => number
  getHeatColor: (hourIndex: number, quarterIndex: number, dateIndex: number) => string
  onFullHourClick: (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    hourIndex: number,
    dateIndex: number,
  ) => void
  onCellMouseDown: (
    hourIndex: number,
    quarterIndex: number,
    dateIndex: number,
    e: React.MouseEvent | React.TouchEvent,
  ) => void
  onCellMouseEnter: (hourIndex: number, quarterIndex: number, dateIndex: number) => void
  completedSelections?: { [key: string]: boolean }
  isTouchDevice?: boolean
  isSlotInRange?: (hourIndex: number, quarterIndex: number) => boolean
}

export function HourRow({
  hourLabel,
  hourIndex,
  dates,
  readOnly,
  isDragging,
  dragMode,
  isIndividualView,
  isHourFullySelected,
  isInDragSelection,
  isCellSelected,
  getCellHeatIntensity,
  getHeatColor,
  onFullHourClick,
  onCellMouseDown,
  onCellMouseEnter,
  completedSelections = {},
  isTouchDevice = false,
  isSlotInRange = () => true,
}: HourRowProps) {
  return (
    <tr key={`hour-${hourIndex}`}>
      {/* Time label */}
      <td className="text-center pr-2 text-sm text-muted-foreground py-1 sticky left-0 bg-card z-10 align-middle">
        {hourLabel}
      </td>

      {/* Time blocks */}
      {dates.map((_, dateIndex) => {
        // Check if the entire hour is selected
        const isFullySelected = !readOnly
          ? isHourFullySelected(hourIndex, dateIndex)
          : readOnly && isIndividualView && [0, 1, 2, 3].every((q) => getCellHeatIntensity(hourIndex, q, dateIndex) > 0)

        // Check if this hour was just completed (for animation)
        const wasJustCompleted = completedSelections[`${hourIndex}-${dateIndex}`] === true

        // Check if any quarter in this hour is in range
        const hasQuarterInRange = [0, 1, 2, 3].some((q) => isSlotInRange(hourIndex, q))

        return (
          <HourCell
            key={`hour-cell-${hourIndex}-${dateIndex}`}
            hourIndex={hourIndex}
            dateIndex={dateIndex}
            isFullySelected={isFullySelected}
            readOnly={readOnly}
            isDragging={isDragging}
            dragMode={dragMode}
            isInDragSelection={isInDragSelection}
            isCellSelected={isCellSelected}
            getHeatColor={getHeatColor}
            onFullHourClick={(e) => onFullHourClick(e, hourIndex, dateIndex)}
            onCellMouseDown={onCellMouseDown}
            onCellMouseEnter={onCellMouseEnter}
            wasJustCompleted={wasJustCompleted}
            isTouchDevice={isTouchDevice}
            isSlotInRange={isSlotInRange}
            hasQuarterInRange={hasQuarterInRange}
          />
        )
      })}
    </tr>
  )
}
