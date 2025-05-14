"use client"

import type React from "react"

export function useTouchHandling(
  readOnly: boolean,
  onCellSelect?: (index: number) => void,
  getCellIndex: (hourIndex: number, quarterIndex: number, dateIndex: number) => number,
  isCellSelected: (hourIndex: number, quarterIndex: number, dateIndex: number) => boolean,
  setCompletedSelections: (value: { [key: string]: boolean }) => void,
) {
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

    if (!isCellSelected(hourIndex, quarterIndex, dateIndex) && allQuartersSelected) {
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

    if (!isCellSelected(hourIndex, quarterIndex, dateIndex) && allQuartersSelected) {
      // This will complete a block
      setCompletedSelections({ [hourKey]: true })
      setTimeout(() => setCompletedSelections({}), 300)
    }
  }

  return {
    handleTap,
    handleMobileTap,
  }
}
