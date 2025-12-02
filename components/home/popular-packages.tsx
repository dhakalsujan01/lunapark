"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Gift, 
  Calendar, 
  Users, 
  Star, 
  ArrowRight, 
  Sparkles, 
  Zap,
  Heart,
  Crown,
  Ticket,
  Percent
} from "lucide-react"

interface PackageRide {
  _id: string
  title: string
  price: number
  category: string
  thrillLevel: number
}

interface Package {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  validityDays: number
  maxUsage?: number
  rides: PackageRide[]
  analytics?: {
    purchases: number
    views: number
  }
  promotions?: {
    isOnSale: boolean
    discountPercentage?: number
  }
  savings: number
  savingsPercentage: number
  rideCount: number
}

interface PopularPackagesProps {
  locale?: string
}

export default function PopularPackages({ locale = "en" }: PopularPackagesProps) {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPopularPackages = async () => {
      try {
        const response = await fetch('/api/public/packages/popular?limit=3')
        const data = await response.json()
        if (data.success) {
          setPackages(data.data.packages)
        }
      } catch (error) {
        console.error('Error fetching popular packages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPopularPackages()
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'family': return <Users className="w-4 h-4" />
      case 'group': return <Users className="w-4 h-4" />
      case 'single': return <Ticket className="w-4 h-4" />
      case 'season': return <Crown className="w-4 h-4" />
      default: return <Gift className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'family': return 'bg-pink-100 text-pink-700 border-pink-200'
      case 'group': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'single': return 'bg-green-100 text-green-700 border-green-200'
      case 'season': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-orange-100 text-orange-700 border-orange-200'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'family': return 'Family Fun'
      case 'group': return 'Group Adventure'
      case 'single': return 'Solo Explorer'
      case 'season': return 'Season Pass'
      default: return 'Special Package'
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (packages.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200/50 mb-6">
            <Gift className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">Best Value Deals</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent mb-4">
            Popular Packages
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Unlock incredible savings with our most-loved packages. More rides, more fun, more memories for less!
          </p>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatePresence mode="wait">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg._id}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 group-hover:bg-white/95">
                  {/* Image Container */}
                  <div className="relative mb-6 overflow-hidden rounded-2xl">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src={pkg.image}
                        alt={pkg.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      
                      {/* Category Badge */}
                      <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getCategoryColor(pkg.category)}`}>
                        {getCategoryIcon(pkg.category)}
                        <span className="capitalize">{getCategoryLabel(pkg.category)}</span>
                      </div>

                      {/* Sale Badge */}
                      {pkg.promotions?.isOnSale && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                          <Percent className="w-3 h-3" />
                          <span>{pkg.promotions.discountPercentage}% OFF</span>
                        </div>
                      )}

                      {/* Ride Count Badge */}
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Ticket className="w-4 h-4" />
                        <span>{pkg.rideCount} rides</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                        {pkg.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {pkg.description}
                      </p>
                    </div>

                    {/* Package Details */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{pkg.validityDays} day{pkg.validityDays > 1 ? 's' : ''}</span>
                        </div>
                        {pkg.maxUsage && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>Up to {pkg.maxUsage}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-emerald-600 font-semibold">
                        Best Value
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        {pkg.originalPrice && (
                          <div className="text-sm text-gray-500 line-through mb-1">
                            ${pkg.originalPrice}
                          </div>
                        )}
                        <span className="text-2xl font-bold text-gray-900">
                          ${pkg.price}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">per package</span>
                        {pkg.savings > 0 && (
                          <div className="text-xs text-emerald-600 font-medium">
                            Save ${pkg.savings} ({pkg.savingsPercentage}% off)
                          </div>
                        )}
                      </div>
                      
                      <Link 
                        href={`/${locale}/attractions`}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 group/btn"
                      >
                        <span className="text-sm font-medium">Explore</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-600/0 to-teal-600/0 group-hover:from-emerald-600/5 group-hover:to-teal-600/5 transition-all duration-500 pointer-events-none"></div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* View All Button */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link 
            href={`/${locale}/attractions`}
            className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 px-8 py-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 group"
          >
            <span className="font-medium">Discover All Packages</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
