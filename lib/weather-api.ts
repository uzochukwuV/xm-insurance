const API_BASE_URL = "https://pro.weatherxm.com/api/v1"
const API_KEY = "69d66926-1ad3-4b1b-988e-13bb89712535"

const apiHeaders = {
  Accept: "application/json",
  "X-API-KEY": API_KEY,
}

export interface WeatherInsurancePolicy {
  policyId: string
  stationId: string
  coverageType: "drought" | "flood" | "wind" | "hail" | "multi_peril"
  startDate: string
  endDate: string
  premiumPaid: number
  coverageAmount: number
  deductible: number
  thresholds: {
    drought: { days: number; humidityThreshold: number; temperatureThreshold: number }
    flood: { days: number; precipitationThreshold: number; cumulativeThreshold: number }
    wind: { occurrences: number; windSpeedThreshold: number; gustThreshold: number }
  }
}

export interface WeatherAnalysis {
  stationId: string
  analysisDate: string
  period: string // "7d", "14d", "30d"
  riskScores: {
    drought: number
    flood: number
    wind: number
    hail: number
  }
  triggerEvents: TriggerEvent[]
  payoutRecommendation: PayoutRecommendation | null
}

export interface TriggerEvent {
  eventType: "drought" | "flood" | "wind" | "hail"
  severity: "low" | "medium" | "high" | "extreme"
  startDate: string
  endDate: string
  duration: number // days
  peakValue: number
  averageValue: number
  affectedArea: number // radius in meters
}

export interface PayoutRecommendation {
  policyId: string
  eventType: string
  severity: string
  payoutAmount: number
  payoutPercentage: number
  justification: string
  evidenceData: any[]
}

export interface WeatherObservation {
  timestamp: string
  temperature: number
  humidity: number
  pressure: number
  wind_speed: number
  wind_gust: number
  precipitation_rate: number
  precipitation_accumulated: number
}

export interface Station {
  id: string
  name: string
  location: { lat: number; lon: number }
}

// Add this function that the UI is calling
export async function getStationWeatherRisk(stationId: string): Promise<{
  stationId: string
  timestamp: string
  flood_risk: number
  wind_risk: number
  drought_risk: number
  temperature: number
  precipitation_rate: number
  wind_speed: number
  wind_gust: number
  humidity: number
  pressure: number
}> {
  try {
    const latestData = await getStationLatest(stationId)
    const obs = latestData.observation

    // Calculate risk scores based on current conditions
    const flood_risk = calculateFloodRisk(obs)
    const wind_risk = calculateWindRisk(obs)
    const drought_risk = calculateDroughtRisk(obs)

    return {
      stationId,
      timestamp: obs.timestamp,
      flood_risk,
      wind_risk,
      drought_risk,
      temperature: obs.temperature,
      precipitation_rate: obs.precipitation_rate,
      wind_speed: obs.wind_speed,
      wind_gust: obs.wind_gust,
      humidity: obs.humidity,
      pressure: obs.pressure,
    }
  } catch (error) {
    console.error("Error calculating station weather risk:", error)
    throw error
  }
}

// Add this function for Chainlink alerts
export async function getWeatherAlertsForChainlink(): Promise<
  Array<{
    stationId: string
    alertType: "flood" | "wind" | "drought"
    severity: "low" | "medium" | "high" | "extreme"
    value: number
    threshold: number
    location: { lat: number; lon: number }
    affectedRadius: number
  }>
