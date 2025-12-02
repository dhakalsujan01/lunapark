import mongoose, { type Document, Schema } from "mongoose"

export interface ITicketScanLog extends Document {
  ticket: mongoose.Types.ObjectId
  scannedBy: mongoose.Types.ObjectId
  success: boolean
  details: string
  location?: string
  device?: string
  ipAddress?: string
  qrCode?: string
  scannedAt: Date
  metadata?: {
    isDuplicateAttempt?: boolean
    recentScanCount?: number
    userAgent?: string
    scanType?: string
    [key: string]: any
  }
  createdAt: Date
}

const TicketScanLogSchema = new Schema<ITicketScanLog>(
  {
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    scannedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "Main Entrance",
    },
    device: String,
    ipAddress: String,
    qrCode: String,
    scannedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
)

// Indexes for efficient querying
TicketScanLogSchema.index({ ticket: 1, createdAt: -1 })
TicketScanLogSchema.index({ scannedBy: 1, createdAt: -1 })
TicketScanLogSchema.index({ success: 1, createdAt: -1 })
TicketScanLogSchema.index({ scannedAt: -1 })

export default mongoose.models.TicketScanLog || mongoose.model<ITicketScanLog>("TicketScanLog", TicketScanLogSchema)