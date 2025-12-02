import mongoose, { type Document, Schema } from "mongoose"

export interface ISecurityLog extends Document {
  type: "login_success" | "login_failed" | "password_reset" | "account_locked" | "role_changed" | "account_suspended"
  userId?: mongoose.Types.ObjectId
  email?: string
  ipAddress: string
  userAgent: string
  location?: {
    country?: string
    city?: string
    region?: string
  }
  details?: {
    reason?: string
    oldRole?: string
    newRole?: string
    attempts?: number
  }
  severity: "low" | "medium" | "high" | "critical"
  createdAt: Date
}

const SecurityLogSchema = new Schema<ISecurityLog>(
  {
    type: {
      type: String,
      required: true,
      enum: ["login_success", "login_failed", "password_reset", "account_locked", "role_changed", "account_suspended"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    location: {
      country: String,
      city: String,
      region: String,
    },
    details: {
      reason: String,
      oldRole: String,
      newRole: String,
      attempts: Number,
    },
    severity: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
)

// Indexes for efficient querying
SecurityLogSchema.index({ type: 1, createdAt: -1 })
SecurityLogSchema.index({ userId: 1, createdAt: -1 })
SecurityLogSchema.index({ email: 1, createdAt: -1 })
SecurityLogSchema.index({ severity: 1, createdAt: -1 })
SecurityLogSchema.index({ ipAddress: 1, createdAt: -1 })

export default mongoose.models.SecurityLog || mongoose.model<ISecurityLog>("SecurityLog", SecurityLogSchema)
