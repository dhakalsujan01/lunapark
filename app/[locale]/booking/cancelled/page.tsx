"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ShoppingCart, ArrowLeft, Phone } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"

export default function BookingCancelledPage() {
  const params = useParams()
  const t = useTranslations('booking.cancelled')
  const currentLocale = params.locale as string || 'en'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Cancelled Header */}
          <Card className="text-center">
            <CardContent className="py-8">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-red-600 mb-2">{t('paymentCancelled')}</h1>
              <p className="text-lg text-muted-foreground">
                {t('cancelledMessage')}
              </p>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('whatHappened')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>{t('explanation')}</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>{t('reason1')}</li>
                  <li>{t('reason2')}</li>
                  <li>{t('reason3')}</li>
                  <li>{t('reason4')}</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">{t('dontWorry')}</h4>
                <p className="text-sm text-blue-700">
                  {t('noChargesMessage')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href={`/${currentLocale}/tickets`}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t('tryAgain')}
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href={`/${currentLocale}/attractions`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('browseAttractions')}
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href={`/${currentLocale}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToHome')}
              </Link>
            </Button>
          </div>

          {/* Support Information */}
          <Card>
            <CardContent className="text-center py-6">
              <h3 className="font-semibold mb-2">{t('needHelp')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('helpMessage')}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${currentLocale}/contact`}>
                  <Phone className="h-4 w-4 mr-2" />
                  {t('contactSupport')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
