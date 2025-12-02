import mongoose, { type Document, Schema } from "mongoose"

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId
  action: string
  resource: string
  resourceId?: mongoose.Types.ObjectId
  details?: any
  ipAddress: string
  userAgent: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  endpoint: string
  statusCode: number
  responseTime: number
  createdAt: Date
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
    },
    details: Schema.Types.Mixed,
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    },
    endpoint: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    responseTime: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
)

// Indexes for efficient querying
ActivityLogSchema.index({ userId: 1, createdAt: -1 })
ActivityLogSchema.index({ action: 1, createdAt: -1 })
ActivityLogSchema.index({ resource: 1, createdAt: -1 })
ActivityLogSchema.index({ createdAt: -1 })

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema)
