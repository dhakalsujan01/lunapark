import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  Users, 
  Ruler, 
  Star, 
  ArrowLeft,
  Zap,
  Heart,
  AlertTriangle,
  Calendar,
  MapPin
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { IRide } from "@/models/Ride"
import { TicketPurchaseButton } from "@/components/tickets/ticket-purchase-button"

interface RideDetailPageProps {
  params: Promise<{ id: string }>
}

async function getRide(id: string): Promise<IRide | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/public/attractions/${id}`, {
      cache: 'no-store' // Ensure fresh data on each request
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch attraction')
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch attraction')
    }
    
    return result.data as IRide
  } catch (error) {
    console.error("Failed to fetch ride:", error)
    return null
  }
}

export async function generateMetadata({ params }: RideDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const ride = await getRide(id)
  
  if (!ride) {
    return {
      title: "Ride Not Found - Luna Amusement Park"
    }
  }

  return {
    title: `${ride.title} - Luna Amusement Park`,
    description: ride.description || `Experience ${ride.title} at Luna Amusement Park. ${ride.shortDescription}`,
    keywords: [
      ride.title,
      "amusement park ride",
      "Luna Park",
      ride.category,
      "theme park attraction"
    ],
    openGraph: {
      title: `${ride.title} - Luna Amusement Park`,
      description: ride.description || ride.shortDescription,
      images: [
        {
          url: ride.image || '/placeholder-ride.jpg',
          width: 1200,
          height: 630,
          alt: ride.title,
        },
      ],
    },
  }
}

const getThrillLevelColor = (level: number) => {
  switch (level) {
    case 1:
      return "bg-emerald-500" // Emerald Green for gentle rides
    case 2:
      return "bg-blue-800" // Deep Thunder Blue for family rides
    case 3:
      return "bg-amber-500" // Golden Thunder for moderate rides
    case 4:
      return "bg-orange-500" // Orange for thrilling rides
    case 5:
      return "bg-red-600" // Lightning Red for extreme rides
    default:
      return "bg-gray-500"
  }
}

const getThrillLevelText = (level: number) => {
  switch (level) {
    case 1: return "Gentle"
    case 2: return "Family"
    case 3: return "Moderate"
    case 4: return "Thrilling"
    case 5: return "Extreme"
    default: return "Unknown"
  }
}

const getThrillLevelIcon = (level: number) => {
  if (level >= 4) return <Zap className="h-5 w-5" />
  if (level >= 2) return <Heart className="h-5 w-5" />
  return <Star className="h-5 w-5" />
}

export default async function RideDetailPage({ params }: RideDetailPageProps) {
  const { id } = await params
  const ride = await getRide(id)

  if (!ride || !ride.isPublished) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back Navigation */}
      <section className="py-6 bg-gray-50">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/attractions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Attractions
            </Link>
          </Button>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden">
                <Image
                  src={ride.image || "/placeholder-ride.jpg"}
                  alt={ride.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Badges */}
                <div className="absolute top-6 left-6">
                  <Badge className={`${getThrillLevelColor(ride.thrillLevel)} text-white border-none text-lg px-4 py-2`}>
                    {getThrillLevelIcon(ride.thrillLevel)}
                    <span className="ml-2">{getThrillLevelText(ride.thrillLevel)}</span>
                  </Badge>
                </div>
                
                <div className="absolute top-6 right-6">
                  <Badge className="bg-white/90 text-gray-800 border-none text-lg px-4 py-2">
                    €{ride.price}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <div>
                  <Badge variant="outline" className="mb-4">
                    {ride.category}
                  </Badge>
                  
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {ride.title}
                  </h1>
                  
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {ride.shortDescription}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-semibold">Duration</p>
                      <p className="text-gray-600">{ride.duration} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-semibold">Capacity</p>
                      <p className="text-gray-600">{ride.capacity} riders</p>
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <div className="pt-4">
                  <TicketPurchaseButton 
                    tier={{
                      id: ride._id,
                      name: ride.title,
                      price: ride.price,
                      description: ride.description || ride.shortDescription || "Experience this amazing ride at Luna Park",
                      features: [
                        `${ride.duration} minute ride`,
                        `Capacity: ${ride.capacity} riders`,
                        `${getThrillLevelText(ride.thrillLevel)} thrill level`,
                        ride.restrictions?.minHeight ? `Min height: ${ride.restrictions.minHeight}"` : "No height restrictions",
                        ride.category
                      ],
                      buttonText: "Buy Ticket"
                    }}
                    className="w-full max-w-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Description */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">About This Ride</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {ride.description}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                {/* Restrictions */}
                {ride.restrictions && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Requirements & Restrictions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {ride.restrictions.minHeight && (
                        <div className="flex items-center gap-3">
                          <Ruler className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="font-medium">Minimum Height</p>
                            <p className="text-gray-600">{ride.restrictions.minHeight} inches</p>
                          </div>
                        </div>
                      )}
                      
                      {ride.restrictions.minAge && (
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="font-medium">Minimum Age</p>
                            <p className="text-gray-600">{ride.restrictions.minAge} years</p>
                          </div>
                        </div>
                      )}
                      
                      {ride.restrictions.healthWarnings && ride.restrictions.healthWarnings.length > 0 && (
                        <div>
                          <p className="font-medium text-yellow-600 mb-2">Health Warnings:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {ride.restrictions.healthWarnings.map((warning, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-yellow-500 mt-1">•</span>
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Located in the {ride.category} section of Luna Amusement Park
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience {ride.title}?
            </h2>
            
            <p className="text-blue-100 mb-6">
              Book your ticket now and get ready for an unforgettable adventure!
            </p>
            
            <TicketPurchaseButton 
              tier={{
                id: ride._id,
                name: ride.title,
                price: ride.price,
                description: ride.description || ride.shortDescription || "Experience this amazing ride at Luna Park",
                features: [
                  `${ride.duration} minute ride`,
                  `Capacity: ${ride.capacity} riders`,
                  `${getThrillLevelText(ride.thrillLevel)} thrill level`,
                  ride.restrictions?.minHeight ? `Min height: ${ride.restrictions.minHeight}"` : "No height restrictions",
                  ride.category
                ],
                buttonText: "Buy Ticket"
              }}
              className="mx-auto"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
