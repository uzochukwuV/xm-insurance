"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Thermometer, Droplets, Wind, Gauge, Sun, RefreshCw, Loader2, Eye, Zap } from "lucide-react"
import { getAllStations, getStationLatest, type Station, type WeatherObservation } from "@/lib/api"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from "recharts"
import { GradientCard } from "@/components/ui/gradient-card"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { LoadingSkeleton, ChartSkeleton } from "@/components/ui/loading-skeleton"
import { useToast } from "@/hooks/use-toast"

interface WeatherData {
  station: Station
  observation: WeatherObservation
  location: { lat: number; lon: number; elevation: number }
}

// Generate mock time series for demonstration
const generateMockTimeSeries = (currentData: WeatherObservation) => {
  const data = []
  const now = new Date()

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    const variation = Math.sin(i * 0.5) * 2 + Math.random() * 1

    data.push({
      time: time.toISOString(),
      temperature: currentData.temperature + variation,
      humidity: Math.max(0, Math.min(100, currentData.humidity + Math.cos(i * 0.3) * 10 + Math.random() * 5)),
      pressure: currentData.pressure + Math.sin(i * 0.2) * 5 + Math.random() * 2,
      wind_speed: Math.max(0, currentData.wind_speed + Math.abs(Math.sin(i * 0.4)) * 3 + Math.random() * 1),
    })
  }
  return data
}

