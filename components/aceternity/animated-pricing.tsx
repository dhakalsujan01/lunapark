"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils-aceternity"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Crown, Zap, Heart } from "lucide-react"

interface PricingTier {
  id: string
  name: string
  price: number
  originalPrice?: number
  description: string
  features: string[]
  icon: React.ReactNode
  gradient: string
  popular?: boolean
  buttonText: string
}

export const AnimatedPricing = ({
  tiers,
  className,
}: {
  tiers: PricingTier[]
  className?: string
}) => {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null)

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto", className)}>
      {tiers.map((tier, index) => (
        <motion.div
          key={tier.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          onMouseEnter={() => setHoveredTier(tier.id)}
          onMouseLeave={() => setHoveredTier(null)}
          className="relative group"
        >
          {tier.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none px-4 py-1">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>
          )}
          
          <motion.div
            className={cn(
              "relative bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-8 h-full",
              tier.popular && "border-yellow-500 dark:border-yellow-400",
              "transition-all duration-300 group-hover:shadow-2xl"
            )}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            style={{
              background: hoveredTier === tier.id 
                ? `linear-gradient(135deg, ${tier.gradient})` 
                : undefined,
            }}
          >
            <div className="text-center mb-8">
              <motion.div 
                className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                style={{
                  background: `linear-gradient(135deg, ${tier.gradient})`,
                }}
              >
                {tier.icon}
              </motion.div>
              
              <h3 className={cn(
                "text-2xl font-bold mb-2",
                hoveredTier === tier.id ? "text-white" : "text-gray-900 dark:text-white"
              )}>
                {tier.name}
              </h3>
              
              <p className={cn(
                "text-sm mb-4",
                hoveredTier === tier.id ? "text-white/80" : "text-gray-600 dark:text-gray-400"
              )}>
                {tier.description}
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-6">
                {tier.originalPrice && (
                  <span className={cn(
                    "text-lg line-through",
                    hoveredTier === tier.id ? "text-white/60" : "text-gray-400"
                  )}>
                    €{tier.originalPrice}
                  </span>
                )}
                <motion.span 
                  className={cn(
                    "text-4xl font-bold",
                    hoveredTier === tier.id ? "text-white" : "text-gray-900 dark:text-white"
                  )}
                  animate={{ scale: hoveredTier === tier.id ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  €{tier.price}
                </motion.span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {tier.features.map((feature, featureIndex) => (
                <motion.li
                  key={featureIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: featureIndex * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center",
                    hoveredTier === tier.id ? "bg-white/20" : "bg-green-100 dark:bg-green-900"
                  )}>
                    <Check className={cn(
                      "w-3 h-3",
                      hoveredTier === tier.id ? "text-white" : "text-green-600 dark:text-green-400"
                    )} />
                  </div>
                  <span className={cn(
                    "text-sm",
                    hoveredTier === tier.id ? "text-white" : "text-gray-600 dark:text-gray-300"
                  )}>
                    {feature}
                  </span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-full text-lg py-3 px-6 rounded-lg text-center font-semibold transition-all duration-300 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                {tier.buttonText}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
