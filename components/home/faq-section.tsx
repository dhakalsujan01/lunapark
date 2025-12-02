"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])
  const t = useTranslations()

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const faqData = [
    {
      questionKey: "home.faq.hours.question",
      answerKey: "home.faq.hours.answer"
    },
    {
      questionKey: "home.faq.cost.question",
      answerKey: "home.faq.cost.answer"
    },
    {
      questionKey: "home.faq.height.question",
      answerKey: "home.faq.height.answer"
    },
    {
      questionKey: "home.faq.food.question",
      answerKey: "home.faq.food.answer"
    },
    {
      questionKey: "home.faq.accessibility.question",
      answerKey: "home.faq.accessibility.answer"
    },
    {
      questionKey: "home.faq.rain.question",
      answerKey: "home.faq.rain.answer"
    },
    {
      questionKey: "home.faq.fastpass.question",
      answerKey: "home.faq.fastpass.answer"
    },
    {
      questionKey: "home.faq.storage.question",
      answerKey: "home.faq.storage.answer"
    }
  ]

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t("home.faq.title")} <span style={{ color: '#155dfc' }}>{t("home.faq.titleHighlight")}</span>
          </h1>
          <p className="text-lg text-muted-foreground">{t("home.faq.subtitle")}</p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div key={index} className="bg-card rounded-lg overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-primary">{t(item.questionKey)}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                    openItems.includes(index) ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <p className="text-foreground leading-relaxed">{t(item.answerKey)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}