"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Users, Zap, ArrowRight, Sparkles } from "lucide-react"

interface Ride {
  _id: string
  title: string
  description: string
  shortDescription: string
  category: string
  price: number
  image: string
  duration: number
  capacity: number
  thrillLevel: number
  analytics?: {
    bookings: number
    views: number
    rating: number
  }
}

interface PopularRidesProps {
  locale?: string
}

export default function PopularRides({ locale = "en" }: PopularRidesProps) {
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const fetchPopularRides = async () => {
      try {
        const response = await fetch('/api/public/rides/popular?limit=3')
        const data = await response.json()
        if (data.success) {
          setRides(data.data.rides)
        }
      } catch (error) {
        console.error('Error fetching popular rides:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPopularRides()
  }, [])

  const getThrillColor = (level: number) => {
    const colors = [
      'text-green-500',
      'text-yellow-500', 
      'text-orange-500',
      'text-red-500',
      'text-purple-600'
    ]
    return colors[level - 1] || colors[0]
  }

  const getThrillLabel = (level: number) => {
    const labels = ['Mild', 'Moderate', 'Thrilling', 'Extreme', 'Insane']
    return labels[level - 1] || 'Mild'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'thrill': return <Zap className="w-4 h-4" />
      case 'family': return <Users className="w-4 h-4" />
      case 'kids': return <Sparkles className="w-4 h-4" />
      case 'water': return <Zap className="w-4 h-4" />
      case 'arcade': return <Sparkles className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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

  if (rides.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
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
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200/50 mb-6">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Guest Favorites</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            Most Popular Rides
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Experience the thrills that our guests love most. These rides have captured hearts and created unforgettable memories.
          </p>
        </motion.div>

        {/* Rides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatePresence mode="wait">
            {rides.map((ride, index) => (
              <motion.div
                key={ride._id}
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
                        src={ride.image}
                        alt={ride.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-700">
                        {getCategoryIcon(ride.category)}
                        <span className="capitalize">{ride.category}</span>
                      </div>

                      {/* Thrill Level */}
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <span className={`text-sm font-semibold ${getThrillColor(ride.thrillLevel)}`}>
                          {getThrillLabel(ride.thrillLevel)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {ride.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {ride.shortDescription}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{ride.duration}min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{ride.capacity}</span>
                        </div>
                      </div>
                      <div className={`font-semibold ${getThrillColor(ride.thrillLevel)}`}>
                        {getThrillLabel(ride.thrillLevel)}
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          ${ride.price}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">per person</span>
                      </div>
                      
                      <Link 
                        href={`/${locale}/attractions`}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 group/btn"
                      >
                        <span className="text-sm font-medium">Explore</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-500 pointer-events-none"></div>
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
            <span className="font-medium">Discover All Rides</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
