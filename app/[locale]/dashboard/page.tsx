"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QrCode, Calendar, Clock, MapPin, Download, Eye, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { QRCodeSVG } from "qrcode.react"

interface Ticket {
  _id: string
  type: "ride" | "package"
  item: {
    _id: string
    title?: string
    name?: string
    image?: string
    description?: string
  }
  packageInfo?: {
    _id: string
    name: string
    price: number
  }
  qrCode: string
  qrSignature: string
  simpleCode: string
  status: "valid" | "used" | "expired" | "cancelled"
  validFrom: string
  validUntil: string
  visitDate: string
  usedAt?: string
  maxUsage: number
  currentUsage: number
  scanLocation?: string
  createdAt: string
}

interface Order {
  _id: string
  items: Array<{
    type: string
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  status: string
  createdAt: string
  paidAt?: string
  tickets: Ticket[]
}

export default function UserDashboard() {
  const { data: session } = useSession()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  
  // Get translations
  const t = useTranslations('dashboard')
  const tStats = useTranslations('dashboard.stats')
  const tTabs = useTranslations('dashboard.tabs')
  const tTickets = useTranslations('dashboard.tickets')
  const tOrders = useTranslations('dashboard.orders')

  const [ticketPage, setTicketPage] = useState(1)
  const [orderPage, setOrderPage] = useState(1)
  const [ticketSearch, setTicketSearch] = useState("")
  const [orderSearch, setOrderSearch] = useState("")
  const [ticketFilter, setTicketFilter] = useState("all")
  const [orderFilter, setOrderFilter] = useState("all")
  const itemsPerPage = 6

  // Helper functions
  const getItemName = (item: any) => {
    if (!item) return "Item Unavailable"
    return item.title || item.name || "Unknown Item"
  }

  const getItemDescription = (item: any) => {
    if (!item) return "This item is no longer available"
    return item.description || item.shortDescription || "No description available"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "used":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "expired":
        return "bg-red-100 text-red-800 border-red-200"
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "refunded":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatVisitDate = (visitDate: string) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const visit = new Date(visitDate)
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
    const visitOnly = new Date(visit.getFullYear(), visit.getMonth(), visit.getDate())

    if (visitOnly.getTime() === todayOnly.getTime()) {
      return tTickets('today')
    } else if (visitOnly.getTime() === tomorrowOnly.getTime()) {
      return tTickets('tomorrow')
    } else {
      return visit.toLocaleDateString()
    }
  }

  useEffect(() => {
    if (session) {
      fetchUserData()
    }
  }, [session])

  async function fetchUserData() {
    try {
      const [ticketsRes, ordersRes] = await Promise.all([fetch("/api/user/tickets"), fetch("/api/user/orders")])

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json()
        setTickets(ticketsData.tickets)
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData.orders)
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Group tickets by package for better organization
  const groupedTickets = tickets.reduce((groups, ticket) => {
    if (ticket.packageInfo) {
      // Group by package + order to separate multiple purchases of same package
      const packageId = ticket.packageInfo._id
      const orderId = (ticket as any).order || 'no_order'
      const groupKey = `${packageId}_${orderId}`
      if (!groups[groupKey]) {
        groups[groupKey] = {
          packageInfo: ticket.packageInfo,
          tickets: [],
          visitDate: ticket.visitDate,
          validUntil: ticket.validUntil
        }
      }
      groups[groupKey].tickets.push(ticket)
    } else {
      // This is an individual ticket (ride or package)
      const key = `individual_${ticket._id}`
      groups[key] = {
        packageInfo: null,
        tickets: [ticket],
        visitDate: ticket.visitDate,
        validUntil: ticket.validUntil
      }
    }
    return groups
  }, {} as Record<string, { packageInfo: any; tickets: Ticket[]; visitDate: string; validUntil: string }>)

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      getItemName(ticket.item).toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.simpleCode?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      (ticket.packageInfo && ticket.packageInfo.name.toLowerCase().includes(ticketSearch.toLowerCase()))
    const matchesFilter = ticketFilter === "all" || ticket.status === ticketFilter
    return matchesSearch && matchesFilter
  })

