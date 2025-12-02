import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import Ride from "@/models/Ride"
import Package from "@/models/Package"
import TicketScanLog from "@/models/TicketScanLog"
import { withAuth } from "@/lib/auth-middleware"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { createErrorResponse, createSuccessResponse, CommonErrors } from "@/lib/api-response"
import * as crypto from "crypto"

// Scan cooldown storage (in-memory for now, could be moved to database)
const scanCooldownMap = new Map<string, { lastScan: number; ticketId: string }>()

// POST /api/tickets/validate - Validate and mark QR ticket as used
async function validateTicket(req: NextRequest, context: any, { session }: any) {
  try {
    await connectDB()

    const { qrCode, simpleCode, location } = await req.json()

    if (!qrCode && !simpleCode) {
      return createErrorResponse("QR code or simple code is required", 400, { code: "MISSING_INPUT" })
    }

    // SECURITY: Rate limiting per user to prevent brute force attacks
    const userId = session.user.id
    const clientIP = await getClientIP(req)
    const now = Date.now()
    
    const rateLimitResult = await checkRateLimit(userId, "ticket_validation", clientIP)
    
    if (!rateLimitResult.allowed) {
      console.warn(`Rate limit exceeded for user ${userId} from IP ${clientIP}`)
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      return createErrorResponse(
        "Too many attempts. Please wait before trying again.",
        429,
        { code: "RATE_LIMITED", retryAfter }
      )
    }

    // SECURITY: Input sanitization
    const sanitizedLocation = location ? location.toString().trim().substring(0, 100) : undefined
    let ticket, ticketData, qrData, signature

    if (simpleCode) {
      // Handle simple code validation
      const sanitizedSimpleCode = simpleCode.toString().trim().toUpperCase()
      
      if (sanitizedSimpleCode.length > 20) {
        return NextResponse.json({ error: "Simple code too long" }, { status: 400 })
      }
      
      // Validate simple code format (LP-ABC123)
      if (!/^LP-[BCDFGHJKLMNPQRSTVWXZ]{3}[23456789]{3}$/.test(sanitizedSimpleCode)) {
        return NextResponse.json({ error: "Invalid simple code format. Expected: LP-ABC123" }, { status: 400 })
      }

      // Find ticket by simple code
      ticket = await Ticket.findOne({ 
        simpleCode: sanitizedSimpleCode,
        simpleCodeExpiry: { $gte: new Date() } // Check if simple code hasn't expired
      }).populate("user", "name email")

      if (!ticket) {
        return NextResponse.json({ error: "Simple code not found or expired" }, { status: 404 })
      }

      // Create mock ticket data for logging
      ticketData = { ticketId: (ticket._id as any).toString(), type: 'simple_code' }
      
    } else {
      // Handle QR code validation (existing logic)
      const sanitizedQrCode = qrCode.toString().trim()

      if (sanitizedQrCode.length > 1000) {
        return NextResponse.json({ error: "QR code too long" }, { status: 400 })
      }

      // Parse QR code (format: base64Data.signature) with proper validation
      const parts = sanitizedQrCode.split(".")
      if (parts.length !== 2) {
        return NextResponse.json({ error: "Invalid QR code format" }, { status: 400 })
      }
      
      qrData = parts[0]
      signature = parts[1]

      // Validate base64 format before decoding
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(qrData)) {
        return NextResponse.json({ error: "Invalid QR code encoding" }, { status: 400 })
      }

      // Validate signature format (hex)
      if (!/^[a-fA-F0-9]+$/.test(signature)) {
        return NextResponse.json({ error: "Invalid QR code signature format" }, { status: 400 })
      }

      // Decode QR data with proper error handling
      try {
        const decodedData = Buffer.from(qrData, "base64").toString()
        if (!decodedData || decodedData.length === 0) {
          return NextResponse.json({ error: "Empty QR code data" }, { status: 400 })
        }
        ticketData = JSON.parse(decodedData)
        
        // Validate required fields in ticket data
        if (!ticketData || (typeof ticketData !== 'object')) {
          return NextResponse.json({ error: "Invalid QR code structure" }, { status: 400 })
        }
        
        if (!ticketData.ticketId && !ticketData.qrId) {
          return NextResponse.json({ error: "Missing ticket identifier in QR code" }, { status: 400 })
        }
      } catch (error) {
        return NextResponse.json({ error: "Invalid QR code data format" }, { status: 400 })
      }

      // Find ticket by QR data (existing logic)
      if (ticketData.qrId) {
        ticket = await Ticket.findOne({ qrId: ticketData.qrId }).populate("user", "name email")
      } else if (ticketData.ticketId) {
        ticket = await Ticket.findById(ticketData.ticketId).populate("user", "name email")
      } else {
        return NextResponse.json({ error: "Invalid QR code: missing identifiers" }, { status: 400 })
      }
    }

    // SCAN COOLDOWN: Prevent rapid duplicate scans of the same ticket
    const cooldownKey = `${userId}:${ticketData.ticketId || ticketData.qrId}`
    const userScanCooldown = scanCooldownMap.get(cooldownKey)
    
    if (userScanCooldown && now - userScanCooldown.lastScan < 3000) { // 3 second cooldown
      console.warn(`Scan cooldown active for user ${userId} and ticket ${ticketData.ticketId}`)
      return NextResponse.json({ 
        error: "Please wait before scanning the same ticket again",
        details: {
          cooldownRemaining: Math.ceil((3000 - (now - userScanCooldown.lastScan)) / 1000)
        }
      }, { status: 429 })
    }
    
    // Update scan cooldown
    scanCooldownMap.set(cooldownKey, { lastScan: now, ticketId: ticketData.ticketId || ticketData.qrId })
    
    // Manually populate the item based on type to avoid schema errors
    if (ticket) {
      try {
        if (ticket.type === "ride") {
          const rideItem = await Ride.findById(ticket.item)
          ticket.item = rideItem
          
          // Check if this ride ticket is part of a package
          if (ticket.metadata && ticket.metadata.packageId) {
            const packageItem = await Package.findById(ticket.metadata.packageId)
            if (packageItem) {
              ticket.packageInfo = {
                _id: packageItem._id,
                name: packageItem.name,
                price: packageItem.price
              }
            } else {
              // Fallback to metadata if package not found
              ticket.packageInfo = {
                _id: ticket.metadata.packageId,
                name: ticket.metadata.packageName || "Package",
                price: 0
              } as any
            }
          }
        } else if (ticket.type === "package") {
          const packageItem = await Package.findById(ticket.item)
          ticket.item = packageItem
        }
      } catch (err) {
        console.warn(`Failed to populate item for ticket ${ticket._id}:`, err)
      }
    }

    if (!ticket) {
      return CommonErrors.NOT_FOUND("Ticket")
    }

    // Validate signature with timing attack protection (only for QR codes, not simple codes)
    if (!simpleCode) {
      const isValidSignature = await validateSignatureSecurely(ticket, signature, qrData, ticketData)
      if (!isValidSignature) {
        await logScanAttempt((ticket._id as any).toString(), session.user.id, sanitizedLocation, false, "Invalid signature", req)
        return NextResponse.json({ error: "Invalid ticket signature" }, { status: 400 })
      }
    }

    // Check if ticket is already used
    if (ticket.status === "used") {
      await logScanAttempt((ticket._id as any).toString(), session.user.id, location, false, "Already used")
      return NextResponse.json({ 
        error: "This ticket has already been used"
      }, { status: 400 })
    }

    // Check if ticket is valid
    if (ticket.status !== "valid") {
      await logScanAttempt((ticket._id as any).toString(), session.user.id, location, false, `Status: ${ticket.status}`)
      return NextResponse.json({ error: "This ticket is not valid" }, { status: 400 })
    }

    // Check if ticket is expired
    if (new Date() > ticket.validUntil) {
      ticket.status = "expired"
      await ticket.save()
      await logScanAttempt((ticket._id as any).toString(), session.user.id, location, false, "Expired")
      return NextResponse.json({ error: "Ticket has expired" }, { status: 400 })
    }

    // Check if ticket is valid for today's date
    if (!ticket.isValidForDate()) {
      const visitDateStr = new Date(ticket.visitDate).toLocaleDateString()
      const todayStr = new Date().toLocaleDateString()
      await logScanAttempt((ticket._id as any).toString(), session.user.id, location, false, `Wrong visit date: ticket for ${visitDateStr}, today is ${todayStr}`)
      return NextResponse.json({ 
        error: "This ticket is not valid for today's date"
      }, { status: 400 })
    }

    // Check if ticket is valid from date
    if (new Date() < ticket.validFrom) {
      await logScanAttempt((ticket._id as any).toString(), session.user.id, location, false, "Not yet valid")
      return NextResponse.json({ error: "Ticket is not yet valid" }, { status: 400 })
    }

    // Check usage limits
    if (ticket.currentUsage >= ticket.maxUsage) {
      ticket.status = "used"
      await ticket.save()
      await logScanAttempt((ticket._id as any).toString(), session.user.id, location, false, "Usage limit exceeded")
      return NextResponse.json({ error: "Ticket usage limit exceeded" }, { status: 400 })
    }

    // ATOMIC UPDATE: Use findOneAndUpdate to prevent race conditions
    const scanTime = new Date()
    
    // More robust atomic update with all necessary conditions
    const updateQuery = {
      _id: ticket._id,
      status: "valid", // Only update if still valid
      currentUsage: { $lt: ticket.maxUsage }, // Only if usage limit not exceeded
      validUntil: { $gt: scanTime }, // Ensure ticket hasn't expired
      validFrom: { $lte: scanTime }, // Ensure ticket is valid from current time
    }
    
    // Calculate new usage count first
    const newUsageCount = ticket.currentUsage + 1
    const willBeUsedUp = newUsageCount >= ticket.maxUsage
    
    // Atomic update with conditional status change using aggregation pipeline
    const updatedTicket = await Ticket.findOneAndUpdate(
      updateQuery,
      [
        {
          $set: {
            currentUsage: newUsageCount,
            scanCount: { $add: ["$scanCount", 1] },
            scanLocation: sanitizedLocation || "$scanLocation",
            lastScannedAt: scanTime,
            lastScannedBy: session.user.id,
            status: willBeUsedUp ? "used" : "$status",
            usedAt: willBeUsedUp ? scanTime : "$usedAt",
            usedBy: willBeUsedUp ? session.user.id : "$usedBy"
          }
        }
      ],
      { 
        new: true, 
        runValidators: true,
      }
    )
    
    // If update failed, ticket was already used or modified
    if (!updatedTicket) {
      await logScanAttempt((ticket._id as any).toString(), session.user.id, location, false, "Ticket already processed or invalid")
      return NextResponse.json({ 
        error: "This ticket has already been used"
      }, { status: 400 })
    }
    
    // Update our local ticket object with the new values
    ticket.currentUsage = updatedTicket.currentUsage
    ticket.status = updatedTicket.status
    ticket.usedAt = updatedTicket.usedAt
    ticket.usedBy = updatedTicket.usedBy
    ticket.scanLocation = updatedTicket.scanLocation
    ticket.scanCount = updatedTicket.scanCount

    // Log successful scan with enhanced security info
    await logScanAttempt(
      (ticket._id as any).toString(), 
      session.user.id, 
      sanitizedLocation, 
      true, 
      "Valid ticket scanned",
      req
    )

    // Prepare response with proper item details
    const responseData = {
      id: ticket._id,
      type: ticket.type,
      user: ticket.user,
      item: {
        _id: ticket.item._id || ticket.item,
        name: ticket.item.name || ticket.item.title || "Unknown Item",
        title: ticket.item.title || ticket.item.name || "Unknown Item"
      },
      packageInfo: ticket.packageInfo || null,
      status: ticket.status,
      usageRemaining: ticket.maxUsage - ticket.currentUsage,
      validUntil: ticket.validUntil,
      currentUsage: ticket.currentUsage,
      maxUsage: ticket.maxUsage,
      usedAt: ticket.usedAt,
    }

    return createSuccessResponse(
      responseData,
      ticket.status === "used" ? "Ticket validated and marked as used" : "Ticket validated"
    )

  } catch (error) {
    console.error("Error validating ticket:", error)
    return CommonErrors.INTERNAL_ERROR("Failed to validate ticket")
  }
}

