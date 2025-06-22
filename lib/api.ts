const API_BASE_URL = "https://pro.weatherxm.com/api/v1"
const API_KEY = "69d66926-1ad3-4b1b-988e-13bb89712535"

const apiHeaders = {
  Accept: "application/json",
  "X-API-KEY": API_KEY,
}

export interface Station {
  id: string
  name: string
  cellIndex: string
  
    lat: number
    lon: number
    elevation: number

  createdAt: string
}

export interface WeatherObservation {
  timestamp: string
  temperature: number
  feels_like: number
  dew_point: number
  precipitation_rate: number
  precipitation_accumulated: number
  humidity: number
  wind_speed: number
  wind_gust: number
  wind_direction: number
  uv_index: number
  pressure: number
  solar_irradiance: number
  icon: string
}

export interface StationHealth {
  timestamp: string
  data_quality: {
    score: number
  }
  location_quality: {
    score: number
    reason: string
  }
}

export interface ForecastData {
  tz: string
  date: string
  hourly: Array<{
    timestamp: string
    precipitation: number
    precipitation_probability: number
    temperature: number
    icon: string
    wind_speed: number
    wind_direction: number
    humidity: number
    pressure: number
    uv_index: number
    feels_like: number
  }>
  daily: {
    temperature_max: number
    temperature_min: number
    precipitation_probability: number
    precipitation_intensity: number
    humidity: number
    uv_index: number
    pressure: number
    icon: string
    precipitation_type: string
    wind_speed: number
    wind_direction: number
    timestamp: string
  }
}

export interface ModelPerformance {
  errorMetric: string
  models: Array<{
    name: string
    rank: number
    avgErrorDistance: number
    errorDistance: number[]
  }>
}

export interface Cell {
  index: string
  center: {
    lat: number
    lon: number
    elevation: number
  }
  station_count: number
}

// API Functions
export async function getAllStations(): Promise<Station[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/stations`, {
      headers: apiHeaders,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching stations:", error)
    throw error
  }
}

export async function getStationsNear(lat: number, lon: number, radius = 50000): Promise<Station[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/stations/near?lat=${lat}&lon=${lon}&radius=${radius}`, {
      headers: apiHeaders,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching nearby stations:", error)
    throw error
  }
}

export async function getStationLatest(stationId: string): Promise<{
  observation: WeatherObservation
  health: StationHealth
  location: { lat: number; lon: number; elevation: number }
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/stations/${stationId}/latest`, {
      headers: apiHeaders,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching station latest data:", error)
    throw error
  }
}

export async function getStationHistory(
  stationId: string,
  date: string,
): Promise<{
  date: string
  health: StationHealth
  observations: WeatherObservation[]
  location: { lat: number; lon: number; elevation: number }
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/stations/${stationId}/history?date=${date}`, { headers: apiHeaders })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    console.log(await response.json())
    return await response.json()
  } catch (error) {
    console.error("Error fetching station history:", error)
    throw error
  }
}

export async function getStationForecast(stationId: string): Promise<ForecastData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/stations/${stationId}/mlm`, {
      headers: apiHeaders,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    console.log( await response.json())
    return await response.json()
  } catch (error) {
    console.error("Error fetching station forecast:", error)
    throw error
  }
}

export async function getModelPerformance(stationId: string, variable: string): Promise<ModelPerformance> {
  try {
    const response = await fetch(`${API_BASE_URL}/stations/${stationId}/fact/performance?variable=${variable}`, {
      headers: apiHeaders,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    console.log(await response.json())
    return await response.json()
  } catch (error) {
    console.error("Error fetching model performance:", error)
    throw error
  }
}

export async function searchCells(query: string): Promise<Cell[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/cells/search?query=${encodeURIComponent(query)}`, {
      headers: apiHeaders,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error searching cells:", error)
    throw error
  }
}

export async function getCellForecast(
  cellIndex: string,
  from: string,
  to: string,
  include = "daily,hourly",
): Promise<ForecastData[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/cells/${cellIndex}/forecast?from=${from}&to=${to}&include=${include}`,
      { headers: apiHeaders },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    console.log(await response.json())
    return await response.json()
  } catch (error) {
    console.error("Error fetching cell forecast:", error)
    throw error
  }
}

export async function getStationHealth(stationId: string): Promise<StationHealth> {
  try {
    const response = await fetch(`${API_BASE_URL}/stations/${stationId}/health`, {
      headers: apiHeaders,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching station health:", error)
    throw error
  }
}
