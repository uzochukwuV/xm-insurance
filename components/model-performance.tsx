"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
} from "recharts"
import { Award, Target, BarChart3 } from "lucide-react"
import { useState } from "react"

// Mock model performance data
const mockModelPerformance = {
  temperature: [
    { model: "GFS", rank: 1, avgError: 1.2, errorDistance: [1.1, 0.9, 1.4, 1.8, 1.0, 0.8, 1.3] },
    { model: "ECMWF", rank: 2, avgError: 1.5, errorDistance: [1.3, 1.2, 1.7, 2.1, 1.4, 1.1, 1.6] },
    { model: "ICON", rank: 3, avgError: 1.8, errorDistance: [1.6, 1.4, 2.0, 2.4, 1.7, 1.3, 1.9] },
    { model: "NAM", rank: 4, avgError: 2.1, errorDistance: [1.9, 1.7, 2.3, 2.7, 2.0, 1.6, 2.2] },
  ],
  humidity: [
    { model: "ECMWF", rank: 1, avgError: 3.2, errorDistance: [2.8, 2.5, 3.5, 4.1, 3.0, 2.7, 3.3] },
    { model: "GFS", rank: 2, avgError: 3.8, errorDistance: [3.4, 3.1, 4.1, 4.7, 3.6, 3.3, 3.9] },
    { model: "ICON", rank: 3, avgError: 4.1, errorDistance: [3.7, 3.4, 4.4, 5.0, 3.9, 3.6, 4.2] },
    { model: "NAM", rank: 4, avgError: 4.5, errorDistance: [4.1, 3.8, 4.8, 5.4, 4.3, 4.0, 4.6] },
  ],
  precipitation: [
    { model: "ICON", rank: 1, avgError: 0.8, errorDistance: [0.6, 0.5, 1.0, 1.2, 0.7, 0.4, 0.9] },
    { model: "ECMWF", rank: 2, avgError: 1.1, errorDistance: [0.9, 0.8, 1.3, 1.5, 1.0, 0.7, 1.2] },
    { model: "GFS", rank: 3, avgError: 1.4, errorDistance: [1.2, 1.1, 1.6, 1.8, 1.3, 1.0, 1.5] },
    { model: "NAM", rank: 4, avgError: 1.7, errorDistance: [1.5, 1.4, 1.9, 2.1, 1.6, 1.3, 1.8] },
  ],
  windSpeed: [
    { model: "GFS", rank: 1, avgError: 0.9, errorDistance: [0.7, 0.6, 1.1, 1.3, 0.8, 0.5, 1.0] },
    { model: "ECMWF", rank: 2, avgError: 1.2, errorDistance: [1.0, 0.9, 1.4, 1.6, 1.1, 0.8, 1.3] },
    { model: "ICON", rank: 3, avgError: 1.5, errorDistance: [1.3, 1.2, 1.7, 1.9, 1.4, 1.1, 1.6] },
    { model: "NAM", rank: 4, avgError: 1.8, errorDistance: [1.6, 1.5, 2.0, 2.2, 1.7, 1.4, 1.9] },
  ],
}

const mockRankingData = {
  temperature: [
    { daysAhead: 1, model: { name: "GFS", errorDistance: 1.1 } },
    { daysAhead: 2, model: { name: "GFS", errorDistance: 1.3 } },
    { daysAhead: 3, model: { name: "ECMWF", errorDistance: 1.5 } },
    { daysAhead: 4, model: { name: "ECMWF", errorDistance: 1.8 } },
    { daysAhead: 5, model: { name: "ECMWF", errorDistance: 2.1 } },
    { daysAhead: 6, model: { name: "ICON", errorDistance: 2.4 } },
    { daysAhead: 7, model: { name: "ICON", errorDistance: 2.7 } },
  ],
}

// Generate radar chart data for model comparison
const generateRadarData = (variable: string) => {
  const models = mockModelPerformance[variable as keyof typeof mockModelPerformance]
  return models.map((model) => ({
    model: model.model,
    accuracy: 100 - model.avgError * 10, // Convert error to accuracy score
    consistency: 95 - (Math.max(...model.errorDistance) - Math.min(...model.errorDistance)) * 5,
    reliability: 90 + (4 - model.rank) * 2.5,
  }))
}

