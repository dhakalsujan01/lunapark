import mongoose, { Schema, Document } from "mongoose"

export interface IContact extends Document {
  name: string
  email: string
  phone?: string
  subject: string
  category?: string
  message: string
  status: "new" | "read" | "replied" | "archived"
  priority: "low" | "medium" | "high"
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    category: {
      type: String,
      enum: ["general", "groups", "events", "support", "media", "other"],
      default: "general",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Admin notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
)

// Index for better query performance
ContactSchema.index({ email: 1, createdAt: -1 })
ContactSchema.index({ status: 1, createdAt: -1 })
ContactSchema.index({ category: 1, createdAt: -1 })

export default mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema)
