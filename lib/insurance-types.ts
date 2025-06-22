export interface InsurancePolicy {
  id: string
  farmerId: string
  farmerName: string
  farmerEmail: string
  stationId: string
  stationName: string

    lat: number
    lon: number
  farmSize: number // in hectares
  cropType: string
  coverageAmount: number // in USD
  premiumAmount: number // monthly premium in USD
  coverageTypes: ("flood" | "wind" | "drought" | "hail")[]
  startDate: string
  endDate: string
  status: "active" | "expired" | "cancelled" | "claimed"
  createdAt: string
  lastPremiumPaid: string
  totalPremiumsPaid: number
  claimsHistory: InsuranceClaim[]
}

export interface InsuranceClaim {
  id: string
  policyId: string
  alertType: "flood" | "wind" | "drought" | "hail"
  claimAmount: number
  claimDate: string
  weatherData: any
  status: "pending" | "approved" | "paid" | "rejected"
  transactionHash?: string
}

export interface PremiumPayment {
  id: string
  policyId: string
  amount: number
  paymentDate: string
  transactionHash: string
  status: "pending" | "confirmed" | "failed"
}
