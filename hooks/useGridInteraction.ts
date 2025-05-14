"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

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
  const [isDragging, setIsDragging] = useState(false)
  const [isHorizontalSwiping, setIsHorizontalSwiping] = useState(false)
  const [dragStartCoords, setDragStartCoords] = useState<DragCoordinates | null>(null)
  const [dragCurrentCoords, setDragCurrentCoords] = useState<DragCoordinates | null>(null)
  const [dragMode, setDragMode] = useState<"select" | "deselect">("select")
  const [completedSelections, setCompletedSelections] = useState<{
    [key: string]: boolean
  }>({})
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false)

  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoScrollRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const touchMoveRef = useRef<boolean>(false)
  const swipeStartRef = useRef<{ x: number; y: number; scrollLeft: number } | null>(null)
  const touchStartTimeRef = useRef<number>(0)
  const touchStartPositionRef = useRef<{ x: number; y: number } | null>(null)

  // Detect touch devices
  useEffect(() => {
    const detectTouchDevice = () => {
      // Check for touch capability using multiple methods
      const isTouchCapable =
        "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0

      // Also check for mobile user agent as a secondary signal
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )

      // Set as touch device if either condition is true
      setIsTouchDevice(isTouchCapable && isMobileUserAgent)
    }

    detectTouchDevice()

    // Re-check on resize (for devices that can switch between touch/mouse modes)
    window.addEventListener("resize", detectTouchDevice)
    return () => {
      window.removeEventListener("resize", detectTouchDevice)
    }
  }, [])

  // Auto-scroll function for when dragging near edges
  const startAutoScroll = () => {
    if (scrollTimerRef.current) return

    scrollTimerRef.current = setInterval(() => {
      if (!contentRef.current || (autoScrollRef.current.x === 0 && autoScrollRef.current.y === 0)) return

      contentRef.current.scrollLeft += autoScrollRef.current.x
      contentRef.current.scrollTop += autoScrollRef.current.y

      // Sync top scrollbar
      if (topScrollbarRef.current) {
        topScrollbarRef.current.scrollLeft = contentRef.current.scrollLeft
      }
    }, 16) // ~60fps
  }

  const stopAutoScroll = () => {
    if (scrollTimerRef.current) {
      clearInterval(scrollTimerRef.current)
      scrollTimerRef.current = null
    }
    autoScrollRef.current = { x: 0, y: 0 }
  }

  // Update auto-scroll values based on mouse/touch position
  const updateAutoScroll = (clientX: number, clientY: number) => {
    if (!contentRef.current) return

    const rect = contentRef.current.getBoundingClientRect()
    const scrollSpeed = 10
    const scrollThreshold = 60 // pixels from edge to start scrolling

    // Horizontal scrolling
    if (clientX < rect.left + scrollThreshold) {
      autoScrollRef.current.x = -scrollSpeed * (1 - (clientX - rect.left) / scrollThreshold)
    } else if (clientX > rect.right - scrollThreshold) {
      autoScrollRef.current.x = scrollSpeed * (1 - (rect.right - clientX) / scrollThreshold)
    } else {
      autoScrollRef.current.x = 0
    }

    // Vertical scrolling
    if (clientY < rect.top + scrollThreshold) {
      autoScrollRef.current.y = -scrollSpeed * (1 - (clientY - rect.top) / scrollThreshold)
    } else if (clientY > rect.bottom - scrollThreshold) {
      autoScrollRef.current.y = scrollSpeed * (1 - (rect.bottom - clientY) / scrollThreshold)
    } else {
      autoScrollRef.current.y = 0
    }

    if (autoScrollRef.current.x !== 0 || autoScrollRef.current.y !== 0) {
      startAutoScroll()
    } else {
      stopAutoScroll()
    }
  }

  // Handle horizontal swiping
  const handleSwipeStart = (clientX: number, clientY: number) => {
    if (!contentRef.current) return

    swipeStartRef.current = {
      x: clientX,
      y: clientY,
      scrollLeft: contentRef.current.scrollLeft,
    }
  }

  const handleSwipeMove = (clientX: number, clientY: number) => {
    if (!swipeStartRef.current || !contentRef.current || isDragging) return

    const dx = swipeStartRef.current.x - clientX
    const dy = swipeStartRef.current.y - clientY

    // If horizontal movement is greater than vertical, it's a horizontal swipe
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      setIsHorizontalSwiping(true)
      contentRef.current.scrollLeft = swipeStartRef.current.scrollLeft + dx

      // Sync top scrollbar
      if (topScrollbarRef.current) {
        topScrollbarRef.current.scrollLeft = contentRef.current.scrollLeft
      }

      return true
    }

    return false
  }

  const handleSwipeEnd = () => {
    swipeStartRef.current = null
    setIsHorizontalSwiping(false)
  }

  // Check if a cell is in the current drag selection range
  const isInDragSelection = (hourIndex: number, quarterIndex: number, dateIndex: number) => {
    if (!isDragging || !dragStartCoords || !dragCurrentCoords) return false

    // Calculate the range of the drag selection
    const startHourIndex = Math.min(dragStartCoords.hourIndex, dragCurrentCoords.hourIndex)
    const endHourIndex = Math.max(dragStartCoords.hourIndex, dragCurrentCoords.hourIndex)
    const startDateIndex = Math.min(dragStartCoords.dateIndex, dragCurrentCoords.dateIndex)
    const endDateIndex = Math.max(dragStartCoords.dateIndex, dragCurrentCoords.dateIndex)

    // Check if the current cell is within the drag selection range
    const isInHourRange = hourIndex >= startHourIndex && hourIndex <= endHourIndex
    const isInDateRange = dateIndex >= startDateIndex && dateIndex <= endDateIndex

    // For the start and end hours, we need to check the quarter indices
    if (isInHourRange && isInDateRange) {
      if (hourIndex === startHourIndex && hourIndex === endHourIndex) {
        // If it's both the start and end hour, check quarter range
        const startQuarterIndex = Math.min(dragStartCoords.quarterIndex, dragCurrentCoords.quarterIndex)
        const endQuarterIndex = Math.max(dragStartCoords.quarterIndex, dragCurrentCoords.quarterIndex)
        return quarterIndex >= startQuarterIndex && quarterIndex <= endQuarterIndex
      } else if (hourIndex === startHourIndex) {
        // If it's the start hour, check if quarter is >= start quarter
        const startQuarterIndex =
          dragStartCoords.hourIndex <= dragCurrentCoords.hourIndex
            ? dragStartCoords.quarterIndex
            : dragCurrentCoords.quarterIndex
        return quarterIndex >= startQuarterIndex
      } else if (hourIndex === endHourIndex) {
        // If it's the end hour, check if quarter is <= end quarter
        const endQuarterIndex =
          dragStartCoords.hourIndex >= dragCurrentCoords.hourIndex
            ? dragStartCoords.quarterIndex
            : dragCurrentCoords.quarterIndex
        return quarterIndex <= endQuarterIndex
      }
      // If it's a middle hour, all quarters are in range
      return true
    }

    return false
  }

  // Process all cells in the drag selection
  const processDragSelection = () => {
    if (!dragStartCoords || !dragCurrentCoords) return

    // Calculate the range of the drag selection
    const startHourIndex = Math.min(dragStartCoords.hourIndex, dragCurrentCoords.hourIndex)
    const endHourIndex = Math.max(dragStartCoords.hourIndex, dragCurrentCoords.hourIndex)
    const startDateIndex = Math.min(dragStartCoords.dateIndex, dragCurrentCoords.dateIndex)
    const endDateIndex = Math.max(dragStartCoords.dateIndex, dragCurrentCoords.dateIndex)

    // Track newly completed blocks for animation
    const newCompletedSelections: { [key: string]: boolean } = {}

    // Process all cells in the range
    for (let h = startHourIndex; h <= endHourIndex; h++) {
      for (let d = startDateIndex; d <= endDateIndex; d++) {
        // Determine quarter range for this hour
        let startQuarter = 0
        let endQuarter = 3

        if (h === startHourIndex && h === endHourIndex) {
          startQuarter = Math.min(dragStartCoords.quarterIndex, dragCurrentCoords.quarterIndex)
          endQuarter = Math.max(dragStartCoords.quarterIndex, dragCurrentCoords.quarterIndex)
        } else if (h === startHourIndex) {
          startQuarter =
            dragStartCoords.hourIndex <= dragCurrentCoords.hourIndex
              ? dragStartCoords.quarterIndex
              : dragCurrentCoords.quarterIndex
        } else if (h === endHourIndex) {
          endQuarter =
            dragStartCoords.hourIndex >= dragCurrentCoords.hourIndex
              ? dragStartCoords.quarterIndex
              : dragCurrentCoords.quarterIndex
        }

        // Check if this is a fully selected hour block when in deselect mode
        const isFullySelected = isHourFullySelected(h, d)

        // Track if this will complete a full hour block
        const hourKey = `${h}-${d}`
        let selectedQuarters = 0
        let totalQuartersInRange = 0

        // Process all quarters in range
        for (let q = startQuarter; q <= endQuarter; q++) {
          totalQuartersInRange++
          const cellIndex = getCellIndex(h, q, d)
          const isSelected = selectedCells.includes(cellIndex)

          // Count currently selected quarters
          if (isSelected && dragMode === "select") {
            selectedQuarters++
          } else if (!isSelected && dragMode === "deselect") {
            selectedQuarters++
          }

          // For fully selected blocks in deselect mode, ensure we deselect all quarters
          if (dragMode === "deselect" && isFullySelected) {
            if (isSelected) {
              onCellSelect?.(cellIndex)
            }
          }
          // For normal cells, apply selection based on drag mode
          else if ((dragMode === "select" && !isSelected) || (dragMode === "deselect" && isSelected)) {
            onCellSelect?.(cellIndex)
          }
        }

        // Check if this action completes a full hour block
        if (totalQuartersInRange === 4) {
          if (dragMode === "select" && selectedQuarters + (4 - selectedQuarters) === 4) {
            newCompletedSelections[hourKey] = true
          } else if (dragMode === "deselect" && selectedQuarters === 4) {
            newCompletedSelections[hourKey] = true
          }
        }
      }
    }

    // Update completed selections for animation
    setCompletedSelections(newCompletedSelections)

    // Clear completed selections after animation duration
    setTimeout(() => {
      setCompletedSelections({})
    }, 300)
  }

  // Handle tap events on mobile
  const handleTap = (hourIndex: number, quarterIndex: number, dateIndex: number) => {
    if (readOnly) return

    // Toggle the cell
    const cellIndex = getCellIndex(hourIndex, quarterIndex, dateIndex)
    onCellSelect?.(cellIndex)

    // Check if this completes a block and animate if needed
    const hourKey = `${hourIndex}-${dateIndex}`
    const allQuartersSelected = [0, 1, 2, 3]
      .filter((q) => q !== quarterIndex)
      .every((q) => isCellSelected(hourIndex, q, dateIndex))

    if (!selectedCells.includes(cellIndex) && allQuartersSelected) {
      // This will complete a block
      setCompletedSelections({ [hourKey]: true })
      setTimeout(() => setCompletedSelections({}), 300)
    }
  }

  // Dedicated handler for mobile tap events
  const handleMobileTap = (hourIndex: number, quarterIndex: number, dateIndex: number, e: React.TouchEvent) => {
    if (readOnly) return

    // Prevent default to stop any scrolling or zooming
    e.preventDefault()

    // Immediately toggle the cell without waiting for touchend
    const cellIndex = getCellIndex(hourIndex, quarterIndex, dateIndex)
    onCellSelect?.(cellIndex)

    // Check if this completes a block and animate if needed
    const hourKey = `${hourIndex}-${dateIndex}`
    const allQuartersSelected = [0, 1, 2, 3]
      .filter((q) => q !== quarterIndex)
      .every((q) => isCellSelected(hourIndex, q, dateIndex))

    if (!selectedCells.includes(cellIndex) && allQuartersSelected) {
      // This will complete a block
      setCompletedSelections({ [hourKey]: true })
      setTimeout(() => setCompletedSelections({}), 300)
    }
  }

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

              // Get the cell index
              const cellIndex = getCellIndex(hourIndex, quarterIndex, dateIndex)
              const isSelected = selectedCells.includes(cellIndex)

              // Apply selection based on drag mode
              if ((dragMode === "select" && !isSelected) || (dragMode === "deselect" && isSelected)) {
                onCellSelect?.(cellIndex)
              }
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

        // Find the element under the mouse pointer
        const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY)
        if (elementUnderMouse) {
          // Check if the element or its parent has data attributes for hour, quarter, and date indices
          const cellElement = elementUnderMouse.closest("[data-hour-index][data-quarter-index][data-date-index]")
          if (cellElement) {
            const hourIndex = Number.parseInt(cellElement.getAttribute("data-hour-index") || "0", 10)
            const quarterIndex = Number.parseInt(cellElement.getAttribute("data-quarter-index") || "0", 10)
            const dateIndex = Number.parseInt(cellElement.getAttribute("data-date-index") || "0", 10)

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
        }
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
  }, [isDragging, isHorizontalSwiping, dragStartCoords, dragCurrentCoords, dragMode, selectedCells])

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
