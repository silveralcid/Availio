"use client"

import type React from "react"
import type { MutableRefObject } from "react"

export function useSwipeHandling(
  contentRef: React.RefObject<HTMLDivElement>,
  topScrollbarRef: React.RefObject<HTMLDivElement>,
  swipeStartRef: MutableRefObject<{ x: number; y: number; scrollLeft: number } | null>,
  isDragging: boolean,
  setIsHorizontalSwiping: (value: boolean) => void,
) {
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

  return {
    handleSwipeStart,
    handleSwipeMove,
    handleSwipeEnd,
  }
}
