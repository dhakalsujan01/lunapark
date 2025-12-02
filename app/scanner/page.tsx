"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrScanner } from "@/components/qr-scanner"
import { ValidationResult } from "@/components/validation-result"
import { Scan, History, RefreshCw } from "lucide-react"

interface ScanResult {
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

export default function ScannerPage() {
  const { data: session, status } = useSession()
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([])

  useEffect(() => {
    if (status === "authenticated" && session?.user.role !== "admin" && session?.user.role !== "checker") {
      redirect("/dashboard")
    }
  }, [session, status])

  const handleScan = async (qrData: string) => {
    try {
      const response = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: qrData }),
      })

      const result = await response.json()
      setScanResult(result)
      setScanHistory((prev) => [result, ...prev.slice(0, 9)]) // Keep last 10 scans
      setIsScanning(false)
    } catch (error) {
      console.error("Scan error:", error)
      setScanResult({
        success: false,
        message: "Failed to validate ticket. Please try again.",
      })
      setIsScanning(false)
    }
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ticket Scanner</h1>
          <p className="text-gray-600">Scan QR codes to validate park tickets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scan className="mr-2 h-5 w-5" />
                QR Code Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isScanning ? (
                <div className="text-center py-8">
                  <Button onClick={() => setIsScanning(true)} size="lg" className="bg-orange-600 hover:bg-orange-700">
                    <Scan className="mr-2 h-5 w-5" />
                    Start Scanning
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <QrScanner onScan={handleScan} />
                  <Button onClick={() => setIsScanning(false)} variant="outline" className="w-full">
                    Stop Scanning
                  </Button>
                </div>
              )}

              {scanResult && <ValidationResult result={scanResult} />}
            </CardContent>
          </Card>

          {/* Scan History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <History className="mr-2 h-5 w-5" />
                  Recent Scans
                </CardTitle>
                <Button onClick={() => setScanHistory([])} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {scanHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No scans yet. Start scanning tickets to see history.
                </div>
              ) : (
                <div className="space-y-3">
                  {scanHistory.map((scan, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        scan.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant={scan.success ? "default" : "destructive"}
                          className={scan.success ? "bg-green-600" : ""}
                        >
                          {scan.success ? "Valid" : "Invalid"}
                        </Badge>
                        <span className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</span>
                      </div>
                      {scan.ticket && (
                        <div className="text-sm space-y-1">
                          <div>
                            <strong>Ticket ID:</strong> {scan.ticket.id.slice(-8)}
                          </div>
                          <div>
                            <strong>Item:</strong> {scan.ticket.item?.name || scan.ticket.item?.title || "Unknown"}
                          </div>
                          <div>
                            <strong>Guest:</strong> {scan.ticket.user.name}
                          </div>
                        </div>
                      )}
                      <p className="text-sm mt-2 text-gray-600">{scan.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
