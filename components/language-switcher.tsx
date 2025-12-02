"use client"

import { usePathname, useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
]

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  
  // Get current locale from params with better fallback
  const currentLocale = (params?.locale as string) || 'en'
  
  // Skip rendering for static files
  if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot)$/)) {
    return null
  }

  const handleLanguageChange = (newLocale: string) => {
    // Replace the current locale in the pathname
    const segments = pathname.split('/')
    segments[1] = newLocale // Replace the locale segment
    const newPath = segments.join('/')
    
    console.log('Current pathname:', pathname)
    console.log('Current locale:', currentLocale)
    console.log('New locale:', newLocale)
    console.log('Switching to:', newPath)
    router.push(newPath)
    router.refresh() // Force a refresh to update the page
  }

  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0]

  console.log('LanguageSwitcher - pathname:', pathname, 'currentLocale:', currentLocale)

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => console.log('Globe clicked!')}>
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{currentLanguage?.flag}</span>
            <span className="text-xs">{currentLocale}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[150px]">
          {languages.map((language) => (
            <DropdownMenuItem 
              key={language.code} 
              onClick={() => {
                console.log('Language item clicked:', language.code)
                handleLanguageChange(language.code)
              }} 
              className="gap-2 cursor-pointer"
              disabled={language.code === currentLocale}
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
              {language.code === currentLocale && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