> {
  try {
    const stations = await getAllStations()
    const alerts = []

    for (const station of stations.slice(0, 10)) {
      // Limit for demo
      try {
        const riskData = await getStationWeatherRisk(station.id)

        // Check for flood alerts
        if (riskData.flood_risk >= 60) {
          alerts.push({
            stationId: station.id,
            alertType: "flood" as const,
            severity: riskData.flood_risk >= 80 ? "extreme" : riskData.flood_risk >= 70 ? "high" : ("medium" as const),
            value: riskData.precipitation_rate,
            threshold: 10,
            location: station.location,
            affectedRadius: 5000,
          })
        }

        // Check for wind alerts
        if (riskData.wind_risk >= 60) {
          alerts.push({
            stationId: station.id,
            alertType: "wind" as const,
            severity: riskData.wind_risk >= 80 ? "extreme" : riskData.wind_risk >= 70 ? "high" : ("medium" as const),
            value: Math.max(riskData.wind_speed, riskData.wind_gust),
            threshold: 15,
            location: station.location,
            affectedRadius: 8000,
          })
        }

        // Check for drought alerts
        if (riskData.drought_risk >= 60) {
          alerts.push({
            stationId: station.id,
            alertType: "drought" as const,
            severity:
              riskData.drought_risk >= 80 ? "extreme" : riskData.drought_risk >= 70 ? "high" : ("medium" as const),
            value: riskData.temperature,
            threshold: 35,
            location: station.location,
            affectedRadius: 15000,
          })
        }
      } catch (error) {
        console.warn(`Failed to get risk data for station ${station.id}:`, error)
      }
    }

    return alerts
  } catch (error) {
    console.error("Error getting weather alerts for Chainlink:", error)
    throw error
  }
}

// Risk calculation helper functions
function calculateFloodRisk(obs: WeatherObservation): number {
  let risk = 0

  // High precipitation rate
  if (obs.precipitation_rate > 20) risk += 40
  else if (obs.precipitation_rate > 10) risk += 30
  else if (obs.precipitation_rate > 5) risk += 15

  // High humidity
  if (obs.humidity > 90) risk += 20
  else if (obs.humidity > 80) risk += 10

  // Low pressure (storm systems)
  if (obs.pressure < 1000) risk += 10
  else if (obs.pressure < 1005) risk += 5

  return Math.min(risk, 100)
}

function calculateWindRisk(obs: WeatherObservation): number {
  let risk = 0
  const maxWind = Math.max(obs.wind_speed, obs.wind_gust)

  // High wind speeds
  if (maxWind > 25) risk += 40
  else if (maxWind > 20) risk += 30
  else if (maxWind > 15) risk += 20
  else if (maxWind > 10) risk += 10

  // Low pressure (storm systems)
  if (obs.pressure < 990) risk += 20
  else if (obs.pressure < 1000) risk += 10

  return Math.min(risk, 100)
}

function calculateDroughtRisk(obs: WeatherObservation): number {
  let risk = 0

  // Low humidity
  if (obs.humidity < 20) risk += 30
  else if (obs.humidity < 30) risk += 20
  else if (obs.humidity < 40) risk += 10

  // High temperature
  if (obs.temperature > 40) risk += 25
  else if (obs.temperature > 35) risk += 20
  else if (obs.temperature > 30) risk += 10

  // No precipitation
  if (obs.precipitation_rate === 0) risk += 20

  // Extreme conditions bonus
  if (obs.humidity < 20 && obs.temperature > 40) risk += 25

  return Math.min(risk, 100)
}

// Enhanced weather analysis with historical context
export async function analyzeWeatherForInsurance(
  stationId: string,
  analysisDate: string,
  lookbackDays = 30,
): Promise<WeatherAnalysis> {
  try {
    // Get historical data for the specified period
    const historicalData = await getHistoricalWeatherData(stationId, analysisDate, lookbackDays)

    // Analyze different risk types
    const droughtAnalysis = analyzeDroughtRisk(historicalData)
    const floodAnalysis = analyzeFloodRisk(historicalData)
    const windAnalysis = analyzeWindRisk(historicalData)
    const hailAnalysis = analyzeHailRisk(historicalData)

    // Combine all trigger events
    const triggerEvents: TriggerEvent[] = [
      ...droughtAnalysis.events,
      ...floodAnalysis.events,
      ...windAnalysis.events,
      ...hailAnalysis.events,
    ]

    return {
      stationId,
      analysisDate,
      period: `${lookbackDays}d`,
      riskScores: {
        drought: droughtAnalysis.riskScore,
        flood: floodAnalysis.riskScore,
        wind: windAnalysis.riskScore,
        hail: hailAnalysis.riskScore,
      },
      triggerEvents,
      payoutRecommendation: null, // Will be set by evaluatePayoutEligibility
    }
  } catch (error) {
    console.error("Error analyzing weather for insurance:", error)
    throw error
  }
}

