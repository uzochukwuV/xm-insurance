import { type NextRequest, NextResponse } from "next/server"
import type { InsuranceClaim } from "@/lib/insurance-types"

// Mock database for claims
const claims: InsuranceClaim[] = []

export async function POST(request: NextRequest) {
  try {
    const claimData = await request.json()

    const newClaim: InsuranceClaim = {
      id: `CLM-${Date.now()}`,
      policyId: claimData.policyId,
      alertType: claimData.alertType,
      claimAmount: Number.parseFloat(claimData.claimAmount),
      claimDate: new Date().toISOString(),
      weatherData: claimData.weatherData,
      status: "pending",
    }

    claims.push(newClaim)

    // In production, this would trigger smart contract evaluation
    // For demo, we'll simulate the process
    setTimeout(async () => {
      try {
        // Simulate weather analysis and payout evaluation
        newClaim.status = "approved"
        newClaim.transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`
      } catch (error) {
        newClaim.status = "rejected"
      }
    }, 3000)

    return NextResponse.json({
      success: true,
      claim: newClaim,
      message: "Insurance claim submitted successfully",
    })
  } catch (error) {
    console.error("Error processing insurance claim:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process insurance claim",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const policyId = searchParams.get("policyId")
    const status = searchParams.get("status")

    let filteredClaims = claims

    if (policyId) {
      filteredClaims = filteredClaims.filter((c) => c.policyId === policyId)
    }

    if (status) {
      filteredClaims = filteredClaims.filter((c) => c.status === status)
    }

    return NextResponse.json({
      success: true,
      claims: filteredClaims,
    })
  } catch (error) {
    console.error("Error fetching insurance claims:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch insurance claims" }, { status: 500 })
  }
}