  // Filter grouped tickets based on search and filter
  const filteredGroupedTickets = Object.entries(groupedTickets).filter(([key, group]) => {
    const hasMatchingTickets = group.tickets.some(ticket => {
      const matchesSearch =
        getItemName(ticket.item).toLowerCase().includes(ticketSearch.toLowerCase()) ||
        ticket.simpleCode?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        (ticket.packageInfo && ticket.packageInfo.name.toLowerCase().includes(ticketSearch.toLowerCase()))
      const matchesFilter = ticketFilter === "all" || ticket.status === ticketFilter
      return matchesSearch && matchesFilter
    })
    return hasMatchingTickets
  })

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(orderSearch.toLowerCase()))
    const matchesFilter = orderFilter === "all" || order.status === orderFilter
    return matchesSearch && matchesFilter
  })

  const paginatedGroupedTickets = filteredGroupedTickets.slice((ticketPage - 1) * itemsPerPage, ticketPage * itemsPerPage)

  const paginatedOrders = filteredOrders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage)

  const totalTicketPages = Math.ceil(filteredGroupedTickets.length / itemsPerPage)
  const totalOrderPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const downloadQRCode = async (ticket: Ticket) => {
    try {
      const response = await fetch(`/api/user/tickets/${ticket._id}/download`)

      if (!response.ok) {
        throw new Error("Failed to download ticket")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const element = document.createElement("a")
      element.href = url
      element.download = `ticket-${ticket._id.slice(-8)}.pdf`
      element.style.display = "none"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading ticket:", error)
      alert("Failed to download ticket. Please try again.")
    }
  }

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
    isOrders = false,
  }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    isOrders?: boolean
  }) => (
    <div className="flex items-center justify-between px-2">
      <div className="text-sm text-muted-foreground">
        {isOrders ? tOrders('page', { current: currentPage, total: totalPages }) : tTickets('page', { current: currentPage, total: totalPages })}
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
          <ChevronLeft className="h-4 w-4" />
          {isOrders ? tOrders('previous') : tTickets('previous')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          {isOrders ? tOrders('next') : tTickets('next')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">{t('welcome', { name: session?.user?.name || 'User' })}</h1>
        <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{tStats('validTickets')}</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-full">
              <QrCode className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {tickets.filter((t) => t.status === "valid").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{tStats('readyToUse')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{tStats('usedTickets')}</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{tickets.filter((t) => t.status === "used").length}</div>
            <p className="text-xs text-muted-foreground mt-1">{tStats('previouslyUsed')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{tStats('totalOrders')}</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{orders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{tStats('allTime')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{tStats('totalSpent')}</CardTitle>
            <div className="p-2 bg-orange-100 rounded-full">
              <MapPin className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              $
              {orders
                .filter((o) => o.status === "paid")
                .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{tStats('lifetimeValue')}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="tickets" className="text-base">
            {tTabs('myTickets')}
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-base">
            {tTabs('orderHistory')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={tTickets('searchPlaceholder')}
                  value={ticketSearch}
                  onChange={(e) => {
                    setTicketSearch(e.target.value)
                    setTicketPage(1)
                  }}
                  className="pl-10"
                />
              </div>
              <Select
                value={ticketFilter}
                onValueChange={(value) => {
                  setTicketFilter(value)
                  setTicketPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={tTickets('filterPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tTickets('allStatus')}</SelectItem>
                  <SelectItem value="valid">{tTickets('valid')}</SelectItem>
                  <SelectItem value="used">{tTickets('used')}</SelectItem>
                  <SelectItem value="expired">{tTickets('expired')}</SelectItem>
                  <SelectItem value="cancelled">{tTickets('cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {tTickets('ticketsFound', { 
                count: filteredGroupedTickets.length, 
                plural: filteredGroupedTickets.length !== 1 ? "s" : "" 
              })}
            </div>
          </div>

          {filteredGroupedTickets.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-12">
                <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  {tickets.length === 0 ? tTickets('noTicketsYet') : tTickets('noTicketsMatch')}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {tickets.length === 0
                    ? tTickets('purchaseTickets')
                    : tTickets('adjustSearch')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-6">
                {paginatedGroupedTickets.map(([key, group]) => (
                  <Card key={key} className="border-0 shadow-md">
                    {group.packageInfo && (
                      <CardHeader className="pb-4 border-b">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <CardTitle className="text-xl leading-tight flex items-center gap-2">
                              <span className="text-purple-600">📦</span>
                              {group.packageInfo.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              Package with {group.tickets.length} ride{group.tickets.length !== 1 ? 's' : ''} • €{group.packageInfo.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              {formatVisitDate(group.visitDate)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Valid until {new Date(group.validUntil).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    )}
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.tickets.map((ticket) => (
                          <Card
                            key={ticket._id}
                            className="relative hover:shadow-lg transition-all duration-200 border border-border/50"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start gap-3">
                                <CardTitle className="text-base leading-tight">{getItemName(ticket.item)}</CardTitle>
                                <Badge className={`${getStatusColor(ticket.status)} font-medium shrink-0`}>
                                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="space-y-1">
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs uppercase tracking-wide">{tTickets('type')}</span>
                                    <span className="font-medium">
                                      {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs uppercase tracking-wide">{tTickets('usage')}</span>
                                    <span className="font-medium">
                                      {ticket.currentUsage}/{ticket.maxUsage}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs uppercase tracking-wide">{tTickets('code')}</span>
                                    <span className="font-mono text-sm font-medium">
                                      {ticket.simpleCode || (
                                        <span className="text-orange-600 animate-pulse">{tTickets('generating')}</span>
                                      )}
                                    </span>
                                  </div>
                                  {ticket.usedAt && (
                                    <div className="flex flex-col">
                                      <span className="text-muted-foreground text-xs uppercase tracking-wide">{tTickets('usedOn')}</span>
                                      <span className="font-medium">{new Date(ticket.usedAt).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {ticket.scanLocation && (
                                <div className="p-2 bg-muted/50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs font-medium">{ticket.scanLocation}</span>
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2 pt-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 bg-transparent"
                                      onClick={() => setSelectedTicket(ticket)}
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      {tTickets('viewQR')}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>{tTickets('ticketQRCode')}</DialogTitle>
                                    </DialogHeader>
                                    {selectedTicket && (
                                      <div className="text-center space-y-4">
                                        <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block">
                                          {selectedTicket.qrCode ? (
                                            <QRCodeSVG
                                              value={`${selectedTicket.qrCode}.${selectedTicket.qrSignature}`}
                                              size={192}
                                              level="M"
                                              includeMargin={true}
                                            />
                                          ) : (
                                            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                                              <QrCode className="h-24 w-24 text-gray-400" />
                                              <span className="sr-only">QR Code not available</span>
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-sm space-y-2">
                                          <div className="grid grid-cols-2 gap-4 text-left">
                                            <div>
                                              <p className="text-muted-foreground text-xs uppercase tracking-wide">{tTickets('ticketId')}</p>
                                              <p className="font-mono">#{selectedTicket._id.slice(-6)}</p>
                                            </div>
                                            <div>
                                              <p className="text-muted-foreground text-xs uppercase tracking-wide">{tTickets('status')}</p>
                                              <p className="font-medium">{selectedTicket.status}</p>
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <p className="text-muted-foreground text-xs uppercase tracking-wide">{tTickets('simpleCode')}</p>
                                            <div className="font-mono text-lg bg-gray-100 px-3 py-2 rounded-lg inline-block">
                                              {selectedTicket.simpleCode || (
                                                <span className="text-orange-600 animate-pulse">{tTickets('generating')}</span>
                                              )}
                                            </div>
                                            {!selectedTicket.simpleCode && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="ml-2 bg-transparent"
                                                onClick={() => fetchUserData()}
                                              >
                                                {tTickets('refresh')}
                                              </Button>
                                            )}
                                          </div>
                                          <div className="grid grid-cols-2 gap-4 text-left">
                                            <div>
                                              <p className="text-muted-foreground text-xs uppercase tracking-wide">{tTickets('item')}</p>
                                              <p className="font-medium">
                                                {selectedTicket.item.title || selectedTicket.item.name}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                                                {tTickets('visitDate')}
                                              </p>
                                              <p className="font-bold text-blue-600">
                                                {formatVisitDate(selectedTicket.visitDate)}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-2 gap-4 text-left">
                                            <div>
                                              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                                                {tTickets('validUntil')}
                                              </p>
                                              <p className="font-medium">
                                                {new Date(selectedTicket.validUntil).toLocaleDateString()}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-muted-foreground text-xs uppercase tracking-wide">{tTickets('usage')}</p>
                                              <p className="font-medium">
                                                {selectedTicket.currentUsage}/{selectedTicket.maxUsage}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadQRCode(ticket)}
                                  disabled={ticket.status !== "valid"}
                                  className="shrink-0"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  {tTickets('pdf')}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalTicketPages > 1 && (
                <Card className="p-4">
                  <PaginationControls
                    currentPage={ticketPage}
                    totalPages={totalTicketPages}
                    onPageChange={setTicketPage}
                    isOrders={false}
                  />
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={tOrders('searchPlaceholder')}
                  value={orderSearch}
                  onChange={(e) => {
                    setOrderSearch(e.target.value)
                    setOrderPage(1)
                  }}
                  className="pl-10"
                />
              </div>
              <Select
                value={orderFilter}
                onValueChange={(value) => {
                  setOrderFilter(value)
                  setOrderPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={tOrders('filterPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tOrders('allStatus')}</SelectItem>
                  <SelectItem value="paid">{tOrders('paid')}</SelectItem>
                  <SelectItem value="pending">{tOrders('pending')}</SelectItem>
                  <SelectItem value="cancelled">{tOrders('cancelled')}</SelectItem>
                  <SelectItem value="refunded">{tOrders('refunded')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {tOrders('ordersFound', { 
                count: filteredOrders.length, 
                plural: filteredOrders.length !== 1 ? "s" : "" 
              })}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  {orders.length === 0 ? tOrders('noOrdersYet') : tOrders('noOrdersMatch')}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {orders.length === 0
                    ? tOrders('orderHistory')
                    : tOrders('adjustSearch')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedOrders.map((order) => (
                  <Card key={order._id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold">{tOrders('order', { id: order._id.slice(-6) })}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                            {order.paidAt && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {tOrders('paidOn', { date: new Date(order.paidAt).toLocaleDateString() })}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={`${getOrderStatusColor(order.status)} font-medium`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <p className="text-2xl font-bold">€{(order.totalAmount || 0).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-lg">{tOrders('items')}</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                              <div className="flex-1">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-muted-foreground ml-2">× {item.quantity}</span>
                              </div>
                              <span className="font-semibold">
                                €{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalOrderPages > 1 && (
                <Card className="p-4">
                  <PaginationControls
                    currentPage={orderPage}
                    totalPages={totalOrderPages}
                    onPageChange={setOrderPage}
                    isOrders={true}
                  />
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
