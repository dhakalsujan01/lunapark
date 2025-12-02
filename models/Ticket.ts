import mongoose, { type Document, Schema } from "mongoose"
import crypto from "crypto"

export interface ITicket extends Document {
  user: mongoose.Types.ObjectId
  order: mongoose.Types.ObjectId
  type: "ride" | "package"
  item: mongoose.Types.ObjectId
  
  // Enhanced QR Code System
  qrId: string // Unique QR identifier
  qrCode: string
  qrSignature: string
  qrVersion: number // For QR code versioning
  
  // Human-friendly Simple Code System
  simpleCode: string // Short, easy-to-type code (e.g., "LP-ABC123")
  simpleCodeExpiry: Date // When simple code expires
  
  // Ticket Status & Lifecycle
  status: "valid" | "used" | "expired" | "cancelled" | "refunded"
  validFrom: Date
  validUntil: Date
  visitDate: Date // Specific date this ticket is valid for
  purchaseDate: Date
  usedAt?: Date
  usedBy?: mongoose.Types.ObjectId
  scanLocation?: string
  scanCount: number
  
  // Usage Rules
  maxUsage: number
  currentUsage: number
  allowPartialUse: boolean
  
  // Financial Information
  purchasePrice: number
  currency: string
  refundAmount?: number
  refundReason?: string
  
  // Enhanced Features
  transferable: boolean
  giftTicket: boolean
  specialRequirements?: string[]
  accessibilityFeatures?: string[]
  
  // Email & Notifications
  emailSent: boolean
  emailSentAt?: Date
  remindersSent: number
  
  // Metadata
  metadata: {
    purchaseChannel: "online" | "onsite" | "mobile" | "partner"
    customerNotes?: string
    internalNotes?: string
    promoCode?: string
    discount?: number
    // Extended fields used by the package system and date normalization
    packageId?: mongoose.Types.ObjectId
    packageName?: string
    visitDate?: string
  }
  
  createdAt: Date
  updatedAt: Date
  
  // Methods
  generateQRCode(): string
  generateSimpleCode(): string
  validateSignature(signature: string): boolean
  isExpired(): boolean
  isValidForDate(date?: Date): boolean
  canBeUsed(): boolean
  getRemainingUsage(): number
}

const TicketSchema = new Schema<ITicket>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    type: {
      type: String,
      enum: ["ride", "package"],
      required: true,
    },
    item: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    
    // Enhanced QR Code System
    qrId: {
      type: String,
      required: false, // Will be generated after first save
    },
    qrCode: {
      type: String,
      required: false, // Will be generated after first save
    },
    qrSignature: {
      type: String,
      required: false, // Will be generated after first save
    },
    qrVersion: {
      type: Number,
      default: 1,
    },
    
    // Human-friendly Simple Code System
    simpleCode: {
      type: String,
      required: false, // Will be generated after first save
    },
    simpleCodeExpiry: {
      type: Date,
      required: false,
    },
    
    // Ticket Status & Lifecycle
    status: {
      type: String,
      enum: ["valid", "used", "expired", "cancelled", "refunded"],
      default: "valid",
    },
    validFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    visitDate: {
      type: Date,
      required: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    usedAt: Date,
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    scanLocation: String,
    scanCount: {
      type: Number,
      default: 0,
    },
    
    // Usage Rules
    maxUsage: {
      type: Number,
      default: 1,
      min: 1,
    },
    currentUsage: {
      type: Number,
      default: 0,
      min: 0,
    },
    allowPartialUse: {
      type: Boolean,
      default: false,
    },
    
    // Financial Information
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "eur",
      enum: ["eur", "gbp"],
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
    refundReason: String,
    
    // Enhanced Features
    transferable: {
      type: Boolean,
      default: false,
    },
    giftTicket: {
      type: Boolean,
      default: false,
    },
    specialRequirements: [String],
    accessibilityFeatures: [String],
    
    // Email & Notifications
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: Date,
    remindersSent: {
      type: Number,
      default: 0,
    },
    
    // Metadata
    metadata: {
      purchaseChannel: {
        type: String,
        enum: ["online", "onsite", "mobile", "partner"],
        default: "online",
      },
      customerNotes: String,
      internalNotes: String,
      promoCode: String,
      discount: {
        type: Number,
        min: 0,
        max: 100,
      },
      // Extended fields used by the package system and date normalization
      packageId: { type: Schema.Types.ObjectId, ref: "Package" },
      packageName: String,
      visitDate: String,
    },
  },
  {
    timestamps: true,
  },
)

// Generate unique QR ID
function generateQRId(): string {
  const timestamp = Date.now().toString()
  const random = crypto.randomBytes(8).toString('hex').toUpperCase()
  const microseconds = process.hrtime.bigint().toString().slice(-6)
  return `QR${timestamp.slice(-8)}${random}${microseconds}`
}

// Generate human-friendly simple code (e.g., "LP-ABC123")
function generateSimpleCode(): string {
  // Use consonants and numbers (excluding similar-looking characters)
  const consonants = 'BCDFGHJKLMNPQRSTVWXZ' // No vowels to avoid words
  const numbers = '23456789' // No 0, 1 to avoid confusion with O, I
  
  // Generate 3 consonants + 3 numbers
  let code = 'LP-' // Luna Park prefix
  
  // Add 3 consonants
  for (let i = 0; i < 3; i++) {
    code += consonants[Math.floor(Math.random() * consonants.length)]
  }
  
  // Add 3 numbers
  for (let i = 0; i < 3; i++) {
    code += numbers[Math.floor(Math.random() * numbers.length)]
  }
  
  return code
}

