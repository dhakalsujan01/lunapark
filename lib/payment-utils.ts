import { stripe } from "./stripe"
import { type SupportedCurrency } from "./currency-config"
import { formatCurrency as formatCurrencyUtil } from "./currency-utils"

export interface PaymentMetadata {
  orderId: string
  userId: string
  itemType?: string
  itemId?: string
}

export async function createPaymentIntent(amount: number, currency: SupportedCurrency = "eur", metadata: PaymentMetadata) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return paymentIntent
  } catch (error) {
    console.error("Error creating payment intent:", error)
    throw error
  }
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId)
  } catch (error) {
    console.error("Error retrieving payment intent:", error)
    throw error
  }
}

export async function createRefund(paymentIntentId: string, amount?: number, reason?: string) {
  try {
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason: reason as any,
    })
  } catch (error) {
    console.error("Error creating refund:", error)
    throw error
  }
}

export function formatCurrency(amount: number, currency: SupportedCurrency = "eur"): string {
  return formatCurrencyUtil(amount, currency)
}

export function validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    stripe.webhooks.constructEvent(payload, signature, secret)
    return true
  } catch (error) {
    console.error("Webhook signature validation failed:", error)
    return false
  }
}
