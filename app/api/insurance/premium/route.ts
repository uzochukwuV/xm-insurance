import { type NextRequest, NextResponse } from "next/server"
import type { PremiumPayment } from "@/lib/insurance-types"

// Mock database for premium payments
const premiumPayments: PremiumPayment[] = []

export async function POST(request: NextRequest) {
  try {
    const paymentData = await request.json()

    const newPayment: PremiumPayment = {
      id: `PAY-${Date.now()}`,
      policyId: paymentData.policyId,
      amount: Number.parseFloat(paymentData.amount),
      paymentDate: new Date().toISOString(),
      transactionHash: generateMockTransactionHash(),
      status: "pending",
    }

    // Simulate payment processing
    setTimeout(() => {
      newPayment.status = "confirmed"
    }, 2000)

    premiumPayments.push(newPayment)

    // In production, you would:
    // 1. Process actual payment (crypto/card/bank)
    // 2. Update smart contract
    // 3. Update policy payment status
    // 4. Send payment confirmation

    return NextResponse.json({
      success: true,
      payment: newPayment,
      message: "Premium payment processed successfully",
    })
  } catch (error) {
    console.error("Error processing premium payment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process premium payment",
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
    const farmerId = searchParams.get("farmerId")

    let filteredPayments = premiumPayments

    if (policyId) {
      filteredPayments = filteredPayments.filter((p) => p.policyId === policyId)
    }

    // In production, you would filter by farmerId through policy relationships

    return NextResponse.json({
      success: true,
      payments: filteredPayments,
    })
  } catch (error) {
    console.error("Error fetching premium payments:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch premium payments" }, { status: 500 })
  }
}

function generateMockTransactionHash(): string {
  return `0x${Math.random().toString(16).substr(2, 64)}`
}
