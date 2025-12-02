import type { Metadata } from "next"
import { AttractionsPageClient } from "@/components/attractions/attractions-page-client"
import { getTranslations } from "next-intl/server"

// --- METADATA ---
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  
  return {
    title: locale === "ru" 
      ? "Аттракционы - Захватывающие аттракционы и семейное веселье"
      : "Attractions - Thrilling Rides & Family Fun",
    description: locale === "ru"
      ? "Откройте для себя более 20 аттракционов мирового класса в парке развлечений Луна. От захватывающих американских горок до семейных развлечений - найдется что-то для каждого!"
      : "Discover 20+ world-class attractions at Luna Amusement Park. From heart-pounding roller coasters to family-friendly rides, there's something for everyone!",
  }
}

// --- INTERFACES (No changes needed) ---
interface IRide {
  _id: string
  title: string
  description: string
  shortDescription: string
  category: string
  price: number
  image: string
  restrictions: {
    minHeight?: number
    maxHeight?: number
    minAge?: number
    maxAge?: number
    healthWarnings?: string[]
  }
  isPublished: boolean
  duration: number
  capacity: number
  thrillLevel: number
}

interface IPackage {
  _id: string
  name: string
  description: string
  price: number
  discountPercent?: number
  validityDays: number
  category: string
  rides: IRide[]
  image?: string
  isPublished: boolean
}

// --- DATA FETCHING VIA API ---
async function getAttractions(): Promise<IRide[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/public/attractions`, {
      cache: 'no-store' // Ensure fresh data on each request
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch attractions')
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch attractions')
    }
    
    return result.data.attractions.map((ride: any) => ({
      ...ride,
      _id: ride._id.toString(),
    })) as IRide[]
  } catch (error) {
    console.error("Failed to fetch rides:", error)
    return []
  }
}

async function getPackages(): Promise<IPackage[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/public/packages`, {
      cache: 'no-store' // Ensure fresh data on each request
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch packages')
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch packages')
    }
    
    return result.data.packages.map((pkg: any) => ({
      ...pkg,
      _id: pkg._id.toString(),
      rides: pkg.rides.map((ride: any) => ({
        ...ride,
        _id: ride._id.toString(),
      })),
    })) as IPackage[]
  } catch (error) {
    console.error("Failed to fetch packages:", error)
    return []
  }
}

export default async function AttractionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  
  // Fetch initial data via API for server-side rendering
  const [initialRides, initialPackages] = await Promise.all([
    getAttractions(),
    getPackages()
  ])

  return (
    <AttractionsPageClient 
      initialRides={initialRides}
      initialPackages={initialPackages}
      locale={locale}
    />
  )
}