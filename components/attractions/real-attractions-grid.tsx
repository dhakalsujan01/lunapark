"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Clock, Users, Ruler, Zap, Heart, AlertTriangle, Filter, Search, Waves, X, Grid3X3, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { TicketPurchaseButton } from "@/components/tickets/ticket-purchase-button"
import { Pagination } from "@/components/ui/pagination"
import { useTranslations } from "next-intl"
import { formatCurrencySimple } from "@/lib/currency-utils"

interface Ride {
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

interface RealAttractionsGridProps {
  rides: Ride[]
}

export function RealAttractionsGrid({ rides }: RealAttractionsGridProps) {
  const t = useTranslations('attractionsPage')
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [itemsPerPage] = useState(12)


  // Filter rides based on search term
  const filteredRides = rides.filter(ride =>
    ride.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredRides.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRides = filteredRides.slice(startIndex, endIndex)

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'thrill': return '🎢'
      case 'water': return '💧'
      case 'family': return '👨‍👩‍👧‍👦'
      case 'kids': return '🧸'
      default: return '🎠'
    }
  }

  // Get thrill level color
  const getThrillLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-500'
      case 2: return 'bg-yellow-500'
      case 3: return 'bg-orange-500'
      case 4: return 'bg-red-500'
      case 5: return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  // Get thrill level text
  const getThrillLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Mild'
      case 2: return 'Moderate'
      case 3: return 'Thrilling'
      case 4: return 'Extreme'
      case 5: return 'Intense'
      default: return 'Unknown'
    }
  }

  return (
    <div className="space-y-8">

      {/* Simplified Grid without animations for testing */}
      <div className={
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      }>
        {currentRides.map((ride, index) => (
          <div key={ride._id} className="group">
            {/* Grid View - Simplified for testing */}
            <div className="h-full border-2 border-gray-200 hover:border-blue-600 transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 overflow-hidden bg-white">
              <div className="relative h-40 overflow-hidden bg-gray-200">
                {ride.image ? (
                  <img
                    src={ride.image}
                    alt={ride.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <Star className="h-12 w-12 text-blue-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Thrill Level Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`${getThrillLevelColor(ride.thrillLevel)} text-white border-none shadow-lg font-semibold px-2 py-1 text-xs rounded`}>
                    {getThrillLevelText(ride.thrillLevel)}
                  </span>
                </div>

                {/* Price Badge */}
                <div className="absolute top-2 right-2">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg border border-white/20">
                    <span className="text-base font-bold text-gray-900">{formatCurrencySimple(ride.price)}</span>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-2 left-2">
                  <span className="bg-white/90 text-gray-800 border-none shadow-md font-medium px-2 py-1 text-xs rounded">
                    <span className="mr-1">{getCategoryIcon(ride.category)}</span>
                    {ride.category}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-base font-bold group-hover:text-blue-800 transition-colors duration-300 leading-tight mb-1">
                  {ride.title}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed mb-3">
                  {ride.shortDescription || ride.description?.substring(0, 80) + "..."}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center gap-2 p-1.5 bg-blue-50 rounded-md">
                    <Clock className="h-3 w-3 text-blue-800" />
                    <div className="text-xs">
                      <div className="font-semibold text-foreground">{ride.duration}m</div>
                      <div className="text-muted-foreground text-[10px]">Duration</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 bg-emerald-50 rounded-md">
                    <Users className="h-3 w-3 text-emerald-800" />
                    <div className="text-xs">
                      <div className="font-semibold text-foreground">{ride.capacity}</div>
                      <div className="text-muted-foreground text-[10px]">Capacity</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-2 border-gray-200 text-foreground hover:bg-blue-50 hover:border-blue-800 hover:text-blue-800 font-semibold rounded-md transition-all duration-200 bg-transparent h-8 text-xs"
                    asChild
                  >
                    <Link href={`/attractions/${ride._id}`}>
                      Details
                    </Link>
                  </Button>
                  <TicketPurchaseButton
                    tier={{
                      id: ride._id,
                      name: ride.title,
                      price: ride.price,
                      description:
                        ride.shortDescription ||
                        ride.description?.substring(0, 150) + "..." ||
                        "Experience this amazing ride at Luna Park",
                      features: [
                        `${ride.duration} minute ride`,
                        `Capacity: ${ride.capacity} riders`,
                        `Thrill Level: ${getThrillLevelText(ride.thrillLevel)}`,
                        ride.category,
                      ],
                      buttonText: "Buy Ticket",
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-800 to-blue-700 hover:from-blue-900 hover:to-blue-800 text-white font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-200 h-8 w-full text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* No results message */}
      {filteredRides.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">
            {t('noResults')}
          </div>
          <p className="text-gray-400 text-sm">
            {t('tryDifferentSearch')}
          </p>
        </div>
      )}
    </div>
  )
}