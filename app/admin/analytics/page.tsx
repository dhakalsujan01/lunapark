"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Users, DollarSign, TrendingUp, Download, Calendar } from "lucide-react"
import AnalyticsCharts from "@/components/admin/analytics-charts"
import { formatCurrency } from "@/lib/currency-utils"

interface AnalyticsData {
  overview: {
    totalRides: number
    totalPackages: number
    totalUsers: number
    totalOrders: number
    totalTickets: number
    totalRevenue: number
  }
  charts: {
    revenue: Array<{
      _id: string
      revenue: number
      orders: number
    }>
    ticketStatus: Array<{
      _id: string
      count: number
    }>
    popularItems: Array<{
      _id: {
        item: string
        type: string
        name: string
      }
      totalSold: number
      revenue: number
    }>
  }
  recentOrders: Array<{
    _id: string
    totalAmount: number
    status: string
    createdAt: string
    user: {
      name: string
      email: string
    }
  }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  async function fetchAnalytics() {
    try {
      const response = await fetch(`/api/admin/analytics?period=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrencyValue = (amount: number) => {
    return formatCurrency(amount * 100) // Convert to cents for proper formatting
  }



  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  if (!analytics) {
    return <div className="text-center py-8">Failed to load analytics data</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyValue(analytics.overview.totalRevenue || 0)}</div>
            <p className="text-xs text-gray-500">Total revenue from all orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics.overview.totalOrders || 0).toLocaleString()}</div>
            <p className="text-xs text-gray-500">Paid orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics.overview.totalUsers || 0).toLocaleString()}</div>
            <p className="text-xs text-gray-500">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics.overview.totalRides || 0).toLocaleString()}</div>
            <p className="text-xs text-gray-500">Published rides</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(analytics.charts.revenue || []).map((day) => (
                <div key={day._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium">{day._id}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrencyValue(day.revenue)}</div>
                    <div className="text-xs text-gray-500">{day.orders} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(analytics.charts.ticketStatus || []).map((status) => (
                <div key={status._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium">{status._id}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{status.count}</div>
                    <div className="text-xs text-gray-500">tickets</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Items */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(analytics.charts.popularItems || []).map((item, index) => (
              <div key={`${item._id.item}-${item._id.type}`} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{item._id.name}</div>
                    <div className="text-sm text-gray-500">{item._id.type} • {item.totalSold} sold</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrencyValue(item.revenue)}</div>
                  <div className="text-sm text-gray-500">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(analytics.recentOrders || []).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {formatCurrencyValue(order.totalAmount / 100)}
                  </div>
                  <div>
                    <div className="font-medium">{order.user?.name || 'Unknown User'}</div>
                    <div className="text-sm text-gray-500">{order.user?.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrencyValue(order.totalAmount)}</div>
                  <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Charts */}
      <AnalyticsCharts />
    </div>
  )
}
