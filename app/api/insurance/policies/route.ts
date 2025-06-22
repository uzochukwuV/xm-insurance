import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use a real database
const policies: any[] = []

export async function POST(request: NextRequest) {
  try {
    const policyData = await request.json()

    const newPolicy = {
      id: `POL-${Date.now()}`,
      ...policyData,
      status: "active",
      createdAt: new Date().toISOString(),
      totalPremiumsPaid: 0,
      claimsHistory: [],
    }

    policies.push(newPolicy)

    return NextResponse.json({
      success: true,
      policy: newPolicy,
    })
  } catch (error) {
    console.error("Error creating policy:", error)
    return NextResponse.json({ error: "Failed to create policy" }, { status: 500 })
  }
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
    return NextResponse.json({ error: "Failed to fetch policies" }, { status: 500 })
  }
}
