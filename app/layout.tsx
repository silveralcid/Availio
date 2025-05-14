import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { EventProvider } from "@/context/EventContext"

export const metadata: Metadata = {
  title: "Availio - Find the perfect time for your next meeting",
  description: "Schedule group events easily with Availio",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <EventProvider>{children}</EventProvider>
      </body>
    </html>
  )
}
