import Image from "next/image"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function CalawayParkHero() {
  const t = useTranslations()
  const params = useParams()
  const currentLocale = (params?.locale as string) || "en"
  
  return (
    <div className="min-h-screen bg-background">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Column - Image */}
        <div className="relative overflow-hidden">
          <Image
            src="/thrilling-roller-coaster.png"
            alt={t("home.secondWhy.imageAlt")}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Right Column - Content */}
        <div className="flex flex-col justify-between p-8 lg:p-12 bg-card">
          {/* Brand Name */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-light text-red-500 lowercase tracking-wide">luna park</h1>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center space-y-8">
            {/* Headline */}
            <h2 className="text-4xl lg:text-6xl font-black text-blue-800 uppercase tracking-tight leading-none">
              {t("home.secondWhy.headlineLine1")}
              <br />
              {t("home.secondWhy.headlineLine2")}
            </h2>

            {/* Body Copy */}
            <div className="space-y-4 text-foreground font-serif text-lg leading-relaxed max-w-md">
              <p>{t("home.secondWhy.p1")}</p>
              <p>{t("home.secondWhy.p2")}</p>
              <p>{t("home.secondWhy.p3")}</p>
            </div>

            {/* Call to Action */}
            <div className="pt-4">
              <Link 
                href={`/${currentLocale}/attractions`}
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200"
              >
                {t("home.secondWhy.cta")}
              </Link>
            </div>
          </div>

          {/* Proudly Award Winning Badge */}
          <div className="flex items-center space-x-2 mt-8">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">🏆</span>
            </div>
            <span className="text-amber-600 font-bold text-sm uppercase tracking-wide">{t("home.secondWhy.badge")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}