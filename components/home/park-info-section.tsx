"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, MapPin, Ticket, Award } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export function ParkInfoSection() {
  const t = useTranslations();
  const params = useParams();
  const currentLocale = (params?.locale as string) || "en";

  // Data remains the same, but we'll render it differently.
  const quickStats = [
    { value: "20+", labelKey: "home.parkInfo.stats.attractions" },
    { value: "4.8★", labelKey: "home.parkInfo.stats.rating" },
    { value: "15+", labelKey: "home.parkInfo.stats.years" },
    { value: "365", labelKey: "home.parkInfo.stats.days" },
  ];

  const parkInfo = [
    {
      icon: <MapPin className="h-5 w-5 text-primary" />,
      labelKey: "home.parkInfo.location.label",
      valueKey: "home.parkInfo.location.value",
    },
    {
      icon: <Clock className="h-5 w-5 text-primary" />,
      labelKey: "home.parkInfo.hours.label",
      valueKey: "home.parkInfo.hours.value",
    },
    {
      icon: <Users className="h-5 w-5 text-primary" />,
      labelKey: "home.parkInfo.visitors.label",
      valueKey: "home.parkInfo.visitors.value",
    },
  ];

  return (
    <section className="bg-background text-foreground py-16 sm:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <Badge variant="secondary" className="mb-4">
            <Award className="h-4 w-4 mr-2" />
            {t("home.parkInfo.badge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            {t("home.parkInfo.title")} <span style={{ color: '#155dfc' }}>{t("home.parkInfo.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("home.parkInfo.subtitle")}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Information */}
          <div className="space-y-10">
            
            {/* Quick Stats Section */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-8">
              {quickStats.map((stat) => (
                <div key={stat.labelKey}>
                  <p className="text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t(stat.labelKey)}</p>
                </div>
              ))}
            </div>

            {/* Divider for visual separation */}
            <hr className="border-border" />

            {/* Detailed Info List */}
            <div className="space-y-6">
              {parkInfo.map((info) => (
                <div key={info.labelKey} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{info.icon}</div>
                  <div>
                    <p className="font-semibold text-foreground">{t(info.valueKey)}</p>
                    <p className="text-sm text-muted-foreground">{t(info.labelKey)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href={`/${currentLocale}/attractions`}>
                  <Ticket className="mr-2 h-5 w-5" />
                  {t("home.parkInfo.cta.tickets")}
                </Link>
              </Button>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
                <Link href={`/${currentLocale}/contact`}>
                  <MapPin className="mr-2 h-5 w-5" />
                  {t("home.parkInfo.cta.directions")}
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Right Column: Image */}
          <div className="w-full h-full">
            <Image
              src="/amusement-park-entrance-gate.png" 
              alt={t("home.parkInfo.image.alt")}
              width={600}
              height={700}
              className="w-full h-full object-cover rounded-xl shadow-lg"
            />
          </div>

        </div>
      </div>
    </section>
  );
}