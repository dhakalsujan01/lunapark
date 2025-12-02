import mongoose, { type Document, Schema } from "mongoose"

export interface IWebhookLog extends Document {
  provider: "stripe" | "paypal" | "other"
  eventType: string
  eventId: string
  status: "success" | "failed" | "pending" | "retry"
  httpStatus: number
  payload: any
  response?: any
  errorMessage?: string
  processingTime: number
  retryCount: number
  ipAddress: string
  signature?: string
  signatureValid: boolean
  createdAt: Date
}

const WebhookLogSchema = new Schema<IWebhookLog>(
  {
    provider: {
      type: String,
      required: true,
      enum: ["stripe", "paypal", "other"],
    },
    eventType: {
      type: String,
      required: true,
    },
    eventId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["success", "failed", "pending", "retry"],
    },
    httpStatus: {
      type: Number,
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    response: Schema.Types.Mixed,
    errorMessage: String,
    processingTime: {
      type: Number,
      required: true,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    signature: String,
    signatureValid: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
)

// Indexes for performance
WebhookLogSchema.index({ provider: 1, eventType: 1, createdAt: -1 })
WebhookLogSchema.index({ status: 1, createdAt: -1 })
WebhookLogSchema.index({ eventId: 1 }, { unique: true, sparse: true })
WebhookLogSchema.index({ signatureValid: 1, createdAt: -1 })
WebhookLogSchema.index({ createdAt: -1 })

// Export the model, ensuring it's only defined once
export default mongoose.models.WebhookLog || mongoose.model<IWebhookLog>("WebhookLog", WebhookLogSchema)
