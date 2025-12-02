import { type NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { type SupportedCurrency } from "@/lib/currency-config"
import connectDB from "@/lib/mongodb"
import Ride from "@/models/Ride"
import Package from "@/models/Package"
import Order from "@/models/Order"
import { withAuth } from "@/lib/auth-middleware"
import { createErrorResponse, createSuccessResponse, CommonErrors } from "@/lib/api-response"

// POST /api/checkout/create-session - Create Stripe checkout session
async function createCheckoutSession(req: NextRequest, context: any, { session }: any) {
  try {
    console.log(`Checkout session creation started for user: ${session?.user?.id}`)
    await connectDB()

    const requestBody = await req.json()
    const { items, currency = "eur" } = requestBody
    
    // Validate currency
    if (!["eur", "gbp"].includes(currency)) {
      return createErrorResponse("Invalid currency. Only EUR and GBP are supported.", 400, { code: "INVALID_CURRENCY" })
    }
    
    console.log(`Received checkout request with ${items?.length || 0} items:`, items)

    // SECURITY: Reject requests with suspicious pricing fields
    const forbiddenFields = [
      'total', 'totalAmount', 'subtotal', 'grandTotal', 'finalTotal',
      'discount', 'coupon', 'promo', 'sale', 'offer', 'deal',
      'price', 'cost', 'amount', 'value', 'rate', 'fee'
    ]
    
    for (const field of forbiddenFields) {
      if (requestBody.hasOwnProperty(field)) {
        console.warn(`Security violation: Client sent forbidden field '${field}'`)
        return NextResponse.json({ 
          error: `Security violation: Field '${field}' not allowed from client` 
        }, { status: 400 })
      }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return createErrorResponse("Items are required", 400, { code: "MISSING_ITEMS" })
    }

    // Validate maximum number of items
    if (items.length > 50) {
      return createErrorResponse("Too many items (maximum 50)", 400, { code: "TOO_MANY_ITEMS" })
    }

    // Validate and fetch items
    const lineItems = []
    const orderItems = []
    let totalAmount = 0

    for (const item of items as any[]) {
      // SECURITY: Only extract allowed fields - ignore any price/total data from client
      const { type, id } = item
      let quantity = Number(item.quantity) || 1

      // Enforce quantity = 1 for packages
      if (type === "package") {
        quantity = 1
      }

      // SECURITY: Validate required fields and ranges
      if (!type || !id || quantity < 1 || quantity > 100) {
        return NextResponse.json({ error: "Invalid item format or quantity (max 100 per item)" }, { status: 400 })
      }

      // Require visitDate for both rides and packages (valid on selected date model)
      const visitDateRaw = item?.metadata?.visitDate
      const visitDateParsed = visitDateRaw ? new Date(visitDateRaw) : null
      if (!visitDateParsed || Number.isNaN(visitDateParsed.getTime())) {
        return NextResponse.json({ error: "visitDate is required and must be a valid date (YYYY-MM-DD)" }, { status: 400 })
      }

      // SECURITY: Reject any requests that include price data from client
      if (item.hasOwnProperty('price') || item.hasOwnProperty('total') || 
          item.hasOwnProperty('cost') || item.hasOwnProperty('amount') ||
          item.hasOwnProperty('unitPrice') || item.hasOwnProperty('salePrice') ||
          item.hasOwnProperty('discountedPrice') || item.hasOwnProperty('originalPrice')) {
        return NextResponse.json({ 
          error: "Security violation: Price data not allowed from client" 
        }, { status: 400 })
      }

      let itemDoc
      let price
      let name

      if (type === "ride") {
        console.log(`Looking up ride with ID: ${id}`)
        itemDoc = await Ride.findById(id)
        if (!itemDoc) {
          console.error(`Ride not found in database: ${id}`)
          return NextResponse.json({ error: `Ride not found: ${id}` }, { status: 404 })
        }
        if (!itemDoc.isPublished) {
          console.error(`Ride not published: ${id}`)
          return NextResponse.json({ error: `Ride not available: ${id}` }, { status: 404 })
        }
        price = itemDoc.price
        name = itemDoc.title
        console.log(`Found ride: ${name} - €${price}`)
      } else if (type === "package") {
        console.log(`Looking up package with ID: ${id}`)
        itemDoc = await Package.findById(id)
        if (!itemDoc) {
          console.error(`Package not found in database: ${id}`)
          return NextResponse.json({ error: `Package not found: ${id}` }, { status: 404 })
        }
        if (!itemDoc.isPublished) {
          console.error(`Package not published: ${id}`)
          return NextResponse.json({ error: `Package not available: ${id}` }, { status: 404 })
        }
        price = itemDoc.price
        name = itemDoc.name
        console.log(`Found package: ${name} - €${price}`)
      } else {
        console.error(`Invalid item type: ${type}`)
        return NextResponse.json({ error: "Invalid item type" }, { status: 400 })
      }

      const itemTotal = price * quantity
      totalAmount += itemTotal

      // Validate reasonable price ranges
      if (price <= 0 || price > 10000) {
        return NextResponse.json({ error: `Invalid price for item: ${name}` }, { status: 400 })
      }

      // Add to Stripe line items
      lineItems.push({
        price_data: {
          currency: currency as SupportedCurrency,
          product_data: {
            name,
            description: itemDoc.description || itemDoc.shortDescription,
            images: itemDoc.image ? [itemDoc.image] : [],
          },
          unit_amount: Math.round(price * 100), // Convert to cents for Stripe
        },
        quantity,
      })

      // Add to order items
      orderItems.push({
        type,
        item: id,
        quantity,
        price,
        name,
        metadata: {
          ...item.metadata,
          visitDate: visitDateParsed.toISOString(),
        }, // Preserve metadata with normalized visitDate
      })
    }

    // Validate total amount
    if (totalAmount <= 0) {
      return NextResponse.json({ error: "Invalid total amount" }, { status: 400 })
    }

    if (totalAmount > 999999) {
      return NextResponse.json({ error: "Order total too large (maximum €9,999.99)" }, { status: 400 })
    }

    // Create pending order with retry logic for duplicate order numbers
    // SECURITY: Check for existing pending order with same items to prevent duplicates
    const orderHash = JSON.stringify({
      userId: session.user.id,
      items: orderItems.map(item => ({ type: item.type, item: item.item, quantity: item.quantity })),
      totalAmount,
      currency
    })
    
    console.log(`🔍 Checking for existing pending order with same items...`)
    const existingOrder = await Order.findOne({
      user: session.user.id,
      status: "pending",
      totalAmount,
      currency: currency as SupportedCurrency,
      // Check if items match (simplified check)
      $expr: {
        $eq: [
          { $size: "$items" },
          orderItems.length
        ]
      }
    })
    
    let order
    if (existingOrder) {
      console.log(`⚠️ Found existing pending order ${existingOrder._id} with same items, using it instead`)
      order = existingOrder
    } else {
      let retries = 0
      const maxRetries = 10

      while (retries < maxRetries) {
        try {
          order = new Order({
            user: session.user.id,
            items: orderItems,
            totalAmount,
            currency: currency as SupportedCurrency,
            status: "pending",
            customerEmail: session.user.email,
            customerName: session.user.name,
          })

          await order.save()
        
        // Debug: Check what was actually saved
        console.log(`✅ Order created with items:`, order.items.map((item: any) => ({
          type: item.type,
          metadata: item.metadata,
          metadataType: typeof item.metadata
        })))
        
          break // Success, exit the retry loop
        } catch (error: any) {
          console.log(`Order creation attempt ${retries + 1}:`, error.message)
          
          if (error.code === 11000 && (error.keyPattern?.orderNumber || error.message?.includes('orderNumber'))) {
            // Duplicate order number, retry with a new one
            retries++
            if (retries >= maxRetries) {
              console.error(`Failed to create order after ${maxRetries} retries due to duplicate order numbers`)
              return NextResponse.json({ error: "Unable to process order at this time. Please try again in a few moments." }, { status: 503 })
            }
            
            // Exponential backoff with jitter
            const delay = Math.min(1000, Math.pow(2, retries) * 100 + Math.random() * 100)
            console.log(`Retrying order creation in ${delay}ms (attempt ${retries + 1}/${maxRetries})`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          } else {
            // Different error, don't retry
            console.error("Non-retryable error creating order:", error)
            throw error
          }
        }
      }
    }

    if (!order) {
      console.error("Order creation failed - no order created after retries")
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Create Stripe checkout session with idempotency
    // Use order ID as idempotency key to prevent duplicate sessions for same order
    const idempotencyKey = `checkout_order_${order._id.toString()}`
    
    // Ensure URLs have proper protocol
    const baseUrl = process.env.NEXTAUTH_URL || process.env.BASE_URL || 'https://luna-park.vercel.app'
    const successUrl = `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`
    const cancelUrl = `${baseUrl}/attractions`
    
    // Debug: Log the URLs being sent to Stripe
    console.log('🔗 Stripe URLs:', { baseUrl, successUrl, cancelUrl })
    
    const checkoutSession = await stripe.checkout.sessions.create({
      ...STRIPE_CONFIG,
      currency: currency as SupportedCurrency,
      line_items: lineItems,
      customer_email: session.user.email,
      metadata: {
        orderId: order._id.toString(),
        userId: session.user.id,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    }, {
      idempotencyKey
    })

    // Update order with Stripe session ID
    order.stripeSessionId = checkoutSession.id
    await order.save()

    return createSuccessResponse({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      orderId: order._id,
    }, "Checkout session created successfully")
  } catch (error) {
    console.error("Error creating checkout session:", error)
    
    // Check if it's a Stripe-specific error
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as any
      if (stripeError.type === 'StripeInvalidRequestError') {
        console.error("Stripe validation error:", stripeError.message)
        return NextResponse.json({ 
          error: "Payment processing error", 
          details: stripeError.message 
        }, { status: 400 })
      }
    }
    
    // Check if it's a database/item lookup error
    if (error && typeof error === 'object' && 'message' in error) {
      const errorWithMessage = error as { message: string }
      if (errorWithMessage.message.includes('not found')) {
        console.error("Item lookup error:", errorWithMessage.message)
        return NextResponse.json({ 
          error: "One or more items are no longer available" 
        }, { status: 404 })
      }
    }
    
    return NextResponse.json({ 
      error: "Failed to create checkout session",
      details: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined
    }, { status: 500 })
  }
}
export const POST = withAuth(createCheckoutSession)