export function ModelPerformance() {
  const [selectedStation, setSelectedStation] = useState("04f39e90-f3ce-11ec-960f-d7d4cf200cc9")
  const [selectedVariable, setSelectedVariable] = useState("temperature")

  const currentPerformance = mockModelPerformance[selectedVariable as keyof typeof mockModelPerformance]
  const radarData = generateRadarData(selectedVariable)

  const getVariableLabel = (variable: string) => {
    const labels = {
      temperature: "Temperature",
      humidity: "Humidity",
      precipitation: "Precipitation",
      windSpeed: "Wind Speed",
    }
    return labels[variable as keyof typeof labels] || "Temperature"
  }

  const getRankBadge = (rank: number) => {
    const colors = {
      1: "bg-yellow-100 text-yellow-800",
      2: "bg-gray-100 text-gray-800",
      3: "bg-orange-100 text-orange-800",
      4: "bg-red-100 text-red-800",
    }
    const icons = {
      1: "🥇",
      2: "🥈",
      3: "🥉",
      4: "4th",
    }
    return (
      <Badge className={colors[rank as keyof typeof colors]}>
        {icons[rank as keyof typeof icons]} Rank {rank}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Model Performance</h2>
          <p className="text-muted-foreground">Analyze and compare forecast model accuracy and reliability</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Detailed Report
          </Button>
          <Button variant="outline" size="sm">
            Export Analysis
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

        <Select value={selectedVariable} onValueChange={setSelectedVariable}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select variable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="temperature">Temperature</SelectItem>
            <SelectItem value="humidity">Humidity</SelectItem>
            <SelectItem value="precipitation">Precipitation</SelectItem>
            <SelectItem value="windSpeed">Wind Speed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Model Rankings */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {currentPerformance.map((model) => (
          <Card key={model.model} className={model.rank === 1 ? "ring-2 ring-yellow-400" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">{model.model}</CardTitle>
              {model.rank === 1 && <Award className="h-5 w-5 text-yellow-500" />}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">{getRankBadge(model.rank)}</div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Error</span>
                  <span className="font-medium">{model.avgError.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      model.rank === 1
                        ? "bg-green-500"
                        : model.rank === 2
                          ? "bg-blue-500"
                          : model.rank === 3
                            ? "bg-orange-500"
                            : "bg-red-500"
                    }`}
                    style={{ width: `${Math.max(10, 100 - model.avgError * 20)}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Error range: {Math.min(...model.errorDistance).toFixed(1)} -{" "}
                {Math.max(...model.errorDistance).toFixed(1)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{getVariableLabel(selectedVariable)} Model Performance</CardTitle>
          <CardDescription>Average error comparison across forecast models</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={currentPerformance.reduce(
              (acc, model) => ({
                ...acc,
                [model.model]: {
                  label: model.model,
                  color: `hsl(var(--chart-${model.rank}))`,
                },
              }),
              {},
            )}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentPerformance}>
                <XAxis dataKey="model" />
                <YAxis />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => [Number(value).toFixed(2), "Average Error"]}
                />
                <Bar
                  dataKey="avgError"
                  fill={(entry) => {
                    const colors = [
                      "hsl(var(--chart-1))",
                      "hsl(var(--chart-2))",
                      "hsl(var(--chart-3))",
                      "hsl(var(--chart-4))",
                    ]
                    return colors[entry.rank - 1] || colors[0]
                  }}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Model Comparison Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Dimensional Model Comparison</CardTitle>
          <CardDescription>Accuracy, consistency, and reliability comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={radarData.reduce(
              (acc, model) => ({
                ...acc,
                [model.model]: {
                  label: model.model,
                  color: `hsl(var(--chart-${radarData.indexOf(model) + 1}))`,
                },
              }),
              {},
            )}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={[
                  {
                    metric: "Accuracy",
                    ...radarData.reduce((acc, model) => ({ ...acc, [model.model]: model.accuracy }), {}),
                  },
                  {
                    metric: "Consistency",
                    ...radarData.reduce((acc, model) => ({ ...acc, [model.model]: model.consistency }), {}),
                  },
                  {
                    metric: "Reliability",
                    ...radarData.reduce((acc, model) => ({ ...acc, [model.model]: model.reliability }), {}),
                  },
                ]}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                {radarData.map((model, index) => (
                  <Radar
                    key={model.model}
                    name={model.model}
                    dataKey={model.model}
                    stroke={`hsl(var(--chart-${index + 1}))`}
                    fill={`hsl(var(--chart-${index + 1}))`}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Error Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Error Distribution Over Time</CardTitle>
          <CardDescription>Model error patterns across different forecast periods</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={currentPerformance.reduce(
              (acc, model) => ({
                ...acc,
                [model.model]: {
                  label: model.model,
                  color: `hsl(var(--chart-${model.rank}))`,
                },
              }),
              {},
            )}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={currentPerformance[0].errorDistance.map((_, index) => ({
                  period: `Day ${index + 1}`,
                  ...currentPerformance.reduce(
                    (acc, model) => ({
                      ...acc,
                      [model.model]: model.errorDistance[index],
                    }),
                    {},
                  ),
                }))}
              >
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                {currentPerformance.map((model) => (
                  <Line
                    key={model.model}
                    type="monotone"
                    dataKey={model.model}
                    stroke={`hsl(var(--chart-${model.rank}))`}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Best Model by Forecast Horizon */}
      <Card>
        <CardHeader>
          <CardTitle>Best Model by Forecast Horizon</CardTitle>
          <CardDescription>Which model performs best at different forecast distances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRankingData.temperature.map((item) => (
              <div key={item.daysAhead} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-bold w-16">Day {item.daysAhead}</div>
                  <div>
                    <div className="font-medium">{item.model.name}</div>
                    <div className="text-sm text-muted-foreground">Error: {item.model.errorDistance.toFixed(2)}</div>
                  </div>
                </div>
                <Badge variant="outline">
                  <Target className="h-3 w-3 mr-1" />
                  Best
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
