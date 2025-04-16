"use client"

import { useRef, useEffect, useCallback } from "react"
import { GridHeader } from "./GridHeader"
import { HourRow } from "./HourRow"
import { useGridInteraction } from "@/hooks/useGridInteraction"
import { getCellIndex, getHeatColor, isTimeSlotInRange } from "@/utils/gridUtils"
import { generateHourLabels } from "@/lib/dateUtils"

interface GridContainerProps {
  dates: Date[]
  timeSlots: string[]
  selectedCells?: number[]
  onCellSelect?: (index: number) => void
  readOnly?: boolean
  heatmapData?: number[]
  maxParticipants?: number
  startTime?: string
  endTime?: string
  isIndividualView?: boolean
}

export function GridContainer({
  dates,
  timeSlots,
  selectedCells = [],
  onCellSelect,
  readOnly = false,
  heatmapData = [],
  maxParticipants = 5,
  startTime,
  endTime,
  isIndividualView = false,
}: GridContainerProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const topScrollbarRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Get all hour labels (6 AM to 11 PM)
  const allHourLabels = generateHourLabels()

  // Calculate the start and end hour indices based on the time range
  const getHourIndex = (time?: string): number => {
    if (!time) return 0
    const [hours] = time.split(":").map(Number)
    return Math.max(0, hours - 6) // Subtract 6 because our hours start at 6 AM
  }

  const startHourIndex = startTime ? getHourIndex(startTime) : 0
  const endHourIndex = endTime ? getHourIndex(endTime) : allHourLabels.length

  // Filter hour labels based on the time range
  const hourLabels = allHourLabels.slice(startHourIndex, endHourIndex + 1)

  // Check if a specific time slot is in range
  const isSlotInRange = useCallback(
    (hourIndex: number, quarterIndex: number) => {
      return isTimeSlotInRange(hourIndex, quarterIndex, startTime, endTime)
    },
    [startTime, endTime],
  )

  // Check if a cell is selected
  const isCellSelected = (hourIndex: number, quarterIndex: number, dateIndex: number): boolean => {
    const cellIndex = getCellIndex(hourIndex, quarterIndex, dateIndex, dates.length)
    return selectedCells.includes(cellIndex)
  }

  // Check if all quarters in an hour block are selected
  const isHourFullySelected = (hourIndex: number, dateIndex: number): boolean => {
    return [0, 1, 2, 3].every((quarterIndex) => isCellSelected(hourIndex, quarterIndex, dateIndex))
  }

  // Get heat intensity for a cell in read-only mode
  const getCellHeatIntensity = (hourIndex: number, quarterIndex: number, dateIndex: number): number => {
    if (!heatmapData || heatmapData.length === 0) return 0
    const cellIndex = getCellIndex(hourIndex, quarterIndex, dateIndex, dates.length)
    return heatmapData[cellIndex] || 0
  }

  // Set up synchronization between top scrollbar and content
  useEffect(() => {
    const handleTopScrollbarScroll = () => {
      if (topScrollbarRef.current && contentRef.current) {
        contentRef.current.scrollLeft = topScrollbarRef.current.scrollLeft
      }
    }

    const handleContentScroll = () => {
      if (topScrollbarRef.current && contentRef.current) {
        topScrollbarRef.current.scrollLeft = contentRef.current.scrollLeft
      }
    }

    if (topScrollbarRef.current) {
      topScrollbarRef.current.addEventListener("scroll", handleTopScrollbarScroll)
    }

    if (contentRef.current) {
      contentRef.current.addEventListener("scroll", handleContentScroll)
    }

    return () => {
      if (topScrollbarRef.current) {
        topScrollbarRef.current.removeEventListener("scroll", handleTopScrollbarScroll)
      }
      if (contentRef.current) {
        contentRef.current.removeEventListener("scroll", handleContentScroll)
      }
    }
  }, [])

  // Use the grid interaction hook
  const {
    isDragging,
    dragMode,
    completedSelections,
    isTouchDevice,
    isInDragSelection,
    handleSwipeStart,
    handleFullHourClick,
    handleCellMouseDown,
    handleCellMouseEnter,
  } = useGridInteraction({
    readOnly,
    onCellSelect,
    selectedCells,
    getCellIndex: (h, q, d) => getCellIndex(h, q, d, dates.length),
    isCellSelected,
    isHourFullySelected,
    contentRef,
    topScrollbarRef,
  })

  // Calculate the width needed for the table based on the number of dates
  const tableWidth = dates.length * 24 + 64 // 24px per date cell + 64px for time label column

  return (
    <div ref={gridRef} className="select-none touch-none tap-highlight-transparent no-text-select">
      {/* Top scrollbar that controls the content */}
      <div
        ref={topScrollbarRef}
        className="overflow-x-auto scrollbar-visible mb-2"
        style={{
          maxWidth: "100%",
          height: "16px", // Height for the scrollbar
        }}
      >
        {/* This div creates the scrollable width */}
        <div style={{ width: `${tableWidth}px`, height: "1px" }}></div>
      </div>

      {/* Main content area */}
      <div
        ref={contentRef}
        className="overflow-x-auto scrollbar-hidden touch-action-pan-x"
        style={{ maxWidth: "100%" }}
        onMouseDown={(e) => {
          if (e.target === contentRef.current) {
            handleSwipeStart(e.clientX, e.clientY)
          }
        }}
        onTouchStart={(e) => {
          if (e.target === contentRef.current) {
            handleSwipeStart(e.touches[0].clientX, e.touches[0].clientY)
          }
        }}
      >
        <table className="border-separate" style={{ borderSpacing: "4px 4px", minWidth: `${tableWidth}px` }}>
          <thead>
            <GridHeader dates={dates} />
          </thead>
          <tbody>
            {hourLabels.map((hourLabel, index) => {
              // Calculate the actual hour index (relative to 6 AM)
              const hourIndex = startHourIndex + index

              return (
                <HourRow
                  key={`hour-${hourIndex}`}
                  hourLabel={hourLabel}
                  hourIndex={hourIndex}
                  dates={dates}
                  readOnly={readOnly}
                  isDragging={isDragging}
                  dragMode={dragMode}
                  isIndividualView={isIndividualView}
                  isHourFullySelected={isHourFullySelected}
                  isInDragSelection={isInDragSelection}
                  isCellSelected={isCellSelected}
                  getCellHeatIntensity={getCellHeatIntensity}
                  getHeatColor={(h, q, d) =>
                    getHeatColor(h, q, d, readOnly, heatmapData, maxParticipants, isIndividualView, (h, q, d) =>
                      getCellIndex(h, q, d, dates.length),
                    )
                  }
                  onFullHourClick={handleFullHourClick}
                  onCellMouseDown={handleCellMouseDown}
                  onCellMouseEnter={handleCellMouseEnter}
                  completedSelections={completedSelections}
                  isTouchDevice={isTouchDevice}
                  isSlotInRange={isSlotInRange}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
