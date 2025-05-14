"use client"

import type React from "react"

import { useEffect, type MutableRefObject } from "react"
import type { DragCoordinates } from "./useGridInteraction"

interface UseGlobalEventsProps {
  isDragging: boolean
  isHorizontalSwiping: boolean
  dragStartCoords: DragCoordinates | null
  dragCurrentCoords: DragCoordinates | null
  dragMode: "select" | "deselect"
  selectedCells: number[]
  swipeStartRef: MutableRefObject<{ x: number; y: number; scrollLeft: number } | null>
  touchMoveRef: MutableRefObject<boolean>
  touchStartTimeRef: MutableRefObject<number>
  touchStartPositionRef: MutableRefObject<{ x: number; y: number } | null>
  setIsDragging: (value: boolean) => void
  setDragStartCoords: (value: DragCoordinates | null) => void
  setDragCurrentCoords: (value: DragCoordinates | null) => void
  stopAutoScroll: () => void
  handleSwipeEnd: () => void
  processDragSelection: () => void
  handleTap: (hourIndex: number, quarterIndex: number, dateIndex: number) => void
  handleSwipeMove: (clientX: number, clientY: number) => boolean
  updateAutoScroll: (clientX: number, clientY: number) => void
  contentRef: React.RefObject<HTMLDivElement>
  isTouchDevice: boolean
}

export function useGlobalEvents({
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
}: UseGlobalEventsProps) {
  // Set up global event handlers
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        // Process all cells in the drag selection range to ensure none are missed
        processDragSelection()

        // Reset drag state
        setIsDragging(false)
        setDragStartCoords(null)
        setDragCurrentCoords(null)
        stopAutoScroll()
      }
      handleSwipeEnd()
    }

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      // If we're on a mobile device and we have drag start coordinates but aren't dragging,
      // don't do anything - the tap was already handled by handleMobileTap
      if (isTouchDevice && dragStartCoords && !isDragging) {
        // Reset states
        setDragStartCoords(null)
        setDragCurrentCoords(null)
        touchMoveRef.current = false
        touchStartPositionRef.current = null
        return
      }

      // Check if this was a tap (no significant movement and short duration)
      const touchEndTime = Date.now()
      const touchDuration = touchEndTime - touchStartTimeRef.current

      if (dragStartCoords && !isDragging && touchDuration < 300 && !touchMoveRef.current) {
        // This was a tap, not a drag
        handleTap(dragStartCoords.hourIndex, dragStartCoords.quarterIndex, dragStartCoords.dateIndex)
      } else if (isDragging) {
        // Process all cells in the drag selection range to ensure none are missed
        processDragSelection()
      }

      // Reset states
      setIsDragging(false)
      setDragStartCoords(null)
      setDragCurrentCoords(null)
      stopAutoScroll()
      touchMoveRef.current = false
      touchStartPositionRef.current = null

      handleSwipeEnd()
    }

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]

        // Mark that touch has moved
        if (touchStartPositionRef.current) {
          const dx = Math.abs(touch.clientX - touchStartPositionRef.current.x)
          const dy = Math.abs(touch.clientY - touchStartPositionRef.current.y)

          // If moved more than threshold, it's not a tap
          if (dx > 5 || dy > 5) {
            touchMoveRef.current = true
          }
        }

        // Try horizontal swiping first (allow this on all devices)
        if (handleSwipeMove(touch.clientX, touch.clientY)) {
          e.preventDefault()
          return
        }

        // On mobile devices, don't start dragging for selection
        if (isTouchDevice) {
          return
        }

        // For non-mobile touch devices, continue with normal drag behavior
        if (dragStartCoords && !isDragging && touchMoveRef.current) {
          // Start dragging if we've moved enough
          setIsDragging(true)
        }

        // If not horizontal swiping and we're dragging, handle cell selection
        if (isDragging) {
          updateAutoScroll(touch.clientX, touch.clientY)

          // Find the element under the touch point
          const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY)
          if (elementUnderTouch) {
            // Check if the element or its parent has data attributes for hour, quarter, and date indices
            const cellElement = elementUnderTouch.closest("[data-hour-index][data-quarter-index][data-date-index]")
            if (cellElement) {
              const hourIndex = Number.parseInt(cellElement.getAttribute("data-hour-index") || "0", 10)
              const quarterIndex = Number.parseInt(cellElement.getAttribute("data-quarter-index") || "0", 10)
              const dateIndex = Number.parseInt(cellElement.getAttribute("data-date-index") || "0", 10)

              // Update current drag coordinates
              setDragCurrentCoords({ hourIndex, quarterIndex, dateIndex })
            }
          }
          e.preventDefault()
        }
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (dragStartCoords && !isDragging) {
        // Check if mouse has moved enough to consider it a drag
        if (swipeStartRef.current) {
          const moveThreshold = 5 // pixels
          const dx = Math.abs(e.clientX - swipeStartRef.current.x)
          const dy = Math.abs(e.clientY - swipeStartRef.current.y)

          if (dx > moveThreshold || dy > moveThreshold) {
            // Mouse has moved enough, start dragging
            setIsDragging(true)
          }
        }
      }

      if (isDragging) {
        updateAutoScroll(e.clientX, e.clientY)
      } else if (swipeStartRef.current) {
        handleSwipeMove(e.clientX, e.clientY)
      }
    }

    // Prevent default behavior for touch events to avoid scrolling while dragging
    const preventDefaultForTouchMove = (e: TouchEvent) => {
      if ((isDragging && touchMoveRef.current) || isHorizontalSwiping) {
        e.preventDefault()
      }
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)
    window.addEventListener("touchend", handleGlobalTouchEnd)
    window.addEventListener("touchmove", handleGlobalTouchMove, { passive: false })
    window.addEventListener("mousemove", handleGlobalMouseMove)
    document.addEventListener("touchmove", preventDefaultForTouchMove, { passive: false })

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
      window.removeEventListener("touchend", handleGlobalTouchEnd)
      window.removeEventListener("touchmove", handleGlobalTouchMove)
      window.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("touchmove", preventDefaultForTouchMove)
      stopAutoScroll()
    }
  }, [
    isDragging,
    isHorizontalSwiping,
    dragStartCoords,
    dragCurrentCoords,
    dragMode,
    selectedCells,
    processDragSelection,
    setIsDragging,
    setDragStartCoords,
    setDragCurrentCoords,
    stopAutoScroll,
    handleSwipeEnd,
    handleTap,
    handleSwipeMove,
    updateAutoScroll,
    isTouchDevice,
  ])
}
