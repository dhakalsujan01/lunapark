"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LanguageSwitcher } from "@/components/language-switcher"
import { DynamicLogo } from "@/components/dynamic-logo"
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar"
import {
  User,
  Settings,
  LogOut,
  Home,
  MapPin,
  ImageIcon,
  Info,
  Phone,
  Ticket,
  Key,
} from "lucide-react"

// This will be replaced with translated items inside the component
const baseNavigationItems = [
  {
    key: "home",
    link: "/",
  },
  {
    key: "attractions",
    link: "/attractions",
  },
  {
    key: "gallery",
    link: "/gallery",
  },
  {
    key: "about",
    link: "/about",
  },
  {
    key: "contact",
    link: "/contact",
  }
]

export function Navigation() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const params = useParams()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Get current locale from params with better fallback
  const currentLocale = (params?.locale as string) || 'en'
  
  // Skip rendering for static files
  if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot)$/)) {
    return null
  }
  
  // Get translations for profile popup
  const tProfile = useTranslations('navigation.profile')
  
  // Helper function to create locale-aware links
  const createLocalizedLink = (path: string) => {
    if (path === "/") return `/${currentLocale}`
    return `/${currentLocale}${path}`
  }

  // Fallback translations
  const navTranslations = {
    en: {
      home: "Home",
      attractions: "Attractions & Tickets", 
      gallery: "Gallery",
      about: "About",
      contact: "Contact"
    },
    ru: {
      home: "Главная",
      attractions: "Аттракционы и билеты",
      gallery: "Галерея", 
      about: "О нас",
      contact: "Контакты"
    }
  }

  // Use fallback translations for now
  const t = (key: string) => navTranslations[currentLocale as 'en' | 'ru']?.[key as keyof typeof navTranslations.en] || key

  // Create localized navigation items with translations
  const localizedNavigationItems = baseNavigationItems.map(item => ({
    name: t(item.key),
    link: createLocalizedLink(item.link)
  }))

  console.log('Navigation - currentLocale:', currentLocale, 'pathname:', pathname)

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          {/* Custom Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Luna Park Logo" 
              width={64} 
              height={64} 
              className="bg-transparent mix-blend-mode-multiply"
              style={{ 
                backgroundColor: 'transparent',
                filter: 'contrast(1.1) brightness(1.05)'
              }}
            />
          </Link>
          
          <NavItems items={localizedNavigationItems} />
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className="space-y-2">
                    {(session.user as any)?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center space-x-3">
                          <Settings className="h-4 w-4" />
                          <span>{tProfile('adminPanel')}</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem asChild>
                      <Link href={createLocalizedLink("/dashboard")} className="flex items-center space-x-3">
                        <User className="h-4 w-4" />
                        <span>{tProfile('myDashboard')}</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href={createLocalizedLink("/settings")} className="flex items-center space-x-3">
                        <Key className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => signOut()}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      {tProfile('signOut')}
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <NavbarButton variant="secondary" onClick={() => signIn(undefined, { callbackUrl: `/${currentLocale}` })}>
                  {tProfile('signIn')}
                </NavbarButton>
                <NavbarButton variant="primary" onClick={() => signIn(undefined, { callbackUrl: `/${currentLocale}/attractions` })}>
                  <Ticket className="h-4 w-4 mr-2" />
                  {tProfile('getTickets')}
                </NavbarButton>
              </div>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            {/* Custom Mobile Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Luna Park Logo" 
                width={56} 
                height={56} 
                className="bg-transparent mix-blend-mode-multiply"
                style={{ 
                  backgroundColor: 'transparent',
                  filter: 'contrast(1.1) brightness(1.05)'
                }}
              />
            </Link>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {localizedNavigationItems.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "relative text-neutral-600 dark:text-neutral-300 px-4 py-2 rounded-lg transition-colors",
                  isActive(item.link) && "bg-orange-50 text-orange-600"
                )}
              >
                <span className="block">{item.name}</span>
              </Link>
            ))}
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <LanguageSwitcher />
            </div>

            {session ? (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{session.user?.name}</p>
                    <p className="text-sm text-gray-500">{session.user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {(session.user as any)?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>{tProfile('adminPanel')}</span>
                    </Link>
                  )}
                  
                  <Link
                    href={createLocalizedLink("/dashboard")}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>{tProfile('myDashboard')}</span>
                  </Link>
                  
                  <Link
                    href={createLocalizedLink("/settings")}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Key className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  
                  <Button
                    variant="ghost"
                    onClick={() => {
                      signOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    {tProfile('signOut')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="space-y-3">
                  <NavbarButton variant="secondary" onClick={() => signIn(undefined, { callbackUrl: `/${currentLocale}` })} className="w-full justify-start">
                    {tProfile('signIn')}
                  </NavbarButton>
                  <NavbarButton variant="primary" onClick={() => signIn(undefined, { callbackUrl: `/${currentLocale}/attractions` })} className="w-full">
                    <Ticket className="h-4 w-4 mr-2" />
                    {tProfile('getTickets')}
                  </NavbarButton>
                </div>
              </div>
            )}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  )
}