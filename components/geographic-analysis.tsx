"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ScatterChart, Scatter, Cell } from "recharts"
import { MapPin, Search, Globe, Layers, Grid } from "lucide-react"
import { useState } from "react"

// Mock H3 cell data
const mockCells = [
  {
    index: "822d57fffffffff",
    center: { lat: 37.9755, lon: 23.7348, elevation: 150 },
    station_count: 5,
    region: "Athens Metropolitan",
    avg_temperature: 22.5,
    avg_humidity: 65.2,
    avg_precipitation: 2.3,
  },
  {
    index: "823a42fffffffff",
    center: { lat: 40.6401, lon: 22.9444, elevation: 25 },
    station_count: 3,
    region: "Thessaloniki",
    avg_temperature: 19.8,
    avg_humidity: 72.1,
    avg_precipitation: 3.1,
  },
  {
    index: "824b53fffffffff",
    center: { lat: 35.2401, lon: 24.8093, elevation: 800 },
    station_count: 2,
    region: "Crete Central",
    avg_temperature: 24.2,
    avg_humidity: 58.9,
    avg_precipitation: 1.2,
  },
  {
    index: "825c64fffffffff",
    center: { lat: 36.4341, lon: 28.2176, elevation: 50 },
    station_count: 1,
    region: "Rhodes",
    avg_temperature: 25.8,
    avg_humidity: 61.4,
    avg_precipitation: 0.8,
  },
  {
    index: "826d75fffffffff",
    center: { lat: 39.3681, lon: 22.9349, elevation: 200 },
    station_count: 4,
    region: "Central Greece",
    avg_temperature: 21.3,
    avg_humidity: 68.7,
    avg_precipitation: 2.8,
  },
]

// Mock forecast models available per cell
const mockCellModels = {
  "822d57fffffffff": ["GFS", "ECMWF", "ICON", "NAM"],
  "823a42fffffffff": ["GFS", "ECMWF", "ICON"],
  "824b53fffffffff": ["GFS", "ECMWF"],
  "825c64fffffffff": ["GFS"],
  "826d75fffffffff": ["GFS", "ECMWF", "ICON", "NAM"],
}

// Generate elevation vs temperature data for scatter plot
const generateElevationData = () => {
  return mockCells.map((cell) => ({
    elevation: cell.center.elevation,
    temperature: cell.avg_temperature,
    humidity: cell.avg_humidity,
    region: cell.region,
    station_count: cell.station_count,
  }))
}

export function GeographicAnalysis() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCell, setSelectedCell] = useState("")
  const [analysisType, setAnalysisType] = useState("overview")

  const filteredCells = mockCells.filter(
    (cell) => cell.region.toLowerCase().includes(searchQuery.toLowerCase()) || cell.index.includes(searchQuery),
  )

  const elevationData = generateElevationData()

  const getStationCountColor = (count: number) => {
    if (count >= 4) return "bg-green-500"
    if (count >= 2) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getModelCoverage = (cellIndex: string) => {
    const models = mockCellModels[cellIndex] || []
    return {
      count: models.length,
      models: models,
      coverage: (models.length / 4) * 100, // Assuming 4 is max models
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Geographic Analysis</h2>
          <p className="text-muted-foreground">Analyze weather patterns across H3 cells and geographic regions</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Globe className="h-4 w-4 mr-2" />
            View Map
          </Button>
          <Button variant="outline" size="sm">
            Export Regions
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search regions or cell indices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={analysisType} onValueChange={setAnalysisType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Analysis type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Overview</SelectItem>
            <SelectItem value="temperature">Temperature</SelectItem>
            <SelectItem value="precipitation">Precipitation</SelectItem>
            <SelectItem value="elevation">Elevation Analysis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cells</CardTitle>
            <Grid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCells.length}</div>
            <p className="text-xs text-muted-foreground">H3 geographic cells</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCells.reduce((sum, cell) => sum + cell.station_count, 0)}</div>
            <p className="text-xs text-muted-foreground">Across all regions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Temperature</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(mockCells.reduce((sum, cell) => sum + cell.avg_temperature, 0) / mockCells.length).toFixed(1)}°C
            </div>
            <p className="text-xs text-muted-foreground">Regional average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Coverage</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                ((Object.values(mockCellModels).reduce((sum, models) => sum + models.length, 0) /
                  Object.keys(mockCellModels).length) *
                  100) /
                  4,
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">Average model availability</p>
          </CardContent>
        </Card>
      </div>

      {/* Cell Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCells.map((cell) => {
          const modelCoverage = getModelCoverage(cell.index)
          return (
            <Card key={cell.index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{cell.region}</CardTitle>
                  <Badge variant="outline">{cell.station_count} stations</Badge>
                </div>
                <CardDescription>Cell: {cell.index.slice(0, 8)}...</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Location</div>
                    <div className="font-medium">
                      {cell.center.lat.toFixed(3)}, {cell.center.lon.toFixed(3)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Elevation</div>
                    <div className="font-medium">{cell.center.elevation}m</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Temperature</span>
                    <span className="font-medium">{cell.avg_temperature.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Humidity</span>
                    <span className="font-medium">{cell.avg_humidity.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Precipitation</span>
                    <span className="font-medium">{cell.avg_precipitation.toFixed(1)}mm</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Model Coverage</span>
                    <span className="font-medium">{modelCoverage.count}/4 models</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${modelCoverage.coverage}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {modelCoverage.models.map((model) => (
                      <Badge key={model} variant="secondary" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Forecast
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Regional Temperature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Temperature Comparison</CardTitle>
          <CardDescription>Average temperature across different geographic regions</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              avg_temperature: {
                label: "Average Temperature",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCells}>
                <XAxis dataKey="region" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="avg_temperature" fill="var(--color-avg_temperature)" radius={[4, 4, 0, 0]}>
                  {mockCells.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Elevation vs Temperature Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Elevation vs Temperature Analysis</CardTitle>
          <CardDescription>Relationship between elevation and temperature across regions</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              temperature: {
                label: "Temperature",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={elevationData}>
                <XAxis dataKey="elevation" name="Elevation" unit="m" />
                <YAxis dataKey="temperature" name="Temperature" unit="°C" />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    `${Number(value).toFixed(1)}${name === "elevation" ? "m" : "°C"}`,
                    name === "elevation" ? "Elevation" : "Temperature",
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.region
                    }
                    return label
                  }}
                />
                <Scatter dataKey="temperature" fill="var(--color-temperature)">
                  {elevationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Station Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Station Distribution by Region</CardTitle>
          <CardDescription>Number of weather stations deployed in each geographic cell</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              station_count: {
                label: "Station Count",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCells}>
                <XAxis dataKey="region" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="station_count" fill="var(--color-station_count)" radius={[4, 4, 0, 0]}>
                  {mockCells.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.station_count >= 4
                          ? "hsl(var(--chart-1))"
                          : entry.station_count >= 2
                            ? "hsl(var(--chart-2))"
                            : "hsl(var(--chart-3))"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
