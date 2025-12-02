import mongoose, { type Document, Schema } from "mongoose"

export interface IParkSettings extends Document {
  general: {
    parkName: string
    description: string
    address: string
    phone: string
    email: string
    website: string
    logo?: string
  }
  // hours: {
  //   monday: { open: string; close: string; closed: boolean }
  //   tuesday: { open: string; close: string; closed: boolean }
  //   wednesday: { open: string; close: string; closed: boolean }
  //   thursday: { open: string; close: string; closed: boolean }
  //   friday: { open: string; close: string; closed: boolean }
  //   saturday: { open: string; close: string; closed: boolean }
  //   sunday: { open: string; close: string; closed: boolean }
  // }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
    canonicalUrl: string
    ogTitle: string
    ogDescription: string
    ogImage: string
    twitterTitle: string
    twitterDescription: string
    twitterImage: string
  }
  social: {
    facebook: string
    instagram: string
    twitter: string
    youtube: string
    tiktok: string
  }
  // features: {
  //   multiLanguage: boolean
  //   darkMode: boolean
  //   cookieBanner: boolean
  //   analytics: boolean
  //   booking: boolean
  // }
  // notifications: {
  //   emailNotifications: boolean
  //   smsNotifications: boolean
  //   pushNotifications: boolean
  // }
  createdAt: Date
  updatedAt: Date
}

const ParkSettingsSchema = new Schema<IParkSettings>(
  {
    general: {
      parkName: { type: String, default: "Luna Amusement Park" },
      description: { type: String, default: "Experience the magic at Luna Park - where fun never ends!" },
      address: { type: String, default: "123 Fun Street, Entertainment City, EC 12345" },
      phone: { type: String, default: "(555) 123-PARK" },
      email: { type: String, default: "info@lunapark.com" },
      website: { type: String, default: "https://lunapark.com" },
      logo: { type: String, default: "" }
    },
    // hours: {
    //   monday: { open: { type: String, default: "10:00" }, close: { type: String, default: "18:00" }, closed: { type: Boolean, default: false } },
    //   tuesday: { open: { type: String, default: "10:00" }, close: { type: String, default: "18:00" }, closed: { type: Boolean, default: false } },
    //   wednesday: { open: { type: String, default: "10:00" }, close: { type: String, default: "18:00" }, closed: { type: Boolean, default: false } },
    //   thursday: { open: { type: String, default: "10:00" }, close: { type: String, default: "18:00" }, closed: { type: Boolean, default: false } },
    //   friday: { open: { type: String, default: "10:00" }, close: { type: String, default: "22:00" }, closed: { type: Boolean, default: false } },
    //   saturday: { open: { type: String, default: "09:00" }, close: { type: String, default: "23:00" }, closed: { type: Boolean, default: false } },
    //   sunday: { open: { type: String, default: "09:00" }, close: { type: String, default: "20:00" }, closed: { type: Boolean, default: false } }
    // },
    seo: {
      metaTitle: { type: String, default: "Luna Amusement Park - Fun for the Whole Family" },
      metaDescription: { type: String, default: "Visit Luna Amusement Park for thrilling rides, family fun, and unforgettable memories. Open daily with rides for all ages." },
      keywords: { type: [String], default: ["amusement park", "family fun", "rides", "entertainment", "theme park"] },
      canonicalUrl: { type: String, default: "https://lunapark.com" },
      ogTitle: { type: String, default: "Luna Amusement Park - Where Magic Happens" },
      ogDescription: { type: String, default: "Experience the ultimate family fun at Luna Park with exciting rides and attractions for all ages." },
      ogImage: { type: String, default: "https://lunapark.com/og-image.jpg" },
      twitterTitle: { type: String, default: "Luna Amusement Park" },
      twitterDescription: { type: String, default: "Come and experience the magic at Luna Park!" },
      twitterImage: { type: String, default: "https://lunapark.com/twitter-image.jpg" }
    },
    social: {
      facebook: { type: String, default: "https://facebook.com/lunapark" },
      instagram: { type: String, default: "https://instagram.com/lunapark" },
      twitter: { type: String, default: "https://twitter.com/lunapark" },
      youtube: { type: String, default: "https://youtube.com/lunapark" },
      tiktok: { type: String, default: "https://tiktok.com/@lunapark" }
    },
    // features: {
    //   multiLanguage: { type: Boolean, default: true },
    //   darkMode: { type: Boolean, default: false },
    //   cookieBanner: { type: Boolean, default: true },
    //   analytics: { type: Boolean, default: true },
    //   booking: { type: Boolean, default: true }
    // },
    // notifications: {
    //   emailNotifications: { type: Boolean, default: true },
    //   smsNotifications: { type: Boolean, default: false },
    //   pushNotifications: { type: Boolean, default: true }
    // }
  },
  {
    timestamps: true,
  }
)

// Index for singleton pattern (only one settings document should exist)
ParkSettingsSchema.index({ _id: 1 }, { unique: true })

export default mongoose.models.ParkSettings || mongoose.model<IParkSettings>("ParkSettings", ParkSettingsSchema)
