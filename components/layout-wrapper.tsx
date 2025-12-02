"use client"

import { Navigation } from "@/components/navigation"
import { DynamicFooter } from "@/components/dynamic-footer"
import { CookieBanner } from "@/components/cookie-banner"
import { usePathname } from "next/navigation"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  
  // Check if current path is admin or auth related
  const isAdminPath = pathname?.startsWith('/admin') || pathname?.startsWith('/auth')
  
  return (
    <>
      {!isAdminPath && <Navigation />}
      <main className="min-h-screen">
        {children}
      </main>
      {!isAdminPath && <DynamicFooter />}
      {!isAdminPath && <CookieBanner />}
    </>
  )
}





