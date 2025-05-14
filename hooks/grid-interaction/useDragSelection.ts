"use client"

import type { DragCoordinates } from "./useGridInteraction"

export function useDragSelection(
  isDragging: boolean,
  dragStartCoords: DragCoordinates | null,
  dragCurrentCoords: DragCoordinates | null,
  onCellSelect?: (index: number) => void,
  selectedCells: number[],
  dragMode: "select" | "deselect",
  setCompletedSelections: (value: { [key: string]: boolean }) => void,
) {
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

        // Track if this will complete a full hour block
        const hourKey = `${h}-${d}`
        let selectedQuarters = 0
        let totalQuartersInRange = 0

        // Process all quarters in range
        for (let q = startQuarter; q <= endQuarter; q++) {
          totalQuartersInRange++
          const isSelected = selectedCells.includes(h * 4 + q)

          // Count currently selected quarters
          if (isSelected && dragMode === "select") {
            selectedQuarters++
          } else if (!isSelected && dragMode === "deselect") {
            selectedQuarters++
          }

          // Apply selection based on drag mode
          if ((dragMode === "select" && !isSelected) || (dragMode === "deselect" && isSelected)) {
            onCellSelect?.(h * 4 + q)
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

  return {
    isInDragSelection,
    processDragSelection,
  }
}
