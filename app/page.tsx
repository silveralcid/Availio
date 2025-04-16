"use client"

import { useState } from "react"
import Header from "@/components/landing/Header"
import Footer from "@/components/landing/Footer"
import HeroSection from "@/components/landing/HeroSection"
import FeaturesSection from "@/components/landing/FeaturesSection"
import HowItWorksSection from "@/components/landing/HowItWorksSection"
import CTASection from "@/components/landing/CTASection"

export default function LandingPage() {
  const [eventName, setEventName] = useState("")

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <HeroSection eventName={eventName} setEventName={setEventName} />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection eventName={eventName} setEventName={setEventName} />
      </main>

      <Footer />
    </div>
  )
}
