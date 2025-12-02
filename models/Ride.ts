import mongoose, { type Document, Schema } from "mongoose"

export interface IRide extends Document {
  title: string
  description: string
  shortDescription: string
  price: number
  image: string
  images: string[]
  restrictions: {
    minHeight?: number
    maxHeight?: number
    minAge?: number
    maxAge?: number
    healthWarnings: string[]
  }
  isPublished: boolean
  category: string
  duration: number // in minutes
  capacity: number
  thrillLevel: 1 | 2 | 3 | 4 | 5
  seo: {
    metaTitle?: string
    metaDescription?: string
    keywords: string[]
    slug?: string
    canonicalUrl?: string
    ogTitle?: string
    ogDescription?: string
    ogImage?: string
    twitterTitle?: string
    twitterDescription?: string
    twitterImage?: string
    structuredData?: any
  }
  translations: {
    en: {
      title: string
      description: string
      shortDescription: string
    }
    ru: {
      title: string
      description: string
      shortDescription: string
    }
  }
  analytics: {
    views: number
    bookings: number
    revenue: number
    rating: number
    reviewCount: number
  }
  status: {
    isActive: boolean
    maintenanceMode: boolean
    lastMaintenance?: Date
    nextMaintenance?: Date
  }
  createdAt: Date
  updatedAt: Date
}

const RideSchema = new Schema<IRide>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
      maxlength: 200,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    restrictions: {
      minHeight: Number,
      maxHeight: Number,
      minAge: Number,
      maxAge: Number,
      healthWarnings: [String],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: true,
      enum: ["thrill", "family", "kids", "water", "arcade"],
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    thrillLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      slug: {
        type: String,
        unique: true,
        sparse: true,
      },
      canonicalUrl: String,
      ogTitle: String,
      ogDescription: String,
      ogImage: String,
      twitterTitle: String,
      twitterDescription: String,
      twitterImage: String,
      structuredData: Schema.Types.Mixed,
    },
    translations: {
      en: {
        title: String,
        description: String,
        shortDescription: String,
      },
      ru: {
        title: String,
        description: String,
        shortDescription: String,
      },
    },
    analytics: {
      views: {
        type: Number,
        default: 0,
      },
      bookings: {
        type: Number,
        default: 0,
      },
      revenue: {
        type: Number,
        default: 0,
      },
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      reviewCount: {
        type: Number,
        default: 0,
      },
    },
    status: {
      isActive: {
        type: Boolean,
        default: true,
      },
      maintenanceMode: {
        type: Boolean,
        default: false,
      },
      lastMaintenance: Date,
      nextMaintenance: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Index for search and filtering
RideSchema.index({ title: "text", description: "text" })
RideSchema.index({ category: 1, isPublished: 1 })
RideSchema.index({ price: 1 })
RideSchema.index({ "analytics.rating": -1 })
RideSchema.index({ "analytics.bookings": -1 })

export default mongoose.models.Ride || mongoose.model<IRide>("Ride", RideSchema)
