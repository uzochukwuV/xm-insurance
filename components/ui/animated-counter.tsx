"use client"

import { motion, useSpring, useTransform } from "framer-motion"
import { useEffect } from "react"

interface AnimatedCounterProps {
  value: number
  duration?: number
  decimals?: number
  suffix?: string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1,
  decimals = 0,
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const spring = useSpring(0, { duration: duration * 1000 })
  const display = useTransform(spring, (current) => current.toFixed(decimals) + suffix)

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {display}
    </motion.span>
  )
}
