"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { StationOverview } from "@/components/station-overview"
import { RealTimeWeather } from "@/components/real-time-weather"
import { HistoricalAnalysis } from "@/components/historical-analysis"
import { ForecastAnalysis } from "@/components/forecast-analysis"
import { ModelPerformance } from "@/components/model-performance"
import { GeographicAnalysis } from "@/components/geographic-analysis"
import { Toaster } from "@/components/ui/toaster"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

export default function Home() {
  const [activeSection, setActiveSection] = useState("overview")
  const [isOnline, setIsOnline] = useState(true)

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
    const components = {
      overview: StationOverview,
      realtime: RealTimeWeather,
      historical: HistoricalAnalysis,
      forecast: ForecastAnalysis,
      performance: ModelPerformance,
      geographic: GeographicAnalysis,
    }

    const Component = components[activeSection as keyof typeof components] || StationOverview

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Component />
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <SidebarProvider>
        <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <SidebarInset>
          <motion.header
            className="flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-sm px-4 shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-4 flex-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  WeatherXM Analytics
                </h1>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
                  {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {isOnline ? "Connected" : "Offline"}
                </Badge>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-muted-foreground"
            >
              {new Date().toLocaleString()}
            </motion.div>
          </motion.header>
          <div className="flex flex-1 flex-col gap-4 p-6">{renderContent()}</div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </div>
  )
}
