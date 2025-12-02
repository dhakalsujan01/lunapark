"use client"

import Image from "next/image"
import { useSettingsWithFallback } from "@/hooks/use-settings"

interface DynamicLogoProps {
  className?: string
  width?: number
  height?: number
  alt?: string
}

export function DynamicLogo({ 
  className = "", 
  width = 40, 
  height = 40, 
  alt = "Park Logo" 
}: DynamicLogoProps) {
  const { settings, loading, hasSettings } = useSettingsWithFallback()
  
  // Show logo immediately if available, fallback to text
  if (settings.general.logo && settings.general.logo.trim()) {
    return (
      <Image
        src={settings.general.logo}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority
      />
    )
  }
  
  // Fallback to park name if no logo
  return (
    <div className={`font-bold text-xl text-orange-600 ${className}`}>
      {settings.general.parkName}
    </div>
  )
}
