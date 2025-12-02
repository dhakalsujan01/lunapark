import mongoose, { type Document, Schema } from "mongoose"

export interface ITestimonial extends Document {
  user: mongoose.Types.ObjectId
  order: mongoose.Types.ObjectId
  ticket: mongoose.Types.ObjectId
  rating: number
  title: string
  content: string
  rideName?: string
  packageName?: string
  status: "pending" | "approved" | "rejected"
  approvedBy?: mongoose.Types.ObjectId
  approvedAt?: Date
  rejectionReason?: string
  isVerifiedPurchase: boolean
  createdAt: Date
  updatedAt: Date
}

const TestimonialSchema = new Schema<ITestimonial>(
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
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    rideName: {
      type: String,
      trim: true,
    },
    packageName: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for performance
TestimonialSchema.index({ user: 1, ticket: 1 }, { unique: true })
TestimonialSchema.index({ status: 1, createdAt: -1 })
TestimonialSchema.index({ rating: 1 })
TestimonialSchema.index({ isVerifiedPurchase: 1 })

// Validate that user can only submit one testimonial per ticket
TestimonialSchema.pre("save", async function (next) {
  if (this.isNew) {
    const existingTestimonial = await this.constructor.findOne({
      user: this.user,
      ticket: this.ticket,
    })
    
    if (existingTestimonial) {
      const error = new Error("You have already submitted a testimonial for this ticket")
      return next(error)
    }
  }
  next()
})

// Indexes for performance
TestimonialSchema.index({ user: 1, ticket: 1 }, { unique: true })
TestimonialSchema.index({ status: 1, createdAt: -1 })
TestimonialSchema.index({ rating: -1, status: 1 })
TestimonialSchema.index({ order: 1 })

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>("Testimonial", TestimonialSchema)
