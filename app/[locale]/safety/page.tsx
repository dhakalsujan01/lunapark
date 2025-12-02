import type { Metadata } from "next"
import { SafetyHero } from "@/components/safety/safety-hero"
import { SafetyRules } from "@/components/safety/safety-rules"
import { SafetyGuidelines } from "@/components/safety/safety-guidelines"
import { DisclaimerSection } from "@/components/safety/disclaimer.section"

export const metadata: Metadata = {
  title: "Safety Guidelines & Disclaimer - Adventure Park",
  description:
    "Important safety information, park rules, and liability disclaimer for Adventure Park visitors. Your safety is our top priority.",
  keywords:
    "safety guidelines, park rules, height requirements, liability disclaimer, visitor safety, amusement park safety",
  openGraph: {
    title: "Safety Guidelines & Disclaimer - Adventure Park",
    description: "Important safety information and park rules for Adventure Park visitors.",
    url: "https://adventurepark.com/safety",
    images: [
      {
        url: "/thrilling-roller-coaster.png",
        width: 1200,
        height: 630,
        alt: "Adventure Park Safety Guidelines - Your Safety is Our Priority",
      },
    ],
  },
  twitter: {
    title: "Safety Guidelines & Disclaimer - Adventure Park",
    description: "Important safety information and park rules for Adventure Park visitors.",
    images: ["/thrilling-roller-coaster.png"],
  },
  alternates: {
    canonical: "https://adventurepark.com/safety",
  },
}

export default function SafetyPage() {
  return (
    <div className="min-h-screen pt-16 lg:pt-20">
      <SafetyHero />
      <SafetyRules />
      <SafetyGuidelines />
      <DisclaimerSection />
    </div>
  )
}