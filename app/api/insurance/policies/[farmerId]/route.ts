import { type NextRequest, NextResponse } from "next/server"

// This would typically fetch from your database
// For demo, we'll return mock data
const mockPolicies = [
  {
    id: "POL-001",
    farmerId: "farmer-1",
    farmerName: "John Smith",
    farmerEmail: "john@example.com",
    stationId: "04f39e90-f3ce-11ec-960f-d7d4cf200cc9",
    stationName: "Athens Central",
    lat: 37.9755, lon: 23.7348 ,
    farmSize: 50,
    cropType: "corn",
    coverageAmount: 100000,
    premiumAmount: 850,
    coverageTypes: ["flood", "wind", "drought"],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
    createdAt: "2024-01-01",
    lastPremiumPaid: "2024-12-01",
    totalPremiumsPaid: 9350,
    claimsHistory: [],
  },
  {
    id: "POL-002",
    farmerId: "farmer-1",
    farmerName: "John Smith",
    farmerEmail: "john@example.com",
    stationId: "05a42b91-g4df-22fd-861g-e8e5dg311dd0",
    stationName: "Thessaloniki Port",
     lat: 40.6401, lon: 22.9444 ,
    farmSize: 75,
    cropType: "wheat",
    coverageAmount: 150000,
    premiumAmount: 1200,
    coverageTypes: ["flood", "wind"],
    startDate: "2024-03-01",
    endDate: "2025-02-28",
    status: "active",
    createdAt: "2024-03-01",
    lastPremiumPaid: "2024-11-01",
    totalPremiumsPaid: 10800,
    claimsHistory: [],
  },
]

export async function GET(request: NextRequest, { params }: { params: { farmerId: string } }) {
  try {
    const farmerId = params.farmerId

    // In production, fetch from database where farmerId matches
    const farmerPolicies = mockPolicies.filter((p) => p.farmerId === farmerId)

    return NextResponse.json({
      success: true,
      policies: farmerPolicies,
    })
  } catch (error) {
    console.error("Error fetching farmer policies:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch policies" }, { status: 500 })
  }
}
