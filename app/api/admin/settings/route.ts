import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ParkSettings from "@/models/Settings"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/admin/settings - Get park settings
async function getSettings(req: NextRequest, context: any, { session }: any) {
  try {
    await connectDB()

    let settings = await ParkSettings.findOne()
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new ParkSettings()
      await settings.save()
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

// PUT /api/admin/settings - Update park settings
async function updateSettings(req: NextRequest, context: any, { session }: any) {
  try {
    await connectDB()

    const settingsData = await req.json()

    // Validate the settings data structure
    const requiredSections = ['general', 'seo', 'social']
    for (const section of requiredSections) {
      if (!settingsData[section]) {
        return NextResponse.json({ error: `Missing required section: ${section}` }, { status: 400 })
      }
    }

    const settings = await ParkSettings.findOneAndUpdate(
      {},
      settingsData,
      { upsert: true, new: true, runValidators: true }
    )

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

export const GET = withAuth(getSettings, "admin")
export const PUT = withAuth(updateSettings, "admin")