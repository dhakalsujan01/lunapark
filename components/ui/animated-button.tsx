"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

const animatedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg hover:shadow-xl",
        destructive:
          "bg-destructive text-white shadow-lg hover:shadow-xl",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground shadow-md hover:shadow-lg",
        secondary:
          "bg-secondary text-secondary-foreground shadow-lg hover:shadow-xl",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl",
        thunder:
          "bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white shadow-lg hover:shadow-xl",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 py-2",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-lg",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        spin: "animate-spin",
        ping: "animate-ping",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

interface AnimatedButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof animatedButtonVariants> {
  asChild?: boolean
  motionProps?: MotionProps
  showRipple?: boolean
  showShine?: boolean
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant, size, animation, asChild = false, motionProps, showRipple = true, showShine = true, children, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (showRipple) {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        const newRipple = {
          id: Date.now(),
          x,
          y,
        }
        
        setRipples(prev => [...prev, newRipple])
        
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
        }, 600)
      }
      
      if (props.onClick) {
        props.onClick(e)
      }
    }

    const defaultMotionProps: MotionProps = {
      whileHover: { 
        scale: 1.05,
        y: -2,
        transition: { duration: 0.2 }
      },
      whileTap: { 
        scale: 0.95,
        y: 0,
        transition: { duration: 0.1 }
      },
      ...motionProps
    }

    if (asChild) {
      // When asChild is true, we need to clone the child and add our props
      const child = React.Children.only(children) as React.ReactElement
      
      return (
        <motion.div {...defaultMotionProps}>
          <Slot
            ref={ref}
            data-slot="animated-button"
            className={cn(animatedButtonVariants({ variant, size, animation, className }))}
            onClick={handleClick}
            {...props}
          >
            {React.cloneElement(child, {
              ...child.props,
              className: cn(child.props.className, animatedButtonVariants({ variant, size, animation, className })),
              onClick: (e: any) => {
                handleClick(e)
                if (child.props.onClick) {
                  child.props.onClick(e)
                }
              },
              children: (
                <>
                  {/* Shine effect */}
                  {showShine && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  )}
                  
                  {/* Ripple effects */}
                  {showRipple && ripples.map(ripple => (
                    <motion.span
                      key={ripple.id}
                      className="absolute rounded-full bg-white/30"
                      initial={{
                        width: 0,
                        height: 0,
                        x: ripple.x,
                        y: ripple.y,
                        opacity: 1,
                      }}
                      animate={{
                        width: 200,
                        height: 200,
                        x: ripple.x - 100,
                        y: ripple.y - 100,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  ))}
                  
                  {/* Content */}
                  <span className="relative z-10">{child.props.children}</span>
                </>
              )
            })}
          </Slot>
        </motion.div>
      )
    }

    // Regular button rendering
    return (
      <motion.div {...defaultMotionProps}>
        <button
          ref={ref}
          data-slot="animated-button"
          className={cn(animatedButtonVariants({ variant, size, animation, className }))}
          onClick={handleClick}
          {...props}
        >
          {/* Shine effect */}
          {showShine && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          )}
          
          {/* Ripple effects */}
          {showRipple && ripples.map(ripple => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full bg-white/30"
              initial={{
                width: 0,
                height: 0,
                x: ripple.x,
                y: ripple.y,
                opacity: 1,
              }}
              animate={{
                width: 200,
                height: 200,
                x: ripple.x - 100,
                y: ripple.y - 100,
                opacity: 0,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
          
          {/* Content */}
          <span className="relative z-10">{children}</span>
        </button>
      </motion.div>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton, animatedButtonVariants }
