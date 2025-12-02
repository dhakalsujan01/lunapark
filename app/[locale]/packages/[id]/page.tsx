import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  Users, 
  Star, 
  ArrowLeft,
  Calendar,
  Gift,
  Percent,
  Ticket
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
// No direct database imports needed
import { TicketPurchaseButton } from "@/components/tickets/ticket-purchase-button"

interface PackageDetailPageProps {
  params: Promise<{ id: string }>
}

interface IPackage {
  _id: string
  name: string
  description: string
  price: number
  discountPercent?: number
  validityDays: number
  category: string
  rides: Array<{
    _id: string
    title: string
    description?: string
    shortDescription?: string
    image?: string
    duration: number
  }>
  image?: string
  isPublished: boolean
}

async function getPackage(id: string): Promise<IPackage | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/public/packages/${id}`, {
      cache: 'no-store' // Ensure fresh data on each request
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch package')
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch package')
    }
    
    return result.data as IPackage
  } catch (error) {
    console.error("Failed to fetch package:", error)
    return null
  }
}

export async function generateMetadata({ params }: PackageDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const packageDoc = await getPackage(id)
  
  if (!packageDoc) {
    return {
      title: "Package Not Found - Luna Amusement Park"
    }
  }

  return {
    title: `${packageDoc.name} - Luna Amusement Park`,
    description: packageDoc.description || `Experience the ${packageDoc.name} package at Luna Amusement Park with ${packageDoc.rides.length} amazing rides.`,
    keywords: [
      packageDoc.name,
      "amusement park package",
      "Luna Park",
      packageDoc.category,
      "theme park deals",
      "ride packages"
    ],
    openGraph: {
      title: `${packageDoc.name} - Luna Amusement Park`,
      description: packageDoc.description,
      images: [
        {
          url: packageDoc.image || '/placeholder.jpg',
          width: 1200,
          height: 630,
          alt: packageDoc.name,
        },
      ],
    },
  }
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { id } = await params
  const packageDoc = await getPackage(id)

  if (!packageDoc || !packageDoc.isPublished) {
    notFound()
  }

  const originalPrice = packageDoc.discountPercent 
    ? Math.round(packageDoc.price / (1 - packageDoc.discountPercent / 100))
    : null

  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <section className="py-6 bg-muted">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/attractions">
              <ArrowLeft className="h-4 w-4 mr-2" />
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
                  src={packageDoc.image || "/placeholder.jpg"}
                  alt={packageDoc.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Badges */}
                <div className="absolute top-6 left-6">
                  <Badge className="bg-emerald-600 text-white border-none text-lg px-4 py-2">
                    <Gift className="h-5 w-5 mr-2" />
                    Package Deal
                  </Badge>
                </div>
                
                <div className="absolute top-6 right-6 space-y-2">
                  <Badge className="bg-white/90 text-gray-800 border-none text-lg px-4 py-2 block">
                    €{packageDoc.price}
                  </Badge>
                  {packageDoc.discountPercent && (
                    <Badge className="bg-red-600 text-white border-none px-4 py-2 block">
                      <Percent className="h-4 w-4 mr-1" />
                      Save {packageDoc.discountPercent}%
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <div>
                  <Badge variant="outline" className="mb-4">
                    {packageDoc.category}
                  </Badge>
                  
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {packageDoc.name}
                  </h1>
                  
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {packageDoc.description}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <Ticket className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-semibold">Includes</p>
                      <p className="text-gray-600">{packageDoc.rides.length} rides</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-semibold">Valid For</p>
                      <p className="text-gray-600">{packageDoc.validityDays} days</p>
                    </div>
                  </div>
                </div>

                {/* Price Info */}
                {originalPrice && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg line-through text-gray-500">€{originalPrice}</p>
                        <p className="text-2xl font-bold text-green-600">€{packageDoc.price}</p>
                      </div>
                      <Badge className="bg-emerald-600 text-white text-lg px-4 py-2">
                        Save €{originalPrice - packageDoc.price}!
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Purchase Button */}
                <div className="pt-4">
                  <TicketPurchaseButton 
                    tier={{
                      id: packageDoc._id,
                      name: packageDoc.name,
                      price: packageDoc.price,
                      originalPrice: originalPrice || undefined,
                      description: packageDoc.description || "Amazing package deal at Luna Park",
                      features: [
                        `${packageDoc.rides.length} rides included`,
                        `Valid for ${packageDoc.validityDays} days`,
                        packageDoc.category,
                        packageDoc.discountPercent ? `Save ${packageDoc.discountPercent}%` : "Great value",
                        "Multiple ride access"
                      ],
                      buttonText: "Buy Package"
                    }}
                    className="w-full max-w-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Included Rides Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Included Rides
              </h2>
              <p className="text-xl text-gray-600">
                This package includes access to {packageDoc.rides.length} amazing rides
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packageDoc.rides.map((ride) => (
                <Card key={ride._id} className="hover:shadow-lg transition-shadow">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={ride.image || "/placeholder-ride.jpg"}
                      alt={ride.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{ride.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {ride.shortDescription || ride.description?.substring(0, 100)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>{ride.duration} min</span>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/attractions/${ride._id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready for the Ultimate Adventure?
            </h2>
            
            <p className="text-blue-100 mb-6">
              Get the {packageDoc.name} package and experience {packageDoc.rides.length} amazing rides!
              {packageDoc.discountPercent && ` Save ${packageDoc.discountPercent}% compared to individual tickets.`}
            </p>
            
            <TicketPurchaseButton 
              tier={{
                id: packageDoc._id,
                name: packageDoc.name,
                price: packageDoc.price,
                originalPrice: originalPrice || undefined,
                description: packageDoc.description || "Amazing package deal at Luna Park",
                features: [
                  `${packageDoc.rides.length} rides included`,
                  `Valid for ${packageDoc.validityDays} days`,
                  packageDoc.category,
                  packageDoc.discountPercent ? `Save ${packageDoc.discountPercent}%` : "Great value",
                  "Multiple ride access"
                ],
                buttonText: "Buy Package"
              }}
              className="mx-auto"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
