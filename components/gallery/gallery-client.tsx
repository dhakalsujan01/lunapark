"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { ImageGallery } from "@/components/aceternity/image-gallery"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

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
}

interface GalleryClientProps {
  mediaItems: MediaItem[]
  categories: string[]
}

export function GalleryClient({ mediaItems, categories }: GalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredItems = mediaItems.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <>
      {/* Filters Section */}
      <section className="py-12 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Search */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
                <Input
                  placeholder="Search photos and videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "secondary" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`${
                    selectedCategory === category
                      ? "bg-white text-purple-600 hover:bg-gray-100"
                      : "border-white/30 text-white hover:bg-white/20"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Results Count */}
            <div className="text-center mt-6">
              <p className="text-white/80">
                Showing {filteredItems.length} of {mediaItems.length} items
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ImageGallery items={filteredItems} />
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
                <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-gray-600 dark:text-gray-300">
                  No Results Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search terms or category filters.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
