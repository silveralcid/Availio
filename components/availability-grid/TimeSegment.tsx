"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type React from "react"

interface TimeSegmentProps {
  hourIndex: number
  quarterIndex: number
  dateIndex: number
  isSelected: boolean
  isInDragSelection: boolean
  dragMode: "select" | "deselect"
  isDragging: boolean
  readOnly: boolean
  heatColor: string
  onMouseDown: (e: React.MouseEvent | React.TouchEvent) => void
  onMouseEnter: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  animate?: boolean
  isTouchDevice?: boolean
}

export function TimeSegment({
  hourIndex,
  quarterIndex,
  dateIndex,
  isSelected,
  isInDragSelection,
  dragMode,
  isDragging,
  readOnly,
  heatColor,
  onMouseDown,
  onMouseEnter,
  onTouchStart,
  animate = false,
  isTouchDevice = false,
}: TimeSegmentProps) {
  // Visual state based on selection, drag mode, and drag selection
  const isVisuallySelected = readOnly ? false : isSelected

  // Preview state for drag selection - only show on desktop
  const isPreviewSelected =
    !readOnly &&
    !isTouchDevice && // Don't show preview on mobile
    isInDragSelection &&
    ((dragMode === "select" && !isSelected) || (dragMode === "deselect" && isSelected))

  // Handle touch events differently for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTouchDevice && onTouchStart) {
      onTouchStart(e)
    } else if (onMouseDown) {
      onMouseDown(e)
    }
  }

  return (
    <motion.div
      key={`quarter-${hourIndex}-${quarterIndex}-${dateIndex}`}
      className={cn(
        "w-full h-full",
        readOnly ? heatColor : "",
        !readOnly && "cursor-pointer",
        !readOnly && !isTouchDevice && "hover:bg-gray-300", // Add hover effect for desktop only
        !readOnly && (isTouchDevice ? "active:opacity-70" : "active:bg-gray-400"), // Different active states
        isDragging && !isTouchDevice && "cursor-grabbing", // Only show grabbing cursor on desktop
        isVisuallySelected && !readOnly ? "bg-black" : "",
        isPreviewSelected && dragMode === "select" ? "bg-black/60" : "",
        isTouchDevice && !readOnly && "touch-feedback", // Add touch feedback class for mobile
      )}
      animate={animate && isVisuallySelected && !isDragging ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
      onMouseDown={!readOnly && !isTouchDevice ? onMouseDown : undefined}
      onTouchStart={!readOnly ? handleTouchStart : undefined}
      onMouseEnter={!readOnly && !isTouchDevice ? onMouseEnter : undefined} // Disable mouseEnter on mobile
      data-hour-index={hourIndex}
      data-quarter-index={quarterIndex}
      data-date-index={dateIndex}
    />
  )
}
