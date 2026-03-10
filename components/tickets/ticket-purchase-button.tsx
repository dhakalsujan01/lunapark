"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingCart, 
  CreditCard, 
  Users, 
  Calendar,
  Loader2,
  Check,
  LogIn
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface TicketPurchaseButtonProps {
  tier: {
    id: string
    name: string
    price: number
    originalPrice?: number
    description: string
    features: string[]
    buttonText: string
  }
  className?: string
}

export function TicketPurchaseButton({ tier, className }: TicketPurchaseButtonProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [visitDate, setVisitDate] = useState("")
  const isPackage = tier.buttonText === "Buy Package"

  // Handle authentication check before opening purchase dialog
  const handlePurchaseClick = () => {
    if (status === "loading") {
      return // Still loading, don't do anything
    }
    
    if (!session) {
      // User is not authenticated, show message and redirect to sign in
      toast.error("Please sign in to purchase tickets")
      router.push("/auth/signin?callbackUrl=" + encodeURIComponent(window.location.pathname))
      return
    }
    
    // User is authenticated, open the purchase dialog
    setIsOpen(true)
  }

  const handlePurchase = async () => {
    setIsLoading(true)
    
    try {
      // Create Stripe checkout session
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              type: isPackage ? "package" : "ride",
              id: tier.id,
              quantity: isPackage ? 1 : quantity,
              metadata: {
                ticketType: tier.id,
                visitDate: visitDate,
              }
            }
          ],
          successUrl: `${window.location.origin}/booking/success`,
          cancelUrl: `${window.location.origin}/attractions`,
        }),
      })

      const result = await response.json()
      
      // Check if the response was successful
      if (!response.ok) {
        throw new Error(result.error || "Failed to create checkout session")
      }
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create checkout session")
      }

      const { sessionId, url } = result.data

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url
      } else {
        throw new Error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Purchase error:", error)
      
      let errorMessage = "Failed to initiate purchase. Please try again."
      
      if (error instanceof Error) {
        if (error.message.includes("Invalid Stripe API version")) {
          errorMessage = "Payment system configuration error. Please contact support."
        } else if (error.message.includes("Payment processing error")) {
          errorMessage = "Payment system temporarily unavailable. Please try again later."
        } else if (error.message.includes("not found")) {
          errorMessage = "This item is no longer available. Please refresh the page."
        } else if (error.message.includes("not available")) {
          errorMessage = "This item is currently not available for purchase."
        } else if (error.message.includes("Unauthorized")) {
          errorMessage = "Please sign in again to complete your purchase."
          // Redirect to sign in
          router.push("/auth/signin?callbackUrl=" + encodeURIComponent(window.location.pathname))
          return
        } else if (error.message !== "Failed to create checkout session") {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const effectiveQuantity = isPackage ? 1 : quantity
  const totalPrice = tier.price * effectiveQuantity
  const savings = tier.originalPrice ? (tier.originalPrice - tier.price) * effectiveQuantity : 0

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={className}
        >
          <Button 
            onClick={handlePurchaseClick}
            className="w-full bg-gradient-to-r from-blue-800 to-purple-600 hover:from-blue-900 hover:to-purple-700 text-white transition-all duration-200"
            size="sm"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : !session ? (
              <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span className="text-sm sm:text-base">
              {status === "loading" ? "Loading..." : !session ? "Sign In to Buy" : tier.buttonText}
            </span>
          </Button>
        </motion.div>
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Purchase {tier.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm sm:text-base">
            Complete your ticket purchase for Luna Amusement Park
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-base sm:text-lg mb-2">{tier.name}</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3">
              {tier.description}
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
              <div className="flex items-center gap-2">
                {tier.originalPrice && (
                  <span className="text-base sm:text-lg line-through text-gray-400">
                    €{tier.originalPrice}
                  </span>
                )}
                <span className="text-xl sm:text-2xl font-bold text-green-600">
                  €{tier.price}
                </span>
              </div>
              {savings > 0 && (
                <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                  Save €{savings} per ticket
                </Badge>
              )}
            </div>

            {/* Key Features */}
            <div className="space-y-1">
              {tier.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-3 w-3 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Options */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {!isPackage && (
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    Tickets
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="text-center font-semibold text-sm sm:text-base"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="visitDate" className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  Visit Date
                </Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {effectiveQuantity} × {tier.name}
                </span>
                <span className="font-semibold text-sm sm:text-base">€{totalPrice}</span>
              </div>
              
              {savings > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm text-green-600">Total Savings</span>
                  <span className="font-semibold text-green-600 text-sm sm:text-base">-€{savings}</span>
                </div>
              )}
              
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-bold text-sm sm:text-base">Total</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600">€{totalPrice}</span>
              </div>
            </div>

            {/* Purchase Button */}
            <Button
              onClick={handlePurchase}
              disabled={isLoading || !visitDate}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 sm:py-3 text-sm sm:text-base"
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Payment
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Secure payment powered by Stripe. You'll be redirected to complete your purchase.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
