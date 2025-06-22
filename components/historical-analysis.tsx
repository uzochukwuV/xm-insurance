"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, ComposedChart, Area } from "recharts"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { addDays } from "date-fns"

// Mock historical data
const generateHistoricalData = (days: number) => {
  const data = []
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    data.push({
      date: date.toISOString().split("T")[0],
      temperature_avg: 20 + Math.sin(i * 0.1) * 8 + Math.random() * 4,
      temperature_max: 25 + Math.sin(i * 0.1) * 8 + Math.random() * 3,
      temperature_min: 15 + Math.sin(i * 0.1) * 8 + Math.random() * 3,
      humidity_avg: 65 + Math.cos(i * 0.15) * 20 + Math.random() * 10,
      precipitation: Math.random() > 0.7 ? Math.random() * 15 : 0,
      wind_speed_avg: 3 + Math.abs(Math.sin(i * 0.2)) * 6 + Math.random() * 2,
      pressure_avg: 1013 + Math.sin(i * 0.08) * 12 + Math.random() * 3,
      uv_index_max: Math.max(0, 6 + Math.sin(i * 0.1) * 4 + Math.random() * 2),
    })
  }
  return data
}

export function HistoricalAnalysis() {
  const [selectedStation, setSelectedStation] = useState("04f39e90-f3ce-11ec-960f-d7d4cf200cc9")
  const [selectedMetric, setSelectedMetric] = useState("temperature")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  const historicalData = generateHistoricalData(30)

  const getMetricConfig = (metric: string) => {
    const configs = {
      temperature: {
        label: "Temperature",
        color: "hsl(var(--chart-1))",
        dataKey: "temperature_avg",
        unit: "°C",
        icon: TrendingUp,
      },
      humidity: {
        label: "Humidity",
        color: "hsl(var(--chart-2))",
        dataKey: "humidity_avg",
        unit: "%",
        icon: Activity,
      },
      precipitation: {
        label: "Precipitation",
        color: "hsl(var(--chart-3))",
        dataKey: "precipitation",
        unit: "mm",
        icon: TrendingDown,
      },
      wind_speed: {
        label: "Wind Speed",
        color: "hsl(var(--chart-4))",
        dataKey: "wind_speed_avg",
        unit: "m/s",
        icon: Activity,
      },
      pressure: {
        label: "Pressure",
        color: "hsl(var(--chart-5))",
        dataKey: "pressure_avg",
        unit: "hPa",
        icon: TrendingUp,
      },
    }
    return configs[metric as keyof typeof configs] || configs.temperature
  }

  const currentConfig = getMetricConfig(selectedMetric)

  // Calculate statistics
  const calculateStats = (data: any[], key: string) => {
    const values = data.map((d) => d[key]).filter((v) => v !== undefined && v !== null)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    const trend = values[values.length - 1] - values[0]

    return { avg, max, min, trend }
  }

  const stats = calculateStats(historicalData, currentConfig.dataKey)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Historical Analysis</h2>
          <p className="text-muted-foreground">Analyze weather patterns and trends over time</p>
        </div>
        <div className="flex items-center gap-4">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button variant="outline" size="sm">
            Export Data
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedStation} onValueChange={setSelectedStation}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select station" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="04f39e90-f3ce-11ec-960f-d7d4cf200cc9">Athens Central</SelectItem>
            <SelectItem value="05a42b91-g4df-22fd-861g-e8e5dg311dd0">Thessaloniki Port</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="temperature">Temperature</SelectItem>
            <SelectItem value="humidity">Humidity</SelectItem>
            <SelectItem value="precipitation">Precipitation</SelectItem>
            <SelectItem value="wind_speed">Wind Speed</SelectItem>
            <SelectItem value="pressure">Pressure</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
            <currentConfig.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avg.toFixed(1)} {currentConfig.unit}
            </div>
            <p className="text-xs text-muted-foreground">30-day average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maximum</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.max.toFixed(1)} {currentConfig.unit}
            </div>
            <p className="text-xs text-muted-foreground">Highest recorded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minimum</CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.min.toFixed(1)} {currentConfig.unit}
            </div>
            <p className="text-xs text-muted-foreground">Lowest recorded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            {stats.trend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.trend >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stats.trend >= 0 ? "+" : ""}
              {stats.trend.toFixed(1)} {currentConfig.unit}
            </div>
            <p className="text-xs text-muted-foreground">30-day change</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{currentConfig.label} Trend</CardTitle>
          <CardDescription>Daily {currentConfig.label.toLowerCase()} readings over the selected period</CardDescription>
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
              <LineChart data={historicalData}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString([], { month: "short", day: "numeric" })}
                />
                <YAxis />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey={currentConfig.dataKey}
                  stroke={currentConfig.color}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Temperature Range Chart (if temperature is selected) */}
      {selectedMetric === "temperature" && (
        <Card>
          <CardHeader>
            <CardTitle>Temperature Range</CardTitle>
            <CardDescription>Daily minimum and maximum temperatures</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                temperature_max: {
                  label: "Max Temperature",
                  color: "hsl(var(--chart-1))",
                },
                temperature_min: {
                  label: "Min Temperature",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={historicalData}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString([], { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="temperature_max"
                    stackId="1"
                    stroke="var(--color-temperature_max)"
                    fill="var(--color-temperature_max)"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="temperature_min"
                    stackId="1"
                    stroke="var(--color-temperature_min)"
                    fill="var(--color-temperature_min)"
                    fillOpacity={0.3}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Precipitation Chart (if precipitation is selected) */}
      {selectedMetric === "precipitation" && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Precipitation</CardTitle>
            <CardDescription>Daily rainfall amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                precipitation: {
                  label: "Precipitation",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historicalData}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString([], { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Bar dataKey="precipitation" fill="var(--color-precipitation)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
