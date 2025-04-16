"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface GridCellProps {
  hourIndex: number
  dateIndex: number
  isFullySelected: boolean
  segments: boolean[]
  readOnly: boolean
  onCellSelect: (hourIndex: number, quarterIndex: number, dateIndex: number) => void
}

export function GridCell({ hourIndex, dateIndex, isFullySelected, segments, readOnly, onCellSelect }: GridCellProps) {
  return (
    <td className="p-0">
      <motion.div
        className={cn("h-14 w-14 relative", isFullySelected ? "bg-black" : "bg-gray-200")}
        animate={
          isFullySelected
            ? {
                scale: [1, 1.08, 1],
                transition: { duration: 0.3, ease: "easeOut" },
              }
            : {}
        }
        layout
      >
        {/* Only render segments if not fully selected */}
        {!isFullySelected && (
          <div className="absolute inset-0 grid grid-rows-4 divide-y divide-gray-300">
            {[0, 1, 2, 3].map((quarterIndex) => (
              <div
                key={`quarter-${quarterIndex}`}
                className={cn(
                  "w-full h-full",
                  segments[quarterIndex] ? "bg-black" : "bg-transparent",
                  !readOnly && "cursor-pointer",
                )}
                onMouseDown={readOnly ? undefined : () => onCellSelect(hourIndex, quarterIndex, dateIndex)}
                onMouseEnter={readOnly ? undefined : () => onCellSelect(hourIndex, quarterIndex, dateIndex)}
              />
            ))}
          </div>
        )}

        {/* Invisible overlay for selection when fully selected */}
        {isFullySelected && !readOnly && (
          <div className="absolute inset-0 grid grid-rows-4">
            {[0, 1, 2, 3].map((quarterIndex) => (
              <div
                key={`quarter-${quarterIndex}`}
                className="w-full h-full cursor-pointer"
                onMouseDown={() => onCellSelect(hourIndex, quarterIndex, dateIndex)}
                onMouseEnter={() => onCellSelect(hourIndex, quarterIndex, dateIndex)}
              />
            ))}
          </div>
        )}
      </motion.div>
    </td>
  )
}
