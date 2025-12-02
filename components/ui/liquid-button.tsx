"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LiquidButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean
  variant?: "default" | "thunder" | "outline" | "gradient"
  size?: "sm" | "default" | "lg" | "xl"
}

const liquidButtonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  thunder: "bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white hover:from-blue-900 hover:via-blue-800 hover:to-blue-700",
  outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
  gradient: "bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90"
}

const liquidButtonSizes = {
  sm: "h-8 px-4 py-2 text-sm",
  default: "h-10 px-6 py-2",
  lg: "h-12 px-8 py-3 text-base",
  xl: "h-14 px-10 py-4 text-lg"
}

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement
      return (
        <motion.div
          className="relative inline-block"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {React.cloneElement(child, {
            ref,
            className: cn(
              "relative overflow-hidden rounded-md font-medium transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              liquidButtonVariants[variant],
              liquidButtonSizes[size],
              className
            ),
            ...props,
            children: (
              <>
                {/* Liquid background effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20"
                  initial={{ x: "-100%", y: "100%" }}
                  whileHover={{ 
                    x: "100%", 
                    y: "-100%",
                    transition: { 
                      duration: 0.8, 
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse"
                    }
                  }}
                />
                
                {/* Liquid wave effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: "-100%", y: "50%" }}
                  whileHover={{ 
                    x: "100%", 
                    y: "50%",
                    transition: { 
                      duration: 1.2, 
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse"
                    }
                  }}
                />
                
                {/* Liquid bubble effects */}
                <motion.div
                  className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ 
                    scale: [0, 1.5, 0], 
                    opacity: [0, 1, 0],
                    transition: { 
                      duration: 1.5, 
                      ease: "easeInOut",
                      repeat: Infinity,
                      delay: 0.2
                    }
                  }}
                />
                <motion.div
                  className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-white/30 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ 
                    scale: [0, 1.2, 0], 
                    opacity: [0, 1, 0],
                    transition: { 
                      duration: 1.8, 
                      ease: "easeInOut",
                      repeat: Infinity,
                      delay: 0.5
                    }
                  }}
                />
                
                {/* Content */}
                <span className="relative z-10">{child.props.children}</span>
              </>
            )
          })}
        </motion.div>
      )
    }

    return (
      <motion.div
        className="relative inline-block"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <button
          ref={ref}
          className={cn(
            "relative overflow-hidden rounded-md font-medium transition-all duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            liquidButtonVariants[variant],
            liquidButtonSizes[size],
            className
          )}
          {...props}
        >
          {/* Liquid background effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20"
            initial={{ x: "-100%", y: "100%" }}
            whileHover={{ 
              x: "100%", 
              y: "-100%",
              transition: { 
                duration: 0.8, 
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          />
          
          {/* Liquid wave effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: "-100%", y: "50%" }}
            whileHover={{ 
              x: "100%", 
              y: "50%",
              transition: { 
                duration: 1.2, 
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          />
          
          {/* Liquid bubble effects */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ 
              scale: [0, 1.5, 0], 
              opacity: [0, 1, 0],
              transition: { 
                duration: 1.5, 
                ease: "easeInOut",
                repeat: Infinity,
                delay: 0.2
              }
            }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-white/30 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ 
              scale: [0, 1.2, 0], 
              opacity: [0, 1, 0],
              transition: { 
                duration: 1.8, 
                ease: "easeInOut",
                repeat: Infinity,
                delay: 0.5
              }
            }}
          />
          
          {/* Content */}
          <span className="relative z-10">{children}</span>
        </button>
      </motion.div>
    )
  }
)

LiquidButton.displayName = "LiquidButton"

export { LiquidButton, liquidButtonVariants, liquidButtonSizes }