// Get historical weather data for a specific period
export async function getHistoricalWeatherData(stationId: string, endDate: string, days: number): Promise<any[]> {
  const historicalData: any[] = []
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - days)

  // Fetch data day by day (could be optimized with batch requests if API supports it)
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + i)
    const dateString = currentDate.toISOString().split("T")[0]

    try {
      const response = await fetch(`${API_BASE_URL}/stations/${stationId}/history?date=${dateString}`, {
        headers: apiHeaders,
      })

      if (response.ok) {
        const dayData = await response.json()
        historicalData.push({
          date: dateString,
          ...dayData,
        })
      }
    } catch (error) {
      console.warn(`Failed to fetch data for ${dateString}:`, error)
    }
  }

  return historicalData
}

// Enhanced drought analysis - requires sustained conditions
function analyzeDroughtRisk(historicalData: any[]): { riskScore: number; events: TriggerEvent[] } {
  const events: TriggerEvent[] = []
  let consecutiveDryDays = 0
  let droughtStartDate: string | null = null
  let peakTemperature = 0
  let minHumidity = 100
  let totalRainfall = 0

  for (const dayData of historicalData) {
    const obs = dayData.observation || dayData
    const humidity = obs.humidity || 0
    const temperature = obs.temperature || 0
    const precipitation = obs.precipitation_rate || 0

    totalRainfall += precipitation

    // Drought conditions: low humidity + high temperature + no rain
    const isDroughtDay = humidity < 40 && temperature > 30 && precipitation < 1

    if (isDroughtDay) {
      if (consecutiveDryDays === 0) {
        droughtStartDate = dayData.date
      }
      consecutiveDryDays++
      peakTemperature = Math.max(peakTemperature, temperature)
      minHumidity = Math.min(minHumidity, humidity)
    } else {
      // End of drought period
      if (consecutiveDryDays >= 7) {
        // At least 7 consecutive days
        const severity = getSeverity(consecutiveDryDays, [7, 14, 21])
        events.push({
          eventType: "drought",
          severity,
          startDate: droughtStartDate!,
          endDate: dayData.date,
          duration: consecutiveDryDays,
          peakValue: peakTemperature,
          averageValue: minHumidity,
          affectedArea: 15000,
        })
      }
      consecutiveDryDays = 0
      droughtStartDate = null
      peakTemperature = 0
      minHumidity = 100
    }
  }

  // Handle ongoing drought at end of period
  if (consecutiveDryDays >= 7) {
    const severity = getSeverity(consecutiveDryDays, [7, 14, 21])
    events.push({
      eventType: "drought",
      severity,
      startDate: droughtStartDate!,
      endDate: historicalData[historicalData.length - 1].date,
      duration: consecutiveDryDays,
      peakValue: peakTemperature,
      averageValue: minHumidity,
      affectedArea: 15000,
    })
  }

  // Calculate overall risk score
  const avgRainfall = totalRainfall / historicalData.length
  const longestDrought = Math.max(...events.map((e) => e.duration), 0)
  const riskScore = Math.min(longestDrought * 3 + (avgRainfall < 1 ? 30 : 0) + events.length * 10, 100)

  return { riskScore, events }
}

// Enhanced flood analysis - considers cumulative rainfall
function analyzeFloodRisk(historicalData: any[]): { riskScore: number; events: TriggerEvent[] } {
  const events: TriggerEvent[] = []
  const cumulativeRainfall = 0
  const rollingWindow = 3 // 3-day window for flood risk

  for (let i = rollingWindow - 1; i < historicalData.length; i++) {
    // Calculate 3-day cumulative rainfall
    let windowRainfall = 0
    let maxDailyRate = 0

    for (let j = i - rollingWindow + 1; j <= i; j++) {
      const obs = historicalData[j].observation || historicalData[j]
      const dailyRain = obs.precipitation_accumulated || obs.precipitation_rate || 0
      windowRainfall += dailyRain
      maxDailyRate = Math.max(maxDailyRate, obs.precipitation_rate || 0)
    }

    // Flood triggers: high cumulative rainfall OR extreme daily rate
    const isFloodEvent = windowRainfall > 50 || maxDailyRate > 20

    if (isFloodEvent) {
      const severity =
        maxDailyRate > 50 ? "extreme" : maxDailyRate > 30 ? "high" : windowRainfall > 100 ? "high" : "medium"

      events.push({
        eventType: "flood",
        severity: severity as any,
        startDate: historicalData[i - rollingWindow + 1].date,
        endDate: historicalData[i].date,
        duration: rollingWindow,
        peakValue: maxDailyRate,
        averageValue: windowRainfall / rollingWindow,
        affectedArea: 5000,
      })
    }
  }

  // Remove overlapping events (keep most severe)
  const uniqueEvents = deduplicateEvents(events)

  const riskScore = Math.min(
    uniqueEvents.reduce((score, event) => {
      const severityPoints = { low: 10, medium: 20, high: 35, extreme: 50 }
      return score + severityPoints[event.severity]
    }, 0),
    100,
  )

  return { riskScore, events: uniqueEvents }
}

