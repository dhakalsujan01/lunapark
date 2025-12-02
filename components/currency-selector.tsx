"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupportedCurrencies, getCurrencySymbol, getCurrencyName, type SupportedCurrency } from "@/lib/currency-utils"

interface CurrencySelectorProps {
  value?: SupportedCurrency
  onValueChange?: (currency: SupportedCurrency) => void
  className?: string
}

export function CurrencySelector({ value = "eur", onValueChange, className }: CurrencySelectorProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>(value)
  
  const supportedCurrencies = getSupportedCurrencies()

  useEffect(() => {
    setSelectedCurrency(value)
  }, [value])

  const handleValueChange = (newCurrency: string) => {
    if (newCurrency === "eur" || newCurrency === "gbp") {
      setSelectedCurrency(newCurrency)
      onValueChange?.(newCurrency)
    }
  }

  return (
    <Select value={selectedCurrency} onValueChange={handleValueChange}>
      <SelectTrigger className={className}>
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getCurrencySymbol(selectedCurrency)}</span>
            <span>{getCurrencyName(selectedCurrency)}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {supportedCurrencies.map((currency) => (
          <SelectItem key={currency} value={currency}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getCurrencySymbol(currency)}</span>
              <span>{getCurrencyName(currency)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
