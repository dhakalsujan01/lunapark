"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from "@/lib/currency-utils"

interface RevenueChartProps {
  data: Array<{
    date: string
    revenue: number
    tickets: number
    visitors: number
  }>
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrencyValue = (value: number) => {
    return formatCurrency(value * 100) // Convert to cents for proper formatting
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            className="text-xs"
          />
          <YAxis 
            tickFormatter={formatCurrencyValue}
            className="text-xs"
          />
          <Tooltip 
            formatter={(value: any, name: string) => [
              name === 'revenue' ? formatCurrencyValue(value) : value.toLocaleString(),
              name === 'revenue' ? 'Revenue' : name === 'tickets' ? 'Tickets' : 'Visitors'
            ]}
            labelFormatter={(label) => `Date: ${formatDate(label)}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}