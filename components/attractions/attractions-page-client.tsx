"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Ticket, Info, Star, ArrowDown, RefreshCw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { TicketPurchaseButton } from "@/components/tickets/ticket-purchase-button"
import { RealAttractionsGrid } from "@/components/attractions/real-attractions-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { formatCurrencySimple } from "@/lib/currency-utils"

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

interface AttractionsPageClientProps {
  initialRides: IRide[]
  initialPackages: IPackage[]
  locale: string
}

export function AttractionsPageClient({ 
  initialRides, 
  initialPackages, 
  locale 
}: AttractionsPageClientProps) {
  // Add error handling for translations
  let t: any
  try {
    t = useTranslations('attractionsPage')
  } catch (error) {
    console.warn('Translation context not available, using fallbacks')
    // Fallback translations
    t = (key: string) => {
      const fallbacks: Record<string, string> = {
        'title': 'Attractions & Rides',
        'subtitle': 'Experience the thrill at Luna Park',
        'searchPlaceholder': 'Search attractions...',
        'filterAll': 'All',
        'filterRides': 'Rides',
        'filterPackages': 'Packages',
        'noResults': 'No attractions found',
        'loading': 'Loading...',
        'refresh': 'Refresh'
      }
      return fallbacks[key] || key
    }
  }
  const [rides, setRides] = useState<IRide[]>(initialRides)
  const [packages, setPackages] = useState<IPackage[]>(initialPackages)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)


  // Fetch attractions from API
  const fetchAttractions = async () => {
    try {
      const response = await fetch('/api/public/attractions')
      const result = await response.json()
      
      if (result.success) {
        setRides(result.data.attractions)
      } else {
        toast.error('Failed to fetch attractions')
      }
    } catch (error) {
      toast.error('Failed to fetch attractions')
    }
  }

  // Fetch packages from API
  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/public/packages')
      const result = await response.json()
      
      if (result.success) {
        setPackages(result.data.packages)
      } else {
        toast.error('Failed to fetch packages')
      }
    } catch (error) {
      toast.error('Failed to fetch packages')
    }
  }

  // Refresh all data
  const refreshData = async () => {
    setRefreshing(true)
    try {
      await Promise.all([fetchAttractions(), fetchPackages()])
      toast.success('Data refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  // Hero Section Component
  const HeroSection = () => (
    <header className="relative flex items-center justify-center h-[60vh] min-h-[400px] max-h-[650px] w-full text-center text-white">
      <Image
        src="/roller-coaster-thunder-mountain.png"
        alt="Thrilling roller coaster at Luna Amusement Park"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      <div className="relative z-10 flex flex-col items-center p-4 space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl drop-shadow-lg">
          {t('hero.title')}
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-gray-200 drop-shadow-md">
          {t('hero.subtitle')}
        </p>
        <a href="#attractions-tabs">
          <Button
            size="lg"
            className="rounded-full h-12 px-8 text-base font-bold bg-white text-blue-600 hover:bg-gray-200 transition-transform hover:scale-105"
          >
            {t('hero.cta')} <ArrowDown className="ml-2 h-5 w-5" />
          </Button>
        </a>
      </div>
    </header>
  )

  // Packages Grid Component
  const PackagesGrid = () => {
    if (!packages.length) {
      return (
        <div className="text-center py-20">
          <div className="bg-white rounded-3xl p-12 max-w-md mx-auto shadow-lg border">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Ticket className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">
              {t('noPackages.title')}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {t('noPackages.subtitle')}
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map(pkg => (
          <Card
            key={pkg._id}
            className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white border-2 border-gray-100 hover:border-purple-200 overflow-hidden rounded-2xl"
          >
            <div className="relative h-56 overflow-hidden bg-gray-200">
              {pkg.image ? (
                <Image
                  src={pkg.image}
                  alt={pkg.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <Star className="h-16 w-16 text-purple-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <Badge className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white border-none shadow-lg font-medium">
                {pkg.category}
              </Badge>
              {pkg.discountPercent && (
                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  SAVE {pkg.discountPercent}%
                </div>
              )}
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-purple-700 transition-colors">
                  {pkg.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{t('labels.validOnSelectedDate')}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatCurrencySimple(pkg.price)}
                    </div>
                    <div className="text-xs text-gray-500">per package</div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed line-clamp-2 pt-1">
                  {pkg.description}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    {t('labels.includesRides', { count: pkg.rides.length })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pkg.rides.slice(0, 3).map(ride => (
                    <Badge
                      key={ride._id}
                      variant="secondary"
                      className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-medium hover:bg-blue-100 transition-colors"
                    >
                      {ride.title}
                    </Badge>
                  ))}
                  {pkg.rides.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-purple-100 text-purple-700 border border-purple-200 font-medium"
                    >
                      +{pkg.rides.length - 3} {t('labels.more')}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700 hover:text-purple-700 font-semibold rounded-xl h-12 transition-all duration-200"
                  asChild
                >
                  <Link href={`/packages/${pkg._id}`}>
                    <Info className="mr-2 h-4 w-4" />
                    {t('labels.viewDetails')}
                  </Link>
                </Button>
                <TicketPurchaseButton
                  tier={{
                    id: pkg._id,
                    name: pkg.name,
                    price: pkg.price,
                    description:
                      pkg.description || "Amazing package deal at Luna Park",
                    features: [
                      `${pkg.rides.length} rides included`,
                      `Valid on selected date`,
                      pkg.category,
                    ],
                    buttonText: t('labels.buyPackage'),
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 h-12 border-0"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-700">
              {t('loading.title')}
            </h3>
            <p className="text-gray-500 text-sm">
              {t('loading.subtitle')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      <HeroSection />

      {/* Main Content Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10 pb-20 lg:pb-28">

        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        <Tabs defaultValue="rides" className="w-full" id="attractions-tabs">
          {/* Enhanced TabsList */}
          <div className="flex justify-center mb-12">
            <TabsList className="inline-flex h-14 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm p-1.5 shadow-lg border border-gray-200/50">
              <TabsTrigger
                value="rides"
                className="rounded-full px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Ticket className="h-5 w-5 mr-2" />
                <span className="font-bold">{t('tabs.individualRides')}</span>
                <Badge
                  variant="secondary"
                  className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5"
                >
                  {rides.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="packages"
                className="rounded-full px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Star className="h-5 w-5 mr-2" />
                <span className="font-bold">{t('tabs.valuePackages')}</span>
                <Badge
                  variant="secondary"
                  className="ml-2 bg-purple-100 text-purple-700 px-2 py-0.5"
                >
                  {packages.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="rides">
            <RealAttractionsGrid rides={rides} />
          </TabsContent>

          <TabsContent value="packages">
            <PackagesGrid />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
