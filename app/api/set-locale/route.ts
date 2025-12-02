import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { locales, type Locale } from "@/lib/i18n"

export async function POST(request: NextRequest) {
  try {
    const { locale } = await request.json()

    if (!locale || !locales.includes(locale as Locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 })
    }

    const cookieStore = await cookies()
    cookieStore.set("locale", locale, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting locale:", error)
    return NextResponse.json({ error: "Failed to set locale" }, { status: 500 })
  }
}
