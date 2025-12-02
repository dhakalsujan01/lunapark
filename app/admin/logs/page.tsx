"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Activity, AlertTriangle, CheckCircle, XCircle, Search, DollarSign } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"

interface LogEntry {
  _id: string
  type: "security" | "activity" | "webhook" | "scan" | "payment"
  // Common fields
  ipAddress?: string
  userAgent?: string
  createdAt: string
  
  // Activity log fields
  action?: string
  resource?: string
  method?: string
  statusCode?: number
  responseTime?: number
  user?: {
    name: string
    email: string
  }
  
  // Security log fields
  securityType?: string
  email?: string
  severity?: string
  securityDetails?: any
  
  // Scan log fields
  success?: boolean
  details?: string
  location?: string
  device?: string
  scannedBy?: {
    name: string
    email: string
  }
  scannedAt?: string
  
  // Webhook log fields
  webhookType?: string
  webhookDetails?: any
  
  // Payment log fields
  orderNumber?: string
  totalAmount?: number
  status?: string
  paymentMethod?: string
  paymentIntentId?: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      const response = await fetch("/api/admin/logs")
      if (response.ok) {
        const data = await response.json()
        console.log("Logs API response:", data)
        setLogs(data.logs)
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    // Build searchable fields based on log type
    const searchFields = []
    
    if (log.type === 'activity') {
      searchFields.push(
        log.action || '',
        log.resource || '',
        log.method || '',
        log.user?.name || '',
        log.user?.email || ''
      )
    } else if (log.type === 'security') {
      searchFields.push(
        log.securityType || '',
        log.email || '',
        log.severity || '',
        JSON.stringify(log.securityDetails || {})
      )
    } else if (log.type === 'scan') {
      searchFields.push(
        log.details || '',
        log.location || '',
        log.device || '',
        log.scannedBy?.name || '',
        log.scannedBy?.email || ''
      )
         } else if (log.type === 'webhook') {
       searchFields.push(
         log.webhookType || '',
         JSON.stringify(log.webhookDetails || {})
       )
     } else if (log.type === 'payment') {
       searchFields.push(
         log.orderNumber || '',
         log.status || '',
         log.paymentMethod || '',
         log.paymentIntentId || '',
         log.totalAmount?.toString() || ''
       )
     }
    
    // Add common fields
    searchFields.push(
      log.ipAddress || '',
      log.userAgent || ''
    )
    
    const filteredFields = searchFields.filter(Boolean)
    const matchesSearch = searchTerm === '' || filteredFields.some(field => 
      field.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const matchesType = typeFilter === "all" || log.type === typeFilter
    
    // Handle status filtering for different log types
    let matchesStatus = true
    if (statusFilter !== "all") {
      if (log.type === 'scan' && log.success !== undefined) {
        matchesStatus = (statusFilter === "success" && log.success) ||
                       (statusFilter === "failed" && !log.success)
      } else if (log.type === 'activity' && log.statusCode !== undefined) {
        const isSuccess = log.statusCode >= 200 && log.statusCode < 300
        matchesStatus = (statusFilter === "success" && isSuccess) ||
                       (statusFilter === "failed" && !isSuccess)
      } else if (log.type === 'security') {
        // For security logs, consider high/critical severity as "failed"
        const isFailed = log.severity === 'high' || log.severity === 'critical'
        matchesStatus = (statusFilter === "success" && !isFailed) ||
                       (statusFilter === "failed" && isFailed)
      }
    }
    
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "security":
        return <Shield className="h-4 w-4 text-red-600" />
      case "activity":
        return <Activity className="h-4 w-4 text-blue-600" />
      case "webhook":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "scan":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      security: "bg-red-100 text-red-800",
      activity: "bg-blue-100 text-blue-800",
      webhook: "bg-yellow-100 text-yellow-800",
      scan: "bg-green-100 text-green-800",
    }
    return <Badge className={colors[type as keyof typeof colors]}>{type}</Badge>
  }

