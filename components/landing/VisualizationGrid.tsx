"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

interface VisualizationGridProps {
  eventName: string
}

// Sample event names for the typing animation
const SAMPLE_EVENT_NAMES = [
  "Team Weekly Sync",
  "Product Planning",
  "Design Review",
  "Sprint Retrospective",
  "Client Meeting",
  "Quarterly Planning",
  "Brainstorming Session",
  "Project Kickoff",
  "Marketing Strategy",
  "Budget Review",
]

// Animation configuration
const TYPING_CONFIG = {
  idleTimeBeforeTyping: 3000, // Time to wait after user stops typing before starting animation (ms)
  typingSpeed: 1500, // Time between typing each character (ms)
  pauseBetweenNames: 100, // Pause time between different event names (ms)
  deleteSpeed: 1500, // Time between deleting each character (ms)
  pauseBeforeDeleting: 100, // Pause time before starting to delete text (ms)
}

export default function VisualizationGrid({ eventName }: VisualizationGridProps) {
  // Store the grid state to prevent complete re-randomization on every render
  const [gridState, setGridState] = useState<{
    intensities: number[]
    highlightedCells: number[]
  }>({
    intensities: Array.from({ length: 35 }, () => Math.random()),
    highlightedCells: [],
  })

  // State to track if user is actively typing
  const [isUserTyping, setIsUserTyping] = useState(false)

  // State for the simulated event name during animation
  const [simulatedEventName, setSimulatedEventName] = useState("")

  // Ref to store the timeout ID for detecting when user stops typing
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Ref to track the current animation state
  const animationStateRef = useRef({
    currentSampleIndex: 0,
    isTyping: true,
    currentPosition: 0,
    currentText: "",
  })

  // Effect to detect when user starts/stops typing
  useEffect(() => {
    // User has typed something
    setIsUserTyping(true)

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set a new timeout to detect when user stops typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false)

      // Reset animation state when starting a new animation
      animationStateRef.current = {
        currentSampleIndex: Math.floor(Math.random() * SAMPLE_EVENT_NAMES.length),
        isTyping: true,
        currentPosition: 0,
        currentText: "",
      }

      // Start with empty text
      setSimulatedEventName("")
    }, TYPING_CONFIG.idleTimeBeforeTyping)

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [eventName])

  // Effect to handle the typing animation when user is not typing
  useEffect(() => {
    if (isUserTyping) return

    const animateTyping = () => {
      const state = animationStateRef.current
      const currentSample = SAMPLE_EVENT_NAMES[state.currentSampleIndex]

      if (state.isTyping) {
        // Typing forward
        if (state.currentPosition < currentSample.length) {
          // Add next character
          state.currentText = currentSample.substring(0, state.currentPosition + 1)
          state.currentPosition++
          setSimulatedEventName(state.currentText)

          // Schedule next character
          setTimeout(animateTyping, TYPING_CONFIG.typingSpeed)
        } else {
          // Reached end of text, pause before deleting
          state.isTyping = false
          setTimeout(animateTyping, TYPING_CONFIG.pauseBeforeDeleting)
        }
      } else {
        // Deleting
        if (state.currentPosition > 0) {
          // Remove last character
          state.currentPosition--
          state.currentText = currentSample.substring(0, state.currentPosition)
          setSimulatedEventName(state.currentText)

          // Schedule next deletion
          setTimeout(animateTyping, TYPING_CONFIG.deleteSpeed)
        } else {
          // Finished deleting, move to next sample
          state.isTyping = true
          state.currentSampleIndex = (state.currentSampleIndex + 1) % SAMPLE_EVENT_NAMES.length

          // Pause before starting next sample
          setTimeout(animateTyping, TYPING_CONFIG.pauseBetweenNames)
        }
      }
    }

    // Start the animation
    const timeoutId = setTimeout(animateTyping, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [isUserTyping])

  // Determine which event name to use for visualization
  const displayEventName = isUserTyping ? eventName : simulatedEventName

  // Update visualization when display event name changes
  useEffect(() => {
    // Fixed number of cells to highlight (independent of event name length)
    const numberOfHighlightedCells = 12

    // Generate a seed based on the event name for consistent randomization
    const nameSeed = displayEventName
      ? displayEventName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : Date.now()

    // Pseudo-random number generator with seed
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }

    // Generate highlighted cells using the seed
    const newHighlightedCells: number[] = []
    let seed = nameSeed

    // Generate the fixed number of highlighted cells
    while (newHighlightedCells.length < numberOfHighlightedCells) {
      seed = seed + 1
      const cellIndex = Math.floor(seededRandom(seed) * 35)

      // Avoid duplicates
      if (!newHighlightedCells.includes(cellIndex)) {
        newHighlightedCells.push(cellIndex)

        // Occasionally add an adjacent cell to create patterns
        if (seededRandom(seed + 100) > 0.7) {
          const adjacentOptions = [
            (cellIndex + 1) % 35, // right
            (cellIndex - 1 + 35) % 35, // left
            (cellIndex + 7) % 35, // down
            (cellIndex - 7 + 35) % 35, // up
          ]

          const adjacentCell = adjacentOptions[Math.floor(seededRandom(seed + 200) * 4)]
          if (!newHighlightedCells.includes(adjacentCell)) {
            newHighlightedCells.push(adjacentCell)
          }
        }
      }
    }

    // Generate new random intensities for all cells
    const newIntensities = Array.from({ length: 35 }, (_, i) => {
      // Use the seed to generate consistent random values
      return seededRandom(nameSeed + i * 1000)
    })

    setGridState({
      intensities: newIntensities,
      highlightedCells: newHighlightedCells,
    })
  }, [displayEventName])

  return (
    <div className="grid grid-cols-7 gap-1 mb-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="text-center text-xs font-medium">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
        </div>
      ))}

      {gridState.intensities.slice(0, 35).map((intensity, i) => {
        const isHighlighted = gridState.highlightedCells.includes(i)

        // Create more variation in the background colors
        let bgColor
        if (isHighlighted) {
          // Highlighted cells have varying intensities of the primary color
          const highlightIntensity = 0.6 + intensity * 0.4 // Between 60% and 100%
          bgColor = `bg-primary opacity-${Math.round(highlightIntensity * 100)}`
        } else {
          // Non-highlighted cells have more subtle variations
          if (intensity > 0.85) {
            bgColor = "bg-primary/50"
          } else if (intensity > 0.7) {
            bgColor = "bg-primary/40"
          } else if (intensity > 0.55) {
            bgColor = "bg-primary/30"
          } else if (intensity > 0.4) {
            bgColor = "bg-primary/20"
          } else if (intensity > 0.25) {
            bgColor = "bg-primary/15"
          } else {
            bgColor = "bg-primary/10"
          }
        }

        return (
          <motion.div
            key={i}
            className={`aspect-square rounded-sm ${bgColor}`}
            initial={{ scale: 1 }}
            animate={{
              scale: isHighlighted ? [1, 1.1, 1] : 1,
              opacity: isHighlighted ? 1 : 0.3 + intensity * 0.7, // More variation in opacity
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
              delay: isHighlighted ? (i % 7) * 0.03 : 0, // Staggered animation for highlighted cells
            }}
          />
        )
      })}
    </div>
  )
}
