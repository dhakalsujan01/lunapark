import connectDB from '@/lib/mongodb'
import SecurityLog from '@/models/SecurityLog'
import ActivityLog from '@/models/ActivityLog'
import WebhookLog from '@/models/WebhookLog'
import Order from '@/models/Order'
import Ticket from '@/models/Ticket'

// Monitoring configuration
const MONITORING_CONFIG = {
  // Alert thresholds
  maxFailedPayments: 5, // per hour
  maxFailedLogins: 10, // per hour
  maxFailedTicketValidations: 20, // per hour
  maxWebhookFailures: 3, // per hour
  maxResponseTime: 5000, // 5 seconds
  
  // Health check intervals
  healthCheckInterval: 60000, // 1 minute
  alertCooldown: 300000, // 5 minutes
  
  // Email settings
  alertEmailTo: process.env.ADMIN_EMAIL || 'admin@lunapark.com',
  enableEmailAlerts: process.env.ENABLE_EMAIL_ALERTS === 'true',
}

interface Alert {
  id: string
  type: 'error' | 'warning' | 'info'
  category: 'security' | 'performance' | 'business' | 'system'
  title: string
  description: string
  metadata?: any
  timestamp: Date
  resolved: boolean
}

class MonitoringService {
  private alerts: Map<string, Alert> = new Map()
  private lastAlertTime: Map<string, number> = new Map()
  private metrics: Map<string, any> = new Map()

  async logActivity(activity: {
    type: string
    userId?: string
    description: string
    metadata?: any
    ipAddress?: string
    userAgent?: string
  }) {
    try {
      await connectDB()
      await ActivityLog.create({
        ...activity,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }

  async checkSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical'
    checks: Array<{ name: string; status: 'pass' | 'fail'; message?: string; responseTime?: number }>
  }> {
    const checks = []
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy'

    // Database connectivity check
    try {
      const start = Date.now()
      await connectDB()
      const responseTime = Date.now() - start
      
      checks.push({
        name: 'Database Connection',
        status: (responseTime < 1000 ? 'pass' : 'fail') as 'pass' | 'fail',
        responseTime,
        message: responseTime < 1000 ? 'Connected' : `Slow response: ${responseTime}ms`
      })

      if (responseTime >= 1000) {
        overallStatus = 'warning'
      }
    } catch (error) {
      checks.push({
        name: 'Database Connection',
        status: 'fail' as 'pass' | 'fail',
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
      overallStatus = 'critical'
    }

    // Recent error rate check
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      
      const recentErrors = await Promise.all([
        SecurityLog.countDocuments({ 
          timestamp: { $gte: oneHourAgo },
          severity: { $in: ['high', 'critical'] }
        }),
        WebhookLog.countDocuments({
          timestamp: { $gte: oneHourAgo },
          status: 'failed'
        }),
        Order.countDocuments({
          createdAt: { $gte: oneHourAgo },
          status: 'cancelled'
        })
      ])

      const [securityErrors, webhookErrors, cancelledOrders] = recentErrors

      checks.push({
        name: 'Error Rate',
        status: ((securityErrors + webhookErrors) < 10 ? 'pass' : 'fail') as 'pass' | 'fail',
        message: `${securityErrors} security errors, ${webhookErrors} webhook failures, ${cancelledOrders} cancelled orders in last hour`
      })

      if (securityErrors + webhookErrors >= 10) {
        overallStatus = overallStatus === 'critical' ? 'critical' : 'warning'
      }
    } catch (error) {
      checks.push({
        name: 'Error Rate',
        status: 'fail',
        message: 'Failed to check error rates'
      })
    }

    // Business metrics check
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [todayOrders, todayTickets, pendingOrders] = await Promise.all([
        Order.countDocuments({ createdAt: { $gte: today } }),
        Ticket.countDocuments({ createdAt: { $gte: today } }),
        Order.countDocuments({ status: 'pending', createdAt: { $lte: new Date(Date.now() - 30 * 60 * 1000) } })
      ])

      checks.push({
        name: 'Business Metrics',
        status: pendingOrders < 10 ? 'pass' : 'fail',
        message: `${todayOrders} orders, ${todayTickets} tickets today. ${pendingOrders} stale pending orders`
      })

      if (pendingOrders >= 10) {
        overallStatus = overallStatus === 'critical' ? 'critical' : 'warning'
      }
    } catch (error) {
      checks.push({
        name: 'Business Metrics',
        status: 'fail',
        message: 'Failed to check business metrics'
      })
    }

    return { status: overallStatus, checks }
  }

  async createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): Promise<string> {
    const alertId = `${alert.category}_${alert.type}_${Date.now()}`
    const alertKey = `${alert.category}_${alert.type}_${alert.title}`
    
    // Check cooldown to prevent spam
    const lastAlert = this.lastAlertTime.get(alertKey)
    if (lastAlert && Date.now() - lastAlert < MONITORING_CONFIG.alertCooldown) {
      return alertId // Skip duplicate alert
    }

    const fullAlert: Alert = {
      ...alert,
      id: alertId,
      timestamp: new Date(),
      resolved: false,
    }

    this.alerts.set(alertId, fullAlert)
    this.lastAlertTime.set(alertKey, Date.now())

    // Log to activity log
    await this.logActivity({
      type: 'alert_created',
      description: `${alert.category} alert: ${alert.title}`,
      metadata: alert.metadata,
    })

    // Send email if configured
    if (MONITORING_CONFIG.enableEmailAlerts) {
      await this.sendAlertEmail(fullAlert)
    }

    console.warn(`🚨 ALERT [${alert.category}/${alert.type}]: ${alert.title}`)
    console.warn(`📋 Description: ${alert.description}`)
    if (alert.metadata) {
      console.warn(`📊 Metadata:`, alert.metadata)
    }

    return alertId
  }

  private async sendAlertEmail(alert: Alert) {
    try {
      const { sendOrderConfirmationEmail } = await import('@/lib/email')
      
      // This is a simple implementation - in production you'd want a dedicated alert email template
      await sendOrderConfirmationEmail({
        customerEmail: MONITORING_CONFIG.alertEmailTo,
        customerName: 'System Administrator',
        orderNumber: `ALERT-${alert.id}`,
        totalAmount: 0,
        currency: 'eur'
      })
    } catch (error) {
      console.error('Failed to send alert email:', error)
    }
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.get(alertId)
    if (alert) {
      alert.resolved = true
      await this.logActivity({
        type: 'alert_resolved',
        description: `Resolved alert: ${alert.title}`,
        metadata: { alertId },
      })
      return true
    }
    return false
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved)
  }

