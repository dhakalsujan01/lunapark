import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import Ride from "@/models/Ride"
import Package from "@/models/Package"
import Order from "@/models/Order"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/user/tickets - Get user's tickets
async function getUserTickets(req: NextRequest, context: any, { session }: any) {
  try {
    await connectDB()

    // First, let's get tickets without populate to avoid schema errors
    const tickets = await Ticket.find({ user: session.user.id })
      .sort({ createdAt: -1 })
    
    console.log(`Found ${tickets.length} tickets for user ${session.user.id}`)
    
    // Manually populate the items based on type
    const populatedTickets = []
    for (const ticket of tickets) {
      let populatedTicket = ticket.toObject()
      
      // Remove leftover debug logging for specific tickets
      
      try {
        if (ticket.type === "ride") {
          const rideItem = await Ride.findById(ticket.item)
          if (rideItem) {
            populatedTicket.item = rideItem
            
            // Check if this ride ticket is part of a package
            if (ticket.metadata && ticket.metadata.packageId) {
              const packageItem = await Package.findById(ticket.metadata.packageId)
              if (packageItem) {
                populatedTicket.packageInfo = {
                  _id: packageItem._id,
                  name: packageItem.name,
                  price: packageItem.price
                }
              } else {
                // Fallback to metadata if package not found
                populatedTicket.packageInfo = {
                  _id: ticket.metadata.packageId,
                  name: ticket.metadata.packageName || "Package",
                  price: 0,
                }
              }
            } else if (!ticket.metadata?.packageId && ticket.order) {
              // Additional inference: try to determine package via the order
              try {
                const order = await Order.findById(ticket.order)
                if (order && Array.isArray(order.items)) {
                  // Check each package item in the order to see if this ride belongs to it
                  for (const orderItem of order.items) {
                    if (orderItem.type === "package") {
                      const potentialPackage = await Package.findById(orderItem.item)
                      if (potentialPackage && Array.isArray(potentialPackage.rides)) {
                        const rideIds = potentialPackage.rides.map((r: any) => r.toString())
                        if (rideIds.includes(rideItem._id.toString())) {
                          populatedTicket.packageInfo = {
                            _id: potentialPackage._id,
                            name: potentialPackage.name,
                            price: potentialPackage.price,
                          }
                          break
                        }
                      } else if (orderItem?.name) {
                        // Fallback: use order item info if package doc missing
                        populatedTicket.packageInfo = {
                          _id: orderItem.item,
                          name: orderItem.name,
                          price: orderItem.price || 0,
                        }
                        break
                      }
                    }
                  }
                }
              } catch (e) {
                console.warn(`Failed inferring package for ticket ${ticket._id} from order ${ticket.order}:`, e)
              }
            }
          } else {
            // Handle missing ride - create a minimal placeholder without fake names
            console.warn(`Ride not found for ticket ${ticket._id}, item ID: ${ticket.item}`)
            populatedTicket.item = {
              _id: ticket.item,
              title: "Ride Unavailable",
              name: "Ride Unavailable",
              description: "This ride is no longer available",
              price: populatedTicket.purchasePrice || 0,
              isPublished: false
            }
          }
        } else if (ticket.type === "package") {
          const packageItem = await Package.findById(ticket.item)
          if (packageItem) {
            populatedTicket.item = packageItem
          } else {
            // Handle missing package - create a placeholder
            console.warn(`Package not found for ticket ${ticket._id}, item ID: ${ticket.item}`)
            populatedTicket.item = {
              _id: ticket.item,
              name: "Package No Longer Available",
              title: "Package No Longer Available",
              description: "This package is no longer available",
              price: populatedTicket.purchasePrice || 0,
              isPublished: false
            }
          }
        }
      } catch (err) {
        console.error(`Error populating item for ticket ${ticket._id}:`, err)
        // Create a fallback item
        populatedTicket.item = {
          _id: ticket.item || "unknown",
          title: "Item Unavailable",
          name: "Item Unavailable", 
          description: "Unable to load item details",
          price: populatedTicket.purchasePrice || 0,
          isPublished: false
        }
      }
      
      populatedTickets.push(populatedTicket)
    }

    const responseTickets = populatedTickets.map(ticket => ({
      _id: ticket._id.toString(), // Convert ObjectId to string
      type: ticket.type,
      order: ticket.order ? ticket.order.toString?.() || String(ticket.order) : null,
      item: {
        _id: ticket.item._id.toString(), // Convert ObjectId to string
        title: ticket.item.title,
        name: ticket.item.name,
        image: ticket.item.image,
        description: ticket.item.description
      },
      packageInfo: ticket.packageInfo ? {
        _id: ticket.packageInfo._id.toString(),
        name: ticket.packageInfo.name,
        price: ticket.packageInfo.price
      } : null,
      qrCode: ticket.qrCode,
      qrSignature: ticket.qrSignature,
      simpleCode: ticket.simpleCode,
      status: ticket.status,
      validFrom: ticket.validFrom.toISOString(), // Convert Date to string
      validUntil: ticket.validUntil.toISOString(), // Convert Date to string
      visitDate: ticket.visitDate ? ticket.visitDate.toISOString() : null, // Convert Date to string
      usedAt: ticket.usedAt ? ticket.usedAt.toISOString() : null, // Convert Date to string
      maxUsage: ticket.maxUsage,
      currentUsage: ticket.currentUsage,
      scanLocation: ticket.scanLocation,
      createdAt: ticket.createdAt.toISOString(), // Convert Date to string
    }))
    
    // Remove leftover debug logging
    
    return NextResponse.json({ tickets: responseTickets })
  } catch (error) {
    console.error("Error fetching user tickets:", error)
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
  }
}

export const GET = withAuth(getUserTickets, "user")
