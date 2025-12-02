"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, User, Calendar, Ticket } from "lucide-react"

interface ValidationResultProps {
  result: {
    success: boolean
    message: string
    ticket?: {
      id: string
      type: string
      item: {
        _id: string
        name: string
        title: string
      }
      user: { name: string; email: string }
      validUntil: string
      status: string
      currentUsage: number
      maxUsage: number
      usedAt?: string
    }
  }
}

export function ValidationResult({ result }: ValidationResultProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = () => {
    if (result.success) {
      return <CheckCircle className="h-8 w-8 text-green-500" />
    } else if (result.message?.includes("expired") || result.message?.includes("used")) {
      return <AlertTriangle className="h-8 w-8 text-yellow-500" />
    } else {
      return <XCircle className="h-8 w-8 text-red-500" />
    }
  }

  const getStatusColor = () => {
    if (result.success) return "bg-green-100 text-green-800"
    if (result.message?.includes("expired") || result.message?.includes("used")) {
      return "bg-yellow-100 text-yellow-800"
    }
    return "bg-red-100 text-red-800"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">{getStatusIcon()}</div>
        <CardTitle className="text-center">{result.success ? "Ticket Valid ✓" : "Validation Failed"}</CardTitle>
        <CardDescription className="text-center">{result.message}</CardDescription>
      </CardHeader>

      {result.ticket && (
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">{result.ticket.user.name}</p>
                <p className="text-sm text-gray-600">{result.ticket.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">
                  {result.ticket.item?.name || result.ticket.item?.title || "Unknown Item"}
                </p>
                <p className="text-sm text-gray-600">
                  {result.ticket.type === 'ride' ? 'Ride Ticket' : 'Package Ticket'} - ID: {result.ticket.id.slice(-8)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">Valid Until</p>
                <p className="text-sm text-gray-600">{formatDate(result.ticket.validUntil)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Usage:</span>
              <Badge variant="outline">
                {result.ticket.currentUsage} / {result.ticket.maxUsage}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge className={getStatusColor()}>{result.ticket.status}</Badge>
            </div>

            {result.ticket.usedAt && (
              <div className="text-sm text-gray-600">
                <p className="font-medium">Last Used:</p>
                <p>{formatDate(result.ticket.usedAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
