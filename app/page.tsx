"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { StationOverview } from "@/components/station-overview"
import { RealTimeWeather } from "@/components/real-time-weather"
import { HistoricalAnalysis } from "@/components/historical-analysis"
import { ForecastAnalysis } from "@/components/forecast-analysis"
import { ModelPerformance } from "@/components/model-performance"
import { GeographicAnalysis } from "@/components/geographic-analysis"
import { InsurancePlatform } from "@/components/insurance-platform"
import { MyPoliciesDashboard } from "@/components/my-policies-dashboard"
import { Badge } from "@/components/ui/badge"
import { Clock, Wifi, WifiOff } from "lucide-react"

export default function Home() {
  const [activeSection, setActiveSection] = useState("overview")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const renderContent = () => {
    const contentVariants = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    }

    switch (activeSection) {
      case "overview":
        return (
          <motion.div key="overview" variants={contentVariants} initial="initial" animate="animate" exit="exit">
            <StationOverview />
          </motion.div>
        )
      case "realtime":
        return (
          <motion.div key="realtime" variants={contentVariants} initial="initial" animate="animate" exit="exit">
            <RealTimeWeather />
          </motion.div>
        )
      case "historical":
        return (
          <motion.div key="historical" variants={contentVariants} initial="initial" animate="animate" exit="exit">
            <HistoricalAnalysis />
          </motion.div>
        )
      case "forecast":
        return (
          <motion.div key="forecast" variants={contentVariants} initial="initial" animate="animate" exit="exit">
            <ForecastAnalysis />
          </motion.div>
        )
      case "performance":
        return (
          <motion.div key="performance" variants={contentVariants} initial="initial" animate="animate" exit="exit">
            <ModelPerformance />
          </motion.div>
        )
      case "geographic":
        return (
          <motion.div key="geographic" variants={contentVariants} initial="initial" animate="animate" exit="exit">
            <GeographicAnalysis />
          </motion.div>
        )
      case "insurance":
        return (
          <motion.div key="insurance" variants={contentVariants} initial="initial" animate="animate" exit="exit">
            <InsurancePlatform />
          </motion.div>
        )
      case "my-policies":
        return (
          <motion.div key="my-policies" variants={contentVariants} initial="initial" animate="animate" exit="exit">
            <MyPoliciesDashboard />
          </motion.div>
        )
      default:
        return (
          <motion.div key="overview" variants={contentVariants} initial="initial" animate="animate" exit="exit">
            <StationOverview />
          </motion.div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      <SidebarProvider>
        <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-1 overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md shadow-sm">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-8 w-8" />
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">WX</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      WeatherXM Analytics
                    </h1>
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Badge
                    variant="outline"
                    className={`${isOnline ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}`}
                  >
                    {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                    {isOnline ? "Online" : "Offline"}
                  </Badge>
                </motion.div>

                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {currentTime.toLocaleTimeString()}
                </Badge>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}
