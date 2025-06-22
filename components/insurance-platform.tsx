"use client"

import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BuyInsuranceForm } from "@/components/insurance/buy-insurance-form"
import { PremiumPaymentForm } from "@/components/insurance/premium-payment-form"
import { WeatherDashboard } from "@/components/insurance/weather-dashboard"
import { Shield, CreditCard, Cloud } from "lucide-react"

export function InsurancePlatform() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent mb-4">
          WeatherXM Insurance Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Protect your crops with blockchain-powered weather insurance. Automated payouts based on real-time weather
          data.
        </p>
      </motion.div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-14">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 text-base">
            <Cloud className="h-5 w-5" />
            Weather Dashboard
          </TabsTrigger>
          <TabsTrigger value="buy" className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5" />
            Buy Insurance
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5" />
            Premium Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <WeatherDashboard />
        </TabsContent>

        <TabsContent value="buy">
          <BuyInsuranceForm />
        </TabsContent>

        <TabsContent value="payments">
          <PremiumPaymentForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
