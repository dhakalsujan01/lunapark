"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Ticket, ShoppingCart, TrendingUp, Calendar, Target } from "lucide-react"
import { formatCurrencySimple } from "@/lib/currency-utils"

interface Stats {
  totalRevenue: number
  totalUsers: number
  totalTickets: number
  totalOrders: number
  activeTickets: number
  usedTickets: number
  monthlyRevenue: number
  weeklyRevenue: number
  dailyRevenue: number
  totalRides: number
  publishedRides: number
  averageOrderValue: number
  conversionRate: string
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalUsers: 0,
    totalTickets: 0,
    totalOrders: 0,
    activeTickets: 0,
    usedTickets: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    dailyRevenue: 0,
    totalRides: 0,
    publishedRides: 0,
    averageOrderValue: 0,
    conversionRate: "0",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/analytics/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Revenue",
      value: loading ? "..." : formatCurrencySimple(stats.totalRevenue),
      change: loading ? "" : `+${formatCurrencySimple(stats.monthlyRevenue)} this month`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Active Users",
      value: loading ? "..." : stats.totalUsers.toLocaleString(),
      change: loading ? "" : `${stats.conversionRate}% conversion rate`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Tickets Sold",
      value: loading ? "..." : stats.totalTickets.toLocaleString(),
      change: loading ? "" : `${stats.activeTickets} active, ${stats.usedTickets} used`,
      icon: Ticket,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Total Orders",
      value: loading ? "..." : stats.totalOrders.toLocaleString(),
      change: loading ? "" : `${formatCurrencySimple(stats.averageOrderValue)} avg order value`,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Weekly Revenue",
      value: loading ? "..." : formatCurrencySimple(stats.weeklyRevenue),
      change: loading ? "" : "This week",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Daily Revenue",
      value: loading ? "..." : formatCurrencySimple(stats.dailyRevenue),
      change: loading ? "" : "Today",
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      title: "Published Rides",
      value: loading ? "..." : `${stats.publishedRides}/${stats.totalRides}`,
      change: loading ? "" : "Active attractions",
      icon: Target,
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            {stat.change && <p className="text-xs text-muted-foreground">{stat.change}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
