import { type NextRequest, NextResponse } from "next/server"
import { getWeatherAlertsForChainlink } from "@/lib/weather-api"

export async function GET(request: NextRequest) {
  try {
    const alerts = await getWeatherAlertsForChainlink()

    // Format for Chainlink automation
    const chainlinkResponse = {
      timestamp: new Date().toISOString(),
      alertCount: alerts.length,
      alerts: alerts.map((alert) => ({
        stationId: alert.stationId,
        alertType: alert.alertType,
        severity: alert.severity,
        value: alert.value,
        threshold: alert.threshold,
        location: alert.location,
        affectedRadius: alert.affectedRadius,
        shouldTriggerPayout: alert.severity === "extreme" || alert.severity === "high",
      })),
    }

    return NextResponse.json(chainlinkResponse)
  } catch (error) {
    console.error("Error in weather alerts API:", error)
    return NextResponse.json({ error: "Failed to fetch weather alerts" }, { status: 500 })
  }
}
