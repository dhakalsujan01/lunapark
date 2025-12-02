import mongoose, { type Document, Schema } from "mongoose"

export interface IPackage extends Document {
  name: string
  description: string
  price: number
  originalPrice?: number
  rides: mongoose.Types.ObjectId[]
  rideDetails: {
    rideId: mongoose.Types.ObjectId
    individualPrice: number
  }[]
  totalRideCost: number
  customPricing: boolean
  image: string
  isPublished: boolean
  // legacy fields retained for backward compatibility in DB, not for new logic
  validityDays: number
  maxUsage?: number
  category: "single" | "family" | "group" | "season"
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
      name: string
      description: string
    }
    ru: {
      name: string
      description: string
    }
  }
  analytics: {
    views: number
    purchases: number
    revenue: number
    conversionRate: number
  }
  promotions: {
    isOnSale: boolean
    saleStartDate?: Date
    saleEndDate?: Date
    discountPercentage?: number
  }
  createdAt: Date
  updatedAt: Date
}

const PackageSchema = new Schema<IPackage>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    rides: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ride",
        required: true,
      },
    ],
    rideDetails: [
      {
        rideId: {
          type: Schema.Types.ObjectId,
          ref: "Ride",
          required: true,
        },
        individualPrice: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalRideCost: {
      type: Number,
      required: true,
      min: 0,
    },
    customPricing: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    validityDays: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    maxUsage: {
      type: Number,
      min: 1,
    },
    category: {
      type: String,
      required: true,
      enum: ["single", "family", "group", "season"],
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
        name: String,
        description: String,
      },
      ru: {
        name: String,
        description: String,
      },
    },
    analytics: {
      views: {
        type: Number,
        default: 0,
      },
      purchases: {
        type: Number,
        default: 0,
      },
      revenue: {
        type: Number,
        default: 0,
      },
      conversionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    promotions: {
      isOnSale: {
        type: Boolean,
        default: false,
      },
      saleStartDate: Date,
      saleEndDate: Date,
      discountPercentage: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
  },
  {
    timestamps: true,
  },
)

PackageSchema.index({ name: "text", description: "text" })
PackageSchema.index({ category: 1, isPublished: 1 })
PackageSchema.index({ price: 1 })
PackageSchema.index({ "analytics.purchases": -1 })
PackageSchema.index({ "promotions.isOnSale": 1, "promotions.saleEndDate": 1 })

export default mongoose.models.Package || mongoose.model<IPackage>("Package", PackageSchema)
