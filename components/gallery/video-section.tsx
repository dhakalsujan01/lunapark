// src/components/gallery/VideoSection.tsx

"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { VideoPlayerModal } from "./VideoPlayerModal" // New component for the video player
import { useTranslations } from "next-intl"

// Type for Video object
export type Video = {
  id: number
  title: string
  description: string
  thumbnail: string
  duration: string
  category: string
  src: string
}

export function VideoSection() {
  const t = useTranslations('gallery.videoGallery')
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null)

  const videos: Video[] = [
    { id: 1, title: t('videos.parkOverview.title'), description: t('videos.parkOverview.description'), thumbnail: "/thrilling-roller-coaster.png", duration: "2:45", category: t('videos.parkOverview.category'), src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"},
    { id: 2, title: t('videos.thunderMountainPOV.title'), description: t('videos.thunderMountainPOV.description'), thumbnail: "/dark-dragon-coaster.png", duration: "3:12", category: t('videos.thunderMountainPOV.category'), src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"},
    { id: 3, title: t('videos.familyFunHighlights.title'), description: t('videos.familyFunHighlights.description'), thumbnail: "/happy-family-amusement-park.png", duration: "1:58", category: t('videos.familyFunHighlights.category'), src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"},
    { id: 4, title: t('videos.waterParkAdventures.title'), description: t('videos.waterParkAdventures.description'), thumbnail: "/colorful-water-playground.png", duration: "2:23", category: t('videos.waterParkAdventures.category'), src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"},
  ]

  return (
    <section id="video-section" className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('title')}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videos.map((video) => (
            <Card key={video.id} className="border-0 shadow-lg bg-white overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
              <div className="relative aspect-video group">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Button
                    size="icon"
                    className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 transform group-hover:scale-110 transition-transform"
                    onClick={() => setPlayingVideo(video)}
                    aria-label={`Play video: ${video.title}`}
                  >
                    <Play className="w-10 h-10 text-white ml-1" />
                  </Button>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-sm font-medium backdrop-blur-sm">
                  {video.duration}
                </div>
                <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded text-sm font-semibold">
                  {video.category}
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{video.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">{video.description}</p>
                <Button
                  className="bg-amber-500 text-white hover:bg-amber-600"
                  onClick={() => setPlayingVideo(video)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {t('watchNow')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {playingVideo && (
            <VideoPlayerModal 
                video={playingVideo}
                onClose={() => setPlayingVideo(null)}
            />
        )}
      </div>
    </section>
  )
}