  const columns = [
    {
      header: "Type",
      accessorKey: "type",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          {getTypeIcon(row.original.type)}
          {getTypeBadge(row.original.type)}
        </div>
      ),
    },
    {
      header: "Action/Event",
      accessorKey: "action",
      cell: ({ row }: any) => {
        const log = row.original
        if (log.type === 'activity') {
          return (
            <div>
              <div className="font-medium">{log.action || 'N/A'}</div>
              <div className="text-sm text-gray-500">{log.resource} • {log.method}</div>
              {log.user && (
                <div className="text-xs text-gray-400">{log.user.name}</div>
              )}
            </div>
          )
        } else if (log.type === 'security') {
          return (
            <div>
              <div className="font-medium">{log.securityType || 'N/A'}</div>
              <div className="text-sm text-gray-500">{log.email}</div>
              <div className="text-xs text-gray-400">Severity: {log.severity}</div>
            </div>
          )
        } else if (log.type === 'scan') {
          return (
            <div>
              <div className="font-medium">Ticket Scan</div>
              <div className="text-sm text-gray-500">{log.location || 'Unknown'}</div>
              {log.scannedBy && (
                <div className="text-xs text-gray-400">By: {log.scannedBy.name}</div>
              )}
            </div>
          )
                 } else if (log.type === 'webhook') {
           return (
             <div>
               <div className="font-medium">Webhook</div>
               <div className="text-sm text-gray-500">{log.webhookType || 'Unknown'}</div>
             </div>
           )
         } else if (log.type === 'payment') {
           return (
             <div>
               <div className="font-medium">Payment</div>
               <div className="text-sm text-gray-500">Order #{log.orderNumber || 'N/A'}</div>
               {log.user && (
                 <div className="text-xs text-gray-400">{log.user.name}</div>
               )}
             </div>
           )
         }
         return <div>Unknown</div>
      },
    },
    {
      header: "Details",
      accessorKey: "details",
      cell: ({ row }: any) => {
        const log = row.original
        let details = ''
        
        if (log.type === 'activity') {
          details = `${log.statusCode || 'N/A'} • ${log.responseTime || 'N/A'}ms`
        } else if (log.type === 'security') {
          details = log.securityDetails ? JSON.stringify(log.securityDetails) : 'N/A'
        } else if (log.type === 'scan') {
          details = log.details || 'N/A'
                 } else if (log.type === 'webhook') {
           details = log.webhookDetails ? JSON.stringify(log.webhookDetails) : 'N/A'
         } else if (log.type === 'payment') {
           details = `${log.status || 'N/A'} • ${log.paymentMethod || 'N/A'} • €${(log.totalAmount || 0) / 100}`
         }
        
        return (
          <div className="max-w-xs truncate" title={details}>
            {details}
          </div>
        )
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: any) => {
        const log = row.original
        
        if (log.type === 'scan') {
          return (
            <div className="flex items-center space-x-1">
              {log.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <Badge variant={log.success ? "default" : "destructive"}>
                {log.success ? "Success" : "Failed"}
              </Badge>
            </div>
          )
        } else if (log.type === 'activity') {
          const isSuccess = log.statusCode && log.statusCode >= 200 && log.statusCode < 300
          return (
            <div className="flex items-center space-x-1">
              {isSuccess ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <Badge variant={isSuccess ? "default" : "destructive"}>
                {log.statusCode || 'N/A'}
              </Badge>
            </div>
          )
                 } else if (log.type === 'security') {
           const isHighSeverity = log.severity === 'high' || log.severity === 'critical'
           return (
             <div className="flex items-center space-x-1">
               {isHighSeverity ? (
                 <XCircle className="h-4 w-4 text-red-600" />
               ) : (
                 <CheckCircle className="h-4 w-4 text-green-600" />
               )}
               <Badge variant={isHighSeverity ? "destructive" : "default"}>
                 {log.severity || 'N/A'}
               </Badge>
             </div>
           )
         } else if (log.type === 'payment') {
           const isSuccess = log.status === 'paid' || log.status === 'completed'
           return (
             <div className="flex items-center space-x-1">
               {isSuccess ? (
                 <CheckCircle className="h-4 w-4 text-green-600" />
               ) : (
                 <XCircle className="h-4 w-4 text-red-600" />
               )}
               <Badge variant={isSuccess ? "default" : "destructive"}>
                 {log.status || 'N/A'}
               </Badge>
             </div>
           )
         }
        
        return <div>N/A</div>
      },
    },
    {
      header: "IP Address",
      accessorKey: "ipAddress",
      cell: ({ row }: any) => row.original.ipAddress || "N/A",
    },
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      cell: ({ row }: any) => {
        const log = row.original
        const timestamp = log.createdAt || log.scannedAt || log.timestamp
        return timestamp ? new Date(timestamp).toLocaleString() : 'N/A'
      },
    },
  ]

  const stats = {
    total: logs.length,
    security: logs.filter(l => l.type === "security").length,
    activity: logs.filter(l => l.type === "activity").length,
    webhooks: logs.filter(l => l.type === "webhook").length,
    scans: logs.filter(l => l.type === "scan").length,
    payments: logs.filter(l => l.type === "payment").length,
    failed: logs.filter(l => {
      if (l.type === 'scan') return l.success === false
      if (l.type === 'activity') return l.statusCode && (l.statusCode < 200 || l.statusCode >= 300)
      if (l.type === 'security') return l.severity === 'high' || l.severity === 'critical'
      if (l.type === 'payment') return l.status !== 'paid' && l.status !== 'completed'
      return false
    }).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Security & Activity Logs</h1>
        <p className="text-muted-foreground">Monitor system activity and security events</p>
      </div>

             {/* Statistics Cards */}
       <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.security}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activity}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.webhooks}</div>
          </CardContent>
        </Card>

                 <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Scans</CardTitle>
             <CheckCircle className="h-4 w-4 text-green-600" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-green-600">{stats.scans}</div>
           </CardContent>
         </Card>

         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Payments</CardTitle>
             <DollarSign className="h-4 w-4 text-green-600" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-green-600">{stats.payments}</div>
           </CardContent>
         </Card>

         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Failed</CardTitle>
             <XCircle className="h-4 w-4 text-red-600" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
           </CardContent>
         </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
                         <SelectItem value="all">All Types</SelectItem>
             <SelectItem value="security">Security</SelectItem>
             <SelectItem value="activity">Activity</SelectItem>
             <SelectItem value="webhook">Webhooks</SelectItem>
             <SelectItem value="scan">Scans</SelectItem>
             <SelectItem value="payment">Payments</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Loading logs...</div>
          ) : (
                         <DataTable
               columns={columns}
               data={filteredLogs}
               searchKey=""
             />
          )}
        </CardContent>
      </Card>
    </div>
  )
}