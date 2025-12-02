"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils-aceternity"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Share2, 
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize
} from "lucide-react"
import Image from "next/image"

interface MediaItem {
  id: string
  type: "image" | "video"
  src: string
  thumbnail?: string
  title: string
  description: string
  category: string
  likes: number
  views: number
  isLiked?: boolean
}

interface ImageGalleryProps {
  items: MediaItem[]
  className?: string
}

export function ImageGallery({ items, className }: ImageGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  const openLightbox = (item: MediaItem, index: number) => {
    setSelectedItem(item)
    setCurrentIndex(index)
  }

  const closeLightbox = () => {
    setSelectedItem(null)
    setIsPlaying(false)
  }

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
    setCurrentIndex(newIndex)
    setSelectedItem(items[newIndex])
  }

  const goToNext = () => {
    const newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
    setCurrentIndex(newIndex)
    setSelectedItem(items[newIndex])
  }

  const toggleLike = (itemId: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const shareItem = async (item: MediaItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <>
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-lg hover:shadow-2xl transition-all duration-300"
            whileHover={{ y: -5 }}
          >
            {/* Media Container */}
            <div 
              className="relative aspect-square overflow-hidden cursor-pointer"
              onClick={() => openLightbox(item, index)}
            >
              <Image
                src={item.thumbnail || item.src}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              
              {/* Play Button for Videos */}
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="h-8 w-8 text-gray-900 ml-1" />
                  </div>
                </div>
              )}
              
              {/* Type Badge */}
              <div className="absolute top-3 left-3">
                <Badge className={cn(
                  "text-xs",
                  item.type === "video" 
                    ? "bg-red-500/90 text-white" 
                    : "bg-blue-500/90 text-white"
                )}>
                  {item.type === "video" ? "Video" : "Photo"}
                </Badge>
              </div>
              
              {/* Stats */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex gap-2">
                  <div className="bg-black/50 rounded-full px-2 py-1 text-xs text-white">
                    {item.views} views
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {item.description}
              </p>
              
              {/* Actions */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLike(item.id)
                    }}
                  >
                    <Heart className={cn(
                      "h-4 w-4",
                      likedItems.has(item.id) ? "fill-red-500 text-red-500" : "text-gray-500"
                    )} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      shareItem(item)
                    }}
                  >
                    <Share2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Navigation */}
            <Button
              variant="ghost"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            
            <Button
              variant="ghost"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            {/* Close Button */}
            <Button
              variant="ghost"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Media Content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === "image" ? (
                <Image
                  src={selectedItem.src}
                  alt={selectedItem.title}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="relative">
                  <video
                    src={selectedItem.src}
                    className="max-w-full max-h-full object-contain"
                    controls={false}
                    autoPlay={isPlaying}
                    muted={isMuted}
                    loop
                  />
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/50 rounded-lg p-3">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Info Panel */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{selectedItem.title}</h3>
                  <p className="text-gray-300 mb-2">{selectedItem.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{selectedItem.category}</span>
                    <span>{selectedItem.views} views</span>
                    <span>{selectedItem.likes + (likedItems.has(selectedItem.id) ? 1 : 0)} likes</span>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => toggleLike(selectedItem.id)}
                  >
                    <Heart className={cn(
                      "h-5 w-5",
                      likedItems.has(selectedItem.id) ? "fill-red-500 text-red-500" : ""
                    )} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => shareItem(selectedItem)}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