  async updateMetrics() {
    try {
      await connectDB()

      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const metrics = await Promise.all([
        // Orders
        Order.countDocuments({ createdAt: { $gte: oneHourAgo } }),
        Order.countDocuments({ createdAt: { $gte: oneDayAgo } }),
        Order.countDocuments({ status: 'paid', createdAt: { $gte: oneDayAgo } }),
        
        // Tickets
        Ticket.countDocuments({ createdAt: { $gte: oneHourAgo } }),
        Ticket.countDocuments({ status: 'used', createdAt: { $gte: oneDayAgo } }),
        
        // Security
        SecurityLog.countDocuments({ timestamp: { $gte: oneHourAgo } }),
        
        // Revenue
        Order.aggregate([
          { $match: { status: 'paid', createdAt: { $gte: oneDayAgo } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
      ])

      const [
        ordersLastHour,
        ordersToday,
        paidOrdersToday,
        ticketsLastHour,
        usedTicketsToday,
        securityEventsLastHour,
        revenueResult
      ] = metrics

      this.metrics.set('orders_last_hour', ordersLastHour)
      this.metrics.set('orders_today', ordersToday)
      this.metrics.set('paid_orders_today', paidOrdersToday)
      this.metrics.set('tickets_last_hour', ticketsLastHour)
      this.metrics.set('used_tickets_today', usedTicketsToday)
      this.metrics.set('security_events_last_hour', securityEventsLastHour)
      this.metrics.set('revenue_today', revenueResult[0]?.total || 0)
      this.metrics.set('last_updated', now)

      // Check for anomalies
      await this.checkAnomalies()

    } catch (error) {
      console.error('Failed to update metrics:', error)
      await this.createAlert({
        type: 'error',
        category: 'system',
        title: 'Metrics Update Failed',
        description: 'Failed to update system metrics',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    }
  }

  private async checkAnomalies() {
    const securityEvents = this.metrics.get('security_events_last_hour') || 0
    
    if (securityEvents > MONITORING_CONFIG.maxFailedLogins) {
      await this.createAlert({
        type: 'warning',
        category: 'security',
        title: 'High Security Event Rate',
        description: `${securityEvents} security events in the last hour`,
        metadata: { count: securityEvents, threshold: MONITORING_CONFIG.maxFailedLogins }
      })
    }

    // Check for webhook failures
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const failedWebhooks = await WebhookLog.countDocuments({
        timestamp: { $gte: oneHourAgo },
        status: 'failed'
      })

      if (failedWebhooks > MONITORING_CONFIG.maxWebhookFailures) {
        await this.createAlert({
          type: 'error',
          category: 'system',
          title: 'Webhook Failures',
          description: `${failedWebhooks} webhook failures in the last hour`,
          metadata: { count: failedWebhooks, threshold: MONITORING_CONFIG.maxWebhookFailures }
        })
      }
    } catch (error) {
      console.error('Failed to check webhook anomalies:', error)
    }
  }

  getMetrics() {
    return Object.fromEntries(this.metrics.entries())
  }

  startMonitoring() {
    // Update metrics every minute
    setInterval(() => {
      this.updateMetrics()
    }, MONITORING_CONFIG.healthCheckInterval)

    console.log('🔍 Monitoring service started')
  }
}

// Singleton instance
export const monitoring = new MonitoringService()

// Utility functions for easy logging
export async function logUserAction(action: string, userId: string, details?: any, ipAddress?: string) {
  await monitoring.logActivity({
    type: 'user_action',
    userId,
    description: action,
    metadata: details,
    ipAddress,
  })
}

export async function logSecurityEvent(event: string, details?: any, userId?: string, ipAddress?: string) {
  await monitoring.logActivity({
    type: 'security_event',
    userId,
    description: event,
    metadata: details,
    ipAddress,
  })

  // Create alert for critical security events
  if (event.includes('failed') || event.includes('suspicious') || event.includes('blocked')) {
    await monitoring.createAlert({
      type: 'warning',
      category: 'security',
      title: 'Security Event',
      description: event,
      metadata: { details, userId, ipAddress }
    })
  }
}

export async function logBusinessEvent(event: string, details?: any, userId?: string) {
  await monitoring.logActivity({
    type: 'business_event',
    userId,
    description: event,
    metadata: details,
  })
}

export async function createAlert(
  type: Alert['type'],
  category: Alert['category'],
  title: string,
  description: string,
  metadata?: any
) {
  return monitoring.createAlert({ type, category, title, description, metadata })
}
