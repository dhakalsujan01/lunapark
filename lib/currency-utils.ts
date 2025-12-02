import { CURRENCY_CONFIG, type SupportedCurrency } from "./currency-config"

// Re-export SupportedCurrency for use in other files
export type { SupportedCurrency }

export function formatCurrency(amount: number, currency: SupportedCurrency = "eur"): string {
  const config = CURRENCY_CONFIG[currency]
  // Convert from cents to main currency unit if amount is large (likely in cents)
  const displayAmount = amount > 1000 ? amount / 100 : amount
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayAmount)
}

export function formatCurrencySimple(amount: number, currency: SupportedCurrency = "eur"): string {
  const config = CURRENCY_CONFIG[currency]
  // Convert from cents to main currency unit if amount is large (likely in cents)
  const displayAmount = amount > 1000 ? (amount / 100).toFixed(2) : amount.toFixed(2)
  return `${config.symbol}${displayAmount}`
}

export function getCurrencySymbol(currency: SupportedCurrency = "eur"): string {
  return CURRENCY_CONFIG[currency].symbol
}

export function getCurrencyName(currency: SupportedCurrency = "eur"): string {
  return CURRENCY_CONFIG[currency].name
}

export function isValidCurrency(currency: string): currency is SupportedCurrency {
  return ["eur", "gbp"].includes(currency)
}

export function getSupportedCurrencies(): SupportedCurrency[] {
  return ["eur", "gbp"]
}

// CURRENCY CONVERSION: Simple conversion rates (in production, use real-time rates)
const CONVERSION_RATES = {
  eur_to_gbp: 0.85, // 1 EUR = 0.85 GBP (approximate)
  gbp_to_eur: 1.18, // 1 GBP = 1.18 EUR (approximate)
} as const

// CURRENCY VALIDATION: Validate currency conversion
export function validateCurrencyConversion(
  amount: number, 
  fromCurrency: SupportedCurrency, 
  toCurrency: SupportedCurrency
): { isValid: boolean; error?: string } {
  // Check if currencies are valid
  if (!isValidCurrency(fromCurrency)) {
    return { isValid: false, error: `Invalid source currency: ${fromCurrency}` }
  }
  
  if (!isValidCurrency(toCurrency)) {
    return { isValid: false, error: `Invalid target currency: ${toCurrency}` }
  }
  
  // Check if amount is valid
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
    return { isValid: false, error: "Amount must be a positive number" }
  }
  
  // Check amount limits
  if (amount > 999999) {
    return { isValid: false, error: "Amount too high. Maximum €999,999.99 allowed" }
  }
  
  return { isValid: true }
}

// CURRENCY CONVERSION: Convert amount between supported currencies
export function convertCurrency(
  amount: number, 
  fromCurrency: SupportedCurrency, 
  toCurrency: SupportedCurrency
): { amount: number; rate: number; error?: string } {
  // Validate input
  const validation = validateCurrencyConversion(amount, fromCurrency, toCurrency)
  if (!validation.isValid) {
    return { amount: 0, rate: 0, error: validation.error }
  }
  
  // Same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return { amount, rate: 1 }
  }
  
  // Get conversion rate
  const rateKey = `${fromCurrency}_to_${toCurrency}` as keyof typeof CONVERSION_RATES
  const rate = CONVERSION_RATES[rateKey]
  
  if (!rate) {
    return { 
      amount: 0, 
      rate: 0, 
      error: `Conversion rate not available for ${fromCurrency} to ${toCurrency}` 
    }
  }
  
  // Convert amount
  const convertedAmount = Math.round(amount * rate * 100) / 100 // Round to 2 decimal places
  
  return { amount: convertedAmount, rate }
}

// CURRENCY VALIDATION: Validate currency amount for display
export function validateCurrencyAmount(amount: number, currency: SupportedCurrency): { isValid: boolean; error?: string } {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return { isValid: false, error: "Amount must be a valid number" }
  }
  
  if (amount < 0) {
    return { isValid: false, error: "Amount cannot be negative" }
  }
  
  if (amount > 999999) {
    return { isValid: false, error: "Amount too high. Maximum €999,999.99 allowed" }
  }
  
  // Check for reasonable decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length
  if (decimalPlaces > 2) {
    return { isValid: false, error: "Amount cannot have more than 2 decimal places" }
  }
  
  return { isValid: true }
}
