"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  QrCode,
  Info,
  Calendar,
  User,
  Ticket
} from "lucide-react"

interface TicketValidationResult {
  success: boolean
  ticket?: {
    id: string
    type: string
    user: {
      name: string
      email: string
    }
    item: {
      name: string
    }
    status: string
    usageRemaining: number
    validUntil: string
  }
  message?: string
  error?: string
}

export function TicketValidator() {
  const [ticketCode, setTicketCode] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [result, setResult] = useState<TicketValidationResult | null>(null)

  const handleValidation = async () => {
    if (!ticketCode.trim()) return

    setIsValidating(true)
    setResult(null)

    try {
      const response = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrCode: ticketCode.trim(),
          location: "Online Validation"
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          ticket: data.ticket,
          message: data.message
        })
      } else {
        setResult({
          success: false,
          error: data.error || "Validation failed"
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: "Network error. Please try again."
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleReset = () => {
    setTicketCode("")
    setResult(null)
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <QrCode className="h-8 w-8 text-blue-600" />
        </div>
        
        <CardTitle className="text-2xl font-bold text-gray-900">
          Ticket Validation
        </CardTitle>
        
        <p className="text-gray-600">
          Enter your ticket code to check validity and remaining uses
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {!result && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                placeholder="Enter ticket code or scan QR code"
                className="pl-10 py-3 text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleValidation()}
              />
            </div>
            
            <Button 
              onClick={handleValidation}
              disabled={isValidating || !ticketCode.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Validate Ticket
                </>
              )}
            </Button>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {result.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Valid Ticket</h3>
                    <p className="text-sm text-green-600">{result.message}</p>
                  </div>
                </div>

                {result.ticket && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{result.ticket.user.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{result.ticket.item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Valid until {new Date(result.ticket.validUntil).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${
                          result.ticket.status === 'valid' ? 'bg-green-100 text-green-800' :
                          result.ticket.status === 'used' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.ticket.status.charAt(0).toUpperCase() + result.ticket.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    {result.ticket.usageRemaining > 0 && (
                      <div className="bg-blue-50 rounded p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Uses remaining:</strong> {result.ticket.usageRemaining}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-800">Invalid Ticket</h3>
                    <p className="text-sm text-red-600">{result.error}</p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              Check Another Ticket
            </Button>
          </div>
        )}

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">For Staff Use:</p>
              <p>This feature is for validating customer tickets at park entrances and attraction points. All validations are logged for security.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
