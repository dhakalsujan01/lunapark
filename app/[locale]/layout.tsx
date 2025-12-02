import type React from "react"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { NextIntlClientProvider } from "next-intl"

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const locales = ["en", "ru"]

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  return {
    title: {
      default: locale === "ru" 
        ? "Парк развлечений Луна - Захватывающие аттракционы и семейный отдых"
        : "Luna Amusement Park - Thrilling Rides & Family Fun",
      template: locale === "ru" 
        ? "%s | Парк развлечений Луна"
        : "%s | Luna Amusement Park"
    },
    description: locale === "ru"
      ? "Испытайте магию в парке развлечений Луна - захватывающие аттракционы, семейное веселье и незабываемые воспоминания ждут вас! Расположен в Городе развлечений с более чем 20 аттракционами мирового класса."
      : "Experience the magic at Luna Amusement Park - thrilling rides, family fun, and unforgettable memories await! Located in Entertainment City with 20+ world-class attractions.",
    keywords: [
      "amusement park",
      "theme park", 
      "roller coaster",
      "family fun",
      "attractions",
      "rides",
      "tickets",
      "entertainment",
      "Luna Park",
      "thrill rides",
      "water rides",
      "carousel",
      "ferris wheel"
    ],
    authors: [{ name: "Luna Amusement Park" }],
    creator: "Luna Amusement Park",
    publisher: "Luna Amusement Park",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'ru': '/ru',
      },
    },
    openGraph: {
      title: locale === "ru" 
        ? "Парк развлечений Луна - Захватывающие аттракционы и семейный отдых"
        : "Luna Amusement Park - Thrilling Rides & Family Fun",
      description: locale === "ru"
        ? "Испытайте магию в парке развлечений Луна - захватывающие аттракционы, семейное веселье и незабываемые воспоминания ждут вас!"
        : "Experience the magic at Luna Amusement Park - thrilling rides, family fun, and unforgettable memories await!",
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/${locale}`,
      siteName: "Luna Amusement Park",
      images: [
        {
          url: '/amusement-park-aerial-view.png',
          width: 1200,
          height: 630,
          alt: locale === "ru" ? 'Вид парка развлечений Луна с высоты птичьего полета' : 'Luna Amusement Park Aerial View',
        },
      ],
      locale: locale === "ru" ? 'ru_RU' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === "ru" 
        ? "Парк развлечений Луна - Захватывающие аттракционы и семейный отдых"
        : "Luna Amusement Park - Thrilling Rides & Family Fun",
      description: locale === "ru"
        ? "Испытайте магию в парке развлечений Луна - захватывающие аттракционы, семейное веселье и незабываемые воспоминания ждут вас!"
        : "Experience the magic at Luna Amusement Park - thrilling rides, family fun, and unforgettable memories await!",
      images: ['/amusement-park-aerial-view.png'],
      creator: '@lunapark',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
    },
    manifest: '/manifest.json',
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Explicitly load messages based on the URL segment to avoid mis-detection
  const safeLocale = locales.includes(locale) ? locale : 'en'
  const messages = (await import(`../../locales/${safeLocale}.json`)).default

  return (
    <Providers>
      <NextIntlClientProvider locale={safeLocale} messages={messages}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <Toaster />
      </NextIntlClientProvider>
    </Providers>
  )
}
