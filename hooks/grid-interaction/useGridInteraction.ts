"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useAutoScroll } from "./useAutoScroll"
import { useDragSelection } from "./useDragSelection"
import { useSwipeHandling } from "./useSwipeHandling"
import { useGlobalEvents } from "./useGlobalEvents"
import { useTouchHandling } from "./useTouchHandling"

interface DragCoordinates {
  hourIndex: number
  quarterIndex: number
  dateIndex: number
}

interface UseGridInteractionProps {
  readOnly: boolean
  onCellSelect?: (index: number) => void
  selectedCells: number[]
  getCellIndex: (hourIndex: number, quarterIndex: number, dateIndex: number) => number
  isCellSelected: (hourIndex: number, quarterIndex: number, dateIndex: number) => boolean
  isHourFullySelected: (hourIndex: number, dateIndex: number) => boolean
  contentRef: React.RefObject<HTMLDivElement>
  topScrollbarRef: React.RefObject<HTMLDivElement>
}

export function useGridInteraction({
  readOnly,
  onCellSelect,
  selectedCells,
  getCellIndex,
  isCellSelected,
  isHourFullySelected,
  contentRef,
  topScrollbarRef,
}: UseGridInteractionProps) {
  // Core state
  const [isDragging, setIsDragging] = useState(false)
  const [isHorizontalSwiping, setIsHorizontalSwiping] = useState(false)
  const [dragStartCoords, setDragStartCoords] = useState<DragCoordinates | null>(null)
  const [dragCurrentCoords, setDragCurrentCoords] = useState<DragCoordinates | null>(null)
  const [dragMode, setDragMode] = useState<"select" | "deselect">("select")
  const [completedSelections, setCompletedSelections] = useState<{
    [key: string]: boolean
  }>({})
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false)

  // Refs for tracking touch and swipe state
  const touchMoveRef = useRef<boolean>(false)
  const swipeStartRef = useRef<{ x: number; y: number; scrollLeft: number } | null>(null)
  const touchStartTimeRef = useRef<number>(0)
  const touchStartPositionRef = useRef<{ x: number; y: number } | null>(null)

  // Import auto-scroll functionality
  const { scrollTimerRef, autoScrollRef, startAutoScroll, stopAutoScroll, updateAutoScroll } = useAutoScroll(
    contentRef,
    topScrollbarRef,
  )

  // Import swipe handling
  const { handleSwipeStart, handleSwipeMove, handleSwipeEnd } = useSwipeHandling(
    contentRef,
    topScrollbarRef,
    swipeStartRef,
    isDragging,
    setIsHorizontalSwiping,
  )

  // Import drag selection functionality
  const { isInDragSelection, processDragSelection } = useDragSelection(
    isDragging,
    dragStartCoords,
    dragCurrentCoords,
    onCellSelect,
    selectedCells,
    dragMode,
    setCompletedSelections,
  )

  // Import touch handling
  const { handleTap, handleMobileTap } = useTouchHandling(
    readOnly,
    onCellSelect,
    getCellIndex,
    isCellSelected,
    setCompletedSelections,
  )

  // Import global event handlers
  useGlobalEvents({
    isDragging,
    isHorizontalSwiping,
    dragStartCoords,
    dragCurrentCoords,
    dragMode,
    selectedCells,
    swipeStartRef,
    touchMoveRef,
    touchStartTimeRef,
    touchStartPositionRef,
    setIsDragging,
    setDragStartCoords,
    setDragCurrentCoords,
    stopAutoScroll,
    handleSwipeEnd,
    processDragSelection,
    handleTap,
    handleSwipeMove,
    updateAutoScroll,
    contentRef,
    isTouchDevice,
  })

  // Handle click on a fully selected hour block
  const handleFullHourClick = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    hourIndex: number,
    dateIndex: number,
  ) => {
    if (readOnly) return

    // Get the relative position of the click within the hour block
    const rect = e.currentTarget.getBoundingClientRect()
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    const relativeY = clientY - rect.top
    const height = rect.height

    // Determine which quarter was clicked based on the relative Y position
    const quarterIndex = Math.floor((relativeY / height) * 4)
    const validQuarterIndex = Math.min(Math.max(quarterIndex, 0), 3)

    // For touch events on mobile devices, use the dedicated tap handler
    if ("touches" in e && isTouchDevice) {
      handleMobileTap(hourIndex, validQuarterIndex, dateIndex, e)
      return
    }

    // Set up drag operation for deselection
    setDragMode("deselect")
    setDragStartCoords({ hourIndex, quarterIndex: validQuarterIndex, dateIndex })
    setDragCurrentCoords({ hourIndex, quarterIndex: validQuarterIndex, dateIndex })

    // For touch events, don't start dragging immediately
    if (!("touches" in e)) {
      setIsDragging(true)
    }

    // Deselect the specific quarter
    onCellSelect?.(getCellIndex(hourIndex, validQuarterIndex, dateIndex))

    // Prevent default behavior
    e.preventDefault()
    if ("touches" in e) {
      touchStartTimeRef.current = Date.now()
      touchStartPositionRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
      touchMoveRef.current = false
    }
  }

  // Handle cell mouse down
  const handleCellMouseDown = (
    hourIndex: number,
    quarterIndex: number,
    dateIndex: number,
    e: React.MouseEvent | React.TouchEvent,
  ) => {
    if (readOnly) return

    // For touch events on mobile devices, use the dedicated tap handler
    if ("touches" in e && isTouchDevice) {
      handleMobileTap(hourIndex, quarterIndex, dateIndex, e)
      return
    }

    const cellIndex = getCellIndex(hourIndex, quarterIndex, dateIndex)
    const isSelected = selectedCells.includes(cellIndex)

    // Set drag mode based on current selection state
    setDragMode(isSelected ? "deselect" : "select")

    // Store the coordinates for potential drag operations
    setDragStartCoords({ hourIndex, quarterIndex, dateIndex })
    setDragCurrentCoords({ hourIndex, quarterIndex, dateIndex })

    // For touch events or non-mobile touch, continue with normal behavior
    if ("touches" in e) {
      const touch = e.touches[0]

      // Store touch start time and position
      touchStartTimeRef.current = Date.now()
      touchStartPositionRef.current = { x: touch.clientX, y: touch.clientY }
      touchMoveRef.current = false

      // Store touch start position for swipe detection
      handleSwipeStart(touch.clientX, touch.clientY)

      // Prevent default to avoid unwanted scrolling
      e.preventDefault()
    } else {
      // For mouse events, toggle the cell immediately
      onCellSelect?.(cellIndex)

      // Store the start position for potential drag
      handleSwipeStart(e.clientX, e.clientY)

      // Check if this completes a block and animate if needed
      const hourKey = `${hourIndex}-${dateIndex}`
      const allQuartersSelected = [0, 1, 2, 3]
        .filter((q) => q !== quarterIndex)
        .every((q) => isCellSelected(hourIndex, q, dateIndex))

      if (!isSelected && allQuartersSelected) {
        // This will complete a block
        setCompletedSelections({ [hourKey]: true })
        setTimeout(() => setCompletedSelections({}), 300)
      }
    }
  }

  // Handle cell mouse enter during drag
  const handleCellMouseEnter = (hourIndex: number, quarterIndex: number, dateIndex: number) => {
    if (readOnly || !isDragging) return

    // Update current drag coordinates
    setDragCurrentCoords({ hourIndex, quarterIndex, dateIndex })

    // Get the cell index
    const cellIndex = getCellIndex(hourIndex, quarterIndex, dateIndex)
    const isSelected = selectedCells.includes(cellIndex)

    // Apply selection based on drag mode
    if ((dragMode === "select" && !isSelected) || (dragMode === "deselect" && isSelected)) {
      onCellSelect?.(cellIndex)
    }
  }

  return {
    isDragging,
    dragMode,
    dragStartCoords,
    dragCurrentCoords,
    completedSelections,
    isTouchDevice,
    isInDragSelection,
    handleSwipeStart,
    handleFullHourClick,
    handleCellMouseDown,
    handleCellMouseEnter,
  }
}

export type { DragCoordinates }
