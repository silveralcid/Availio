"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Users, Share2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface ResultsHeaderProps {
  eventId: string
  participantCount: number
}

export function ResultsHeader({ eventId, participantCount }: ResultsHeaderProps) {
  const searchParams = useSearchParams()
  const [showSubmissionMessage, setShowSubmissionMessage] = useState(false)

  useEffect(() => {
    // Check if we just came from submission
    const justSubmitted = searchParams.get("submitted") === "true"
    if (justSubmitted) {
      setShowSubmissionMessage(true)

      // Hide the message after 5 seconds
      const timer = setTimeout(() => {
        setShowSubmissionMessage(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Event Results",
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={`/event/${eventId}`} className="flex items-center gap-2">
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Event</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{participantCount} participants</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showSubmissionMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-50 text-green-700 px-4 py-2 flex items-center justify-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Thank you! Your availability has been submitted successfully.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
