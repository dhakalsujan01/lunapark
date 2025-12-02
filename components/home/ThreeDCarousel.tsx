// src/components/home/ThreeDCarousel.tsx
"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useAnimation, PanInfo, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useTranslations } from 'next-intl'

// --- CONFIGURATION ---
const CARD_WIDTH = 420
const CARD_HEIGHT = 480
const GAP = 50
const DRAG_THRESHOLD = 100
const ROTATION_ANGLE = 35
const SCALE_FACTOR = 0.8
const BLUR_AMOUNT = 2

interface ThreeDCarouselProps {
  images: {
    src: string
    alt: string
    title?: string
    description?: string
  }[]
  autoplayInterval?: number
  showIndicators?: boolean
  enableFullscreen?: boolean
  className?: string
}

// Helper to remove duplicate images
const getUniqueImages = (images: ThreeDCarouselProps['images']) => {
  const seen = new Set<string>()
  return images.filter(image => {
    if (seen.has(image.src)) return false
    seen.add(image.src)
    return true
  })
}

export const ThreeDCarousel = ({ 
  images: initialImages, 
  autoplayInterval = 5000,
  showIndicators = true,
  enableFullscreen = true,
  className = ''
}: ThreeDCarouselProps) => {
  const t = useTranslations()
  const images = getUniqueImages(initialImages)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoplayActive, setIsAutoplayActive] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const controls = useAnimation()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate positions
  const itemWidthWithGap = CARD_WIDTH + GAP
  const calculateX = useCallback((index: number) => -index * itemWidthWithGap, [itemWidthWithGap])

  // Navigation handlers
  const navigate = useCallback((direction: 'next' | 'prev') => {
    setCurrentIndex(prev => {
      if (direction === 'next') {
        return (prev + 1) % images.length
      }
      return (prev - 1 + images.length) % images.length
    })
  }, [images.length])

  const handleNext = useCallback(() => navigate('next'), [navigate])
  const handlePrev = useCallback(() => navigate('prev'), [navigate])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Autoplay management
  const startAutoplay = useCallback(() => {
    if (!autoplayInterval || !isAutoplayActive || isHovered || isDragging) return
    
    stopAutoplay()
    intervalRef.current = setInterval(handleNext, autoplayInterval)
  }, [handleNext, autoplayInterval, isAutoplayActive, isHovered, isDragging])

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const toggleAutoplay = useCallback(() => {
    setIsAutoplayActive(prev => !prev)
  }, [])

  // Animation effect
  useEffect(() => {
    controls.start({
      x: calculateX(currentIndex),
      transition: { 
        type: 'spring', 
        stiffness: 260, 
        damping: 28,
        mass: 0.8
      }
    })

    startAutoplay()
    return () => stopAutoplay()
  }, [currentIndex, controls, calculateX, startAutoplay, stopAutoplay])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === ' ') {
        e.preventDefault()
        toggleAutoplay()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleNext, handlePrev, toggleAutoplay])

  // Drag handling
  const handleDragStart = () => setIsDragging(true)
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    const { offset, velocity } = info

    if (Math.abs(offset.x) > DRAG_THRESHOLD || Math.abs(velocity.x) > 500) {
      if (offset.x > 0) {
        handlePrev()
      } else {
        handleNext()
      }
    } else {
      controls.start({ x: calculateX(currentIndex) })
    }
  }

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] text-gray-500">
        <p className="text-lg">{t('home.carousel.noImages')}</p>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white/20 to-transparent dark:from-black/30 z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white/20 to-transparent dark:from-black/30 z-10" />
      </div>

      {/* Main carousel container */}
      <div 
        className="relative flex items-center justify-center py-20"
        style={{ perspective: '1400px', minHeight: CARD_HEIGHT + 160 }}
      >
        <motion.div
          className="flex items-center"
          style={{ width: images.length * itemWidthWithGap, x: calculateX(currentIndex) }}
          animate={controls}
          drag="x"
          dragConstraints={{ left: -((images.length - 1) * itemWidthWithGap), right: 0 }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          dragElastic={0.2}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
        >
          {images.map((image, i) => {
            const relativeIndex = i - currentIndex
            const absIndex = Math.abs(relativeIndex)
            const isCenter = relativeIndex === 0
            const isAdjacent = absIndex === 1
            const isVisible = absIndex <= 2

            const rotateY = Math.max(-60, Math.min(60, relativeIndex * -ROTATION_ANGLE))
            const scale = isCenter ? 1 : isAdjacent ? 0.85 : SCALE_FACTOR
            const z = isCenter ? 50 : isAdjacent ? 0 : -100
            const opacity = isCenter ? 1 : isAdjacent ? 0.7 : 0.3
            const blur = isCenter ? 0 : isAdjacent ? 0 : BLUR_AMOUNT

            return (
              <motion.div
                key={`${image.src}-${i}`}
                className="relative flex-shrink-0 cursor-grab active:cursor-grabbing"
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  marginRight: GAP,
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center',
                  filter: `blur(${blur}px)`,
                }}
                animate={{
                  rotateY,
                  scale,
                  z,
                  opacity: isVisible ? opacity : 0,
                  transition: { type: 'spring', stiffness: 260, damping: 28, mass: 0.8 }
                }}
                whileHover={isCenter ? { scale: 1.02 } : {}}
              >
                {/* Image container */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden group">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes={`(max-width: 768px) 100vw, ${CARD_WIDTH}px`}
                    priority={isCenter}
                    quality={isCenter ? 95 : 75}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {isCenter && (image.title || image.description) && (
                    <AnimatePresence>
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 p-6 text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {image.title && (
                          <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                            {image.title}
                          </h3>
                        )}
                        {image.description && (
                          <p className="text-sm opacity-90 line-clamp-2 drop-shadow">
                            {image.description}
                          </p>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  )}
                  {isCenter && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-full">
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200">HD</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      <button onClick={handlePrev} className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center z-20 transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 hover:shadow-xl group" aria-label={t('home.carousel.prev')}>
        <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
      </button>
      <button onClick={handleNext} className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center z-20 transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 hover:shadow-xl group" aria-label={t('home.carousel.next')}>
        <ChevronRight className="w-6 h-6 text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
      </button>

      {autoplayInterval && (
        <button onClick={toggleAutoplay} className="absolute top-6 right-6 w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center z-20 transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 hover:scale-110" aria-label={isAutoplayActive ? t('home.carousel.pause') : t('home.carousel.play')}>
          {isAutoplayActive ? (<Pause className="w-4 h-4 text-gray-800 dark:text-gray-200" />) : (<Play className="w-4 h-4 text-gray-800 dark:text-gray-200 ml-0.5" />)}
        </button>
      )}

      {showIndicators && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg">
          {images.map((_, i) => (
            <button key={i} onClick={() => goToSlide(i)} className={`transition-all duration-300 rounded-full ${i === currentIndex ? 'w-8 h-2 bg-gray-800 dark:bg-white' : 'w-2 h-2 bg-gray-400 dark:bg-gray-500 hover:bg-gray-600 dark:hover:bg-gray-400'}`} aria-label={t('home.carousel.goto', { index: i + 1 })} />
          ))}
        </div>
      )}

      <div className="absolute top-6 left-6 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-md z-20">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {currentIndex + 1} / {images.length}
        </span>
      </div>
    </div>
  )
}