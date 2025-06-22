"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  Cloud,
  Droplets,
  Wind,
  Sun,
  AlertTriangle,
  Shield,
  TrendingUp,
  MapPin,
  Activity,
  RefreshCw,
} from "lucide-react"
import { getAllStations, getStationWeatherRisk, type Station } from "@/lib/weather-api"
import { GradientCard } from "@/components/ui/gradient-card"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { useToast } from "@/hooks/use-toast"

interface StationRiskData {
  station: Station
  riskData: any
  alerts: string[]
}

export function WeatherDashboard() {
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState<string>("")
  const [stationRisks, setStationRisks] = useState<StationRiskData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadStations()
  }, [])

  useEffect(() => {
    if (selectedStation) {
      loadStationRisk(selectedStation)
    }
  }, [selectedStation])

  const loadStations = async () => {
    try {
      const stationsData = await getAllStations()
      setStations(stationsData.slice(0, 20)) // Limit for demo
      if (stationsData.length > 0) {
        setSelectedStation(stationsData[0].id)
      }

      // Load risk data for all stations
      await loadAllStationRisks(stationsData.slice(0, 10))
    } catch (error) {
      console.error("Error loading stations:", error)
      toast({
        title: "Error",
        description: "Failed to load weather stations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAllStationRisks = async (stationsList: Station[]) => {
    const risks: StationRiskData[] = []

    for (const station of stationsList) {
      try {
        const riskData = await getStationWeatherRisk(station.id)
        const alerts = []

        if (riskData.flood_risk >= 70) alerts.push("Flood Risk")
        if (riskData.wind_risk >= 70) alerts.push("Wind Risk")
        if (riskData.drought_risk >= 70) alerts.push("Drought Risk")

        risks.push({
          station,
          riskData,
          alerts,
        })
      } catch (error) {
        console.error(`Error loading risk for station ${station.id}:`, error)
      }
    }

    setStationRisks(risks)
  }

  const loadStationRisk = async (stationId: string) => {
    try {
      setRefreshing(true)
      const riskData = await getStationWeatherRisk(stationId)
      // Update the specific station in stationRisks
      setStationRisks((prev) => prev.map((sr) => (sr.station.id === stationId ? { ...sr, riskData } : sr)))
    } catch (error) {
      console.error("Error loading station risk:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const selectedStationRisk = stationRisks.find((sr) => sr.station.id === selectedStation)
  const highRiskStations = stationRisks.filter(
    (sr) => sr.riskData.flood_risk >= 70 || sr.riskData.wind_risk >= 70 || sr.riskData.drought_risk >= 70,
  )

  const getRiskLevel = (risk: number) => {
    if (risk >= 80) return { level: "Extreme", color: "text-red-600", bg: "bg-red-100" }
    if (risk >= 60) return { level: "High", color: "text-orange-600", bg: "bg-orange-100" }
    if (risk >= 40) return { level: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { level: "Low", color: "text-green-600", bg: "bg-green-100" }
  }

  // Generate mock historical risk data
  const generateRiskHistory = () => {
    const data = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      data.push({
        date: date.toISOString().split("T")[0],
        flood_risk: Math.random() * 100,
        wind_risk: Math.random() * 100,
        drought_risk: Math.random() * 100,
      })
    }
    return data
  }

  const riskHistory = generateRiskHistory()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Weather Risk Dashboard
        </h2>
        <p className="text-lg text-muted-foreground mt-2">
          Monitor weather conditions and insurance risk levels across all stations
        </p>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Select value={selectedStation} onValueChange={setSelectedStation}>
          <SelectTrigger className="w-[300px] h-12 border-2">
            <SelectValue placeholder="Select station" />
          </SelectTrigger>
          <SelectContent>
            {stations.map((station) => (
              <SelectItem key={station.id} value={station.id}>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {station.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => selectedStation && loadStationRisk(selectedStation)}
          disabled={refreshing}
          className="h-12 px-6"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <GradientCard title="Total Stations" gradient="from-blue-500/20 to-cyan-500/20" delay={0.1}>
          <div className="flex items-center justify-between">
            <div>
              <AnimatedCounter value={stationRisks.length} className="text-3xl font-bold text-blue-600" />
              <p className="text-sm text-muted-foreground mt-1">Monitored stations</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </GradientCard>

        <GradientCard title="High Risk Alerts" gradient="from-red-500/20 to-orange-500/20" delay={0.2}>
          <div className="flex items-center justify-between">
            <div>
              <AnimatedCounter value={highRiskStations.length} className="text-3xl font-bold text-red-600" />
              <p className="text-sm text-muted-foreground mt-1">Stations at risk</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </GradientCard>

        <GradientCard title="Active Policies" gradient="from-green-500/20 to-emerald-500/20" delay={0.3}>
          <div className="flex items-center justify-between">
            <div>
              <AnimatedCounter value={stationRisks.length * 2} className="text-3xl font-bold text-green-600" />
              <p className="text-sm text-muted-foreground mt-1">Insurance policies</p>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
        </GradientCard>

        <GradientCard title="Coverage Amount" gradient="from-purple-500/20 to-pink-500/20" delay={0.4}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-600">$2.4M</div>
              <p className="text-sm text-muted-foreground mt-1">Total coverage</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </GradientCard>
      </div>

      {/* Selected Station Details */}
      {selectedStationRisk && (
        <div className="grid gap-8 md:grid-cols-2">
          {/* Current Risk Levels */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-500" />
                Current Risk Levels
              </CardTitle>
              <CardDescription>{selectedStationRisk.station.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Flood Risk */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Flood Risk</span>
                  </div>
                  <Badge
                    className={`${getRiskLevel(selectedStationRisk.riskData.flood_risk).bg} ${getRiskLevel(selectedStationRisk.riskData.flood_risk).color} border-0`}
                  >
                    {getRiskLevel(selectedStationRisk.riskData.flood_risk).level}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedStationRisk.riskData.flood_risk}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedStationRisk.riskData.flood_risk.toFixed(1)}% risk level
                </div>
              </div>

              {/* Wind Risk */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Wind Risk</span>
                  </div>
                  <Badge
                    className={`${getRiskLevel(selectedStationRisk.riskData.wind_risk).bg} ${getRiskLevel(selectedStationRisk.riskData.wind_risk).color} border-0`}
                  >
                    {getRiskLevel(selectedStationRisk.riskData.wind_risk).level}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedStationRisk.riskData.wind_risk}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedStationRisk.riskData.wind_risk.toFixed(1)}% risk level
                </div>
              </div>

              {/* Drought Risk */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Drought Risk</span>
                  </div>
                  <Badge
                    className={`${getRiskLevel(selectedStationRisk.riskData.drought_risk).bg} ${getRiskLevel(selectedStationRisk.riskData.drought_risk).color} border-0`}
                  >
                    {getRiskLevel(selectedStationRisk.riskData.drought_risk).level}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedStationRisk.riskData.drought_risk}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedStationRisk.riskData.drought_risk.toFixed(1)}% risk level
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Data */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Current Weather Data
              </CardTitle>
              <CardDescription>Real-time measurements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedStationRisk.riskData.temperature.toFixed(1)}°C
                  </div>
                  <div className="text-sm text-muted-foreground">Temperature</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-cyan-600">
                    {selectedStationRisk.riskData.humidity.toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Humidity</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedStationRisk.riskData.wind_speed.toFixed(1)} m/s
                  </div>
                  <div className="text-sm text-muted-foreground">Wind Speed</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedStationRisk.riskData.pressure.toFixed(0)} hPa
                  </div>
                  <div className="text-sm text-muted-foreground">Pressure</div>
                </div>
              </div>

              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-indigo-600">
                  {selectedStationRisk.riskData.precipitation_rate.toFixed(1)} mm/h
                </div>
                <div className="text-sm text-muted-foreground">Precipitation Rate</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk History Chart */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            7-Day Risk Trend
          </CardTitle>
          <CardDescription>Historical risk levels for insurance assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              flood_risk: {
                label: "Flood Risk",
                color: "hsl(var(--chart-1))",
              },
              wind_risk: {
                label: "Wind Risk",
                color: "hsl(var(--chart-2))",
              },
              drought_risk: {
                label: "Drought Risk",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskHistory}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString([], { month: "short", day: "numeric" })}
                />
                <YAxis domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="flood_risk"
                  stroke="var(--color-flood_risk)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="wind_risk"
                  stroke="var(--color-wind_risk)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="drought_risk"
                  stroke="var(--color-drought_risk)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* High Risk Stations Alert */}
      {highRiskStations.length > 0 && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              High Risk Stations Alert
            </CardTitle>
            <CardDescription>Stations requiring immediate attention for insurance payouts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {highRiskStations.map((stationRisk) => (
                <motion.div
                  key={stationRisk.station.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-white rounded-lg border border-red-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{stationRisk.station.name}</h3>
                    <Badge variant="destructive" className="text-xs">
                      High Risk
                    </Badge>
                  </div>
                  <div className="space-y-2 text-xs">
                    {stationRisk.riskData.flood_risk >= 70 && (
                      <div className="flex justify-between">
                        <span>Flood Risk:</span>
                        <span className="font-medium text-red-600">{stationRisk.riskData.flood_risk.toFixed(0)}%</span>
                      </div>
                    )}
                    {stationRisk.riskData.wind_risk >= 70 && (
                      <div className="flex justify-between">
                        <span>Wind Risk:</span>
                        <span className="font-medium text-red-600">{stationRisk.riskData.wind_risk.toFixed(0)}%</span>
                      </div>
                    )}
                    {stationRisk.riskData.drought_risk >= 70 && (
                      <div className="flex justify-between">
                        <span>Drought Risk:</span>
                        <span className="font-medium text-red-600">
                          {stationRisk.riskData.drought_risk.toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-3 text-xs">
                    View Details
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
