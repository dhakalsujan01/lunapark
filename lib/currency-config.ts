// Currency configuration - separate from Stripe to avoid client-side loading
export const SUPPORTED_CURRENCIES = ["eur", "gbp"] as const
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]

// Currency configuration
export const CURRENCY_CONFIG = {
  eur: {
    symbol: "€",
    code: "EUR",
    locale: "en-IE",
    name: "Euro"
  },
  gbp: {
    symbol: "£",
    code: "GBP", 
    locale: "en-GB",
    name: "British Pound"
  }
} as const
