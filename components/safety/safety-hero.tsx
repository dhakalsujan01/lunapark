
"use client"

import { Shield, AlertTriangle, Heart, Users, Award, Star } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export function SafetyHero() {
  // Animation variants for text reveal
  const titleVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
        staggerChildren: 0.1
      }
    }
  }

  const letterVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  }

  const descriptionVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1,
        ease: "easeOut" as const,
        delay: 0.5
      }
    }
  }

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
        staggerChildren: 0.2
      }
    }
  }

  const statItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <Image
        src="/funpark4.png"
        alt="Safety First - Adventure Park"
        fill
        priority
        quality={90}
        className="object-cover"
        sizes="100vw"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />

      {/* Content */}
      <div className="relative h-full flex items-center justify-center text-center text-white px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <motion.div 
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none">
              <span className="text-amber-400">Safety</span> First
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-medium">
              Your well-being is our top priority. We maintain the highest safety standards 
              to ensure every visit is both thrilling and secure for the whole family.
            </p>
          </motion.div>

          {/* Safety Stats */}
          <motion.div
            variants={statsVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
          >
            <motion.div variants={statItemVariants} className="text-center">
              <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-amber-400">100%</div>
              <div className="text-sm text-gray-300">Safety Record</div>
            </motion.div>

            <motion.div variants={statItemVariants} className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-amber-400">24/7</div>
              <div className="text-sm text-gray-300">Monitoring</div>
            </motion.div>

            <motion.div variants={statItemVariants} className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-amber-400">50+</div>
              <div className="text-sm text-gray-300">Safety Officers</div>
            </motion.div>

            <motion.div variants={statItemVariants} className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-amber-400">A+</div>
              <div className="text-sm text-gray-300">Safety Rating</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated Statistics at bottom */}
      <motion.div
        variants={statsVariants}
        initial="hidden"
        animate="visible"
        className="absolute bottom-20 left-1/2 -translate-x-1/2 hidden md:flex items-center space-x-8 text-white/80"
      >
        <motion.div
          variants={statItemVariants}
          whileHover={{
            scale: 1.1,
            y: -5,
            transition: { duration: 0.3 }
          }}
          className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="w-5 h-5 text-blue-400" />
          </motion.div>
          <span className="text-sm font-semibold">100% Safety Certified</span>
        </motion.div>
        
        <motion.div
          variants={statItemVariants}
          whileHover={{
            scale: 1.1,
            y: -5,
            transition: { duration: 0.3 }
          }}
          className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="w-5 h-5 text-red-400" />
          </motion.div>
          <span className="text-sm font-semibold">24/7 Medical Support</span>
        </motion.div>
        
        <motion.div
          variants={statItemVariants}
          whileHover={{
            scale: 1.1,
            y: -5,
            transition: { duration: 0.3 }
          }}
          className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </motion.div>
          <span className="text-sm font-semibold">Emergency Ready</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
