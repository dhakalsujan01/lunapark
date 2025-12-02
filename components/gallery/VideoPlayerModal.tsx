// src/components/gallery/VideoPlayerModal.tsx

"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, X } from "lucide-react"
import type { Video } from "./VideoSection"

interface VideoPlayerModalProps {
  video: Video
  onClose: () => void
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function VideoPlayerModal({ video, onClose }: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)

  // Auto-hide controls logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const show = () => {
      setShowControls(true)
      clearTimeout(timeoutId)
      if (isPlaying) {
        timeoutId = setTimeout(() => setShowControls(false), 3000)
      }
    }
    const container = playerContainerRef.current
    container?.addEventListener('mousemove', show)
    return () => container?.removeEventListener('mousemove', show)
  }, [isPlaying])

  // Core video event listeners
  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleTimeUpdate = () => {
      setCurrentTime(videoEl.currentTime)
      setProgress((videoEl.currentTime / videoEl.duration) * 100)
    }
    const handleLoadedMetadata = () => setDuration(videoEl.duration)
    
    videoEl.addEventListener('play', handlePlay)
    videoEl.addEventListener('pause', handlePause)
    videoEl.addEventListener('timeupdate', handleTimeUpdate)
    videoEl.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      videoEl.removeEventListener('play', handlePlay)
      videoEl.removeEventListener('pause',handlePause)
      videoEl.removeEventListener('timeupdate', handleTimeUpdate)
      videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === " ") togglePlayPause()
      if (e.key === "f") toggleFullscreen()
      if (e.key === "m") toggleMute()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  const togglePlayPause = () => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()
  const handleScrub = (value: number[]) => {
    if (!videoRef.current) return
    const newTime = (value[0] / 100) * duration
    videoRef.current.currentTime = newTime
    setProgress(value[0])
  }
  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return
    const newVolume = value[0]
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }
  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
    if (!newMuted) {
        setVolume(videoRef.current.volume > 0 ? videoRef.current.volume : 0.5);
    }
  }
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        playerContainerRef.current?.requestFullscreen();
        setIsFullscreen(true)
    } else {
        document.exitFullscreen();
        setIsFullscreen(false)
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
    >
      <div 
        ref={playerContainerRef}
        className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden group/player"
      >
        <video
          ref={videoRef}
          src={video.src}
          poster={video.thumbnail}
          className="w-full h-full object-contain"
          onClick={togglePlayPause}
          autoPlay
        />
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Main close button */}
          <Button size="icon" variant="ghost" className="absolute top-4 right-4 z-20 text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm" onClick={onClose}><X className="w-5 h-5" /></Button>
          
          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            {/* Progress Bar */}
            <Slider value={[progress]} onValueChange={handleScrub} className="w-full cursor-pointer" />

            <div className="flex items-center justify-between mt-2 text-white">
              <div className="flex items-center gap-4">
                <Button size="icon" variant="ghost" onClick={togglePlayPause} className="text-white hover:bg-white/20 hover:text-white">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
                <div className="flex items-center gap-2 group/volume">
                    <Button size="icon" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20 hover:text-white">
                      {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      onValueChange={handleVolumeChange}
                      max={1}
                      step={0.05}
                      className="w-24 cursor-pointer opacity-0 group-hover/volume:opacity-100 transition-opacity"
                    />
                </div>
                <div className="font-mono text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <h3 className="font-semibold hidden sm:block">{video.title}</h3>
                <Button size="icon" variant="ghost" onClick={toggleFullscreen} className="text-white hover:bg-white/20 hover:text-white">
                  {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}