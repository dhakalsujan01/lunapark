import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import { withAuth } from "@/lib/auth-middleware"
import mongoose from "mongoose"

// POST /api/admin/fix-database - Fix database indexing issues
async function fixDatabase(req: NextRequest, context: any, { session }: any) {
  try {
    await connectDB()

    const db = mongoose.connection.db
    if (!db) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
    }

    const ordersCollection = db.collection('orders')
    const results = []

    // 1. Check for orders with null or missing orderNumber
    const ordersWithoutNumber = await ordersCollection.find({ 
      $or: [
        { orderNumber: null },
        { orderNumber: { $exists: false } }
      ]
    }).toArray()

    results.push(`Found ${ordersWithoutNumber.length} orders without order numbers`)

    // 2. Delete orders with null orderNumber to resolve duplicate key issue
    if (ordersWithoutNumber.length > 0) {
      const deleteResult = await ordersCollection.deleteMany({ 
        $or: [
          { orderNumber: null },
          { orderNumber: { $exists: false } }
        ]
      })
      results.push(`Deleted ${deleteResult.deletedCount} orders with null orderNumber`)
    }

    // 3. Try to drop and recreate the orderNumber index
    try {
      await ordersCollection.dropIndex('orderNumber_1')
      results.push('Dropped old orderNumber index')
    } catch (error) {
      results.push('orderNumber index not found or already dropped')
    }

    // 4. Create the unique index
    try {
      await ordersCollection.createIndex({ orderNumber: 1 }, { unique: true })
      results.push('Created new unique orderNumber index')
    } catch (error: any) {
      results.push(`Index creation result: ${error.message}`)
    }

    // 5. Check current indexes
    const indexes = await ordersCollection.indexes()
    const orderNumberIndex = indexes.find(idx => idx.key?.orderNumber)
    results.push(`Current orderNumber index: ${orderNumberIndex ? 'EXISTS' : 'NOT FOUND'}`)

    return NextResponse.json({
      success: true,
      message: "Database fix completed",
      results,
      fixedOrders: ordersWithoutNumber.length
    })

  } catch (error) {
    console.error("Error fixing database:", error)
    return NextResponse.json({ 
      error: "Failed to fix database", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export const POST = withAuth(fixDatabase, "admin")
