"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Crown,
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Star,
  Ticket,
  Shield,
  Heart,
  Send,
  ArrowRight
} from "lucide-react"
import { useSettingsWithFallback } from "@/hooks/use-settings"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"

export function DynamicFooter() {
  const { settings, loading } = useSettingsWithFallback()
  const t = useTranslations()
  const params = useParams()
  const currentLocale = (params?.locale as string) || "en"

  const footerSections = [
    {
      title: t("footer.sections.parkInfo.title"),
      icon: <Crown className="h-5 w-5" />,
      links: [
        { name: t("footer.sections.parkInfo.about"), href: `/${currentLocale}/about` },
        { name: t("footer.sections.parkInfo.map"), href: `/${currentLocale}/map` },
        { name: t("footer.sections.parkInfo.hours"), href: `/${currentLocale}/hours` },
        { name: t("footer.sections.parkInfo.directions"), href: `/${currentLocale}/directions` },
        { name: t("footer.sections.parkInfo.accessibility"), href: `/${currentLocale}/accessibility` }
      ]
    },
    {
      title: t("footer.sections.attractions.title"),
      icon: <Star className="h-5 w-5" />,
      links: [
        { name: t("footer.sections.attractions.allRides"), href: `/${currentLocale}/attractions` },
        { name: t("footer.sections.attractions.thrillRides"), href: `/${currentLocale}/attractions?category=thrill` },
        { name: t("footer.sections.attractions.familyRides"), href: `/${currentLocale}/attractions?category=family` },
        { name: t("footer.sections.attractions.waterRides"), href: `/${currentLocale}/attractions?category=water` },
        { name: t("footer.sections.attractions.shows"), href: `/${currentLocale}/shows` }
      ]
    },
    {
      title: t("footer.sections.tickets.title"),
      icon: <Ticket className="h-5 w-5" />,
      links: [
        { name: t("footer.sections.tickets.dayPasses"), href: `/${currentLocale}/tickets` },
        { name: t("footer.sections.tickets.seasonPasses"), href: `/${currentLocale}/tickets?type=season` },
        { name: t("footer.sections.tickets.groupRates"), href: `/${currentLocale}/tickets?type=group` },
        { name: t("footer.sections.tickets.vipExperiences"), href: `/${currentLocale}/tickets?type=vip` },
        { name: t("footer.sections.tickets.giftCards"), href: `/${currentLocale}/gift-cards` }
      ]
    }
  ]

  // Social media icons with fallback links
  const socialIcons = [
    { name: "Facebook", icon: <Facebook className="h-5 w-5" />, color: "hover:text-blue-600" },
    { name: "Instagram", icon: <Instagram className="h-5 w-5" />, color: "hover:text-pink-600" },
    { name: "Twitter", icon: <Twitter className="h-5 w-5" />, color: "hover:text-sky-500" },
    { name: "YouTube", icon: <Youtube className="h-5 w-5" />, color: "hover:text-red-600" },
    { name: "TikTok", icon: <Heart className="h-5 w-5" />, color: "hover:text-purple-600" }
  ]

  // Get social media links from settings
  const socialLinks = [
    { name: "Facebook", href: settings.social.facebook, icon: socialIcons[0].icon, color: socialIcons[0].color },
    { name: "Instagram", href: settings.social.instagram, icon: socialIcons[1].icon, color: socialIcons[1].color },
    { name: "Twitter", href: settings.social.twitter, icon: socialIcons[2].icon, color: socialIcons[2].color },
    { name: "YouTube", href: settings.social.youtube, icon: socialIcons[3].icon, color: socialIcons[3].color },
    { name: "TikTok", href: settings.social.tiktok, icon: socialIcons[4].icon, color: socialIcons[4].color }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">{settings.general.parkName}</h3>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              {settings.general.description}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-orange-400" />
                <span>{settings?.general?.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-orange-400" />
                <span>{settings?.general?.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-orange-400" />
                <span>{settings?.general?.email}</span>
              </div>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center space-x-2">
                {section.icon}
                <h4 className="font-semibold text-white">{section.title}</h4>
              </div>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="max-w-md">
            <h4 className="text-lg font-semibold mb-2">{t("footer.newsletter.title")}</h4>
            <p className="text-gray-300 text-sm mb-4">{t("footer.newsletter.description")}</p>
            <div className="flex space-x-2">
              <Input 
                type="email" 
                placeholder={t("footer.newsletter.placeholder")}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-400">
            © 2025 {settings.general.parkName}. {t("footer.rights")}
          </div>
          
          <div className="flex items-center space-x-6">
            <Link href={`/${currentLocale}/privacy-policy`} className="text-sm text-gray-400 hover:text-white transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link href={`/${currentLocale}/terms`} className="text-sm text-gray-400 hover:text-white transition-colors">
              {t("footer.terms")}
            </Link>
            <Link href={`/${currentLocale}/accessibility`} className="text-sm text-gray-400 hover:text-white transition-colors">
              {t("footer.accessibility")}
            </Link>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-6 flex justify-center space-x-4">
          {socialLinks.map((social, index) => (
            social.href && (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-gray-400 ${social.color} transition-colors`}
                aria-label={social.name}
              >
                {social.icon}
              </a>
            )
          ))}
        </div>
      </div>
    </footer>
  )
}
