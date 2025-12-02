import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AboutHero } from "@/components/about/about-hero"
import { ParkHistory } from "@/components/about/park-hero"
import { TeamSection } from "@/components/about/team-section"
import { AwardsSection } from "@/components/about/award-section"
import TeamMembersSection from "@/components/about/new-team"
import CompleteTimeline from "@/components/about/new-journey"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about.metadata' })
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://adventurepark.com/${locale}/about`,
      images: [
        {
          url: "/thrilling-roller-coaster.png",
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      title: t('title'),
      description: t('description'),
      images: ["/thrilling-roller-coaster.png"],
    },
    alternates: {
      canonical: `https://adventurepark.com/${locale}/about`,
    },
  }
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  
  return (
    <div className="min-h-screen">
      <TeamMembersSection />
      <CompleteTimeline />
    </div>
  )
}