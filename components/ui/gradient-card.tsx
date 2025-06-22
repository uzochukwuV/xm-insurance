"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface GradientCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  gradient?: string
  delay?: number
}

export function GradientCard({
  title,
  description,
  children,
  className,
  gradient = "from-blue-500/10 to-purple-500/10",
  delay = 0,
}: GradientCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
    >
      <Card
        className={cn(
          "relative overflow-hidden border-0 shadow-lg backdrop-blur-sm",
          `bg-gradient-to-br ${gradient}`,
          className,
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && <CardDescription className="text-sm opacity-80">{description}</CardDescription>}
        </CardHeader>
        <CardContent className="relative">{children}</CardContent>
      </Card>
    </motion.div>
  )
}
