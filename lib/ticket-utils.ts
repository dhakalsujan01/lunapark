import crypto from "crypto"

export interface TicketData {
  ticketId: string
  userId: string
  type: "ride" | "package"
  validUntil: string
}

export function generateQRCode(ticketData: TicketData): string {
  const data = Buffer.from(JSON.stringify(ticketData)).toString("base64")
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret"
  const signature = crypto.createHmac("sha256", secret).update(data).digest("hex")

  return `${data}.${signature}`
}

export function validateQRSignature(qrData: string, signature: string): boolean {
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret"
  const expectedSignature = crypto.createHmac("sha256", secret).update(qrData).digest("hex")
  return signature === expectedSignature
}

export function parseQRCode(qrCode: string): { data: TicketData; signature: string } | null {
  try {
    const [qrData, signature] = qrCode.split(".")
    if (!qrData || !signature) return null

    const decodedData = Buffer.from(qrData, "base64").toString("utf-8")
    const data = JSON.parse(decodedData) as TicketData

    return { data, signature }
  } catch (error) {
    return null
  }
}

export function isTicketExpired(validUntil: string): boolean {
  return new Date() > new Date(validUntil)
}

export function getTicketStatusColor(status: string): string {
  switch (status) {
    case "valid":
      return "text-green-600 bg-green-50"
    case "used":
      return "text-gray-600 bg-gray-50"
    case "expired":
      return "text-red-600 bg-red-50"
    case "cancelled":
      return "text-red-600 bg-red-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}
