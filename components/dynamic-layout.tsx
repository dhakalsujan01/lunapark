"use client"

import { useEffect } from "react"
import { useSettingsWithFallback } from "@/hooks/use-settings"
import Head from "next/head"

interface DynamicLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  image?: string
}

export function DynamicLayout({ 
  children, 
  title, 
  description, 
  image 
}: DynamicLayoutProps) {
  const { settings } = useSettingsWithFallback()

  // Use custom title/description or fallback to settings
  const pageTitle = title || settings.seo.metaTitle
  const pageDescription = description || settings.seo.metaDescription
  const pageImage = image || settings.seo.ogImage

  // Update document title dynamically
  useEffect(() => {
    if (pageTitle) {
      document.title = pageTitle
    }
  }, [pageTitle])

  // Update meta tags dynamically
  useEffect(() => {
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', pageDescription)

    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.setAttribute('content', settings.seo.ogTitle)

    let ogDescription = document.querySelector('meta[property="og:description"]')
    if (!ogDescription) {
      ogDescription = document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      document.head.appendChild(ogDescription)
    }
    ogDescription.setAttribute('content', settings.seo.ogDescription)

    let ogImage = document.querySelector('meta[property="og:image"]')
    if (!ogImage) {
      ogImage = document.createElement('meta')
      ogImage.setAttribute('property', 'og:image')
      document.head.appendChild(ogImage)
    }
    ogImage.setAttribute('content', pageImage)

    // Update Twitter tags
    let twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (!twitterTitle) {
      twitterTitle = document.createElement('meta')
      twitterTitle.setAttribute('name', 'twitter:title')
      document.head.appendChild(twitterTitle)
    }
    twitterTitle.setAttribute('content', settings.seo.twitterTitle)

    let twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (!twitterDescription) {
      twitterDescription = document.createElement('meta')
      twitterDescription.setAttribute('name', 'twitter:description')
      document.head.appendChild(twitterDescription)
    }
    twitterDescription.setAttribute('content', settings.seo.twitterDescription)

    let twitterImage = document.querySelector('meta[name="twitter:image"]')
    if (!twitterImage) {
      twitterImage = document.createElement('meta')
      twitterImage.setAttribute('name', 'twitter:image')
      document.head.appendChild(twitterImage)
    }
    twitterImage.setAttribute('content', settings.seo.twitterImage)

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', settings.seo.canonicalUrl)

    // Update keywords
    let keywords = document.querySelector('meta[name="keywords"]')
    if (!keywords) {
      keywords = document.createElement('meta')
      keywords.setAttribute('name', 'keywords')
      document.head.appendChild(keywords)
    }
    keywords.setAttribute('content', settings.seo.keywords.join(', '))

  }, [pageTitle, pageDescription, pageImage, settings.seo])

  return <>{children}</>
}
