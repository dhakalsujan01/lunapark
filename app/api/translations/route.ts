import { NextResponse } from "next/server"
import { getTranslations, getLocale } from "@/lib/i18n"

export async function GET() {
  try {
    const locale = await getLocale()
    const translations = await getTranslations(locale)

    return NextResponse.json(translations)
  } catch (error) {
    console.error("Error fetching translations:", error)
    return NextResponse.json({ error: "Failed to fetch translations" }, { status: 500 })
  }
}
