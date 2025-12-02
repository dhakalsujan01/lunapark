"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Eye, Calendar, Mail } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { formatCurrency } from "@/lib/currency-utils"

interface Order {
  _id: string
  items: Array<{
    type: string
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  customerName: string
  customerEmail: string
  paidAt: string
  tickets: Array<{
    _id: string
    type: string
    qrCode: string
    qrSignature: string
    validUntil: string
  }>
}

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const t = useTranslations('booking.success')
  
  const sessionId = searchParams.get("session_id")
  const orderId = searchParams.get("order_id")
  const currentLocale = params.locale as string || 'en'

  useEffect(() => {
    if (sessionId && orderId) {
      fetchOrderDetails()
    }
  }, [sessionId, orderId])

  async function fetchOrderDetails() {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/checkout/session/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      } else if (response.status === 404) {
        // Handle expired or missing session gracefully
        console.warn("Checkout session not found or expired")
        // Try to fetch order by orderId as fallback
        if (orderId) {
          try {
            const orderResponse = await fetch(`/api/user/orders/${orderId}`)
            if (orderResponse.ok) {
              const orderData = await orderResponse.json()
              setOrder(orderData)
              return
            }
          } catch (fallbackError) {
            console.error("Fallback order fetch failed:", fallbackError)
          }
        }
      } else {
        // Handle other HTTP errors
        console.error(`Failed to fetch order details: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">{t('loading')}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Retrieving your order details...
          </p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">{t('orderNotFound')}</h1>
            <p className="text-muted-foreground mb-6">
              {t('orderNotFoundMessage')}
            </p>
            <Button asChild>
              <Link href={`/${currentLocale}/dashboard`}>{t('goToDashboard')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Success Header */}
          <Card className="text-center">
            <CardContent className="py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-green-600 mb-2">{t('paymentSuccessful')}</h1>
              <p className="text-lg text-muted-foreground">
                {t('thankYouMessage')}
              </p>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t('orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>{t('orderId')}</strong> #{order._id.slice(-8)}
                </div>
                <div>
                  <strong>{t('date')}</strong> {new Date(order.paidAt).toLocaleDateString()}
                </div>
                <div>
                  <strong>{t('customer')}</strong> {order.customerName}
                </div>
                <div>
                  <strong>{t('email')}</strong> {order.customerEmail}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">{t('itemsPurchased')}</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatCurrency((item.price || 0) * (item.quantity || 0))}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                  <span>{t('total')}</span>
                  <span>{formatCurrency(order.totalAmount || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('yourTickets', { count: order.tickets.length })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900">{t('ticketsSentToEmail')}</h4>
                    <p className="text-sm text-blue-700">
                      {t('ticketsSentMessage', { email: order.customerEmail })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">{t('ticketDetails')}</h4>
                {order.tickets.map((ticket, index) => (
                  <div key={ticket._id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{t('ticketNumber', { number: index + 1 })}</div>
                        <div className="text-sm text-muted-foreground">
                          {t('type')} {ticket.type} | {t('validUntil')} {new Date(ticket.validUntil).toLocaleDateString()}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        {t('viewQR')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">{t('importantNotes')}</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• {t('note1')}</li>
                  <li>• {t('note2')}</li>
                  <li>• {t('note3')}</li>
                  <li>• {t('note4')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href={`/${currentLocale}/dashboard`}>
                <Calendar className="h-4 w-4 mr-2" />
                {t('viewAllTickets')}
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href={`/${currentLocale}/attractions`}>
                <Eye className="h-4 w-4 mr-2" />
                {t('exploreAttractions')}
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              {t('printReceipt')}
            </Button>
          </div>

          {/* Contact Information */}
          <Card>
            <CardContent className="text-center py-6">
              <h3 className="font-semibold mb-2">{t('needHelp')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('helpMessage')}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${currentLocale}/contact`}>{t('contactSupport')}</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${currentLocale}/safety`}>{t('safetyGuidelines')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}
