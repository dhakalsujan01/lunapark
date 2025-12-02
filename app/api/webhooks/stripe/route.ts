import { type NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import Ticket from "@/models/Ticket"
import Package from "@/models/Package"
import Ride from "@/models/Ride"
import WebhookLog from "@/models/WebhookLog"
import type Stripe from "stripe"

// POST /api/webhooks/stripe - Handle Stripe webhooks
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  let webhookLog: any = null
  console.log("\n🔔 ===== STRIPE WEBHOOK RECEIVED =====")
  console.log(`⏰ Time: ${new Date().toISOString()}`)
  console.log(`🌐 IP: ${req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'}`)
  console.log(`📋 User-Agent: ${req.headers.get('user-agent') || 'unknown'}`)
  
  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")
    
    console.log(`📦 Body length: ${body.length} characters`)
    console.log(`🔐 Signature present: ${signature ? 'YES' : 'NO'}`)
    console.log(`🔑 Webhook secret configured: ${STRIPE_WEBHOOK_SECRET ? 'YES' : 'NO'}`)

    if (!signature) {
      console.error("❌ No Stripe signature found")
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error("❌ Stripe webhook secret not configured")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      console.log("🔍 Verifying webhook signature...")
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
      console.log("✅ Webhook signature verified successfully")
      console.log(`📋 Event ID: ${event.id}`)
      console.log(`📋 Event Type: ${event.type}`)
      console.log(`📋 Event Created: ${new Date(event.created * 1000).toISOString()}`)
      console.log(`📋 API Version: ${event.api_version || 'unknown'}`)
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log("🔌 Connecting to database...")
    await connectDB()
    console.log("✅ Database connected")

    // SECURITY: Check for duplicate webhook events (idempotency)
    console.log(`🔍 Checking for duplicate webhook event: ${event.id}`)
    const existingWebhook = await WebhookLog.findOne({ 
      eventId: event.id,
      status: "success"
    })
    
    if (existingWebhook) {
      console.log(`⚠️ Webhook event ${event.id} already processed successfully, skipping`)
      return NextResponse.json({ received: true, message: "Event already processed" })
    }

    // Log webhook attempt
    webhookLog = new WebhookLog({
      provider: "stripe",
      eventType: event.type,
      eventId: event.id,
      status: "pending",
      httpStatus: 200,
      payload: event,
      processingTime: 0,
      retryCount: 0,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      signature: signature,
      signatureValid: true,
    })
    await webhookLog.save()

    // Handle different event types with proper deduplication
    console.log(`🎯 Processing event type: ${event.type}`)
    
    // SECURITY: Event-specific deduplication to prevent duplicate processing
    // Only process checkout.session.completed for order fulfillment to avoid duplicate ticket generation
    switch (event.type) {
      case "checkout.session.completed":
        console.log("💳 Processing checkout.session.completed...")
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        console.log("✅ checkout.session.completed processed")
        break

      case "payment_intent.succeeded":
        console.log("💰 Processing payment_intent.succeeded...")
        // Only log this event - order fulfillment is handled by checkout.session.completed
        await logPaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        console.log("✅ payment_intent.succeeded logged (fulfillment handled by checkout.session.completed)")
        break

      case "payment_intent.payment_failed":
        console.log("❌ Processing payment_intent.payment_failed...")
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        console.log("✅ payment_intent.payment_failed processed")
        break

      case "invoice.payment_succeeded":
        console.log("📄 Processing invoice.payment_succeeded (no action needed)...")
        // Handle subscription payments if needed
        break

      case "customer.subscription.deleted":
        console.log("🗑️ Processing customer.subscription.deleted (no action needed)...")
        // Handle subscription cancellation if needed
        break

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`)
        console.log(`📋 Event data:`, JSON.stringify(event.data, null, 2))
    }

    const processingTime = Date.now() - startTime
    console.log(`⏱️ Total processing time: ${processingTime}ms`)
    console.log("✅ ===== WEBHOOK PROCESSED SUCCESSFULLY =====\n")

    // Update webhook log as successful
    webhookLog.status = "success"
    webhookLog.processingTime = processingTime
    await webhookLog.save()

    return NextResponse.json({ received: true })
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error("💥 ===== WEBHOOK ERROR =====")
    console.error(`⏰ Time: ${new Date().toISOString()}`)
    console.error(`⏱️ Processing time before error: ${processingTime}ms`)
    console.error("❌ Webhook error:", error)
    console.error("💥 ===== WEBHOOK ERROR END =====\n")
    
    // Update webhook log as failed if it exists
    try {
      if (webhookLog) {
        webhookLog.status = "failed"
        webhookLog.processingTime = processingTime
        webhookLog.errorMessage = error instanceof Error ? error.message : String(error)
        await webhookLog.save()
      }
    } catch (logError) {
      console.error("Failed to update webhook log:", logError)
    }
    
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("🔍 ===== HANDLING CHECKOUT COMPLETED =====")
  console.log(`📋 Session ID: ${session.id}`)
  console.log(`📋 Payment Intent: ${session.payment_intent}`)
  console.log(`📋 Customer Email: ${session.customer_email}`)
  console.log(`📋 Amount Total: ${session.amount_total}`)
  console.log(`📋 Currency: ${session.currency}`)
  console.log(`📋 Payment Status: ${session.payment_status}`)
  
  try {
    const orderId = session.metadata?.orderId
    console.log(`📋 Order ID from metadata: ${orderId}`)
    
    if (!orderId) {
      console.error("❌ No order ID in session metadata")
      console.log("📋 Session metadata:", JSON.stringify(session.metadata, null, 2))
      return
    }

    console.log(`🔍 Looking up order: ${orderId}`)
    const order = await Order.findById(orderId)
    if (!order) {
      console.error(`❌ Order not found: ${orderId}`)
      return
    }
    console.log(`✅ Order found: ${orderId}`)
    console.log(`📋 Current order status: ${order.status}`)
    console.log(`📋 Order total: €${order.totalAmount}`)
    console.log(`📋 Order items count: ${order.items.length}`)

    // Prevent duplicate processing - check both order status and payment intent
    if (order.status === "paid") {
      console.log(`⚠️ Order ${orderId} already processed (status: ${order.status})`)
      return
    }

    // Additional check: if payment intent already exists, skip processing
    if (order.paymentIntentId && order.paymentIntentId === session.payment_intent) {
      console.log(`⚠️ Order ${orderId} already processed with same payment intent: ${session.payment_intent}`)
      return
    }

    // Update order status atomically with conditions to prevent race conditions
    console.log(`💳 Updating order status to 'paid'...`)
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        status: { $ne: "paid" } // Only update if not already paid
      },
      {
        status: "paid",
        paymentIntentId: session.payment_intent as string,
        paymentMethod: session.payment_method_types?.[0] || "card",
        paidAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('items') // Ensure items are populated with metadata

    if (!updatedOrder) {
      console.error(`❌ Failed to update order ${orderId} - may have been processed by another webhook`)
      return
    }
    console.log(`✅ Order ${orderId} updated to 'paid' status`)
    console.log(`📋 Payment Intent ID: ${updatedOrder.paymentIntentId}`)
    console.log(`📋 Payment Method: ${updatedOrder.paymentMethod}`)
    console.log(`📋 Paid At: ${updatedOrder.paidAt}`)

    // Check if tickets already exist to prevent duplicates
    console.log(`🔍 Checking for existing tickets for order ${orderId}...`)
    const existingTickets = await Ticket.find({ order: orderId })
    if (existingTickets.length > 0) {
      console.log(`⚠️ Tickets already exist for order ${orderId} (${existingTickets.length} tickets)`)
      return
    }
    console.log(`✅ No existing tickets found, proceeding with ticket generation`)

    // Debug: Check what's actually in the order from database
    console.log(`🔍 Order from database:`, {
      orderId: updatedOrder._id,
      itemsCount: updatedOrder.items.length,
      firstItem: updatedOrder.items[0] ? {
        type: updatedOrder.items[0].type,
        metadata: updatedOrder.items[0].metadata,
        metadataType: typeof updatedOrder.items[0].metadata
      } : 'No items'
    })
    
    // Generate tickets for the paid order with error handling and rollback
    console.log(`🎫 Starting ticket generation for order ${orderId}...`)
    try {
      await generateTicketsForOrder(updatedOrder)
      console.log(`✅ Ticket generation completed for order ${orderId}`)
      
      console.log(`🎉 Order ${orderId} marked as paid and tickets generated successfully!`)
      console.log("✅ ===== CHECKOUT COMPLETED HANDLED =====")
    } catch (ticketError) {
      console.error(`💥 Ticket generation failed for order ${orderId}:`, ticketError)
      
      // ROLLBACK: Mark order as failed if ticket generation fails
      try {
        await Order.findByIdAndUpdate(orderId, { 
          status: "ticket_generation_failed",
          failureReason: `Ticket generation failed: ${ticketError instanceof Error ? ticketError.message : String(ticketError)}`
        })
        console.log(`⚠️ Order ${orderId} marked as ticket_generation_failed due to ticket creation error`)
      } catch (rollbackError) {
        console.error(`💥 Failed to rollback order ${orderId}:`, rollbackError)
      }
      
      // Re-throw to ensure webhook fails and Stripe retries
      throw new Error(`Ticket generation failed for order ${orderId}: ${ticketError instanceof Error ? ticketError.message : String(ticketError)}`)
    }
  } catch (error) {
    console.error("💥 ===== CHECKOUT COMPLETED ERROR =====")
    console.error("❌ Error handling checkout completed:", error)
    console.error("💥 ===== CHECKOUT COMPLETED ERROR END =====")
  }
}

async function logPaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("💰 ===== LOGGING PAYMENT SUCCEEDED =====")
  console.log(`📋 Payment Intent ID: ${paymentIntent.id}`)
  console.log(`📋 Amount: ${paymentIntent.amount}`)
  console.log(`📋 Currency: ${paymentIntent.currency}`)
  console.log(`📋 Status: ${paymentIntent.status}`)
  
  try {
    // Find order by payment intent ID for logging purposes only
    console.log(`🔍 Looking up order by payment intent: ${paymentIntent.id}`)
    const order = await Order.findOne({ paymentIntentId: paymentIntent.id })
    if (!order) {
      console.log(`⚠️ No order found for payment intent: ${paymentIntent.id}`)
      return
    }
    console.log(`✅ Order found: ${order._id} - Status: ${order.status}`)
    console.log(`📋 Note: Order fulfillment is handled by checkout.session.completed event`)
    console.log("✅ ===== PAYMENT SUCCEEDED LOGGED =====")
  } catch (error) {
    console.error("💥 ===== PAYMENT SUCCEEDED LOG ERROR =====")
    console.error("❌ Error logging payment succeeded:", error)
    console.error("💥 ===== PAYMENT SUCCEEDED LOG ERROR END =====")
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("❌ ===== HANDLING PAYMENT FAILED =====")
  console.log(`📋 Payment Intent ID: ${paymentIntent.id}`)
  console.log(`📋 Amount: ${paymentIntent.amount}`)
  console.log(`📋 Currency: ${paymentIntent.currency}`)
  console.log(`📋 Status: ${paymentIntent.status}`)
  console.log(`📋 Last Payment Error: ${paymentIntent.last_payment_error?.message || 'No error details'}`)
  
  try {
    console.log(`🔍 Looking up order by payment intent: ${paymentIntent.id}`)
    const order = await Order.findOne({ paymentIntentId: paymentIntent.id })
    if (!order) {
      console.log(`⚠️ No order found for failed payment intent: ${paymentIntent.id}`)
      return
    }
    console.log(`✅ Order found: ${order._id}`)
    console.log(`📋 Current order status: ${order.status}`)

    console.log(`💳 Updating order status to 'cancelled'...`)
    order.status = "cancelled"
    await order.save()
    console.log(`✅ Order ${order._id} updated to 'cancelled' status`)

    console.log(`⚠️ Payment failed for order: ${order._id}`)
    console.log("✅ ===== PAYMENT FAILED HANDLED =====")
  } catch (error) {
    console.error("💥 ===== PAYMENT FAILED ERROR =====")
    console.error("❌ Error handling payment failed:", error)
    console.error("💥 ===== PAYMENT FAILED ERROR END =====")
  }
}

async function generateTicketsForOrder(order: any) {
  console.log("🎫 ===== GENERATING TICKETS FOR ORDER =====")
  console.log(`📋 Order ID: ${order._id}`)
  console.log(`📋 Order Items Count: ${order.items.length}`)
  console.log(`📋 Order Total: €${order.totalAmount}`)
  console.log(`📋 Customer: ${order.customerEmail}`)
  
  try {
    const tickets = []

    // Generate tickets for each item in the order
    for (const item of order.items) {
      console.log(`🔍 Processing item:`, {
        type: item.type,
        itemId: item.item,
        quantity: item.quantity,
        metadata: item.metadata
      })
      
      for (let i = 0; i < item.quantity; i++) {
        let validityDays = 30 // Default validity
        let maxUsage = 1
        let itemDetails = null

        // Get item details for validity and usage rules
        if (item.type === "package") {
          itemDetails = await Package.findById(item.item)
          if (itemDetails) {
            // Packages generate individual ride tickets, validity is determined by visit date
            maxUsage = 1 // Each individual ride ticket is single use
          }
        } else if (item.type === "ride") {
          itemDetails = await Ride.findById(item.item)
          if (itemDetails) {
            validityDays = 1 // Rides are valid for 1 day by default
            maxUsage = 1 // Single ride usage
          }
        }

        // Get visit date from item metadata with proper fallback logic
        let visitDate = new Date()
        
        console.log(`🔍 Checking metadata for visit date:`, JSON.stringify(item.metadata))
        
        if (item.metadata && item.metadata.visitDate) {
          visitDate = new Date(item.metadata.visitDate)
          console.log(`✅ Setting visit date from metadata: ${visitDate.toISOString()}`)
        } else {
          // Default to today for immediate validity, not tomorrow
          console.log(`⚠️ No visit date in metadata, using today: ${visitDate.toISOString()}`)
        }
        
        // Ensure visit date is set to start of day for consistency
        visitDate.setHours(0, 0, 0, 0)
        
        // Set validUntil based on item type
        const validUntil = new Date(visitDate)
        if (item.type === "ride") {
          // Single rides valid for the visit date only
          validUntil.setHours(23, 59, 59, 999)
        } else if (item.type === "package") {
          // Package ride tickets are valid for the visit date only (same as individual rides)
          validUntil.setHours(23, 59, 59, 999)
        }
        console.log(`Setting validUntil to: ${validUntil.toISOString()}`)

        if (item.type === "package") {
          // For packages, create individual ride tickets
          console.log(`Creating individual ride tickets for package: ${item.item}`)
          
          if (itemDetails && itemDetails.rides && itemDetails.rides.length > 0) {
            // Get ride details from package
            const packageRides = await Ride.find({ _id: { $in: itemDetails.rides } })
            
            for (const ride of packageRides) {
              const rideTicket = new Ticket({
                user: order.user,
                order: order._id,
                type: "ride", // Individual ride ticket
                item: ride._id,
                visitDate: visitDate,
                validUntil,
                maxUsage: 1, // Each ride ticket is single use
                purchasePrice: 0, // Individual ride tickets are free (paid via package)
                currency: order.currency || "eur",
                metadata: {
                  purchaseChannel: "online",
                  customerNotes: `Part of package: ${itemDetails.name}`,
                  visitDate: visitDate.toISOString(),
                  packageId: item.item,
                  packageName: itemDetails.name,
                }
              })

              console.log(`Creating ride ticket for: ${ride.title} - Package: ${itemDetails.name}`)
              
              try {
                // Save ticket first to get the _id, then generate codes
                await rideTicket.save()
                console.log(`Ride ticket saved with ID: ${rideTicket._id}`)
                
                // Generate QR code and simple code using model methods consistently
                console.log('Generating QR code using model method...')
                rideTicket.generateQRCode()
                
                console.log('Generating simple code using model method...')
                rideTicket.generateSimpleCode()
                
                // Save again with generated codes
                console.log(`Saving ride ticket with codes - Simple: ${rideTicket.simpleCode}, QR: ${rideTicket.qrCode ? 'Generated' : 'Missing'}`)
                await rideTicket.save()
                
                // Verify the final ticket state
                console.log(`✅ Ride ticket ${rideTicket._id} created successfully`)
                console.log(`  Type: ${rideTicket.type}`)
                console.log(`  Ride: ${ride.title}`)
                console.log(`  Package: ${itemDetails.name}`)
                console.log(`  Visit Date: ${rideTicket.visitDate.toISOString()}`)
                console.log(`  Valid Until: ${rideTicket.validUntil.toISOString()}`)
                console.log(`  Simple Code: ${rideTicket.simpleCode}`)
                console.log(`  QR Code: ${rideTicket.qrCode ? 'Generated' : 'Missing'}`)
                
                tickets.push(rideTicket)
              } catch (error) {
                console.error(`💥 Error creating ride ticket for ${ride.title}:`, error)
                throw new Error(`Failed to create ride ticket: ${error instanceof Error ? error.message : String(error)}`)
              }
            }
          } else {
            console.error(`💥 Package ${item.item} has no rides defined`)
            throw new Error(`Package has no rides defined`)
          }
        } else {
          // For individual rides, create a single ticket
          const ticket = new Ticket({
            user: order.user,
            order: order._id,
            type: item.type,
            item: item.item,
            visitDate: visitDate,
            validUntil,
            maxUsage,
            purchasePrice: item.price, // Set the actual purchase price
            currency: order.currency || "eur",
            metadata: {
              purchaseChannel: "online",
              customerNotes: itemDetails?.description || "",
              visitDate: visitDate.toISOString(),
            }
          })

          console.log(`Creating ticket for ${item.type}: ${item.item} - Price: €${item.price}`)
          
          try {
            // Save ticket first to get the _id, then generate codes
            await ticket.save()
            console.log(`Ticket saved with ID: ${ticket._id}`)
            
            // Generate QR code and simple code using model methods consistently
            console.log('Generating QR code using model method...')
            ticket.generateQRCode()
            
            console.log('Generating simple code using model method...')
            ticket.generateSimpleCode()
            
            // Save again with generated codes
            console.log(`Saving ticket with codes - Simple: ${ticket.simpleCode}, QR: ${ticket.qrCode ? 'Generated' : 'Missing'}`)
            await ticket.save()
            
            // Verify the final ticket state
            console.log(`✅ Ticket ${ticket._id} created successfully`)
            console.log(`  Type: ${ticket.type}`)
            console.log(`  Visit Date: ${ticket.visitDate.toISOString()}`)
            console.log(`  Valid Until: ${ticket.validUntil.toISOString()}`)
            console.log(`  Simple Code: ${ticket.simpleCode}`)
            console.log(`  QR Code: ${ticket.qrCode ? 'Generated' : 'Missing'}`)
            
            tickets.push(ticket)
          } catch (error) {
            console.error(`💥 Error creating ticket for ${item.type} ${item.item}:`, error)
            throw new Error(`Failed to create ticket: ${error instanceof Error ? error.message : String(error)}`)
          }
        }
      }
    }

    // Update order with ticket references
    console.log(`💾 Updating order with ${tickets.length} ticket references...`)
    order.tickets = tickets.map((t) => t._id)
    await order.save()
    console.log(`✅ Order updated with ticket references`)

    // TODO: Send email notification with tickets
    console.log(`📧 Sending ticket email notification...`)
    await sendTicketEmail(order, tickets)
    console.log(`✅ Email notification sent`)

    console.log(`🎉 Generated ${tickets.length} tickets for order ${order._id}`)
    console.log("✅ ===== TICKET GENERATION COMPLETED =====")
  } catch (error) {
    console.error("💥 ===== TICKET GENERATION ERROR =====")
    console.error("❌ Error generating tickets:", error)
    console.error("💥 ===== TICKET GENERATION ERROR END =====")
    throw error // Re-throw to ensure webhook fails if ticket generation fails
  }
}

async function sendTicketEmail(order: any, tickets: any[]) {
  console.log("📧 ===== SENDING TICKET EMAIL =====")
  console.log(`📋 Customer Email: ${order.customerEmail}`)
  console.log(`📋 Tickets Count: ${tickets.length}`)
  console.log(`📋 Ticket IDs: ${tickets.map(t => t._id).join(', ')}`)
  
  try {
    // Import email service
    const { sendTicketEmail: sendEmail } = await import("@/lib/email")
    
    // Prepare ticket data for email
    const ticketData = tickets.map(ticket => ({
      id: ticket._id.toString(),
      type: ticket.type,
      itemName: ticket.item?.title || ticket.item?.name || 'Attraction',
      visitDate: ticket.visitDate.toISOString(),
      qrCode: ticket.qrCode || '',
      simpleCode: ticket.simpleCode || '',
    }))

    const emailData = {
      customerEmail: order.customerEmail,
      customerName: order.customerName || 'Valued Customer',
      orderNumber: order.orderNumber,
      tickets: ticketData,
      totalAmount: order.totalAmount,
      currency: order.currency || 'eur',
    }

    console.log(`📧 Sending ticket email to ${order.customerEmail}...`)
    const emailSent = await sendEmail(emailData)
    
    if (emailSent) {
      console.log(`✅ Ticket email sent successfully`)
      
      // Mark tickets as email sent
      await Ticket.updateMany(
        { _id: { $in: tickets.map(t => t._id) } },
        { 
          emailSent: true, 
          emailSentAt: new Date() 
        }
      )
      console.log(`💾 Tickets marked as email sent`)
    } else {
      console.warn(`⚠️ Failed to send email, but continuing with order processing`)
      
      // Mark as email failed for retry later
      await Ticket.updateMany(
        { _id: { $in: tickets.map(t => t._id) } },
        { 
          emailSent: false,
          emailSentAt: null,
          emailFailedAt: new Date()
        }
      )
    }
    
    console.log("✅ ===== EMAIL PROCESSING COMPLETED =====")
  } catch (error) {
    console.error("💥 ===== EMAIL ERROR =====")
    console.error("❌ Error sending ticket email:", error)
    console.error("💥 ===== EMAIL ERROR END =====")
    
    // Mark as email failed for retry later
    try {
      await Ticket.updateMany(
        { _id: { $in: tickets.map(t => t._id) } },
        { 
          emailSent: false,
          emailSentAt: null,
          emailFailedAt: new Date()
        }
      )
    } catch (updateError) {
      console.error("Failed to update email failure status:", updateError)
    }
    
    // Don't throw - email failure shouldn't fail the entire webhook
  }
}
