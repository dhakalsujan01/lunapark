"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChangePasswordForm } from "@/components/change-password-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, User, Shield, Bell } from "lucide-react"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const t = useTranslations('settings')

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('mustBeLoggedIn')}
            </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{t('accountInfo')}</span>
              </CardTitle>
              <CardDescription>
                {t('accountInfoDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">{t('name')}</label>
                <p className="text-sm text-gray-900">{session.user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t('email')}</label>
                <p className="text-sm text-gray-900">{session.user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t('role')}</label>
                <p className="text-sm text-gray-900 capitalize">{(session.user as any)?.role}</p>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>{t('security')}</span>
              </CardTitle>
              <CardDescription>
                {t('securityDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>

          {/* Future Settings Cards */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>{t('notifications')}</span>
              </CardTitle>
              <CardDescription>
                {t('notificationsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('notificationsComingSoon')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
