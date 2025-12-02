"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Camera, AlertTriangle, X, Check } from "lucide-react"
import jsQR from "jsqr"

interface QRScannerProps {
  onScan: (qrCode: string) => void
  isValidating?: boolean
}

function QrScanner({ onScan, isValidating = false }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const scanningIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startScanning = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsScanning(true)

        // Start scanning for QR codes when video is ready
        videoRef.current.onloadedmetadata = () => {
          scanForQRCode()
        }
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions and try again.")
      console.error("Camera access error:", err)
    }
  }

  const stopScanning = () => {
    if (scanningIntervalRef.current) {
      clearInterval(scanningIntervalRef.current)
      scanningIntervalRef.current = null
    }
    
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }

  const scanForQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height)

    if (qrCode) {
      onScan(qrCode.data)
      stopScanning()
    }
  }

  useEffect(() => {
    if (isScanning) {
      scanningIntervalRef.current = setInterval(scanForQRCode, 100)
    }

    return () => {
      if (scanningIntervalRef.current) {
        clearInterval(scanningIntervalRef.current)
      }
    }
  }, [isScanning])

  const [manualInput, setManualInput] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)

  const handleManualInput = () => {
    setShowManualInput(true)
  }

  const submitManualInput = () => {
    // SECURITY: Validate and sanitize manual input
    const trimmedInput = manualInput.trim()
    
    if (!trimmedInput) {
      setError("Please enter a QR code")
      return
    }
    
    // Length limits to prevent abuse
    if (trimmedInput.length < 10) {
      setError("QR code too short")
      return
    }
    
    if (trimmedInput.length > 1000) {
      setError("QR code too long")
      return
    }
    
    // Basic QR format validation (should contain a dot for signature)
    if (!trimmedInput.includes('.')) {
      setError("Invalid QR code format")
      return
    }
    
    // Split and validate parts
    const parts = trimmedInput.split('.')
    if (parts.length !== 2) {
      setError("Invalid QR code format")
      return
    }
    
    const [dataPart, signaturePart] = parts
    
    // Validate data part (base64)
    const validBase64Pattern = /^[A-Za-z0-9+/=]+$/
    if (!validBase64Pattern.test(dataPart) || dataPart.length < 5) {
      setError("Invalid QR code data")
      return
    }
    
    // Validate signature part (hex)
    const validHexPattern = /^[a-fA-F0-9]+$/
    if (!validHexPattern.test(signaturePart) || signaturePart.length !== 64) {
      setError("Invalid QR code signature")
      return
    }
    
    // Additional security: Check for suspicious patterns
    if (trimmedInput.includes('<script') || trimmedInput.includes('javascript:') || trimmedInput.includes('data:')) {
      setError("Invalid QR code content")
      return
    }
    
    setShowManualInput(false)
    setManualInput("")
    setError(null)
    onScan(trimmedInput)
  }

  const cancelManualInput = () => {
    setShowManualInput(false)
    setManualInput("")
    setError(null)
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="w-full max-w-md mx-auto">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-64 bg-gray-100 rounded-lg ${isScanning ? "block" : "hidden"}`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {!isScanning && (
          <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Camera className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Camera not active</p>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-lg"></div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
              Scanning for QR codes...
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        {!isScanning ? (
          <Button onClick={startScanning} className="flex-1" disabled={isValidating}>
            <Camera className="h-4 w-4 mr-2" />
            Start Scanning
          </Button>
        ) : (
          <Button onClick={stopScanning} variant="outline" className="flex-1" disabled={isValidating}>
            Stop Scanning
          </Button>
        )}

        <Button onClick={handleManualInput} variant="outline" disabled={isValidating}>
          Manual Input
        </Button>
      </div>

      {/* Secure Manual Input Modal */}
      {showManualInput && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium mb-2">Manual QR Code Entry</h4>
          <Input
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Paste QR code data here..."
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button onClick={submitManualInput} size="sm" className="flex-1">
              <Check className="h-4 w-4 mr-1" />
              Validate
            </Button>
            <Button onClick={cancelManualInput} variant="outline" size="sm">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isValidating && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Validating ticket...</span>
        </div>
      )}
    </div>
  )
}

export { QrScanner }