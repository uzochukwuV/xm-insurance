import { type NextRequest, NextResponse } from "next/server"
import type { InsurancePolicy } from "@/lib/insurance-types"

// Mock database - in production, use a real database
const policies: InsurancePolicy[] = []

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Calculate premium based on form data
    const premium = calculatePremium(formData)

    const newPolicy: InsurancePolicy = {
      id: `POL-${Date.now()}`,
      farmerId: `farmer-${Date.now()}`,
      farmerName: formData.farmerName,
      farmerEmail: formData.farmerEmail,
      stationId: formData.stationId,
      stationName: formData.stationName || "Unknown Station",
       lat: formData.lat, lon: formData.lon ,
      farmSize: Number.parseFloat(formData.farmSize),
      cropType: formData.cropType,
      coverageAmount: Number.parseFloat(formData.coverageAmount),
      premiumAmount: premium,
      coverageTypes: formData.selectedCoverages,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1 year from now
      status: "active",
      createdAt: new Date().toISOString(),
      lastPremiumPaid: new Date().toISOString().split("T")[0],
      totalPremiumsPaid: premium,
      claimsHistory: [],
    }

    policies.push(newPolicy)

    // In production, you would:
    // 1. Save to database
    // 2. Create smart contract entry
    // 3. Set up payment schedule
    // 4. Send confirmation email

    return NextResponse.json({
      success: true,
      policy: newPolicy,
      message: "Insurance policy created successfully",
    })
  } catch (error) {
    console.error("Error creating insurance policy:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create insurance policy",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function calculatePremium(formData: any): number {
  const farmSize = Number.parseFloat(formData.farmSize) || 0
  const coverageAmount = Number.parseFloat(formData.coverageAmount) || 0

  // Base rates for different coverage types
  const coverageRates = {
    flood: 0.02,
    wind: 0.015,
    drought: 0.025,
    hail: 0.01,
  }

  // Risk multipliers for different crops
  const cropMultipliers = {
    corn: 1.0,
    wheat: 0.8,
    soybeans: 0.9,
    rice: 1.2,
    cotton: 1.1,
    vegetables: 1.3,
    fruits: 1.4,
  }

  let totalRate = 0
  formData.selectedCoverages?.forEach((coverage: string) => {
    totalRate += coverageRates[coverage as keyof typeof coverageRates] || 0.02
  })

  const cropMultiplier = cropMultipliers[formData.cropType as keyof typeof cropMultipliers] || 1.0
  const sizeFactor = Math.min(farmSize / 100, 2) // Larger farms get better rates

  const basePremium = (coverageAmount * totalRate * cropMultiplier) / 12 // Monthly
  const finalPremium = basePremium * (1 + sizeFactor * 0.1)

  return Math.round(finalPremium * 100) / 100
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const farmerId = searchParams.get("farmerId")

    let filteredPolicies = policies
    if (farmerId) {
      filteredPolicies = policies.filter((p) => p.farmerId === farmerId)
    }

    return NextResponse.json({
      success: true,
      policies: filteredPolicies,
    })
  } catch (error) {
    console.error("Error fetching policies:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch policies" }, { status: 500 })
  }
}
