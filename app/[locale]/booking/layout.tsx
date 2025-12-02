import type React from "react"
import type { Metadata } from "next"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  
  if (locale === 'ru') {
    return {
      title: "Бронирование - Парк приключений",
      description: "Управляйте своими бронированиями и билетами в Парке приключений",
      keywords: "бронирование, билеты, парк приключений, платеж, заказ"
    }
  }
  
  return {
    title: "Booking - Adventure Park",
    description: "Manage your bookings and tickets at Adventure Park",
    keywords: "booking, tickets, adventure park, payment, order"
  }
}

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <main className="min-h-screen">
        {children}
      </main>
      <Toaster />
    </Providers>
  )
}
