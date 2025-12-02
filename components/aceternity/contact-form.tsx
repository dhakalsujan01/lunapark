"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils-aceternity"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  User,
  MessageSquare
} from "lucide-react"
import { useTranslations } from "next-intl"

export const ContactForm = ({ className }: { className?: string }) => {
  const t = useTranslations('contact.form')
  const tVisit = useTranslations('contact.visitUs')
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setSubmitStatus("success")
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          inquiryType: "general"
        })
      } else {
        setSubmitStatus("error")
      }
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitStatus("idle"), 5000)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone",
      details: ["(555) 123-LUNA", "(555) 123-5862"],
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      details: ["info@lunapark.com", "groups@lunapark.com"],
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Address",
      details: ["123 Entertainment Blvd", "Adventure City, AC 12345"],
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Hours",
      details: ["Mon-Fri: 9 AM - 6 PM", "Weekends: 8 AM - 11 PM"],
      gradient: "from-orange-500 to-red-500"
    }
  ]

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, label: "Facebook", color: "text-blue-600" },
    { icon: <Twitter className="h-5 w-5" />, label: "Twitter", color: "text-sky-500" },
    { icon: <Instagram className="h-5 w-5" />, label: "Instagram", color: "text-pink-600" },
    { icon: <Youtube className="h-5 w-5" />, label: "YouTube", color: "text-red-600" }
  ]

  return (
    <div className={cn("bg-white", className)}>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 min-h-[calc(100vh-200px)]">
          {/* Left Side - Map */}
          <div className="relative bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full h-full min-h-[400px] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3048.4419887845694!2d-73.97918652404284!3d40.574721871392844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c244252d4ad011%3A0x1e7b9f9f9b3e9f9f!2sLuna%20Park%20in%20Coney%20Island!5e0!3m2!1sen!2sus!4v1703123456789!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Luna Park Coney Island Location"
                className=""
              ></iframe>
            </div>
            
            {/* Map Overlay Info */}
            <div className="absolute bottom-8 left-8 bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-sm">
              <h3 className="font-medium text-black mb-2">{tVisit('title')}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {tVisit('address')}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Phone size={12} />
                  <span>{tVisit('phone')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="bg-white p-8 lg:p-12 flex items-center">
            <div className="w-full max-w-lg mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-light text-black mb-3 tracking-wide">{t('title')}</h2>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {t('description')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Name Field */}
                  <div className="group">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('fields.fullName')} *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors duration-200" size={18} />
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-amber-500 focus:outline-none transition-all duration-200 bg-white text-black placeholder-gray-400"
                        placeholder={t('placeholders.fullName')}
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="group">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('fields.emailAddress')} *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors duration-200" size={18} />
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-amber-500 focus:outline-none transition-all duration-200 bg-white text-black placeholder-gray-400"
                        placeholder={t('placeholders.emailAddress')}
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="group">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('fields.phoneNumber')}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors duration-200" size={18} />
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-amber-500 focus:outline-none transition-all duration-200 bg-white text-black placeholder-gray-400"
                        placeholder={t('placeholders.phoneNumber')}
                      />
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div className="group">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('fields.subject')} *
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors duration-200" size={18} />
                      <Input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-amber-500 focus:outline-none transition-all duration-200 bg-white text-black placeholder-gray-400"
                        placeholder={t('placeholders.subject')}
                      />
                    </div>
                  </div>

                  {/* Inquiry Type Field */}
                  <div className="group">
                    <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('fields.inquiryType')}
                    </label>
                    <div className="relative">
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-amber-500 focus:outline-none transition-all duration-200 bg-white text-black"
                      >
                        <option value="general">{t('inquiryTypes.general')}</option>
                        <option value="groups">{t('inquiryTypes.groups')}</option>
                        <option value="events">{t('inquiryTypes.events')}</option>
                        <option value="support">{t('inquiryTypes.support')}</option>
                        <option value="media">{t('inquiryTypes.media')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="group">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('fields.message')} *
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 text-gray-400 group-focus-within:text-black transition-colors duration-200" size={18} />
                      <Textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-amber-500 focus:outline-none transition-all duration-200 bg-white text-black placeholder-gray-400 resize-none"
                        placeholder={t('placeholders.message')}
                      />
                    </div>
                  </div>
                </div>

                {/* Status Messages */}
                {submitStatus !== "idle" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg",
                      submitStatus === "success" ? "bg-green-100 text-green-800" : 
                      "bg-red-100 text-red-800"
                    )}
                  >
                    {submitStatus === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    {submitStatus === "success" ? t('messages.success') : t('messages.error')}
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 text-white py-3 px-6 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium tracking-wide"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>{t('button')}</span>
                    </>
                  )}
                </Button>
              </form>

              {/* Contact Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail size={16} className="text-gray-400" />
                    <span>{tVisit('email')}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span>{tVisit('phone')}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{tVisit('address')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
