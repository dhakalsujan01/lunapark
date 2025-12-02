import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ParkSettings from "@/models/Settings"

// GET /api/settings - Get public park settings (no auth required)
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    let settings = await ParkSettings.findOne()
    
    // If no settings exist, return default settings
    if (!settings) {
      settings = {
        general: {
          parkName: "Luna Amusement Park",
          description: "Experience the magic at Luna Park - where fun never ends!",
          address: "123 Fun Street, Entertainment City, EC 12345",
          phone: "(555) 123-PARK",
          email: "info@lunapark.com",
          website: "https://lunapark.com",
          logo: ""
        },
        seo: {
          metaTitle: "Luna Amusement Park - Fun for the Whole Family",
          metaDescription: "Visit Luna Amusement Park for thrilling rides, family fun, and unforgettable memories. Open daily with rides for all ages.",
          keywords: ["amusement park", "family fun", "rides", "entertainment", "theme park"],
          canonicalUrl: "https://lunapark.com",
          ogTitle: "Luna Amusement Park - Where Magic Happens",
          ogDescription: "Experience the ultimate family fun at Luna Park with exciting rides and attractions for all ages.",
          ogImage: "https://lunapark.com/og-image.jpg",
          twitterTitle: "Luna Amusement Park",
          twitterDescription: "Come and experience the magic at Luna Park!",
          twitterImage: "https://lunapark.com/twitter-image.jpg"
        },
        social: {
          facebook: "https://facebook.com/lunapark",
          instagram: "https://instagram.com/lunapark",
          twitter: "https://twitter.com/lunapark",
          youtube: "https://youtube.com/lunapark",
          tiktok: "https://tiktok.com/@lunapark"
        }
      }
    }

    return NextResponse.json({ 
      settings,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error fetching public settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}
