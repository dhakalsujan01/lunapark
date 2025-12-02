import type React from "react"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <main className="min-h-screen">
        {children}
      </main>
      <Toaster />
    </Providers>
  )
}
