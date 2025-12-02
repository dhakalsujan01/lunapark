"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Download, Filter, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Order {
  _id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  totalAmount: number
  status: string
  paymentMethod: string
  items: Array<{
    type: string
    name: string
    quantity: number
    price: number
  }>
  user: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const response = await fetch("/api/admin/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  async function exportOrders() {
    setIsExporting(true)
    try {
      const params = new URLSearchParams({
        format: "csv",
        ...(statusFilter && { status: statusFilter }),
      })
      
      const response = await fetch(`/api/admin/export/orders?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        console.error("Export failed")
      }
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  async function retryTicketGeneration(orderId: string) {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/retry-tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        alert("Ticket generation retry initiated. Please check the order status.")
        fetchOrders()
      } else {
        alert("Failed to retry ticket generation. Please check the logs.")
      }
    } catch (error) {
      console.error("Failed to retry ticket generation:", error)
      alert("Error retrying ticket generation.")
    }
  }


  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "ticket_generation_failed":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "paid":
        return "Payment completed and tickets generated"
      case "pending":
        return "Awaiting payment completion"
      case "cancelled":
        return "Payment failed or cancelled"
      case "ticket_generation_failed":
        return "Payment succeeded but ticket generation failed"
      default:
        return "Unknown status"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={exportOrders}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export CSV"}
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
            placeholder="Search orders..."
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
            <SelectItem value="pending">Pending Payment</SelectItem>
            <SelectItem value="paid">Paid & Complete</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="ticket_generation_failed">Ticket Generation Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading orders...</div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Customer:</strong> {order.customerName}</p>
                      <p><strong>Email:</strong> {order.customerEmail}</p>
                      <p><strong>Total:</strong> €{order.totalAmount.toFixed(2)}</p>
                      <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p><strong>Status:</strong> {getStatusDescription(order.status)}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Order Details - #{order.orderNumber}</DialogTitle>
                        </DialogHeader>
                        {selectedOrder && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold">Customer Information</h4>
                                <p>{selectedOrder.customerName}</p>
                                <p>{selectedOrder.customerEmail}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">Order Information</h4>
                                <p>Status: {selectedOrder.status}</p>
                                <p>Total: €{selectedOrder.totalAmount}</p>
                                <p>Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Items</h4>
                              <div className="space-y-2">
                                {selectedOrder.items?.map((item, index) => (
                                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span>{item.name} x{item.quantity}</span>
                                    <span>€{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Admin Actions */}
                    <div className="flex flex-col space-y-1">
                      {order.status === "ticket_generation_failed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryTicketGeneration(order._id)}
                          className="text-xs"
                        >
                          Retry Tickets
                        </Button>
                      )}
                      <Badge 
                        className={`${getStatusColor(order.status)} text-center justify-center`}
                        variant="outline"
                      >
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
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