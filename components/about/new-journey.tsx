"use client"
import { motion } from "framer-motion"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

interface TimelineEntry {
  title: string
  content: React.ReactNode
}

// Timeline data will be created dynamically with translations

const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const t = useTranslations('about.timeline')
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setHeight(rect.height)
    }
  }, [ref])

  return (
    <div className="w-full bg-white dark:bg-gray-900 font-sans md:px-10 transition-colors duration-300" ref={containerRef}>
      <div className="max-w-7xl mx-auto py-16 px-4 md:px-8 lg:px-10">
        <h2 className="text-2xl md:text-4xl lg:text-5xl mb-6 text-gray-900 dark:text-white max-w-4xl font-bold transition-colors duration-300">
          {t('title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg max-w-2xl leading-relaxed transition-colors duration-300">
          {t('description')}
        </p>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-16">
        {data.map((item, index) => (
          <motion.div 
            key={index} 
            className="flex justify-start pt-8 md:pt-20 md:gap-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-20 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-12 absolute left-3 md:left-3 w-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg border-2 border-gray-200 dark:border-gray-600 transition-colors duration-300">
                <div className="h-5 w-5 rounded-full bg-amber-400 dark:bg-amber-500 transition-colors duration-300" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-4xl font-bold text-gray-600 dark:text-gray-300 transition-colors duration-300">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-6 text-left font-bold text-gray-600 dark:text-gray-300 transition-colors duration-300">
                {item.title}
              </h3>
              {item.content}{" "}
            </div>
          </motion.div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-gradient-to-b from-gray-200 dark:from-gray-600 via-gray-300 dark:via-gray-500 to-gray-200 dark:to-gray-600 transition-colors duration-300"
        >
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: height }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-amber-400 via-orange-500 to-amber-400 rounded-full"
          />
        </div>
      </div>
    </div>
  )
}

export default function CompleteTimeline() {
  const t = useTranslations('about.timeline')
  
  const timelineData: TimelineEntry[] = [
    {
      title: "2024",
      content: (
        <div>
          <p className="text-gray-700 dark:text-gray-200 text-sm md:text-base font-normal mb-8 leading-relaxed transition-colors duration-300">
            {t('entries.2024.content')}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/thrilling-roller-coaster.png"
              alt="Thrilling roller coaster at amusement park"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300"
            />
            <img
              src="/ferris-wheel-at-sunset.png"
              alt="Ferris wheel at sunset with bright lights"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300"
            />
            <img
              src="/colorful-carousel.png"
              alt="Colorful carousel with bright carnival lights"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300"
            />
            <img
              src="/kids-playing-carnival-games.png"
              alt="Kids playing carnival games at amusement park"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Early 2023",
      content: (
        <div>
          <p className="text-gray-700 dark:text-gray-200 text-sm md:text-base font-normal mb-8 leading-relaxed transition-colors duration-300">
            {t('entries.early2023.content')}
          </p>
          <p className="text-gray-700 dark:text-gray-200 text-sm md:text-base font-normal mb-8 leading-relaxed transition-colors duration-300">
            {t('entries.early2023.content2')}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/water-ride-splash-zone.png"
              alt="Water ride splash zone at water park"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300"
            />
            <img
              src="/colorful-carousel-horses.png"
              alt="Colorful carousel horses and decorations"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300"
            />
            <img
              src="/dark-dragon-coaster.png"
              alt="Dark dragon coaster at theme park"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300"
            />
            <img
              src="/amusement-park-entrance-gate.png"
              alt="Amusement park entrance gate"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Changelog",
      content: (
        <div>
          <p className="text-gray-700 dark:text-gray-200 text-sm md:text-base font-normal mb-4 leading-relaxed transition-colors duration-300">
            {t('entries.changelog.content')}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/family-water-rapids.png"
              alt="Family water rapids ride at theme park"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300"
            />
            <img
              src="/roller-coaster-thunder-mountain.png"
              alt="Roller coaster thunder mountain"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300"
            />
            <img
              src="/colorful-water-park.png"
              alt="Colorful water park attractions"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300"
            />
            <img
              src="/colorful-amusement-park-sunset.png"
              alt="Colorful amusement park at sunset"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300"
            />
          </div>
        </div>
      ),
    },
  ]
  
  return <Timeline data={timelineData} />
}