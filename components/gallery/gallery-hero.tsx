// src/components/gallery/GalleryHero.tsx

"use client"

import { motion } from "framer-motion"
import { Camera, PlayCircle } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"

/**
 * A redesigned, professional Gallery Hero component for a theme park website.
 * Features a high-quality background with a subtle zoom animation, cleaner animations, and clear calls-to-action.
 */
export function GalleryHero() {
  const t = useTranslations('gallery.hero')
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <section className="relative flex h-screen min-h-[700px] items-center justify-center overflow-hidden">
      {/* ## High-Quality Background Image
       * - A subtle zoom-in effect on view adds a premium, dynamic feel.
       * - `priority` prop helps optimize Largest Contentful Paint (LCP).
       */}
      <motion.div
        className="absolute inset-0"
        whileInView={{ scale: 1.1 }}
        transition={{ duration: 15, ease: "linear" }}
      >
        <Image
          src="/gallyer-hero1.jpg"
          alt="Colorful amusement park at sunset"
          fill
          priority
          quality={100}
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>

      {/* ## Gradient Overlay
       * - Enhances text readability by creating strong contrast.
       */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

      {/* ## Animated Content Container */}
      <motion.div
        className="relative z-10 max-w-4xl text-center text-white px-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl lg:text-8xl"
          style={{ textShadow: "0 4px 15px rgba(0,0,0,0.5)" }}
        >
          {t('title')}
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-gray-200 md:text-xl"
        >
          {t('description')}
        </motion.p>

        {/* ## Animated Call-to-Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <motion.a
            href="#photo-gallery"
            className="flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-semibold text-white shadow-lg ring-1 ring-amber-500/50 transition-all duration-300 hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Camera className="h-5 w-5" />
            {t('viewPhotos')}
          </motion.a>

          <motion.a
            href="#video-section"
            className="flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-white ring-1 ring-white/20 transition-all duration-300 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <PlayCircle className="h-5 w-5" />
            {t('watchVideos')}
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  )
}