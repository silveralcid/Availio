"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Users, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Participant } from "@/types"

interface ParticipantSelectorProps {
  participants: Participant[]
  selectedParticipantId: number | null
  onSelectParticipant: (participantId: number | null) => void
}

export function ParticipantSelector({
  participants,
  selectedParticipantId,
  onSelectParticipant,
}: ParticipantSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Sort participants by name
  const sortedParticipants = [...participants].sort((a, b) => {
    return a.name.localeCompare(b.name)
  })

  // Get the name of the selected participant or "All Participants" if none selected
  const getSelectedName = () => {
    if (selectedParticipantId === null) {
      return "All Participants"
    }

    const participant = participants.find((p) => p.id === selectedParticipantId)
    return participant ? participant.name : "All Participants"
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle selection
  const handleSelect = (id: number | null) => {
    onSelectParticipant(id)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="outline" className="w-full justify-between" onClick={() => setIsOpen(!isOpen)} type="button">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{getSelectedName()}</span>
        </div>
        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          <div className="px-2 py-1.5 text-sm font-semibold">Select Participant</div>
          <div className="h-px bg-muted my-1"></div>

          <div className="py-1">
            <button
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
              onClick={() => handleSelect(null)}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>All Participants</span>
              {selectedParticipantId === null && <Check className="ml-auto h-4 w-4" />}
            </button>
          </div>

          {sortedParticipants.length > 0 && <div className="h-px bg-muted my-1"></div>}

          <div className="py-1">
            {sortedParticipants.map((participant) => (
              <button
                key={participant.id}
                className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
                onClick={() => handleSelect(participant.id)}
              >
                <span className="ml-6">{participant.name}</span>
                {selectedParticipantId === participant.id && <Check className="ml-auto h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
