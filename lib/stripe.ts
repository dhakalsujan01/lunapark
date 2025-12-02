import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables")
}

if (!process.env.NEXTAUTH_URL) {
  console.warn("NEXTAUTH_URL is not set - this may cause issues with redirect URLs")
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not set in environment variables - webhook signature verification will fail")
}

// Prefer using account default API version unless explicitly pinned via env
// If you want to pin, set STRIPE_API_VERSION to a valid date (e.g. "2024-06-20")
const stripeConfig: Stripe.StripeConfig = {
  typescript: true,
}

if (process.env.STRIPE_API_VERSION) {
  stripeConfig.apiVersion = process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, stripeConfig)

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: "eur" as const, // Default to EUR, can be overridden per session
  payment_method_types: ["card"] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
  mode: "payment" as const,
  success_url: `${process.env.NEXTAUTH_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXTAUTH_URL}/booking/cancelled`,
}
