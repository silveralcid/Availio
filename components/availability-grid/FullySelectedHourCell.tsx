"use client"

import type React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FullySelectedHourCellProps {
  hourIndex: number
  dateIndex: number
  readOnly: boolean
  onClick: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void
  animate?: boolean
  isTouchDevice?: boolean
}

export function FullySelectedHourCell({
  hourIndex,
  dateIndex,
  readOnly,
  onClick,
  animate = false,
  isTouchDevice = false,
}: FullySelectedHourCellProps) {
  // Handle touch events differently for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (readOnly) return

    // For mobile devices, handle touch directly
    if (isTouchDevice) {
      onClick(e)
      // Prevent default to avoid scrolling
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <>
      <motion.div
        className={cn(
          "absolute inset-0 bg-black",
          !readOnly && "cursor-pointer",
          !readOnly && !isTouchDevice && "hover:bg-black/90", // Add hover effect for desktop only
          !readOnly && (isTouchDevice ? "active:opacity-70" : "active:bg-black/80"), // Different active states
          !readOnly && "prevent-double-tap-zoom",
          isTouchDevice && !readOnly && "touch-feedback", // Add touch feedback class for mobile
        )}
        initial={{ scale: 1 }}
        animate={animate ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
        onClick={!readOnly && !isTouchDevice ? onClick : undefined}
        onMouseDown={!readOnly && !isTouchDevice ? onClick : undefined}
        onTouchStart={!readOnly ? handleTouchStart : undefined}
        data-hour-index={hourIndex}
        data-date-index={dateIndex}
      />
      {/* Invisible overlay to show hover feedback - only on desktop */}
      {!readOnly && !isTouchDevice && (
        <div className="absolute inset-0 grid grid-rows-4 pointer-events-none">
          {[0, 1, 2, 3].map((quarterIndex) => (
            <div
              key={`quarter-hover-${hourIndex}-${quarterIndex}-${dateIndex}`}
              className="w-full h-full border border-transparent hover:border-gray-400"
              data-hour-index={hourIndex}
              data-quarter-index={quarterIndex}
              data-date-index={dateIndex}
            />
          ))}
        </div>
      )}
    </>
  )
}
