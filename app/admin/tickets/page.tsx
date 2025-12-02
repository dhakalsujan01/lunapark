"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, QrCode, Download, Filter, Calendar, CheckCircle, XCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Ticket {
  _id: string
  simpleCode: string
  type: string
  status: "valid" | "used" | "expired" | "cancelled"
  user: {
    _id: string
    name: string
    email: string
  }
  item?: {
    _id: string
    name: string
  }
  visitDate: string
  usedAt?: string
  purchasePrice: number
  qrCode: string
  createdAt: string
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    try {
      const response = await fetch("/api/admin/tickets")
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateTicketStatus(ticketId: string, newStatus: string) {
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchTickets()
      }
    } catch (error) {
      console.error("Failed to update ticket status:", error)
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = 
      (ticket.simpleCode && ticket.simpleCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.user?.name && ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.user?.email && ticket.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.item?.name && ticket.item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesType = typeFilter === "all" || ticket.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800"
      case "used":
        return "bg-blue-100 text-blue-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-4 w-4" />
      case "used":
        return <CheckCircle className="h-4 w-4" />
      case "expired":
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="valid">Valid</SelectItem>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ride">Ride</SelectItem>
            <SelectItem value="package">Package</SelectItem>
            <SelectItem value="entry">Entry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading tickets...</div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket._id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-4">
                      <h3 className="font-semibold text-lg">#{ticket.simpleCode || 'N/A'}</h3>
                      <Badge className={getStatusColor(ticket.status)}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(ticket.status)}
                          <span>{ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}</span>
                        </span>
                      </Badge>
                      <Badge variant="outline">
                        {ticket.type ? ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1) : 'N/A'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Customer:</strong></p>
                        <p>{ticket.user?.name || 'N/A'}</p>
                        <p>{ticket.user?.email || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p><strong>Item:</strong></p>
                        <p>{ticket.item?.name || "Entry Ticket"}</p>
                      </div>
                      
                      <div>
                        <p><strong>Visit Date:</strong></p>
                        <p>{new Date(ticket.visitDate).toLocaleDateString()}</p>
                        {ticket.usedAt && (
                          <p className="text-blue-600">Used: {new Date(ticket.usedAt).toLocaleString()}</p>
                        )}
                      </div>
                      
                      <div>
                        <p><strong>Price:</strong></p>
                        <p>{ticket.currency === 'gbp' ? '£' : '€'}{ticket.purchasePrice}</p>
                        <p className="text-gray-500">
                          Created: {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <QrCode className="h-4 w-4 mr-1" />
                          QR
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Ticket QR Code - #{ticket.simpleCode || 'N/A'}</DialogTitle>
                        </DialogHeader>
                        {selectedTicket && (
                          <div className="text-center space-y-4">
                            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                                <QrCode className="h-24 w-24 text-gray-400" />
                                <span className="sr-only">QR Code for ticket {selectedTicket.simpleCode || 'N/A'}</span>
                              </div>
                            </div>
                            <div className="text-sm space-y-1">
                              <p><strong>Ticket:</strong> #{selectedTicket.simpleCode || 'N/A'}</p>
                              <p><strong>Customer:</strong> {selectedTicket.user?.name || 'N/A'}</p>
                              <p><strong>Status:</strong> {selectedTicket.status}</p>
                              <p><strong>Visit Date:</strong> {new Date(selectedTicket.visitDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Select
                      value={ticket.status}
                      onValueChange={(newStatus) => updateTicketStatus(ticket._id, newStatus)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="valid">Valid</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
