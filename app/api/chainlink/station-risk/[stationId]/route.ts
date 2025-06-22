import { type NextRequest, NextResponse } from "next/server"
import { getStationWeatherRisk } from "@/lib/weather-api"

export async function GET(request: NextRequest, { params }: { params: { stationId: string } }) {
  try {
    const stationId = params.stationId
    const weatherRisk = await getStationWeatherRisk(stationId)

    // Format for smart contract consumption
    const contractResponse = {
      stationId: weatherRisk.stationId,
      timestamp: weatherRisk.timestamp,
      risks: {
        flood: weatherRisk.flood_risk,
        wind: weatherRisk.wind_risk,
        drought: weatherRisk.drought_risk,
      },
      shouldTriggerPayout: {
        flood: weatherRisk.flood_risk >= 80,
        wind: weatherRisk.wind_risk >= 80,
        drought: weatherRisk.drought_risk >= 80,
      },
      weatherData: {
        temperature: weatherRisk.temperature,
        precipitation_rate: weatherRisk.precipitation_rate,
        wind_speed: weatherRisk.wind_speed,
        wind_gust: weatherRisk.wind_gust,
        humidity: weatherRisk.humidity,
        pressure: weatherRisk.pressure,
      },
    }

    return NextResponse.json(contractResponse)
  } catch (error) {
    console.error("Error in station risk API:", error)
    return NextResponse.json({ error: "Failed to fetch station risk data" }, { status: 500 })
  }
}
