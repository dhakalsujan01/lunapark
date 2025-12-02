"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TicketPurchaseButton } from "./ticket-purchase-button"
import { formatCurrency } from "@/lib/currency-utils"
import { 
  Star, 
  Crown, 
  Ticket, 
  Clock, 
  Users, 
  Calendar,
  Percent,
  Gift
} from "lucide-react"
import Image from "next/image"

interface Package {
  _id: string
  name: string
  description: string
  price: number
  discountPercent?: number
  validityDays: number
  category: string
  rides: any[]
  image?: string
  isPublished: boolean
}

interface RealPackagesSectionProps {
  packages: Package[]
}

export function RealPackagesSection({ packages }: RealPackagesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(packages.map(pkg => pkg.category)))]
  
  // Filter packages by category
  const filteredPackages = selectedCategory === "all" 
    ? packages 
    : packages.filter(pkg => pkg.category === selectedCategory)

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "standard":
        return <Ticket className="h-6 w-6" />
      case "premium":
        return <Crown className="h-6 w-6" />
      case "vip":
        return <Star className="h-6 w-6" />
      case "family":
        return <Users className="h-6 w-6" />
      case "season":
        return <Calendar className="h-6 w-6" />
      default:
        return <Gift className="h-6 w-6" />
    }
  }

  const getCategoryGradient = (category: string) => {
    switch (category.toLowerCase()) {
      case "standard":
        return "from-blue-800 to-blue-600" // Deep Thunder Blue
      case "premium":
        return "from-red-600 to-red-500" // Lightning Red
      case "vip":
        return "from-amber-500 to-amber-400" // Golden Thunder
      case "family":
        return "from-emerald-600 to-emerald-500" // Emerald Green
      case "season":
        return "from-purple-600 to-purple-500" // Purple
      default:
        return "from-gray-600 to-gray-500" // Gray
    }
  }

  const calculateDiscountedPrice = (price: number, discountPercent?: number) => {
    if (!discountPercent) return price
    return Math.round(price * (1 - discountPercent / 100))
  }

  if (packages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-muted rounded-lg p-8 max-w-md mx-auto">
          <Ticket className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2 text-foreground">
            No Packages Available
          </h3>
          <p className="text-muted-foreground">
            We're updating our packages. Please check back soon or contact us for current offerings.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 ${
              selectedCategory === category
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : "border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white"
            }`}
          >
            {category === "all" ? "All Packages" : category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPackages.map((pkg, index) => {
          const discountedPrice = calculateDiscountedPrice(pkg.price, pkg.discountPercent)
          const savings = pkg.price - discountedPrice

          return (
            <motion.div
              key={pkg._id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              {pkg.discountPercent && pkg.discountPercent > 0 && (
                <div className="absolute -top-4 -right-4 z-10">
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-none px-3 py-1">
                    <Percent className="w-3 h-3 mr-1" />
                    {pkg.discountPercent}% OFF
                  </Badge>
                </div>
              )}
              
              <Card className="h-full border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 group-hover:shadow-2xl">
                {/* Package Image */}
                {pkg.image && (
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={pkg.image}
                      alt={pkg.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${getCategoryGradient(pkg.category)} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">{getCategoryIcon(pkg.category)}</div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold mb-2">
                    {pkg.name}
                  </CardTitle>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {pkg.description}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {savings > 0 && (
                      <span className="text-lg line-through text-gray-400">
                        €{pkg.price}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      €{discountedPrice}
                    </span>
                  </div>

                  {savings > 0 && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300">
                      Save €{savings}!
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Package Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        Validity
                      </span>
                      <span className="font-semibold">
                        Valid on selected date
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Ticket className="h-4 w-4" />
                        Category
                      </span>
                      <Badge variant="outline">
                        {pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1)}
                      </Badge>
                    </div>

                    {pkg.rides && pkg.rides.length > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Star className="h-4 w-4" />
                          Rides Included
                        </span>
                        <span className="font-semibold">
                          {pkg.rides.length} attractions
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Purchase Button */}
                  <TicketPurchaseButton
                    tier={{
                      id: pkg._id,
                      name: pkg.name,
                      price: discountedPrice,
                      originalPrice: savings > 0 ? pkg.price : undefined,
                      description: pkg.description,
                      features: [
                        `Valid on selected date`,
                        `${pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1)} experience`,
                        pkg.rides && pkg.rides.length > 0 ? `${pkg.rides.length} rides included` : "Access to attractions",
                        savings > 0 ? `Save ${formatCurrency(savings)}` : "Best value",
                      ],
                      buttonText: "Buy Package"
                    }}
                    className="w-full"
                  />
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