// Generate robust QR code with enhanced security
TicketSchema.methods.generateQRCode = function (): string {
  // Generate unique QR ID if not exists
  if (!this.qrId) {
    this.qrId = generateQRId()
  }
  
  // Use ticket ID if available, otherwise use a temporary placeholder
  const ticketId = this._id ? this._id.toString() : `temp_${this.qrId}`
  
  const data = {
    qrId: this.qrId,
    ticketId: ticketId,
    userId: this.user.toString(),
    orderId: this.order.toString(),
    type: this.type,
    itemId: this.item.toString(),
    validFrom: this.validFrom.toISOString(),
    validUntil: this.validUntil.toISOString(),
    maxUsage: this.maxUsage,
    currentUsage: this.currentUsage,
    status: this.status,
    purchasePrice: this.purchasePrice,
    currency: this.currency,
    version: this.qrVersion || 1,
    timestamp: Date.now(),
    security: crypto.randomBytes(8).toString('hex'), // Enhanced security
    checksum: crypto.createHash('md5').update(`${this._id}${this.user}${this.validUntil}`).digest('hex').substring(0, 8)
  }

  const qrData = Buffer.from(JSON.stringify(data)).toString("base64")
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET not configured")
  }
  const signature = crypto.createHmac("sha256", secret).update(qrData).digest("hex")

  this.qrCode = qrData
  this.qrSignature = signature

  console.log(`Generated QR code for ticket ${this._id}: ${qrData.length} chars, signature: ${signature.substring(0, 16)}...`)

  return `${qrData}.${signature}`
}

// Generate human-friendly simple code
TicketSchema.methods.generateSimpleCode = function (): string {
  // Generate simple code if not exists
  if (!this.simpleCode) {
    let attempts = 0
    let code
    
    // Try to generate unique code (max 10 attempts)
    do {
      code = generateSimpleCode()
      attempts++
    } while (attempts < 10) // In practice, collision is extremely rare
    
    this.simpleCode = code
    
    // Set expiry to same as ticket validity
    this.simpleCodeExpiry = this.validUntil
  }
  
  console.log(`Generated simple code for ticket ${this._id}: ${this.simpleCode}`)
  return this.simpleCode
}

// Validate QR signature
TicketSchema.methods.validateSignature = function (signature: string): boolean {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET not configured")
  }
  const expectedSignature = crypto.createHmac("sha256", secret).update(this.qrCode).digest("hex")
  return signature === expectedSignature
}

// Check if ticket is expired
TicketSchema.methods.isExpired = function (): boolean {
  return new Date() > this.validUntil
}

// Check if ticket is valid for a specific date (defaults to today)
TicketSchema.methods.isValidForDate = function (date?: Date): boolean {
  const checkDate = date || new Date()
  const visitDate = new Date(this.visitDate)
  
  // Set both dates to start of day for proper comparison
  const checkDateOnly = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate())
  const visitDateOnly = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate())
  
  return checkDateOnly.getTime() === visitDateOnly.getTime()
}

// Check if ticket can be used
TicketSchema.methods.canBeUsed = function (): boolean {
  if (this.status !== "valid") return false
  if (this.isExpired()) return false
  if (!this.isValidForDate()) return false // Check if valid for today
  if (new Date() < this.validFrom) return false
  if (this.currentUsage >= this.maxUsage) return false
  return true
}

// Get remaining usage count
TicketSchema.methods.getRemainingUsage = function (): number {
  return Math.max(0, this.maxUsage - this.currentUsage)
}

// Auto-generate QR code and simple code before saving
TicketSchema.pre("save", function (next) {
  // Generate QR ID if new ticket and missing
  if (this.isNew && !this.qrId) {
    this.qrId = generateQRId()
  }
  
  // Auto-generate QR code if missing (only for existing tickets with _id)
  if (!this.qrCode && this._id) {
    try {
      this.generateQRCode()
    } catch (error) {
      console.error("Error in pre-save QR generation:", error)
      // Don't fail the save, let it continue without QR code for now
    }
  }
  
  // Auto-generate simple code if missing (only for existing tickets with _id)
  if (!this.simpleCode && this._id) {
    try {
      this.generateSimpleCode()
    } catch (error) {
      console.error("Error in pre-save simple code generation:", error)
      // Don't fail the save
    }
  }
  
  // Update status based on expiry
  if (this.isExpired() && this.status === "valid") {
    this.status = "expired"
  }
  
  next()
})

// Enhanced indexes for performance and uniqueness
TicketSchema.index({ qrId: 1 }, { unique: true, sparse: true })
TicketSchema.index({ qrCode: 1 }, { unique: true, sparse: true })
TicketSchema.index({ simpleCode: 1 }, { unique: true, sparse: true })
TicketSchema.index({ user: 1, status: 1 })
TicketSchema.index({ order: 1 })
TicketSchema.index({ validUntil: 1 })
TicketSchema.index({ validFrom: 1 })
TicketSchema.index({ visitDate: 1 })
TicketSchema.index({ status: 1, validUntil: 1 })
TicketSchema.index({ type: 1, item: 1 })
TicketSchema.index({ emailSent: 1, emailSentAt: 1 })
TicketSchema.index({ purchaseDate: 1 })
TicketSchema.index({ "metadata.purchaseChannel": 1 })

// Compound indexes for analytics
TicketSchema.index({ createdAt: -1, status: 1 })
TicketSchema.index({ purchaseDate: -1, type: 1 })

// Compound indexes for common query patterns
TicketSchema.index({ simpleCode: 1, simpleCodeExpiry: 1 })
TicketSchema.index({ _id: 1, user: 1 })
TicketSchema.index({ status: 1, validFrom: 1, validUntil: 1 })
TicketSchema.index({ user: 1, status: 1, validUntil: 1 })

// Export the model, ensuring it's only defined once
export default mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema)
