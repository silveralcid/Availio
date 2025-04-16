"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock } from "lucide-react"
import type { Participant } from "@/types"
import { format } from "date-fns"

interface ParticipantListProps {
  participants: Participant[]
}

export function ParticipantList({ participants }: ParticipantListProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)

  // Format the submission date
  const formatSubmissionDate = (id: number) => {
    // The ID is a timestamp, so we can use it to create a date
    const date = new Date(id)
    return format(date, "MMMM d, yyyy 'at' h:mm a")
  }

  return (
    <div className="space-y-4">
      {participants.map((participant) => (
        <div key={participant.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
          <div>
            <div className="font-medium">{participant.name}</div>
            <div className="text-xs text-muted-foreground">Submitted: {formatSubmissionDate(participant.id)}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedParticipant(participant)}>
            View Availability
          </Button>
        </div>
      ))}

      {participants.length === 0 && (
        <div className="text-center p-6 text-muted-foreground">
          No participants have submitted their availability yet.
        </div>
      )}

      <Dialog open={!!selectedParticipant} onOpenChange={(open) => !open && setSelectedParticipant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedParticipant?.name}'s Availability</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedParticipant && "availability" in selectedParticipant && selectedParticipant.availability ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Submitted: {formatSubmissionDate(selectedParticipant.id)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {selectedParticipant.availability.length} time slots selected
                    </span>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">
                    This participant has selected {selectedParticipant.availability.length} time slots. In a full
                    implementation, you would see a visual representation of their availability here.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No availability data found for this participant.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
