import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Inter, Montserrat } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"
import { LayoutWrapper } from "@/components/layout-wrapper"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: {
    default: "Luna Amusement Park - Thrilling Rides & Family Fun",
    template: "%s | Luna Amusement Park"
  },
  description: "Experience the magic at Luna Amusement Park - thrilling rides, family fun, and unforgettable memories await! Located in Entertainment City with 20+ world-class attractions.",
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
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'ru-RU': '/ru-RU',
    },
  },
  openGraph: {
    title: "Luna Amusement Park - Thrilling Rides & Family Fun",
    description: "Experience the magic at Luna Amusement Park - thrilling rides, family fun, and unforgettable memories await!",
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    siteName: "Luna Amusement Park",
    images: [
      {
        url: '/amusement-park-aerial-view.png',
        width: 1200,
        height: 630,
        alt: 'Luna Amusement Park Aerial View',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Luna Amusement Park - Thrilling Rides & Family Fun",
    description: "Experience the magic at Luna Amusement Park - thrilling rides, family fun, and unforgettable memories await!",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={`${inter.variable} ${montserrat.variable} antialiased`} suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}