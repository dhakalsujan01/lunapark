"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Ticket,
  Package,
  Users,
  ShoppingCart,
  Settings,
  BarChart3,
  FerrisWheel as Ferris,
  FileImage,
  Shield,
  Mail,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Rides", href: "/admin/rides", icon: Ferris },
  { name: "Packages", href: "/admin/packages", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Tickets", href: "/admin/tickets", icon: Ticket },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Contacts", href: "/admin/contact", icon: Mail },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  // { name: "Files", href: "/admin/files", icon: FileImage },
  { name: "Logs", href: "/admin/logs", icon: Shield },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:block">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">Luna Admin</h1>
      </div>
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-orange-50 text-orange-600 border-r-2 border-orange-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
