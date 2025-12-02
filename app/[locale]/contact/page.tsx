import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { ContactForm } from "@/components/aceternity/contact-form"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact.metadata' })
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://adventurepark.com/${locale}/contact`,
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
      canonical: `https://adventurepark.com/${locale}/contact`,
    },
  }
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  return (
    <div className="min-h-screen bg-background">
      {/* Contact Form Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <ContactForm />
        </div>
      </section>
    </div>
  )
}