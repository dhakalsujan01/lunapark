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

const footerSections = [
  {
    title: "Park Info",
    icon: <Crown className="h-5 w-5" />,
    links: [
      { name: "About Luna Park", href: "/about" },
      { name: "Park Map", href: "/map" },
      { name: "Operating Hours", href: "/hours" },
      { name: "Directions", href: "/directions" },
      { name: "Accessibility", href: "/accessibility" }
    ]
  },
  {
    title: "Attractions",
    icon: <Star className="h-5 w-5" />,
    links: [
      { name: "All Rides", href: "/attractions" },
      { name: "Thrill Rides", href: "/attractions?category=thrill" },
      { name: "Family Rides", href: "/attractions?category=family" },
      { name: "Water Rides", href: "/attractions?category=water" },
      { name: "Shows & Events", href: "/shows" }
    ]
  },
  {
    title: "Tickets & Passes",
    icon: <Ticket className="h-5 w-5" />,
    links: [
      { name: "Day Passes", href: "/tickets" },
      { name: "Season Passes", href: "/tickets?type=season" },
      { name: "Group Rates", href: "/tickets?type=group" },
      { name: "VIP Experiences", href: "/tickets?type=vip" },
      { name: "Gift Cards", href: "/gift-cards" }
    ]
  }
]

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com/lunapark",
    icon: <Facebook className="h-5 w-5" />,
    color: "hover:text-blue-800", // Deep Thunder Blue
    followers: "125K"
  },
  {
    name: "Instagram", 
    href: "https://instagram.com/lunapark",
    icon: <Instagram className="h-5 w-5" />,
    color: "hover:text-pink-600",
    followers: "89K"
  },
  {
    name: "Twitter",
    href: "https://twitter.com/lunapark",
    icon: <Twitter className="h-5 w-5" />,
    color: "hover:text-sky-500",
    followers: "67K"
  },
  {
    name: "YouTube",
    href: "https://youtube.com/lunapark",
    icon: <Youtube className="h-5 w-5" />,
    color: "hover:text-red-600", // Lightning Red
    followers: "45K"
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/lunapark",
    icon: <Linkedin className="h-5 w-5" />,
    color: "hover:text-blue-800", // Deep Thunder Blue
    followers: "12K"
  }
]

const awards = [
  "Best Theme Park 2024",
  "Family Favorite Award",
  "Safety Excellence Award",
  "Environmental Leadership"
]

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
      
      {/* Main Footer Content */}
      <div className="relative z-10">
        {/* Newsletter Section */}
    
        {/* Links Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Link href="/" className="flex items-center space-x-3 mb-6 group">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Crown className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Luna Park
                    </h3>
                    <p className="text-sm text-gray-400 -mt-1">Adventure Awaits</p>
                  </div>
                </Link>
                
                <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                  Creating magical memories and unforgettable experiences for families and thrill-seekers of all ages since 1995.
                </p>
                
                {/* Contact Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    <span>123 Entertainment Blvd, Adventure City</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="h-4 w-4 text-green-400" />
                    <span>(555) 123-LUNA</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="h-4 w-4 text-purple-400" />
                    <span>info@lunapark.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="h-4 w-4 text-orange-400" />
                    <span>Daily 9 AM - 11 PM</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="lg:col-span-1"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="text-blue-400">{section.icon}</div>
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                </div>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                      >
                        <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Social Media & Bottom Section */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Social Media */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <span className="text-gray-300 text-sm font-medium">Follow Us:</span>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-300 transition-all duration-300 hover:border-white/40 hover:bg-white/10 group ${social.color}`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={`${social.name} - ${social.followers} followers`}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Special Badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-sm text-gray-300">
                  Made with love for our guests
                </span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 bg-black/20">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
              <div className="flex flex-wrap items-center gap-4">
                <span>© 2024 Luna Amusement Park. All rights reserved.</span>
                <div className="flex gap-4">
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                  <Link href="/cookies" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-600/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Secure & Safe
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
