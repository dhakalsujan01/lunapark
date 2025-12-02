import mongoose, { type Document, Schema } from "mongoose"

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId
  orderNumber: string
  items: {
    type: "ride" | "package"
    item: mongoose.Types.ObjectId
    quantity: number
    price: number
    name: string
    metadata?: any
  }[]
  totalAmount: number
  currency: string
  status: "pending" | "paid" | "cancelled" | "ticket_generation_failed"
  paymentIntentId?: string
  stripeSessionId?: string
  paymentMethod?: string
  customerEmail: string
  customerName: string
  tickets: mongoose.Types.ObjectId[]
  failureReason?: string
  createdAt: Date
  updatedAt: Date
  paidAt?: Date
}

// Function to generate unique order number with high collision resistance
function generateOrderNumber(): string {
  const timestamp = Date.now().toString()
  const random1 = Math.random().toString(36).substring(2, 8).toUpperCase()
  const random2 = Math.random().toString(36).substring(2, 6).toUpperCase() 
  const microseconds = process.hrtime.bigint().toString().slice(-6)
  return `LP${timestamp.slice(-8)}${random1}${random2}${microseconds}`
}

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: String,
      default: generateOrderNumber,
    },
    items: [
      {
        type: {
          type: String,
          enum: ["ride", "package"],
          required: true,
        },
        item: {
          type: Schema.Types.ObjectId,
          required: true,
          refPath: "items.type",
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        name: {
          type: String,
          required: true,
        },
        metadata: {
          type: Schema.Types.Mixed,
          required: false,
        },
      },
    ],
    totalAmount: {
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
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "ticket_generation_failed"],
      default: "pending",
    },
    paymentIntentId: String,
    stripeSessionId: String,
    paymentMethod: String,
    customerEmail: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    tickets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ticket",
      },
    ],
    failureReason: String,
    paidAt: Date,
  },
  {
    timestamps: true,
  },
)

OrderSchema.index({ user: 1, status: 1 })
OrderSchema.index({ user: 1, createdAt: -1 }) // For user orders pagination
OrderSchema.index({ stripeSessionId: 1 })
OrderSchema.index({ paymentIntentId: 1 }) // For webhook lookups
OrderSchema.index({ createdAt: -1 })
OrderSchema.index({ status: 1, createdAt: -1 }) // For analytics queries
OrderSchema.index({ orderNumber: 1 }, { unique: true })

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)
