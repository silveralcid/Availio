"use client"

import type React from "react"
import { useRef } from "react"

export function useAutoScroll(
  contentRef: React.RefObject<HTMLDivElement>,
  topScrollbarRef: React.RefObject<HTMLDivElement>,
) {
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoScrollRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

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

  return {
    scrollTimerRef,
    autoScrollRef,
    startAutoScroll,
    stopAutoScroll,
    updateAutoScroll,
  }
}
