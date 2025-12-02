"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { Sparkles, Star, Zap, Heart, Trophy, Shield } from "lucide-react"

export function ParkHistory() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const milestones = [
    {
      year: "1995",
      title: "The Beginning",
      description:
        "Adventure Park opened its doors with just 5 attractions and a dream to create magical experiences for families.",
      image: "/vintage-amusement-park-entrance.png",
      imageAlt: "Adventure Park opening day in 1995",
      gradient: "from-blue-500/20 to-purple-500/20",
      icon: "🎡",
      lucideIcon: Sparkles,
      color: "text-blue-500"
    },
    {
      year: "2000",
      title: "Major Expansion",
      description:
        "Added the Thunder Mountain roller coaster and doubled the park size, becoming a regional destination.",
      image: "/roller-coaster-construction.png",
      imageAlt: "Thunder Mountain roller coaster construction",
      gradient: "from-green-500/20 to-blue-500/20",
      icon: "🎢",
      lucideIcon: Zap,
      color: "text-green-500"
    },
    {
      year: "2005",
      title: "Water Park Addition",
      description: "Opened the Splash Zone water park, adding a new dimension of fun for hot summer days.",
      image: "/colorful-water-park.png",
      imageAlt: "Splash Zone water park opening",
      gradient: "from-cyan-500/20 to-blue-500/20",
      icon: "💦",
      lucideIcon: Heart,
      color: "text-cyan-500"
    },
    {
      year: "2010",
      title: "Technology Integration",
      description: "Introduced mobile apps, digital fast passes, and enhanced guest experience technology.",
      image: "/amusement-park-tech.png",
      imageAlt: "Digital technology integration at the park",
      gradient: "from-purple-500/20 to-pink-500/20",
      icon: "📱",
      lucideIcon: Star,
      color: "text-purple-500"
    },
    {
      year: "2015",
      title: "Sustainability Initiative",
      description: "Launched our green initiative, becoming the first carbon-neutral amusement park in the region.",
      image: "/amusement-park-green-energy.png",
      imageAlt: "Green sustainability initiatives at Adventure Park",
      gradient: "from-green-500/20 to-emerald-500/20",
      icon: "🌱",
      lucideIcon: Shield,
      color: "text-emerald-500"
    },
    {
      year: "2020",
      title: "Safety Innovation",
      description: "Implemented advanced safety protocols and contactless experiences while maintaining the magic.",
      image: "/theme-park-safety.png",
      imageAlt: "Advanced safety protocols implementation",
      gradient: "from-orange-500/20 to-red-500/20",
      icon: "🛡️",
      lucideIcon: Trophy,
      color: "text-orange-500"
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8
      }
    }
  }

  const timelineVariants = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: {
        duration: 1.5
      }
    }
  }

  const dotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  }

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 5, 0],
      transition: {
        duration: 6,
        repeat: Infinity
      }
    }
  }

  const particleVariants = {
    animate: {
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      transition: {
        duration: 3,
        repeat: Infinity
      }
    }
  }

  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
        variants={floatingVariants}
        animate="animate"
      />
      <motion.div
        className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-xl"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "2s" }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "4s" }}
      />

      {/* Particle effects */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-2 h-2 bg-park-primary rounded-full"
        variants={particleVariants}
        animate="animate"
      />
      <motion.div
                        className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-800 rounded-full"
        variants={particleVariants}
        animate="animate"
        style={{ animationDelay: "1s" }}
      />
      <motion.div
        className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-purple-500 rounded-full"
        variants={particleVariants}
        animate="animate"
        style={{ animationDelay: "2s" }}
      />

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-park-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={containerRef}>
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-park-primary to-blue-600 rounded-3xl mb-8 relative overflow-hidden"
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-3xl relative z-10"></span>
          </motion.div>
          
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-park-text-primary mb-6 bg-gradient-to-r from-park-text-primary via-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Our Journey
          </motion.h2>
          
          <motion.p 
            className="text-xl text-park-text-secondary max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            From humble beginnings to becoming a world-class destination, discover the milestones that shaped Adventure
            Park into the magical experience it is today
          </motion.p>
        </motion.div>

        <motion.div 
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Animated timeline line */}
          <motion.div 
            className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-park-primary via-blue-500 to-purple-500 hidden lg:block"
            variants={timelineVariants}
            style={{
              transformOrigin: "top"
            }}
          >
            <motion.div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-park-primary to-blue-600 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <div className="space-y-16 lg:space-y-20">
            {milestones.map((milestone, index) => {
              const LucideIcon = milestone.lucideIcon
              return (
                <motion.div
                  key={milestone.year}
                  className={`flex items-center ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex-1 lg:pr-8">
                    <motion.div
                      className={`relative ${index % 2 === 0 ? "lg:ml-auto lg:mr-8" : "lg:mr-auto lg:ml-8"} max-w-md`}
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Gradient background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${milestone.gradient} rounded-2xl blur-xl opacity-60`}></div>
                      
                      <Card className="relative border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden group">
                        <div className="relative h-56 w-full overflow-hidden">
                          <Image
                            src={milestone.image || "/placeholder.svg"}
                            alt={milestone.imageAlt}
                            fill
                            className="object-cover transition-all duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          
                          {/* Year badge */}
                          <motion.div 
                            className="absolute top-4 left-4 bg-gradient-to-r from-park-primary to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            {milestone.year}
                          </motion.div>

                          {/* Animated icon overlay */}
                          <motion.div 
                            className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            >
                              <LucideIcon className={`w-6 h-6 ${milestone.color}`} />
                            </motion.div>
                          </motion.div>

                          {/* Floating emoji */}
                          <motion.div
                            className="absolute bottom-4 right-4 text-2xl"
                            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            {milestone.icon}
                          </motion.div>
                        </div>
                        
                        <CardContent className="p-8">
                          <motion.h3 
                            className="text-2xl font-bold text-park-text-primary mb-4 bg-gradient-to-r from-park-text-primary to-blue-600 bg-clip-text text-transparent"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.3 }}
                          >
                            {milestone.title}
                          </motion.h3>
                          <p className="text-park-text-secondary leading-relaxed text-lg">
                            {milestone.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Animated timeline dot */}
                  <motion.div 
                    className="hidden lg:block w-6 h-6 bg-gradient-to-r from-park-primary to-blue-600 rounded-full border-4 border-white shadow-xl z-10 relative"
                    variants={dotVariants}
                    whileHover={{ scale: 1.3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-park-primary to-blue-600 rounded-full animate-pulse"></div>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-park-primary to-blue-600 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  <div className="flex-1 lg:pl-8"></div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>


      </div>
    </section>
  )
}