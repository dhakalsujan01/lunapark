import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import Ride from "@/models/Ride"
import Package from "@/models/Package"
import { withAuth } from "@/lib/auth-middleware"
import QRCode from "qrcode"
import { jsPDF } from "jspdf"

// GET /api/user/tickets/[id]/download - Download ticket as PDF/image
async function downloadTicket(req: NextRequest, { params }: { params: Promise<{ id: string }> }, { session }: any) {
  try {
    await connectDB()

    const { id } = await params

    const ticket = await Ticket.findOne({
      _id: id,
      user: session.user.id
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Manually populate the item based on type
    let itemDetails
    if (ticket.type === "ride") {
      itemDetails = await Ride.findById(ticket.item)
    } else if (ticket.type === "package") {
      itemDetails = await Package.findById(ticket.item)
    }

    if (!itemDetails) {
      return NextResponse.json({ error: "Item details not found" }, { status: 404 })
    }

    // Generate QR code as data URL
    const qrData = `${ticket.qrCode}.${ticket.qrSignature}`
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Create PDF ticket
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Set font
    pdf.setFont('helvetica')

    // Header
    pdf.setFontSize(24)
    pdf.setTextColor(99, 102, 241) // Indigo color
    pdf.text('🎡 LUNA AMUSEMENT PARK', 105, 30, { align: 'center' })

    // Ticket border
    pdf.setDrawColor(0, 0, 0)
    pdf.setLineWidth(2)
    pdf.roundedRect(20, 15, 170, 240, 5, 5)

    // Item name
    pdf.setFontSize(18)
    pdf.setTextColor(0, 0, 0)
    const itemName = itemDetails.title || itemDetails.name || 'Unknown Item'
    pdf.text(itemName, 105, 50, { align: 'center', maxWidth: 150 })

    // Ticket details
    pdf.setFontSize(12)
    // Format visit date to show "Today", "Tomorrow", or date
    const formatVisitDate = (visitDate: Date) => {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
      const visitOnly = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate())
      
      if (visitOnly.getTime() === todayOnly.getTime()) {
        return "TODAY"
      } else if (visitOnly.getTime() === tomorrowOnly.getTime()) {
        return "TOMORROW"
      } else {
        return visitDate.toLocaleDateString()
      }
    }

    const details = [
      `Ticket ID: #${ticket._id.toString().slice(-8)}`,
      `Simple Code: ${ticket.simpleCode || 'Generating...'}`,
      `VISIT DATE: ${formatVisitDate(ticket.visitDate)}`,
      `Type: ${ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)}`,
      `Status: ${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}`,
      `Price: €${ticket.purchasePrice || 0}`,
      `Valid From: ${new Date(ticket.validFrom).toLocaleDateString()}`,
      `Valid Until: ${new Date(ticket.validUntil).toLocaleDateString()}`,
      `Usage: ${ticket.currentUsage}/${ticket.maxUsage} times`,
      `Purchase Date: ${new Date(ticket.createdAt).toLocaleDateString()}`
    ]

    let yPos = 70
 details.forEach((detail, index) => {
      // Make visit date bold and highlighted
      if (detail.startsWith('VISIT DATE:')) {
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(220, 38, 127) // Pink color for emphasis
        pdf.text(detail, 30, yPos)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(0, 0, 0)
      } else {
        pdf.text(detail, 30, yPos)
      }
      yPos += 8
    })

    // QR Code
    const qrSize = 50
    const qrX = 105 - (qrSize / 2)
    const qrY = 150
    
    pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
    
    // QR Code instruction
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Show this QR code at the entrance', 105, qrY + qrSize + 10, { align: 'center' })
    
    // Simple code instruction
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Or tell staff your Simple Code: ${ticket.simpleCode || 'LP-ABC123'}`, 105, qrY + qrSize + 18, { align: 'center' })

    // Footer
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100)
    
    const footerText = [
      'Valid government-issued ID required. Non-transferable.',
      'Subject to park rules and regulations.',
      'For assistance, call (555) 123-PARK or visit Guest Services.',
      '',
      'Luna Amusement Park - Creating magical moments since 1995'
    ]

    yPos = 220
    footerText.forEach(line => {
      pdf.text(line, 105, yPos, { align: 'center' })
      yPos += 5
    })

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ticket-${ticket._id.toString().slice(-8)}.pdf"`
      }
    })
  } catch (error) {
    console.error("Error downloading ticket:", error)
    return NextResponse.json({ error: "Failed to download ticket" }, { status: 500 })
  }
}

export const GET = withAuth(downloadTicket, "user")
