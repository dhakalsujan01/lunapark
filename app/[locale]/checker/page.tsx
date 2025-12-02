"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrScanner } from "@/components/qr-scanner"
import { QrCode, Scan, CheckCircle, XCircle, Clock, MapPin, User, Camera } from "lucide-react"

interface ScanResult {
  success: boolean
  message: string
  ticket?: {
    id: string
    type: string
    user: {
      name: string
      email: string
    }
    item: {
      title?: string
      name?: string
    }
    packageInfo?: {
      _id: string
      name: string
      price: number
    }
    status: string
    usageRemaining: number
    validUntil: string
  }
  error?: string
  details?: any
}

interface ScanHistory {
  id: string
  timestamp: string
  ticketId?: string
  userName?: string
  itemName?: string
  success: boolean
  message: string
  location?: string
}

export default function CheckerDashboard() {
  const { data: session, status } = useSession()
  const [isScanning, setIsScanning] = useState(false)
  const [manualCode, setManualCode] = useState("")
  const [simpleCode, setSimpleCode] = useState("")
  const [inputMode, setInputMode] = useState<"qr" | "simple">("qr")
  const [location, setLocation] = useState("")
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([])
  const [stats, setStats] = useState({
    todayScans: 0,
    successfulScans: 0,
    failedScans: 0,
  })
  
  // Get translations
  const t = useTranslations('checker')
  const tStats = useTranslations('checker.stats')
  const tScanner = useTranslations('checker.scanner')
  const tScanResult = useTranslations('checker.scanResult')
  const tHistory = useTranslations('checker.history')

  useEffect(() => {
    if (session) {
      fetchScanHistory()
      fetchStats()
    }
  }, [session])

  // Loading state
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">{t('loading')}</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('accessDenied')}</h1>
          <p className="text-gray-600 mb-4">{t('loginRequired')}</p>
          <a href="/auth/signin" className="text-blue-600 hover:underline">{t('signInHere')}</a>
        </div>
      </div>
    )
  }

  // Check if user has correct role
  if ((session?.user as any)?.role !== "admin" && (session?.user as any)?.role !== "checker") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('accessDenied')}</h1>
          <p className="text-gray-600 mb-4">{t('noPermission')}</p>
          <p className="text-sm text-gray-500">{t('adminCheckerOnly')}</p>
          <a href="/" className="text-blue-600 hover:underline">{t('returnHome')}</a>
        </div>
      </div>
    )
  }

  async function fetchScanHistory() {
    try {
      const response = await fetch("/api/checker/scan-history")
      if (response.ok) {
        const data = await response.json()
        setScanHistory(data.scans || [])
      }
    } catch (error) {
      console.error("Failed to fetch scan history:", error)
    }
  }

  async function fetchStats() {
    try {
      const response = await fetch("/api/checker/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  async function validateTicket(code: string, isSimpleCode = false) {
    try {
      const payload = isSimpleCode 
        ? { simpleCode: code, location }
        : { qrCode: code, location }
        
      const response = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      
      if (response.ok) {
        setScanResult({
          success: true,
          message: result.message,
          ticket: result.ticket,
        })
      } else {
        setScanResult({
          success: false,
          message: result.error,
          error: result.error,
          details: result.details,
        })
      }

      // Add to scan history
      const newScan: ScanHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ticketId: result.ticket?.id || "Unknown",
        userName: result.ticket?.user?.name || "Unknown",
        itemName: result.ticket?.item?.title || result.ticket?.item?.name || "Unknown",
        success: response.ok,
        message: response.ok ? result.message : result.error,
        location,
      }

      setScanHistory(prev => [newScan, ...prev.slice(0, 49)]) // Keep last 50 scans
      fetchStats() // Refresh stats

    } catch (error) {
      setScanResult({
        success: false,
        message: "Failed to validate ticket",
        error: "Network error",
      })
    }
  }

  function handleQRScan(qrCode: string) {
    validateTicket(qrCode, false)
    setIsScanning(false)
  }

  function handleManualValidation() {
    if (inputMode === "simple") {
      if (!simpleCode.trim()) return
      validateTicket(simpleCode.trim().toUpperCase(), true)
      setSimpleCode("")
    } else {
      if (!manualCode.trim()) return
      validateTicket(manualCode.trim(), false)
      setManualCode("")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tStats('todayScans')}</CardTitle>
            <Scan className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayScans}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tStats('successful')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successfulScans}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tStats('failed')}</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedScans}</div>
          </CardContent>
        </Card>
      </div>

      {/* Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{tScanner('title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">{tScanner('locationLabel')}</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={tScanner('locationPlaceholder')}
              />
            </div>

            {!isScanning ? (
              <div className="space-y-4">
                <Button 
                  onClick={() => setIsScanning(true)}
                  className="w-full"
                  size="lg"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  {tScanner('startCamera')}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">{tScanner('or')}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Button 
                      variant={inputMode === "qr" ? "default" : "outline"}
                      onClick={() => setInputMode("qr")}
                      size="sm"
                    >
                      {tScanner('qrCode')}
                    </Button>
                    <Button 
                      variant={inputMode === "simple" ? "default" : "outline"}
                      onClick={() => setInputMode("simple")}
                      size="sm"
                    >
                      {tScanner('simpleCode')}
                    </Button>
                  </div>

                  {inputMode === "simple" ? (
                    <div className="space-y-2">
                      <Label htmlFor="simple-code">{tScanner('simpleCodeLabel')}</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="simple-code"
                          value={simpleCode}
                          onChange={(e) => setSimpleCode(e.target.value)}
                          placeholder={tScanner('simpleCodePlaceholder')}
                          maxLength={9}
                          className="font-mono text-lg tracking-wider"
                        />
                        <Button onClick={handleManualValidation} disabled={!simpleCode.trim()}>
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tScanner('simpleCodeFormat')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="manual-code">{tScanner('manualQrLabel')}</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="manual-code"
                          value={manualCode}
                          onChange={(e) => setManualCode(e.target.value)}
                          placeholder={tScanner('manualQrPlaceholder')}
                        />
                        <Button onClick={handleManualValidation} disabled={!manualCode.trim()}>
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <QrScanner onScan={handleQRScan} />
                <Button 
                  onClick={() => setIsScanning(false)}
                  variant="outline"
                  className="w-full"
                >
                  {tScanner('stopScanner')}
                </Button>
              </div>
            )}

            {/* Scan Result */}
            {scanResult && (
              <Alert className={scanResult.success ? "border-green-500" : "border-red-500"}>
                {scanResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">{scanResult.message}</p>
                    {scanResult.ticket && (
                      <div className="text-sm space-y-1">
                        <p><strong>{tScanResult('customer')}</strong> {scanResult.ticket.user.name}</p>
                        <p><strong>{tScanResult('item')}</strong> {scanResult.ticket.item.title || scanResult.ticket.item.name}</p>
                        {scanResult.ticket.packageInfo && (
                          <p><strong>Package:</strong> {scanResult.ticket.packageInfo.name} (€{scanResult.ticket.packageInfo.price.toFixed(2)})</p>
                        )}
                        <p><strong>{tScanResult('type')}</strong> {scanResult.ticket.type}</p>
                        <p><strong>{tScanResult('status')}</strong> {scanResult.ticket.status}</p>
                        {scanResult.ticket.usageRemaining > 0 && (
                          <p><strong>{tScanResult('remainingUses')}</strong> {scanResult.ticket.usageRemaining}</p>
                        )}
                        <p><strong>{tScanResult('validUntil')}</strong> {new Date(scanResult.ticket.validUntil).toLocaleDateString()}</p>
                      </div>
                    )}
                    {scanResult.details && (
                      <div className="text-sm">
                        {scanResult.details.usedAt && (
                          <p><strong>{tScanResult('previouslyUsed')}</strong> {new Date(scanResult.details.usedAt).toLocaleString()}</p>
                        )}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Scan History */}
        <Card>
          <CardHeader>
            <CardTitle>{tHistory('title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {scanHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{tHistory('noScans')}</p>
              ) : (
                scanHistory.map((scan) => (
                  <div key={scan.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        {scan.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <Badge variant={scan.success ? "default" : "destructive"}>
                          {scan.success ? tHistory('valid') : tHistory('failed')}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>{scan.userName}</span>
                      </div>
                      <p><strong>{tHistory('item')}</strong> {scan.itemName}</p>
                      <p><strong>{tHistory('message')}</strong> {scan.message}</p>
                      {scan.location && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{scan.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
