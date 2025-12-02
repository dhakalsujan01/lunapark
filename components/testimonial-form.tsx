"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Ticket as TicketIcon,
  Calendar
} from "lucide-react"

interface EligibleTicket {
  _id: string
  type: "ride" | "package"
  usedAt: string
  scanLocation?: string
  item: {
    name: string
    description?: string
  }
  order: {
    _id: string
    customerName: string
    paidAt: string
  }
}

export function TestimonialForm() {
  const { data: session, status } = useSession()
  const [eligibleTickets, setEligibleTickets] = useState<EligibleTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<string>("")
  const [rating, setRating] = useState<number>(0)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Fetch eligible tickets
  useEffect(() => {
    if (status === "authenticated") {
      fetchEligibleTickets()
    }
  }, [status])

  const fetchEligibleTickets = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/user/eligible-tickets")
      if (response.ok) {
        const data = await response.json()
        setEligibleTickets(data.tickets)
      } else {
        setMessage({ type: "error", text: "Failed to fetch your tickets" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error loading tickets" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTicket || !rating || !title.trim() || !content.trim()) {
      setMessage({ type: "error", text: "Please fill in all fields" })
      return
    }

    try {
      setIsSubmitting(true)
      setMessage(null)

      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: selectedTicket,
          rating,
          title: title.trim(),
          content: content.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: "Thank you! Your testimonial has been submitted and is pending approval." 
        })
        // Reset form
        setSelectedTicket("")
        setRating(0)
        setTitle("")
        setContent("")
        // Refresh eligible tickets
        fetchEligibleTickets()
      } else {
        setMessage({ type: "error", text: data.error || "Failed to submit testimonial" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error submitting testimonial" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please sign in to leave a testimonial about your Luna Park experience.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Share Your Experience
        </CardTitle>
        <p className="text-gray-600">
          Tell us about your Luna Park adventure! Only verified ticket holders can submit reviews.
        </p>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert className={`mb-6 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading your tickets...</span>
          </div>
        ) : eligibleTickets.length === 0 ? (
          <Alert>
            <TicketIcon className="h-4 w-4" />
            <AlertDescription>
              You don't have any eligible tickets for testimonials. 
              Visit Luna Park and use your tickets to share your experience!
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ticket Selection */}
            <div>
              <Label htmlFor="ticket">Select Your Experience</Label>
              <div className="grid gap-3 mt-2">
                {eligibleTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTicket === ticket._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedTicket(ticket._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="ticket"
                          value={ticket._id}
                          checked={selectedTicket === ticket._id}
                          onChange={() => setSelectedTicket(ticket._id)}
                          className="text-blue-600"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {ticket.item.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {ticket.type}
                            </Badge>
                            <Calendar className="h-3 w-3" />
                            <span>Used {formatDate(ticket.usedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <Label>Rating</Label>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-gray-600">
                    {rating} star{rating > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Review Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your review a catchy title..."
                maxLength={100}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/100 characters
              </p>
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">Your Review</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tell us about your experience at Luna Park..."
                rows={4}
                maxLength={1000}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {content.length}/1000 characters
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !selectedTicket || !rating || !title.trim() || !content.trim()}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Testimonial"
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Your testimonial will be reviewed by our team before being published.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
