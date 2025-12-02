import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

// Register all models to prevent MissingSchemaError during populate
function registerModels() {
  // Only register if not already registered to avoid re-registration errors
  if (!mongoose.models.User) {
    require("@/models/User")
  }
  if (!mongoose.models.Order) {
    require("@/models/Order")
  }
  if (!mongoose.models.Ticket) {
    require("@/models/Ticket")
  }
  if (!mongoose.models.Ride) {
    require("@/models/Ride")
  }
  if (!mongoose.models.Package) {
    require("@/models/Package")
  }
  if (!mongoose.models.Testimonial) {
    require("@/models/Testimonial")
  }
  if (!mongoose.models.Settings) {
    require("@/models/Settings")
  }
  if (!mongoose.models.Contact) {
    require("@/models/Contact")
  }
  if (!mongoose.models.ActivityLog) {
    require("@/models/ActivityLog")
  }
  if (!mongoose.models.SecurityLog) {
    require("@/models/SecurityLog")
  }
  if (!mongoose.models.TicketScanLog) {
    require("@/models/TicketScanLog")
  }
  if (!mongoose.models.WebhookLog) {
    require("@/models/WebhookLog")
  }
}

// Declare global type for mongoose caching
declare global {
  var mongoose: {
    conn: any | null
    promise: Promise<any> | null
  }
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  // Register all models first
  registerModels()
  
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      // Ensure models are registered after connection
      registerModels()
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB

export { connectDB }
