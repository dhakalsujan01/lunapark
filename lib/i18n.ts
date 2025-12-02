import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"
import { headers } from "next/headers"

// Can be imported from a shared config
export const locales = ['en', 'ru'] as const
export type Locale = typeof locales[number]

// Helper function to get current locale
export async function getLocale(): Promise<Locale> {
  const headersList = await headers()
  const locale = headersList.get('x-locale') || 'en'
  return locales.includes(locale as Locale) ? (locale as Locale) : 'en'
}

// Helper function to get translations for a specific locale
export async function getTranslations(locale: Locale) {
  try {
    const messages = (await import(`../locales/${locale}.json`)).default
    return messages
  } catch (error) {
    console.error(`Failed to load translations for locale ${locale}:`, error)
    // Fallback to English
    const messages = (await import(`../locales/en.json`)).default
    return messages
  }
}

export default getRequestConfig(async ({ locale }) => {
  console.log('i18n.ts - Received locale:', locale)
  
  // Fallback to 'en' if locale is undefined
  const validLocale = (locale as string) || 'en'
  
  // Validate that the locale is valid
  if (!locales.includes(validLocale)) {
    console.log('Invalid locale, using fallback:', validLocale, 'Valid locales:', locales)
    return {
      locale: 'en',
      messages: (await import(`../locales/en.json`)).default
    }
  }

  console.log('Loading messages for locale:', validLocale)
  return {
    locale: validLocale,
    messages: (await import(`../locales/${validLocale}.json`)).default
  }
})