// Enhanced wind analysis - considers frequency and intensity
function analyzeWindRisk(historicalData: any[]): { riskScore: number; events: TriggerEvent[] } {
  const events: TriggerEvent[] = []
  let highWindDays = 0

  for (const dayData of historicalData) {
    const obs = dayData.observation || dayData
    const windSpeed = obs.wind_speed || 0
    const windGust = obs.wind_gust || 0
    const maxWind = Math.max(windSpeed, windGust)

    // High wind event
    if (maxWind > 20) {
      // > 72 km/h
      highWindDays++
      const severity = maxWind > 40 ? "extreme" : maxWind > 30 ? "high" : maxWind > 25 ? "medium" : "low"

      events.push({
        eventType: "wind",
        severity: severity as any,
        startDate: dayData.date,
        endDate: dayData.date,
        duration: 1,
        peakValue: maxWind,
        averageValue: maxWind,
        affectedArea: 10000,
      })
    }
  }

  const riskScore = Math.min(highWindDays * 5 + events.length * 3, 100)
  return { riskScore, events }
}

// Placeholder for hail analysis (requires specialized data)
function analyzeHailRisk(historicalData: any[]): { riskScore: number; events: TriggerEvent[] } {
  // Hail detection would need specialized radar data or specific weather indicators
  // For now, use proxy indicators like sudden temperature drops + precipitation
  const events: TriggerEvent[] = []

  for (let i = 1; i < historicalData.length; i++) {
    const prevObs = historicalData[i - 1].observation || historicalData[i - 1]
    const currObs = historicalData[i].observation || historicalData[i]

    const tempDrop = (prevObs.temperature || 0) - (currObs.temperature || 0)
    const precipitation = currObs.precipitation_rate || 0

    // Hail indicator: sudden temp drop + precipitation
    if (tempDrop > 10 && precipitation > 5) {
      events.push({
        eventType: "hail",
        severity: "medium",
        startDate: historicalData[i].date,
        endDate: historicalData[i].date,
        duration: 1,
        peakValue: precipitation,
        averageValue: precipitation,
        affectedArea: 3000,
      })
    }
  }

  return { riskScore: Math.min(events.length * 15, 100), events }
}

// Evaluate if a policy should trigger a payout
export async function evaluatePayoutEligibility(
  policy: WeatherInsurancePolicy,
  analysis: WeatherAnalysis,
): Promise<PayoutRecommendation | null> {
  const relevantEvents = analysis.triggerEvents.filter(
    (event) => policy.coverageType === "multi_peril" || event.eventType === policy.coverageType,
  )

  if (relevantEvents.length === 0) return null

  for (const event of relevantEvents) {
    let shouldPayout = false
    let payoutPercentage = 0

    switch (event.eventType) {
      case "drought":
        const droughtThreshold = policy.thresholds.drought
        shouldPayout = event.duration >= droughtThreshold.days
        payoutPercentage = Math.min((event.duration / droughtThreshold.days) * 100, 100)
        break

      case "flood":
        const floodThreshold = policy.thresholds.flood
        shouldPayout = event.peakValue >= floodThreshold.precipitationThreshold
        payoutPercentage = Math.min((event.peakValue / floodThreshold.precipitationThreshold) * 100, 100)
        break

      case "wind":
        const windThreshold = policy.thresholds.wind
        shouldPayout = event.peakValue >= windThreshold.windSpeedThreshold
        payoutPercentage = Math.min((event.peakValue / windThreshold.windSpeedThreshold) * 100, 100)
        break
    }

    if (shouldPayout && payoutPercentage > policy.deductible) {
      const netPayoutPercentage = payoutPercentage - policy.deductible
      const payoutAmount = (policy.coverageAmount * netPayoutPercentage) / 100

      return {
        policyId: policy.policyId,
        eventType: event.eventType,
        severity: event.severity,
        payoutAmount,
        payoutPercentage: netPayoutPercentage,
        justification: `${event.eventType} event exceeded policy thresholds: ${event.duration} days duration, peak value ${event.peakValue}`,
        evidenceData: [event],
      }
    }
  }

  return null
}

