"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Activity, AlertTriangle, CheckCircle, Search, Loader2, Wifi } from "lucide-react"
import { getAllStations, getStationHealth, type Station } from "@/lib/api"
import { GradientCard } from "@/components/ui/gradient-card"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { CardSkeleton } from "@/components/ui/loading-skeleton"
import { useToast } from "@/hooks/use-toast"

interface StationWithHealth extends Station {
  health?: {
    data_quality: { score: number }
    location_quality: { score: number; reason: string }
  }
  status: "active" | "warning" | "offline"
}

export function StationOverview() {
  const [stations, setStations] = useState<StationWithHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    loadStations()
  }, [])

  const loadStations = async () => {
    try {
      setLoading(true)
      const stationsData = await getAllStations()

      // Enhance stations with health data and status
      const enhancedStations = await Promise.all(
        stationsData.slice(0, 20).map(async (station) => {
          // Limit to first 20 for demo
          try {
            const health = await getStationHealth(station.id)
            const status = getStationStatus(health.data_quality.score)

            return {
              ...station,
              health,
              status,
            } as StationWithHealth
          } catch (error) {
            // If health data fails, assign default status
            return {
              ...station,
              status: "warning" as const,
            }
          }
        }),
      )

      setStations(enhancedStations)
      toast({
        title: "Stations Loaded",
        description: `Successfully loaded ${enhancedStations.length} stations`,
      })
    } catch (error) {
      console.error("Error loading stations:", error)
      toast({
        title: "Error",
        description: "Failed to load stations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStationStatus = (dataQuality: number): "active" | "warning" | "offline" => {
    if (dataQuality >= 0.8) return "active"
    if (dataQuality >= 0.5) return "warning"
    return "offline"
  }

  const filteredStations = stations.filter((station) => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || station.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      warning: { className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertTriangle },
      offline: { className: "bg-red-100 text-red-800 border-red-200", icon: Activity },
    }

    const variant = variants[status as keyof typeof variants] || variants.active
    const Icon = variant.icon

    return (
      <Badge className={variant.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const activeStations = stations.filter((s) => s.status === "active").length
  const warningStations = stations.filter((s) => s.status === "warning").length
  const offlineStations = stations.filter((s) => s.status === "offline").length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Station Overview
        </h2>
        <p className="text-lg text-muted-foreground mt-2">
          Monitor and manage your WeatherXM station network in real-time
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <GradientCard title="Total Stations" gradient="from-blue-500/20 to-cyan-500/20" delay={0.1}>
          <div className="flex items-center justify-between">
            <div>
              <AnimatedCounter value={stations.length} className="text-3xl font-bold text-blue-600" />
              <p className="text-sm text-muted-foreground mt-1">Across all regions</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <MapPin className="h-8 w-8 text-blue-500" />
            </motion.div>
          </div>
        </GradientCard>

        <GradientCard title="Active Stations" gradient="from-green-500/20 to-emerald-500/20" delay={0.2}>
          <div className="flex items-center justify-between">
            <div>
              <AnimatedCounter value={activeStations} className="text-3xl font-bold text-green-600" />
              <p className="text-sm text-muted-foreground mt-1">
                <AnimatedCounter
                  value={stations.length > 0 ? (activeStations / stations.length) * 100 : 0}
                  decimals={1}
                  suffix="% operational"
                  className="text-sm"
                />
              </p>
            </div>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </motion.div>
          </div>
        </GradientCard>

        <GradientCard title="Warning Status" gradient="from-yellow-500/20 to-orange-500/20" delay={0.3}>
          <div className="flex items-center justify-between">
            <div>
              <AnimatedCounter value={warningStations} className="text-3xl font-bold text-yellow-600" />
              <p className="text-sm text-muted-foreground mt-1">Require attention</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </motion.div>
          </div>
        </GradientCard>

        <GradientCard title="Offline Stations" gradient="from-red-500/20 to-pink-500/20" delay={0.4}>
          <div className="flex items-center justify-between">
            <div>
              <AnimatedCounter value={offlineStations} className="text-3xl font-bold text-red-600" />
              <p className="text-sm text-muted-foreground mt-1">Need maintenance</p>
            </div>
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            >
              <Activity className="h-8 w-8 text-red-500" />
            </motion.div>
          </div>
        </GradientCard>
      </div>

      {/* Filters and Search */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-2 focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "warning", "offline"].map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? "default" : "outline"}
              onClick={() => setStatusFilter(filter)}
              size="sm"
              className={`h-12 px-6 transition-all duration-300 ${
                statusFilter === filter ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg" : "hover:scale-105"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Station Grid */}
      <AnimatePresence>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStations.map((station, index) => (
            <motion.div
              key={station.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
            >
              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16" />

                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">{station.name}</CardTitle>
                    {getStatusBadge(station.status)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    Station ID: {station.id.slice(0, 8)}...
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        Location
                      </div>
                      <div className="font-medium">
                        {station.lat.toFixed(4)}, {station.lon.toFixed(4)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Elevation</div>
                      <div className="font-medium">{station.elevation}m</div>
                    </div>
                  </div>

                  {station.health && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Data Quality</span>
                        <span className="font-medium">{(station.health.data_quality.score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${station.health.data_quality.score * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(station.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                    >
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filteredStations.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Search className="h-16 w-16 text-muted-foreground mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">No stations found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Try adjusting your search terms or filters to find stations, or check your network connection.
              </p>
              <Button onClick={loadStations} className="mt-4" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Refresh Stations
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
