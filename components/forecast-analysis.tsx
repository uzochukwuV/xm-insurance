"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Cloud, Sun, CloudRain, Wind, Thermometer, Eye, TrendingUp } from "lucide-react"
import { getAllStations, getStationForecast, type Station, type ForecastData } from "@/lib/api"
import { GradientCard } from "@/components/ui/gradient-card"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { LoadingSkeleton, ChartSkeleton } from "@/components/ui/loading-skeleton"
import { useToast } from "@/hooks/use-toast"

const mockModels = [
  { name: "GFS", accuracy: 0.92, color: "hsl(var(--chart-1))", trend: "+2.1%" },
  { name: "ECMWF", accuracy: 0.94, color: "hsl(var(--chart-2))", trend: "+1.8%" },
  { name: "ICON", accuracy: 0.89, color: "hsl(var(--chart-3))", trend: "+0.9%" },
  { name: "NAM", accuracy: 0.87, color: "hsl(var(--chart-4))", trend: "-0.3%" },
]

export function ForecastAnalysis() {
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState<string>("")
  const [selectedVariable, setSelectedVariable] = useState("temperature")
  const [forecastHorizon, setForecastHorizon] = useState("7d")
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadStations()
  }, [])

  useEffect(() => {
    if (selectedStation) {
      loadForecastData(selectedStation)
    }
  }, [selectedStation])

  const loadStations = async () => {
    try {
      const stationsData = await getAllStations()
      setStations(stationsData.slice(0, 10))
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
    }
  }

  const loadForecastData = async (stationId: string) => {
    try {
      setLoading(true)
      const data = await getStationForecast(stationId)
      setForecastData(data)
    } catch (error) {
      console.error("Error loading forecast data:", error)
      toast({
        title: "Error",
        description: "Failed to load forecast data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getFilteredData = () => {
    if (!forecastData.length) return []

    const hours = forecastHorizon === "24h" ? 24 : forecastHorizon === "3d" ? 72 : 168
    const allHourlyData = forecastData.flatMap((day) =>
      day.hourly.map((hour) => ({
        ...hour,
        date: day.date,
      })),
    )
    return allHourlyData.slice(0, hours)
  }

  const filteredData = getFilteredData()

  const getVariableConfig = (variable: string) => {
    const configs = {
      temperature: {
        label: "Temperature",
        color: "hsl(var(--chart-1))",
        dataKey: "temperature",
        unit: "°C",
        icon: Thermometer,
      },
      precipitation: {
        label: "Precipitation",
        color: "hsl(var(--chart-3))",
        dataKey: "precipitation",
        unit: "mm",
        icon: CloudRain,
      },
      humidity: {
        label: "Humidity",
        color: "hsl(var(--chart-2))",
        dataKey: "humidity",
        unit: "%",
        icon: Eye,
      },
      wind_speed: {
        label: "Wind Speed",
        color: "hsl(var(--chart-4))",
        dataKey: "wind_speed",
        unit: "m/s",
        icon: Wind,
      },
    }
    return configs[variable as keyof typeof configs] || configs.temperature
  }

  const currentConfig = getVariableConfig(selectedVariable)

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case "sunny":
      case "clear-day":
        return <Sun className="h-5 w-5 text-yellow-500" />
      case "partly-cloudy":
      case "partly-cloudy-day":
        return <Cloud className="h-5 w-5 text-gray-500" />
      case "cloudy":
        return <Cloud className="h-5 w-5 text-gray-600" />
      case "rainy":
      case "rain":
        return <CloudRain className="h-5 w-5 text-blue-500" />
      default:
        return <Sun className="h-5 w-5" />
    }
  }

  if (loading) {
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
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Forecast Analysis
          </h2>
          <p className="text-lg text-muted-foreground mt-2">Weather predictions and model performance analysis</p>
        </motion.div>

        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button variant="outline" size="sm" className="h-12 px-6">
            Compare Models
          </Button>
          <Button variant="outline" size="sm" className="h-12 px-6">
            Export Forecast
          </Button>
        </motion.div>
      </div>

      {/* Controls */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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

        <Select value={selectedVariable} onValueChange={setSelectedVariable}>
          <SelectTrigger className="w-[200px] h-12 border-2">
            <SelectValue placeholder="Select variable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="temperature">Temperature</SelectItem>
            <SelectItem value="precipitation">Precipitation</SelectItem>
            <SelectItem value="humidity">Humidity</SelectItem>
            <SelectItem value="wind_speed">Wind Speed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={forecastHorizon} onValueChange={setForecastHorizon}>
          <SelectTrigger className="w-[150px] h-12 border-2">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 Hours</SelectItem>
            <SelectItem value="3d">3 Days</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Model Performance Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mockModels.map((model, index) => (
          <GradientCard
            key={model.name}
            title={model.name}
            gradient={`from-${["blue", "green", "purple", "red"][index]}-500/20 to-${["cyan", "emerald", "pink", "orange"][index]}-500/20`}
            delay={0.1 * (index + 1)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <AnimatedCounter value={model.accuracy * 100} decimals={1} suffix="%" className="text-2xl font-bold" />
                <Badge variant="outline" className="text-xs">
                  Model
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Accuracy</span>
                  <span className={`font-medium ${model.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {model.trend}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="h-3 rounded-full"
                    style={{ backgroundColor: model.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${model.accuracy * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
              </div>
            </div>
          </GradientCard>
        ))}
      </div>

      {/* Main Forecast Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <currentConfig.icon className="h-5 w-5" style={{ color: currentConfig.color }} />
              {currentConfig.label} Forecast
            </CardTitle>
            <CardDescription>
              {forecastHorizon} {currentConfig.label.toLowerCase()} predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                [currentConfig.dataKey]: {
                  label: currentConfig.label,
                  color: currentConfig.color,
                },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return forecastHorizon === "24h"
                        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : date.toLocaleDateString([], { month: "short", day: "numeric" })
                    }}
                  />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Line
                    type="monotone"
                    dataKey={currentConfig.dataKey}
                    stroke={currentConfig.color}
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* 24-Hour Detailed Forecast */}
      {forecastData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-500" />
                24-Hour Detailed Forecast
              </CardTitle>
              <CardDescription>Hourly weather conditions for the next day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                {forecastData[0]?.hourly.slice(0, 12).map((hour, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center space-y-3 p-4 rounded-xl border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="text-sm font-medium text-gray-600">
                      {new Date(hour.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="flex justify-center">{getWeatherIcon(hour.icon)}</div>
                    <div className="text-xl font-bold text-gray-800">{hour.temperature.toFixed(0)}°C</div>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div>{hour.precipitation.toFixed(1)}mm</div>
                      <div>{hour.wind_speed.toFixed(1)} m/s</div>
                      <div>{hour.humidity.toFixed(0)}%</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Model Comparison */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Model Performance Comparison
            </CardTitle>
            <CardDescription>Accuracy comparison across different forecast models</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={mockModels.reduce(
                (acc, model) => ({
                  ...acc,
                  [model.name]: {
                    label: model.name,
                    color: model.color,
                  },
                }),
                {},
              )}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockModels}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0.8, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, "Accuracy"]}
                  />
                  <Bar dataKey="accuracy" radius={[8, 8, 0, 0]} fill={(entry: any) => entry.color} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
