"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ZoomIn } from "lucide-react"
import { PhotoModal } from "./PhotoModal" // New component for the modal
import { useTranslations } from "next-intl"

// Define a type for our photo objects for better type safety
export type Photo = {
  id: number
  src: string
  alt: string
  category: string
  title: string
  description: string
}

// Photo data will be created dynamically with translations

export function PhotoGallery() {
  const t = useTranslations('gallery.photoGallery')
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null)
  const [activeFilter, setActiveFilter] = useState(t('filters.all'))

  const filters = [
    t('filters.all'),
    t('filters.rides'),
    t('filters.familyFun'),
    t('filters.waterPark'),
    t('filters.events'),
    t('filters.foodDining')
  ]

  const photos: Photo[] = [
    { id: 1, src: "/thrilling-roller-coaster.png", alt: "Thunder Mountain Roller Coaster", category: t('filters.rides'), title: t('photos.thunderMountain.title'), description: t('photos.thunderMountain.description') },
    { id: 2, src: "/family-water-rapids.png", alt: "Family enjoying water rapids", category: t('filters.familyFun'), title: t('photos.familyRapids.title'), description: t('photos.familyRapids.description') },
    { id: 3, src: "/colorful-ferris-wheel-sunset.png", alt: "Ferris wheel at sunset", category: t('filters.rides'), title: t('photos.skySoarer.title'), description: t('photos.skySoarer.description') },
    { id: 4, src: "/colorful-water-playground.png", alt: "Children's water playground", category: t('filters.waterPark'), title: t('photos.splashZone.title'), description: t('photos.splashZone.description') },
    { id: 5, src: "/colorful-carousel.png", alt: "Colorful carousel horses", category: t('filters.familyFun'), title: t('photos.carouselDreams.title'), description: t('photos.carouselDreams.description') },
    { id: 6, src: "/dark-dragon-coaster.png", alt: "Dragon themed dark ride", category: t('filters.rides'), title: t('photos.dragonsLair.title'), description: t('photos.dragonsLair.description') },
  ]

  const filteredPhotos = activeFilter === t('filters.all') ? photos : photos.filter((photo) => photo.category === activeFilter)

  const selectedPhoto = photos.find(p => p.id === selectedPhotoId)

  const handleNext = () => {
    if (selectedPhotoId === null) return
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhotoId)
    const nextIndex = (currentIndex + 1) % filteredPhotos.length
    setSelectedPhotoId(filteredPhotos[nextIndex].id)
  }

  const handlePrev = () => {
    if (selectedPhotoId === null) return
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhotoId)
    const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length
    setSelectedPhotoId(filteredPhotos[prevIndex].id)
  }

  return (
    <section id="photo-gallery" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('title')}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              onClick={() => setActiveFilter(filter)}
              className={
                activeFilter === filter
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }
            >
              {filter}
            </Button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="relative group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
                onClick={() => setSelectedPhotoId(photo.id)}
              >
                                  {/* Much taller images - 448px height for better proportions */}
                  <div className="w-full h-[448px] overflow-hidden relative">
                   <Image
                     src={photo.src}
                     alt={photo.alt}
                     fill
                     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                     className="object-cover group-hover:scale-105 transition-transform duration-300"
                   />
                 </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <Badge className="absolute top-4 left-4 bg-amber-500 text-white border-0">{photo.category}</Badge>
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{photo.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{photo.description}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
            {selectedPhoto && (
                <PhotoModal 
                    photo={selectedPhoto} 
                    onClose={() => setSelectedPhotoId(null)} 
                    onNext={handleNext}
                    onPrev={handlePrev}
                />
            )}
        </AnimatePresence>
      </div>
    </section>
  )
}