"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Award, Trophy, Star, Medal, Sparkles, Zap, Heart, Shield } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function AwardsSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const awards = [
    {
      icon: Trophy,
      year: "2023",
      title: "Best Family Amusement Park",
      organization: "International Theme Park Association",
      description: "Recognized for outstanding family entertainment and safety standards.",
      gradient: "from-yellow-500/20 to-orange-500/20",
      color: "text-yellow-500",
      floatingIcon: Sparkles
    },
    {
      icon: Star,
      year: "2022",
      title: "Excellence in Guest Experience",
      organization: "Tourism Excellence Awards",
      description: "Honored for exceptional customer service and visitor satisfaction.",
      gradient: "from-blue-500/20 to-purple-500/20",
      color: "text-blue-500",
      floatingIcon: Heart
    },
    {
      icon: Medal,
      year: "2021",
      title: "Environmental Leadership Award",
      organization: "Green Business Council",
      description: "Acknowledged for sustainable practices and environmental stewardship.",
      gradient: "from-green-500/20 to-emerald-500/20",
      color: "text-green-500",
      floatingIcon: Shield
    },
    {
      icon: Award,
      year: "2020",
      title: "Innovation in Safety",
      organization: "Amusement Safety Organization",
      description: "Recognized for implementing cutting-edge safety technologies and protocols.",
      gradient: "from-purple-500/20 to-pink-500/20",
      color: "text-purple-500",
      floatingIcon: Zap
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
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

  const floatingVariants = {
    animate: {
      y: [0, -15, 0],
      rotate: [0, 3, 0],
      transition: {
        duration: 4,
        repeat: Infinity
      }
    }
  }

  const particleVariants = {
    animate: {
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      transition: {
        duration: 2.5,
        repeat: Infinity
      }
    }
  }

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-xl"
        variants={floatingVariants}
        animate="animate"
      />
      <motion.div
        className="absolute top-40 right-20 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "1s" }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-28 h-28 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "2s" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "3s" }}
      />

      {/* Particle effects */}
      <motion.div
                        className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-500 rounded-full"
        variants={particleVariants}
        animate="animate"
      />
      <motion.div
                        className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-blue-800 rounded-full"
        variants={particleVariants}
        animate="animate"
        style={{ animationDelay: "0.5s" }}
      />
      <motion.div
                        className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-emerald-600 rounded-full"
        variants={particleVariants}
        animate="animate"
        style={{ animationDelay: "1s" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-purple-500 rounded-full"
        variants={particleVariants}
        animate="animate"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-3xl"></div>
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

          
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-park-text-primary mb-6 bg-gradient-to-r from-park-text-primary via-yellow-600 to-orange-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Awards & Recognition
          </motion.h2>
          
          <motion.p 
            className="text-xl text-park-text-secondary max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            We're proud to be recognized by industry leaders for our commitment to excellence, safety, and innovation
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {awards.map((award, index) => {
            const FloatingIcon = award.floatingIcon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="relative"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${award.gradient} rounded-2xl blur-xl opacity-60`}></div>
                  
                  <Card className="relative border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden group">
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-6">
                        <motion.div 
                          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-park-primary to-blue-600 flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                          variants={iconVariants}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                          <award.icon className="w-10 h-10 text-white relative z-10" />
                          
                          {/* Floating icon */}
                          <motion.div
                            className="absolute -top-2 -right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                            animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <FloatingIcon className={`w-4 h-4 ${award.color}`} />
                          </motion.div>
                        </motion.div>
                        
                        <div className="flex-1">
                          <motion.div 
                            className="text-sm text-park-primary font-bold mb-2 bg-gradient-to-r from-park-primary to-blue-600 bg-clip-text text-transparent"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.3 }}
                          >
                            {award.year}
                          </motion.div>
                          <motion.h3 
                            className="text-xl font-bold text-park-text-primary mb-3 bg-gradient-to-r from-park-text-primary to-blue-600 bg-clip-text text-transparent"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.3 }}
                          >
                            {award.title}
                          </motion.h3>
                          <motion.p 
                            className="text-park-text-secondary font-semibold mb-3"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.3 }}
                          >
                            {award.organization}
                          </motion.p>
                          <p className="text-park-text-secondary text-sm leading-relaxed">
                            {award.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <span className="relative z-10">View All Awards</span>
            <motion.span
              className="relative z-10"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}