// SECURITY: Timing attack resistant signature validation
async function validateSignatureSecurely(ticket: any, signature: string, qrData: string, ticketData: any): Promise<boolean> {
  return new Promise((resolve) => {
    // Add random delay to prevent timing attacks
    const delay = Math.random() * 10 + 5
    setTimeout(() => {
      try {
        // Use standardized validation method
        const secret = process.env.NEXTAUTH_SECRET
        if (!secret) {
          console.error("NEXTAUTH_SECRET not configured")
          resolve(false)
          return
        }
        const expectedSignature = crypto.createHmac("sha256", secret).update(qrData).digest("hex")
        const isValid = signature === expectedSignature
        
        resolve(isValid)
      } catch (error) {
        console.warn("Signature validation error:", error)
        resolve(false)
      }
    }, delay)
  })
}

// Enhanced scan logging with security info and duplicate detection
async function logScanAttempt(
  ticketId: string, 
  scannedBy: string, 
  location: string | undefined, 
  success: boolean, 
  details: string,
  req?: NextRequest,
  additionalInfo?: any
) {
  try {
    // Extract security information
    const ipAddress = req?.headers.get('x-forwarded-for') || 
                     req?.headers.get('x-real-ip') || 
                     'unknown'
    
    const userAgent = req?.headers.get('user-agent') || 'unknown'
    const device = userAgent.substring(0, 200) // Limit device info length
    
    // Check for recent scans by same user for duplicate detection
    const recentScans = await TicketScanLog.find({
      ticket: ticketId,
      scannedBy,
      scannedAt: { $gte: new Date(Date.now() - 10000) } // Last 10 seconds
    }).sort({ scannedAt: -1 }).limit(3)

    const isDuplicateAttempt = recentScans.length > 0 && 
                              recentScans.some(scan => scan.success === success)

    const scanLog = new TicketScanLog({
      ticket: ticketId,
      scannedBy,
      location: location || 'Unknown',
      success,
      details: isDuplicateAttempt ? `${details} (Potential duplicate)` : details,
      device,
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
      qrCode: success ? undefined : 'invalid_attempt', // Don't log valid QR codes for privacy
      scannedAt: new Date(),
      metadata: {
        isDuplicateAttempt,
        recentScanCount: recentScans.length,
        userAgent: userAgent.substring(0, 100),
        ...additionalInfo
      }
    })
    await scanLog.save()
    
    // Log warning for potential duplicates
    if (isDuplicateAttempt) {
      console.warn(`Potential duplicate scan detected for ticket ${ticketId} by user ${scannedBy}`)
    }
  } catch (error) {
    console.error("Error logging scan attempt:", error)
  }
}

export const POST = withAuth(validateTicket, "checker")