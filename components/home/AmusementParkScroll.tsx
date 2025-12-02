"use client"
import React, { useRef } from "react"
import { useMotionValueEvent, useScroll } from "framer-motion"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string
    description: string
    content?: React.ReactNode | any
  }[]
  contentClassName?: string
}) => {
  const [activeCard, setActiveCard] = React.useState(0)
  const ref = useRef<any>(null)
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  })
  const cardLength = content.length

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength)
    const closestBreakpointIndex = cardsBreakpoints.reduce((acc, breakpoint, index) => {
      const distance = Math.abs(latest - breakpoint)
      if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
        return index
      }
      return acc
    }, 0)
    setActiveCard(closestBreakpointIndex)
  })

  const backgroundColors = ["#f8fafc", "#f8fafc", "#f8fafc", "#f8fafc", "#f8fafc"]

  return (
    <motion.div
      animate={{ backgroundColor: backgroundColors[activeCard % backgroundColors.length] }}
      className="relative flex h-[30rem] justify-between items-start overflow-y-auto rounded-md p-10 gap-20 scrollbar-hide"
      ref={ref}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
      <div className="relative flex items-start flex-1 pl-8">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                className="text-2xl font-bold text-gray-900"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                className="text-lg mt-10 max-w-sm text-gray-700"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>
      <div className={cn("sticky top-10 h-80 w-96 overflow-hidden rounded-md flex-shrink-0 mr-8 pointer-events-none", contentClassName)}>
        <div className="pointer-events-auto h-full w-full">
          {content[activeCard].content ?? null}
        </div>
      </div>
    </motion.div>
  )
}

export default function AmusementParkScroll() {
  const t = useTranslations()

  const content = [
    {
      title: t("home.scroll.cards.coaster.title"),
      description: t("home.scroll.cards.coaster.description"),
      content: (
        <div className="relative h-full w-full overflow-hidden">
          <img src="/thrilling-roller-coaster.png" alt={t("home.scroll.cards.coaster.overlayTitle") || "Thunder Mountain Express"} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="text-xl font-bold">{t("home.scroll.cards.coaster.overlayTitle")}</div>
            <div className="text-sm opacity-90">{t("home.scroll.cards.coaster.overlayDetail")}</div>
          </div>
        </div>
      ),
    },
    {
      title: t("home.scroll.cards.ferris.title"),
      description: t("home.scroll.cards.ferris.description"),
      content: (
        <div className="relative h-full w-full overflow-hidden">
          <img src="/colorful-ferris-wheel-sunset.png" alt={t("home.scroll.cards.ferris.overlayTitle") || "Sky View Wonder"} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="text-xl font-bold">{t("home.scroll.cards.ferris.overlayTitle")}</div>
            <div className="text-sm opacity-90">{t("home.scroll.cards.ferris.overlayDetail")}</div>
          </div>
        </div>
      ),
    },
    {
      title: t("home.scroll.cards.splash.title"),
      description: t("home.scroll.cards.splash.description"),
      content: (
        <div className="relative h-full w-full overflow-hidden">
          <img src="/colorful-water-park.png" alt={t("home.scroll.cards.splash.overlayTitle") || "Aqua Adventure"} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="text-xl font-bold">{t("home.scroll.cards.splash.overlayTitle")}</div>
            <div className="text-sm opacity-90">{t("home.scroll.cards.splash.overlayDetail")}</div>
          </div>
        </div>
      ),
    },
    {
      title: t("home.scroll.cards.haunted.title"),
      description: t("home.scroll.cards.haunted.description"),
      content: (
        <div className="relative h-full w-full overflow-hidden">
          <img src="/dark-dragon-coaster.png" alt={t("home.scroll.cards.haunted.overlayTitle") || "Phantom Manor"} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="text-xl font-bold">{t("home.scroll.cards.haunted.overlayTitle")}</div>
            <div className="text-sm opacity-90">{t("home.scroll.cards.haunted.overlayDetail")}</div>
          </div>
        </div>
      ),
    },
    {
      title: t("home.scroll.cards.bumper.title"),
      description: t("home.scroll.cards.bumper.description"),
      content: (
        <div className="relative h-full w-full overflow-hidden">
          <img src="/colorful-carousel.png" alt={t("home.scroll.cards.bumper.overlayTitle") || "Crash Course Arena"} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="text-xl font-bold">{t("home.scroll.cards.bumper.overlayTitle")}</div>
            <div className="text-sm opacity-90">{t("home.scroll.cards.bumper.overlayDetail")}</div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="w-full py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {t("home.scroll.title")} <span style={{ color: '#155dfc' }}>{t("home.scroll.highlight")}</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t("home.scroll.subtitle")}
        </p>
      </div>
      <StickyScroll content={content} />
    </div>
  )
}