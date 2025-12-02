"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"

export function HeroSection() {
  const [isMounted, setIsMounted] = useState(false)
  const t = useTranslations()
  const params = useParams()
  const currentLocale = (params?.locale as string) || "en"

  // This ensures the animation only runs on the client side after the component has mounted.
  // It prevents a flash of un-animated content on initial load.
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const headline = t("home.hero.title")
  const headlineWords = headline.split(" ")

  // --- Framer Motion Animation Variants ---

  // Parent container variant: orchestrates the staggering of children animations.
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Time delay between each word animating in
        delayChildren: 0.3,    // A small delay before the animation starts
      },
    },
  }

  // Child (word) variant: defines how each individual word animates.
  const wordVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 14,
      },
    },
  }

  // Variant for the paragraph and buttons, to fade them in after the headline.
  const fadeInVariants = {
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
    <section className="relative min-h-screen flex items-center justify-center lg:justify-start bg-black overflow-hidden">
      {/* Video Background Container */}
      <div className="absolute inset-0 w-full h-full">
        <video
          // Poster: Shows a static image while the video loads.
          // CRUCIAL for perceived performance. Create a compressed JPG/WebP of the first frame.
          poster="/herovideo-poster.jpg"
          autoPlay
          loop
          muted
          playsInline // Essential for autoplay on mobile devices.
          // preload="metadata" helps the browser load just enough info initially.
          preload="metadata"
          className="w-full h-full object-cover"
        >
          {/* Providing multiple sources is a good practice for browser compatibility */}
          <source src="/herovideo.webm" type="video/webm" />
          <source src="/herovideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Animated Content Container */}
      <div className="relative z-10 max-w-3xl text-center lg:text-left px-6 lg:px-20">
        {isMounted && (
          <motion.h1
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl
                       [text-shadow:0_4px_12px_rgba(0,0,0,0.6)]
                       bg-gradient-to-r from-white via-gray-200 to-gray-300
                       text-transparent bg-clip-text"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            aria-label={headline}
          >
            {/* We map over the words to animate each one individually */}
            {headlineWords.map((word, index) => (
              <motion.span key={index} className="inline-block" variants={wordVariants}>
                {word}&nbsp;
              </motion.span>
            ))}
          </motion.h1>
        )}

        {isMounted && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: headlineWords.length * 0.08 + 0.5, // Delay after headline finishes
                },
              },
            }}
          >
            <motion.p
              className="mt-6 text-lg leading-8 text-gray-200 max-w-xl mx-auto lg:mx-0 [text-shadow:0_2px_6px_rgba(0,0,0,0.8)]"
              variants={fadeInVariants}
            >
              {t("home.hero.description")}
            </motion.p>

            <motion.div
              className="mt-10 flex items-center justify-center lg:justify-start gap-x-6"
              variants={fadeInVariants}
            >
              <a
                href={`/${currentLocale}/attractions`}
                className="rounded-md bg-indigo-500 px-5 py-3 text-base font-semibold text-white shadow-lg 
                           transition-transform duration-300 hover:scale-105 hover:bg-indigo-400 
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                {t("home.hero.cta")}
              </a>
              <a
                href={`/${currentLocale}/attractions`}
                className="text-base font-semibold leading-6 text-white transition-transform duration-300 hover:scale-105 group"
              >
                {t("home.hero.learnMore")} <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