// Utility functions
function getSeverity(value: number, thresholds: number[]): "low" | "medium" | "high" | "extreme" {
  if (value >= thresholds[2]) return "extreme"
  if (value >= thresholds[1]) return "high"
  if (value >= thresholds[0]) return "medium"
  return "low"
}

function deduplicateEvents(events: TriggerEvent[]): TriggerEvent[] {
  // Simple deduplication - keep most severe event per overlapping period
  const sorted = events.sort((a, b) => {
    const severityOrder = { low: 1, medium: 2, high: 3, extreme: 4 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })

  const unique: TriggerEvent[] = []
  for (const event of sorted) {
    const hasOverlap = unique.some(
      (existing) =>
        existing.eventType === event.eventType &&
        Math.abs(new Date(existing.startDate).getTime() - new Date(event.startDate).getTime()) < 86400000 * 2,
    )
    if (!hasOverlap) {
      unique.push(event)
    }
  }

  return unique
}

// Chainlink Automation compatible function
export async function checkWeatherInsurancePayouts(stationId: string): Promise<PayoutRecommendation[]> {
  const today = new Date().toISOString().split("T")[0]

  // Analyze weather over different periods
  const analysis30d = await analyzeWeatherForInsurance(stationId, today, 30)
  const analysis7d = await analyzeWeatherForInsurance(stationId, today, 7)

  // Get all active policies for this station (this would come from your contract storage)
  // const activePolicies = await getActivePoliciesForStation(stationId)

  const payoutRecommendations: PayoutRecommendation[] = []

  // For each policy, check if payout is warranted
  // for (const policy of activePolicies) {
  //   const recommendation = await evaluatePayoutEligibility(policy, analysis30d)
  //   if (recommendation) {
  //     payoutRecommendations.push(recommendation)
  //   }
  // }

  return payoutRecommendations
}

export async function getStationLatest(stationId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/stations/${stationId}/latest`, { headers: apiHeaders })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}

export async function getAllStations(): Promise<Station[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/stations`, { headers: apiHeaders })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Handle different response structures
    const stationsArray = data.data || data.stations || data || []

    return stationsArray.map((station: any) => ({
      id: station.id || station.station_id || `station_${Math.random().toString(36).substr(2, 9)}`,
      name: station.name || station.station_name || `Station ${station.id || "Unknown"}`,
      location: {
        lat: station.lat || station.latitude || 0,
        lon: station.lon || station.longitude || 0,
      },
    }))
  } catch (error) {
    console.error("Error fetching stations:", error)
    // Return mock data as fallback
    return generateMockStations()
  }
}

function generateMockStations(): Station[] {
  return [
    { id: "station_001", name: "Athens Central", location: { lat: 37.9755, lon: 23.7348 } },
    { id: "station_002", name: "Thessaloniki Port", location: { lat: 40.6401, lon: 22.9444 } },
    { id: "station_003", name: "Patras Marina", location: { lat: 38.2466, lon: 21.7346 } },
    { id: "station_004", name: "Heraklion Airport", location: { lat: 35.3387, lon: 25.1442 } },
    { id: "station_005", name: "Rhodes Harbor", location: { lat: 36.4341, lon: 28.2176 } },
    { id: "station_006", name: "Corfu Town", location: { lat: 39.6243, lon: 19.9217 } },
    { id: "station_007", name: "Mykonos Port", location: { lat: 37.4467, lon: 25.3289 } },
    { id: "station_008", name: "Santorini Fira", location: { lat: 36.4138, lon: 25.4318 } },
    { id: "station_009", name: "Zakynthos Bay", location: { lat: 37.7869, lon: 20.8994 } },
    { id: "station_010", name: "Chania Harbor", location: { lat: 35.5138, lon: 24.018 } },
  ]
}
