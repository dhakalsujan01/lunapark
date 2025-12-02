"use client"

import React, { useState } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const HeroParallax = ({
  products,
}: {
  products: {
    title: string
    link: string
    thumbnail: string
  }[]
}) => {
  console.log('HeroParallax rendered with products:', products)
  const firstRow = products.slice(0, 5)
  const secondRow = products.slice(5, 10)
  const thirdRow = products.slice(10, 15)
  const ref = React.useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 }

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  )
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  )
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  )
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  )
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  )
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  )

  return (
    <div
      ref={ref}
      className="h-[280vh] py-32 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d] bg-gradient-to-b from-white to-gray-50"
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className="mt-20"
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-16 mb-16">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-16 space-x-16">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-16">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

export const Header = () => {
  return (
    <div className="max-w-6xl relative mx-auto py-20 md:py-32 px-4 w-full left-0 top-0">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
          Welcome to{" "}
          <span className="text-blue-600">
            Luna Park
          </span>
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl mt-6 text-gray-600 leading-relaxed">
          Where adventure meets excitement. Experience world-class attractions, 
          thrilling rides, and unforgettable moments for the whole family.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 text-lg"
            asChild
          >
            <Link href="/attractions">Buy Tickets</Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 text-lg"
            asChild
          >
            <Link href="/attractions">View Attractions</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600">20+</div>
            <div className="text-gray-600 mt-2">Thrilling Rides</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600">50K+</div>
            <div className="text-gray-600 mt-2">Happy Visitors</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600">365</div>
            <div className="text-gray-600 mt-2">Days Open</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export const ProductCard = ({
  product,
  translate,
}: {
  product: {
    title: string
    link: string
    thumbnail: string
  }
  translate: any
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -10,
      }}
      key={product.title}
      className="group/product h-80 w-[28rem] relative flex-shrink-0 rounded-lg overflow-hidden"
    >
      <Link
        href={product.link}
        className="block group-hover/product:shadow-xl transition-shadow duration-300"
      >
        <Image
          src={product.thumbnail}
          height="600"
          width="600"
          className="object-cover object-center absolute h-full w-full inset-0 transition-transform duration-300 group-hover/product:scale-105"
          alt={product.title}
          onError={(e) => {
            console.error(`Failed to load image: ${product.thumbnail}`)
            // Prevent infinite loops by checking if already using placeholder
            if (!e.currentTarget.src.includes('placeholder.jpg')) {
              e.currentTarget.src = '/placeholder.jpg'
            }
          }}
        />
      </Link>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-60 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 pointer-events-none"></div>
      <h2 className="absolute bottom-6 left-6 opacity-0 group-hover/product:opacity-100 text-white font-semibold text-lg transition-opacity duration-300">
        {product.title}
      </h2>
    </motion.div>
  )
}
