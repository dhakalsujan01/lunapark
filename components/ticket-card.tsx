"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { Calendar, Clock, MapPin, Ticket, Eye, EyeOff } from "lucide-react"

interface TicketCardProps {
  ticket: {
    _id: string
    type: "ride" | "package"
    status: "valid" | "used" | "expired" | "cancelled"
    validUntil: string
    usedAt?: string
    currentUsage: number
    maxUsage: number
    qrCodeData?: string
    item: {
      title?: string
      name?: string
      image?: string
    }
    order: {
      totalAmount: number
      createdAt: string
    }
  }
}

export function TicketCard({ ticket }: TicketCardProps) {
  const [showQR, setShowQR] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800"
      case "used":
        return "bg-gray-100 text-gray-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const itemName = ticket.item.title || ticket.item.name || "Unknown Item"

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              {itemName}
            </CardTitle>
            <CardDescription className="capitalize">{ticket.type} ticket</CardDescription>
          </div>
          <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">Valid Until</p>
              <p className="text-gray-600">{formatDate(ticket.validUntil)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">Usage</p>
              <p className="text-gray-600">
                {ticket.currentUsage} / {ticket.maxUsage}
              </p>
            </div>
          </div>
        </div>

        {ticket.usedAt && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">Used At</p>
              <p className="text-gray-600">{formatDate(ticket.usedAt)}</p>
            </div>
          </div>
        )}

        {ticket.status === "valid" && ticket.qrCodeData && (
          <div className="space-y-2">
            <Button onClick={() => setShowQR(!showQR)} variant="outline" size="sm" className="w-full">
              {showQR ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide QR Code
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show QR Code
                </>
              )}
            </Button>

            {showQR && (
              <div className="flex justify-center p-4 bg-white rounded-lg border">
                <QRCodeSVG value={ticket.qrCodeData} size={200} level="M" includeMargin />
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t text-xs text-gray-500">
          <p>Purchased: {formatDate(ticket.order.createdAt)}</p>
          <p>Order Total: €{(ticket.order.totalAmount / 100).toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
