"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, CreditCard, ShoppingCart, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { formatCurrency, isValidCurrency, validateCurrencyAmount } from "@/lib/currency-utils"
import type { SupportedCurrency } from "@/lib/currency-utils"
import { CurrencySelector } from "@/components/currency-selector"

interface CheckoutItem {
  id: string
  type: "ride" | "package"
  name: string
  price: number
  quantity: number
  image?: string
  description?: string
}

interface CheckoutFormProps {
  items: CheckoutItem[]
  onSuccess?: (sessionId: string) => void
  onError?: (error: string) => void
  defaultCurrency?: SupportedCurrency
}

// CLIENT-SIDE VALIDATION: Comprehensive form validation before API calls
function validateCheckoutData(items: CheckoutItem[], currency?: SupportedCurrency): string[] {
  const errors: string[] = []

  // Check if items exist
  if (!items || items.length === 0) {
    errors.push("No items in cart. Please add items before checkout.")
    return errors
  }

  // Check maximum number of items (matches server-side validation)
  if (items.length > 50) {
    errors.push("Too many items in cart. Maximum 50 items allowed.")
  }

  // Validate each item
  items.forEach((item, index) => {
    // Check required fields
    if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') {
      errors.push(`Item ${index + 1}: Invalid or missing ID`)
    }

    if (!item.type || !['ride', 'package'].includes(item.type)) {
      errors.push(`Item ${index + 1}: Invalid type. Must be 'ride' or 'package'`)
    }

    if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
      errors.push(`Item ${index + 1}: Invalid or missing name`)
    }

    // Validate price with currency validation
    const priceValidation = validateCurrencyAmount(item.price, "eur") // Assume EUR for validation
    if (!priceValidation.isValid) {
      errors.push(`Item ${index + 1}: ${priceValidation.error}`)
    }

    // Validate quantity
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Invalid quantity. Must be a positive number`)
    }

    if (item.quantity > 100) {
      errors.push(`Item ${index + 1}: Quantity too high. Maximum 100 per item allowed`)
    }

    // Check for suspicious values
    if (!Number.isFinite(item.price) || !Number.isFinite(item.quantity)) {
      errors.push(`Item ${index + 1}: Invalid numeric values detected`)
    }
  })

  // Check total amount with currency validation
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  if (totalAmount <= 0) {
    errors.push("Total amount must be greater than zero")
  }

  const totalAmountValidation = validateCurrencyAmount(totalAmount, currency || "eur")
  if (!totalAmountValidation.isValid) {
    errors.push(`Total amount: ${totalAmountValidation.error}`)
  }

  // Check total items
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  if (totalItems > 1000) {
    errors.push("Too many total items. Maximum 1000 items allowed per order")
  }

  // Validate currency
  if (currency && !isValidCurrency(currency)) {
    errors.push("Invalid currency selected. Only EUR and GBP are supported.")
  }

  return errors
}

export function CheckoutForm({ items, onSuccess, onError, defaultCurrency = "eur" }: CheckoutFormProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>(defaultCurrency)
  const router = useRouter()

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = async () => {
    // Check authentication first
    if (!session) {
      toast.error("Please sign in to complete your purchase")
      router.push("/auth/signin?callbackUrl=" + encodeURIComponent(window.location.pathname))
      return
    }

    // CLIENT-SIDE VALIDATION: Validate form data before API call
    const validationErrors = validateCheckoutData(items, selectedCurrency)
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error))
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            type: item.type,
            id: item.id,
            quantity: item.quantity,
          })),
          currency: selectedCurrency,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create checkout session")
      }
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      if (result.data.url) {
        window.location.href = result.data.url
      } else if (onSuccess) {
        onSuccess(result.data.sessionId)
      }
    } catch (error) {
      console.error("Checkout error:", error)
      
      // Handle specific error types
      let errorMessage = "Checkout failed"
      
      if (error instanceof Error) {
        if (error.message.includes("NetworkError") || error.message.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (error.message.includes("Security violation")) {
          errorMessage = "Invalid request. Please refresh the page and try again."
        } else if (error.message.includes("not found") || error.message.includes("not available")) {
          errorMessage = "One or more items are no longer available. Please refresh and try again."
        } else if (error.message.includes("Invalid currency")) {
          errorMessage = "Currency not supported. Please contact support."
        } else if (error.message.includes("Too many items")) {
          errorMessage = "Too many items in cart. Please reduce quantity and try again."
        } else if (error.message.includes("Payment processing error")) {
          errorMessage = "Payment system error. Please try again or contact support."
        } else {
          errorMessage = error.message
        }
      }
      
      // Show user-friendly error message
      toast.error(errorMessage)
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No items in cart</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Checkout
        </CardTitle>
        <CardDescription>Review your order and proceed to payment</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {item.image && (
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {item.type}
                    </Badge>
                    <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                <p className="text-sm text-gray-500">{formatCurrency(item.price)} each</p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Currency Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Currency</label>
          <CurrencySelector 
            value={selectedCurrency}
            onValueChange={setSelectedCurrency}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Items ({totalItems})</span>
            <span>{formatCurrency(totalAmount, selectedCurrency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Processing Fee</span>
            <span>{formatCurrency(0, selectedCurrency)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>{formatCurrency(totalAmount, selectedCurrency)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button 
          onClick={handleCheckout} 
          disabled={isLoading || status === "loading" || !session} 
          className="w-full" 
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : !session ? (
            <>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In to Purchase
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Proceed to Payment
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Secure payment powered by Stripe. Your payment information is encrypted and secure.
        </p>
      </CardContent>
    </Card>
  )
}
