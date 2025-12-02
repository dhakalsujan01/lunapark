"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { formatCurrency } from "@/lib/currency-utils"

// Sample data - in real app this would come from props
const hourlyData = [
  { hour: '9AM', visitors: 45, revenue: 1200 },
  { hour: '10AM', visitors: 78, revenue: 2100 },
  { hour: '11AM', visitors: 120, revenue: 3200 },
  { hour: '12PM', visitors: 190, revenue: 5100 },
  { hour: '1PM', visitors: 230, revenue: 6200 },
  { hour: '2PM', visitors: 280, revenue: 7500 },
  { hour: '3PM', visitors: 320, revenue: 8600 },
  { hour: '4PM', visitors: 290, revenue: 7800 },
  { hour: '5PM', visitors: 240, revenue: 6400 },
  { hour: '6PM', visitors: 180, revenue: 4800 },
  { hour: '7PM', visitors: 120, revenue: 3200 },
  { hour: '8PM', visitors: 80, revenue: 2100 },
]

const ageGroupData = [
  { name: 'Under 18', value: 25, color: '#8884d8' },
  { name: '18-30', value: 35, color: '#82ca9d' },
  { name: '31-45', value: 30, color: '#ffc658' },
  { name: '46-60', value: 8, color: '#ff7300' },
  { name: 'Over 60', value: 2, color: '#8dd1e1' },
]

const weeklyTrends = [
  { day: 'Mon', tickets: 120, revenue: 3200 },
  { day: 'Tue', tickets: 98, revenue: 2600 },
  { day: 'Wed', tickets: 86, revenue: 2300 },
  { day: 'Thu', tickets: 110, revenue: 2900 },
  { day: 'Fri', tickets: 180, revenue: 4800 },
  { day: 'Sat', tickets: 320, revenue: 8500 },
  { day: 'Sun', tickets: 290, revenue: 7700 },
]

export default function AnalyticsCharts() {
  const formatCurrencyValue = (value: number) => {
    return formatCurrency(value * 100) // Convert to cents for proper formatting
  }

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Hourly Visitors */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Visitors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="hour" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'visitors' ? `${value} visitors` : formatCurrencyValue(value),
                    name === 'visitors' ? 'Visitors' : 'Revenue'
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="visitors" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Age Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Visitor Age Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageGroupData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ageGroupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Percentage']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {ageGroupData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'tickets' ? `${value} tickets` : formatCurrencyValue(value),
                    name === 'tickets' ? 'Tickets' : 'Revenue'
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}