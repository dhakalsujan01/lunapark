import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { GalleryHero } from "@/components/gallery/gallery-hero"
import { VideoSection } from "@/components/gallery/video-section"
import { PhotoGallery } from "@/components/gallery/photo-gallery"
import NewGal from "@/components/gallery/new-gal"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'gallery.metadata' })
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://adventurepark.com/${locale}/gallery`,
      images: [
        {
          url: "/thrilling-roller-coaster.png",
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      title: t('title'),
      description: t('description'),
      images: ["/thrilling-roller-coaster.png"],
    },
    alternates: {
      canonical: `https://adventurepark.com/${locale}/gallery`,
    },
  }
}

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params
  
  return (
    <div className="min-h-screen">
      <GalleryHero />
      <PhotoGallery />
      <VideoSection />
      <NewGal />
    </div>
  )
}