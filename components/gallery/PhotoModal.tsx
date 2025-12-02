// src/components/gallery/PhotoModal.tsx

"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Photo } from "./PhotoGallery"

interface PhotoModalProps {
  photo: Photo
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

export function PhotoModal({ photo, onClose, onNext, onPrev }: PhotoModalProps) {
  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") onNext()
      if (e.key === "ArrowLeft") onPrev()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose, onNext, onPrev])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="relative w-full h-full max-w-5xl max-h-[90vh] flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image/content
      >
        <div className="absolute top-0 right-0 z-20 flex items-center gap-2 p-4">
            <Button size="icon" variant="ghost" className="text-white bg-black/30 hover:bg-black/50 hover:text-white backdrop-blur-sm" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>
        
        <Button size="icon" variant="ghost" className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/30 hover:bg-black/50 hover:text-white backdrop-blur-sm h-12 w-12" onClick={onPrev}><ChevronLeft className="w-6 h-6" /></Button>
        <Button size="icon" variant="ghost" className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/30 hover:bg-black/50 hover:text-white backdrop-blur-sm h-12 w-12" onClick={onNext}><ChevronRight className="w-6 h-6" /></Button>
        
        <div className="relative flex-1 w-full h-full">
            <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="100vw"
                className="object-contain rounded-lg"
            />
        </div>

        <div className="text-center text-white bg-gradient-to-t from-black/50 via-black/20 to-transparent p-6 rounded-b-lg">
            <h3 className="font-bold text-xl">{photo.title}</h3>
            <p className="text-gray-300 mt-1">{photo.description}</p>
        </div>

      </motion.div>
    </motion.div>
  )
}