export function RealTimeWeather() {
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState<string>("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const { toast } = useToast()

  useEffect(() => {
    loadStations()
  }, [])

  useEffect(() => {
    if (selectedStation) {
      loadWeatherData(selectedStation)
    }
  }, [selectedStation])

  useEffect(() => {
    if (weatherData) {
      const timeSeries = generateMockTimeSeries(weatherData.observation)
      setTimeSeriesData(timeSeries)
    }
  }, [weatherData])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedStation && !refreshing) {
        loadWeatherData(selectedStation, true)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [selectedStation, refreshing])

  const loadStations = async () => {
    try {
      const stationsData = await getAllStations()
      setStations(stationsData.slice(0, 10)) // Limit for demo
      if (stationsData.length > 0) {
        setSelectedStation(stationsData[0].id)
      }
    } catch (error) {
      console.error("Error loading stations:", error)
      toast({
        title: "Error",
        description: "Failed to load stations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadWeatherData = async (stationId: string, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const station = stations.find((s) => s.id === stationId)
      if (!station) return

      const data = await getStationLatest(stationId)
      setWeatherData({
        station,
        observation: data.observation,
        location: {lat: data.lat, lon: data.lon},
      })
      setLastUpdate(new Date())

      if (isRefresh) {
        toast({
          title: "Data Refreshed",
          description: "Weather data updated successfully",
        })
      }
    } catch (error) {
      console.error("Error loading weather data:", error)
      toast({
        title: "Error",
        description: "Failed to load weather data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getWindDirection = (degrees: number) => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ]
    return directions[Math.round(degrees / 22.5) % 16]
  }

  const getUVLevel = (index: number) => {
    if (index <= 2) return { level: "Low", color: "text-green-600", bg: "bg-green-100" }
    if (index <= 5) return { level: "Moderate", color: "text-yellow-600", bg: "bg-yellow-100" }
    if (index <= 7) return { level: "High", color: "text-orange-600", bg: "bg-orange-100" }
    if (index <= 10) return { level: "Very High", color: "text-red-600", bg: "bg-red-100" }
    return { level: "Extreme", color: "text-purple-600", bg: "bg-purple-100" }
  }

  if (loading && !weatherData) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-20" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-32" />
          ))}
        </div>
        <ChartSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Real-time Weather
          </h2>
          <p className="text-lg text-muted-foreground mt-2">Live weather data from your stations</p>
        </motion.div>

        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-[250px] h-12 border-2">
              <SelectValue placeholder="Select station" />
            </SelectTrigger>
            <SelectContent>
              {stations.map((station) => (
                <SelectItem key={station.id} value={station.id}>
                  {station.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedStation && loadWeatherData(selectedStation, true)}
            disabled={refreshing}
            className="h-12 px-6"
          >
            {refreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </motion.div>
      </div>

      {weatherData && (
        <AnimatePresence>
          {/* Current Conditions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <GradientCard title="Temperature" gradient="from-red-500/20 to-orange-500/20" delay={0.1}>
              <div className="flex items-center justify-between">
                <div>
                  <AnimatedCounter
                    value={weatherData.observation.temperature}
                    decimals={1}
                    suffix="°C"
                    className="text-3xl font-bold text-red-600"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Feels like {weatherData.observation.feels_like.toFixed(1)}°C
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Thermometer className="h-8 w-8 text-red-500" />
                </motion.div>
              </div>
            </GradientCard>

            <GradientCard title="Humidity" gradient="from-blue-500/20 to-cyan-500/20" delay={0.2}>
              <div className="flex items-center justify-between">
                <div>
                  <AnimatedCounter
                    value={weatherData.observation.humidity}
                    decimals={1}
                    suffix="%"
                    className="text-3xl font-bold text-blue-600"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Relative humidity</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Droplets className="h-8 w-8 text-blue-500" />
                </motion.div>
              </div>
            </GradientCard>

            <GradientCard title="Wind" gradient="from-green-500/20 to-emerald-500/20" delay={0.3}>
              <div className="flex items-center justify-between">
                <div>
                  <AnimatedCounter
                    value={weatherData.observation.wind_speed}
                    decimals={1}
                    suffix=" m/s"
                    className="text-3xl font-bold text-green-600"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {getWindDirection(weatherData.observation.wind_direction)} • Gusts{" "}
                    {weatherData.observation.wind_gust.toFixed(1)} m/s
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Wind className="h-8 w-8 text-green-500" />
                </motion.div>
              </div>
            </GradientCard>

            <GradientCard title="Pressure" gradient="from-purple-500/20 to-pink-500/20" delay={0.4}>
              <div className="flex items-center justify-between">
                <div>
                  <AnimatedCounter
                    value={weatherData.observation.pressure}
                    decimals={1}
                    suffix=" hPa"
                    className="text-3xl font-bold text-purple-600"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Barometric pressure</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Gauge className="h-8 w-8 text-purple-500" />
                </motion.div>
              </div>
            </GradientCard>
          </div>

          {/* Additional Metrics */}
          <div className="grid gap-6 md:grid-cols-3">
            <GradientCard title="UV Index" gradient="from-yellow-500/20 to-amber-500/20" delay={0.5}>
              <div className="flex items-center justify-between">
                <div>
                  <AnimatedCounter
                    value={weatherData.observation.uv_index}
                    decimals={1}
                    className="text-3xl font-bold text-yellow-600"
                  />
                  <Badge
                    className={`mt-2 ${getUVLevel(weatherData.observation.uv_index).bg} ${getUVLevel(weatherData.observation.uv_index).color} border-0`}
                  >
                    {getUVLevel(weatherData.observation.uv_index).level}
                  </Badge>
                </div>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Sun className="h-8 w-8 text-yellow-500" />
                </motion.div>
              </div>
            </GradientCard>

            <GradientCard title="Solar Irradiance" gradient="from-orange-500/20 to-red-500/20" delay={0.6}>
              <div className="flex items-center justify-between">
                <div>
                  <AnimatedCounter
                    value={weatherData.observation.solar_irradiance}
                    decimals={0}
                    className="text-3xl font-bold text-orange-600"
                  />
                  <p className="text-sm text-muted-foreground mt-1">W/m²</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Zap className="h-8 w-8 text-orange-500" />
                </motion.div>
              </div>
            </GradientCard>

            <GradientCard title="Precipitation" gradient="from-indigo-500/20 to-blue-500/20" delay={0.7}>
              <div className="flex items-center justify-between">
                <div>
                  <AnimatedCounter
                    value={weatherData.observation.precipitation_rate}
                    decimals={1}
                    className="text-3xl font-bold text-indigo-600"
                  />
                  <p className="text-sm text-muted-foreground mt-1">mm/h</p>
                </div>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}>
                  <Eye className="h-8 w-8 text-indigo-500" />
                </motion.div>
              </div>
            </GradientCard>
          </div>

          {/* Time Series Charts */}
          <div className="grid gap-8 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-red-500" />
                    Temperature Trend (24h)
                  </CardTitle>
                  <CardDescription>Hourly temperature readings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      temperature: {
                        label: "Temperature",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeSeriesData}>
                        <XAxis
                          dataKey="time"
                          tickFormatter={(value) =>
                            new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          }
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="temperature"
                          stroke="var(--color-temperature)"
                          strokeWidth={3}
                          dot={false}
                          strokeDasharray="0"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-cyan-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    Humidity Trend (24h)
                  </CardTitle>
                  <CardDescription>Hourly humidity readings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      humidity: {
                        label: "Humidity",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData}>
                        <XAxis
                          dataKey="time"
                          tickFormatter={(value) =>
                            new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          }
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="humidity"
                          stroke="var(--color-humidity)"
                          fill="var(--color-humidity)"
                          fillOpacity={0.4}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Status Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">Station: {weatherData.station.name}</span>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="w-2 h-2 bg-green-500 rounded-full mr-2"
                      />
                      Live Data
                    </Badge>
                  </div>
                  <span className="text-muted-foreground">Last updated: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
