"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LiquidButton } from "@/components/ui/liquid-button"
import { 
  Heart, 
  Shield, 
  Star, 
  Clock, 
  MapPin, 
  Smartphone,
  ArrowRight,
  Zap,
  Ticket,
  Users,
  Award
} from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"

const features = [
  {
    id: 1,
    icon: <Zap className="h-8 w-8" />,
    titleKey: "home.features.thrilling.title",
    descKey: "home.features.thrilling.description",
    statsKey: "home.stats.rides",
    color: "bg-blue-800", // Deep Thunder Blue
  },
  {
    id: 2,
    icon: <Ticket className="h-8 w-8" />,
    titleKey: "home.features.ticketing.title",
    descKey: "home.features.ticketing.description",
    statsKey: "home.stats.instant",
    color: "bg-emerald-600", // Emerald Green
  },
  {
    id: 3,
    icon: <Shield className="h-8 w-8" />,
    titleKey: "home.features.safety.title",
    descKey: "home.features.safety.description",
    statsKey: "home.stats.safe",
    color: "bg-red-600", // Lightning Red
  },
  {
    id: 4,
    icon: <Users className="h-8 w-8" />,
    titleKey: "home.features.family.title",
    descKey: "home.features.family.description",
    statsKey: "home.stats.allAges",
    color: "bg-purple-600", // Purple
  },
  {
    id: 5,
    icon: <Award className="h-8 w-8" />,
    titleKey: "home.features.award.title",
    descKey: "home.features.award.description",
    statsKey: "home.stats.rated",
    color: "bg-amber-500", // Golden Thunder
  },
  {
    id: 6,
    icon: <Smartphone className="h-8 w-8" />,
    titleKey: "home.features.tech.title",
    descKey: "home.features.tech.description",
    statsKey: "home.stats.tech",
    color: "bg-cyan-600", // Cyan
  },
]

const highlights = [
  {
    icon: <Clock className="h-5 w-5" />,
    labelKey: "home.highlights.open",
    valueKey: "home.highlights.yearRound"
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    labelKey: "home.highlights.location",
    valueKey: "home.highlights.cityCenter"
  },
  {
    icon: <Star className="h-5 w-5" />,
    labelKey: "home.highlights.rating",
    valueKey: "home.highlights.ratingValue"
  },
]

export function FeaturesSection() {
  const t = useTranslations()
  const params = useParams()
  const currentLocale = (params?.locale as string) || "en"

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {t("home.features.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t("home.features.subtitle")}
            </p>
          </div>

          {/* Highlights Bar */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-16 p-6 bg-card rounded-2xl shadow-sm border">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex items-center gap-3 text-center md:text-left">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {highlight.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">{t(highlight.labelKey)}</div>
                  <div className="text-lg font-semibold text-gray-900">{t(highlight.valueKey)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${feature.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {t(feature.titleKey)}
                        </h3>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs font-medium">
                          {t(feature.statsKey)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {t(feature.descKey)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 rounded-full text-blue-700 font-medium">
              <Star className="h-4 w-4" />
              <span>{t("home.stats.trusted")}</span>
            </div>
            
            <div>
              <LiquidButton
                variant="thunder"
                size="lg"
                asChild
              >
                <Link href={`/${currentLocale}/attractions`} className="inline-flex items-center gap-2">
                  {t("home.features.cta")}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </LiquidButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
