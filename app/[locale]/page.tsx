

// import { getTranslations } from "next-intl/server" // Temporarily disabled
import {
  HeroSection,
  FeaturesSection,
  ParkInfoSection,
  FAQSection,
  StructuredData
} from "@/components/home"
import { ErrorBoundary } from "@/components/error-boundary"
import NewWhyChooseluna from "@/components/home/new-whychooseluna"
import NewSecondWhy from "@/components/home/new-second-why"

import { ThreeDCarousel } from "@/components/home/ThreeDCarousel"
import AmusementParkScroll from "@/components/home/AmusementParkScroll"
import ImageCarousel from "@/components/home/ImageCarousel"
import PopularRides from "@/components/home/popular-rides"
import PopularPackages from "@/components/home/popular-packages"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  
  const titles = {
    en: "Luna Amusement Park - Thrilling Rides & Family Fun",
    ru: "Парк развлечений Луна - Захватывающие аттракционы и семейный отдых"
  }
  
  const descriptions = {
    en: "Experience the magic at Luna Amusement Park - thrilling rides, family fun, and unforgettable memories await!",
    ru: "Испытайте магию в парке развлечений Луна - захватывающие аттракционы, семейное веселье и незабываемые воспоминания ждут вас!"
  }
  
  return {
    title: titles[locale as 'en' | 'ru'] || titles.en,
    description: descriptions[locale as 'en' | 'ru'] || descriptions.en,
    keywords: [
      "Luna Amusement Park",
      "theme park", 
      "family entertainment",
      "roller coasters",
      "Entertainment City",
      "amusement park tickets",
      "thrill rides",
      "family fun"
    ],
    openGraph: {
      title: titles[locale as 'en' | 'ru'] || titles.en,
      description: descriptions[locale as 'en' | 'ru'] || descriptions.en,
      images: [
        {
          url: '/amusement-park-aerial-view.png',
          width: 1200,
          height: 630,
          alt: 'Luna Amusement Park Aerial View',
        },
      ],
    },
  }
}

export default function HomePage({ params }: Props) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Hero Section with Parallax */}
        <HeroSection />
        <AmusementParkScroll />
        <NewWhyChooseluna />

        {/* Popular Rides Section */}
        <PopularRides />

        {/* Popular Packages Section */}
        <PopularPackages />

        {/* Park Information with Background Beams */}
        <ParkInfoSection />
        <ImageCarousel />
       
        {/* FAQ Section */}
        <FAQSection />

        {/* Structured Data for SEO */}
        <StructuredData />
      </div>
    </ErrorBoundary>
  )
}