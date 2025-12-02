import nodemailer from 'nodemailer'

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD?.replace(/\s/g, ''), // Remove spaces from app password
  },
}

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('Email configuration missing - emails will not be sent')
      console.warn('SMTP_USER:', !!process.env.SMTP_USER)
      console.warn('SMTP_PASSWORD:', !!process.env.SMTP_PASSWORD)
      return null
    }
    
    console.log('📧 Creating email transporter with config:', {
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      secure: EMAIL_CONFIG.secure,
      user: EMAIL_CONFIG.auth.user
    })
    
    transporter = nodemailer.createTransport(EMAIL_CONFIG)
    
    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error)
      } else {
        console.log('✅ Email transporter verified successfully')
      }
    })
  }
  return transporter
}

export interface TicketEmailData {
  customerEmail: string
  customerName: string
  orderNumber: string
  tickets: Array<{
    id: string
    type: string
    itemName: string
    visitDate: string
    qrCode: string
    simpleCode: string
  }>
  totalAmount: number
  currency: string
}

export async function sendTicketEmail(emailData: TicketEmailData): Promise<boolean> {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('Email transporter not configured - skipping email')
    return false
  }

  try {
    const ticketCount = emailData.tickets.length
    const subject = `🎢 Your Luna Park Tickets - Order #${emailData.orderNumber}`
    
    const htmlContent = generateTicketEmailHTML(emailData)
    const textContent = generateTicketEmailText(emailData)

    const mailOptions = {
      from: {
        name: 'Luna Park',
        address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!,
      },
      to: emailData.customerEmail,
      subject,
      text: textContent,
      html: htmlContent,
      attachments: generateQRCodeAttachments(emailData.tickets),
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ Ticket email sent successfully to ${emailData.customerEmail}`)
    console.log(`📧 Message ID: ${info.messageId}`)
    
    return true
  } catch (error) {
    console.error('❌ Failed to send ticket email:', error)
    return false
  }
}

function generateTicketEmailHTML(data: TicketEmailData): string {
  const formatCurrency = (amount: number, currency: string) => {
    const locale = currency === 'gbp' ? 'en-GB' : 'en-IE'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  const ticketRows = data.tickets.map(ticket => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; font-weight: 500;">${ticket.itemName}</td>
      <td style="padding: 12px; color: #6b7280;">${ticket.type}</td>
      <td style="padding: 12px; color: #6b7280;">${new Date(ticket.visitDate).toLocaleDateString()}</td>
      <td style="padding: 12px; font-family: monospace; background: #f3f4f6; border-radius: 4px;">${ticket.simpleCode}</td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Luna Park Tickets</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">🎢 Luna Park</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your tickets are ready!</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #374151; margin-top: 0;">Hello ${data.customerName}!</h2>
      
      <p style="color: #6b7280; font-size: 16px;">
        Thank you for choosing Luna Park! Your tickets have been confirmed and are ready for your visit.
      </p>

      <!-- Order Summary -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #374151;">Order Summary</h3>
        <p><strong>Order Number:</strong> #${data.orderNumber}</p>
        <p><strong>Total Amount:</strong> ${formatCurrency(data.totalAmount, data.currency)}</p>
        <p><strong>Number of Tickets:</strong> ${data.tickets.length}</p>
      </div>

      <!-- Tickets Table -->
      <h3 style="color: #374151;">Your Tickets</h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Attraction</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Type</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Visit Date</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Simple Code</th>
          </tr>
        </thead>
        <tbody>
          ${ticketRows}
        </tbody>
      </table>

      <!-- Instructions -->
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">How to Use Your Tickets</h3>
        <ul style="color: #374151; padding-left: 20px;">
          <li>Show the QR code on your phone or print this email</li>
          <li>Alternatively, provide the Simple Code to our staff</li>
          <li>Arrive 15 minutes before your scheduled time</li>
          <li>Have a magical day at Luna Park! 🎠</li>
        </ul>
      </div>

      <!-- Contact Info -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280;">
        <p>Need help? Contact us at support@lunapark.com or call +1 (555) 123-4567</p>
        <p style="font-size: 14px;">Luna Park - Where Magic Happens Every Day</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

function generateTicketEmailText(data: TicketEmailData): string {
  const formatCurrency = (amount: number, currency: string) => {
    const locale = currency === 'gbp' ? 'en-GB' : 'en-IE'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  const ticketList = data.tickets.map((ticket, index) => 
    `${index + 1}. ${ticket.itemName} (${ticket.type})
   Visit Date: ${new Date(ticket.visitDate).toLocaleDateString()}
   Simple Code: ${ticket.simpleCode}`
  ).join('\n\n')

  return `
🎢 LUNA PARK - YOUR TICKETS ARE READY!

Hello ${data.customerName}!

Thank you for choosing Luna Park! Your tickets have been confirmed.

ORDER SUMMARY:
- Order Number: #${data.orderNumber}
- Total Amount: ${formatCurrency(data.totalAmount, data.currency)}
- Number of Tickets: ${data.tickets.length}

YOUR TICKETS:
${ticketList}

HOW TO USE YOUR TICKETS:
• Show the QR code on your phone or print this email
• Alternatively, provide the Simple Code to our staff
• Arrive 15 minutes before your scheduled time
• Have a magical day at Luna Park! 🎠

Need help? Contact us at support@lunapark.com or call +1 (555) 123-4567

Luna Park - Where Magic Happens Every Day
  `
}

function generateQRCodeAttachments(tickets: TicketEmailData['tickets']) {
  // In a real implementation, you would generate QR code images
  // For now, we'll return empty array - QR codes can be viewed in the email HTML
  return []
}

export async function sendOrderConfirmationEmail(orderData: {
  customerEmail: string
  customerName: string
  orderNumber: string
  totalAmount: number
  currency: string
}): Promise<boolean> {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('Email transporter not configured - skipping email')
    return false
  }

  try {
    const subject = `🎢 Order Confirmation - Luna Park #${orderData.orderNumber}`
    
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Order Confirmed! 🎉</h2>
      <p>Hello ${orderData.customerName}!</p>
      <p>Your order has been successfully placed and payment confirmed.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order #${orderData.orderNumber}</strong></p>
        <p>Total: ${new Intl.NumberFormat(orderData.currency === 'gbp' ? 'en-GB' : 'en-IE', { style: 'currency', currency: orderData.currency.toUpperCase() }).format(orderData.totalAmount)}</p>
      </div>
      
      <p>Your tickets will be sent shortly in a separate email.</p>
      <p>Thank you for choosing Luna Park! 🎠</p>
    </div>
    `

    const mailOptions = {
      from: {
        name: 'Luna Park',
        address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!,
      },
      to: orderData.customerEmail,
      subject,
      html: htmlContent,
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Order confirmation email sent to ${orderData.customerEmail}`)
    
    return true
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error)
    return false
  }
}
