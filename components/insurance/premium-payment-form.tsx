"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Calendar, DollarSign, Shield, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { InsurancePolicy, PremiumPayment } from "@/lib/insurance-types"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import { INSURANCE_CONTRACT_ADDRESS, INSURANCE_CONTRACT_ABI } from "@/lib/contract-config"

// Mock data - in real app, this would come from your database
const mockPolicies: InsurancePolicy[] = [
  {
    id: "POL-001",
    farmerId: "farmer-1",
    farmerName: "John Smith",
    farmerEmail: "john@example.com",
    stationId: "station-1",
    stationName: "Central Valley Station",
    lat: 40.7128,
    lon: -74.006,
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
    stationId: "station-2",
    stationName: "North Field Station",
    lat: 41.7128,
    lon: -75.006,
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

export function PremiumPaymentForm() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([])
  const [selectedPolicy, setSelectedPolicy] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("crypto")
  const [paymentHistory, setPaymentHistory] = useState<PremiumPayment[]>([])
  const { toast } = useToast()

  // Wagmi hooks
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, error: contractError, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const selectedPolicyData = policies.find((p) => p.id === selectedPolicy)

  const handlePayment = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to make a payment.",
        variant: "destructive",
      })
      return
    }

    if (!selectedPolicyData) {
      toast({
        title: "No Policy Selected",
        description: "Please select a policy to pay premium for.",
        variant: "destructive",
      })
      return
    }

    try {
      // Convert premium amount to ETH (assuming premium is in USD, convert to ETH)
      const ethPriceUSD = 2000 // Mock ETH price - in real app, get from contract
      const premiumETH = (selectedPolicyData.premiumAmount / ethPriceUSD).toFixed(6)
      const premiumWei = parseEther(premiumETH)

      // Extract policy ID number from string (e.g., "POL-001" -> 1)
      const policyIdNumber = BigInt(selectedPolicyData.id.split("-")[1])

      writeContract({
        address: INSURANCE_CONTRACT_ADDRESS,
        abi: INSURANCE_CONTRACT_ABI,
        functionName: "payPremium",
        args: [policyIdNumber],
        value: premiumWei,
      })
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed && selectedPolicyData) {
      // Update policy payment date
      const updatedPolicies = policies.map((p) =>
        p.id === selectedPolicy
          ? {
              ...p,
              lastPremiumPaid: new Date().toISOString().split("T")[0],
              totalPremiumsPaid: p.totalPremiumsPaid + p.premiumAmount,
            }
          : p,
      )
      setPolicies(updatedPolicies)

      // Add to payment history
      const newPayment: PremiumPayment = {
        id: `PAY-${Date.now()}`,
        policyId: selectedPolicy,
        amount: selectedPolicyData.premiumAmount,
        paymentDate: new Date().toISOString(),
        paymentMethod: "crypto",
        transactionHash: hash,
        status: "confirmed",
      }
      setPaymentHistory([newPayment, ...paymentHistory])

      toast({
        title: "Payment Successful!",
        description: `Premium payment of $${selectedPolicyData.premiumAmount} has been processed.`,
      })
    }
  }, [isConfirmed, hash, selectedPolicyData, selectedPolicy, policies, paymentHistory, toast])

  // Handle transaction error
  useEffect(() => {
    if (contractError) {
      toast({
        title: "Payment Failed",
        description: contractError.message,
        variant: "destructive",
      })
    }
  }, [contractError, toast])

  useEffect(() => {
    loadPolicies()
  }, [])

  const loadPolicies = async () => {
    try {
      // In a real app, you'd get the farmer ID from authentication
      const farmerId = "farmer-1"

      const response = await fetch(`/api/insurance/policies/${farmerId}`)
      const result = await response.json()

      if (result.success) {
        setPolicies(result.policies)
      } else {
        toast({
          title: "Error",
          description: "Failed to load insurance policies",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading policies:", error)
      toast({
        title: "Error",
        description: "Failed to load insurance policies",
        variant: "destructive",
      })
    }
  }

  const getPaymentStatus = (policy: InsurancePolicy) => {
    const lastPayment = new Date(policy.lastPremiumPaid)
    const now = new Date()
    const daysSincePayment = Math.floor((now.getTime() - lastPayment.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSincePayment > 35) return { status: "overdue", color: "destructive", days: daysSincePayment }
    if (daysSincePayment > 25) return { status: "due", color: "warning", days: daysSincePayment }
    return { status: "current", color: "success", days: daysSincePayment }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Premium Payments
        </h2>
        <p className="text-lg text-muted-foreground mt-2">
          Manage your insurance premium payments and view payment history
        </p>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Payment Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Policy Selection */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Select Policy
              </CardTitle>
              <CardDescription>Choose the insurance policy you want to pay premiums for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies.map((policy) => {
                  const paymentStatus = getPaymentStatus(policy)
                  return (
                    <motion.div
                      key={policy.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPolicy === policy.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPolicy(policy.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{policy.stationName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {policy.farmSize} hectares • {policy.cropType}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Coverage: ${policy.coverageAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">${policy.premiumAmount}/month</div>
                          <Badge
                            variant={
                              paymentStatus.color === "destructive"
                                ? "destructive"
                                : paymentStatus.color === "warning"
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {paymentStatus.status === "overdue" && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {paymentStatus.status === "current" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {paymentStatus.status}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          {selectedPolicyData && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  Payment Method
                </CardTitle>
                <CardDescription>Choose how you want to pay your premium</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crypto">Cryptocurrency (ETH/USDC)</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Payment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Policy:</span>
                      <span>{selectedPolicyData.stationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Premium Amount:</span>
                      <span className="font-medium">${selectedPolicyData.premiumAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="capitalize">{paymentMethod}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${selectedPolicyData.premiumAmount}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isPending || isConfirming || !isConnected || !selectedPolicy}
                  className="w-full h-12"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPending
                    ? "Confirming Transaction..."
                    : isConfirming
                      ? "Waiting for Confirmation..."
                      : selectedPolicyData
                        ? `Pay $${selectedPolicyData.premiumAmount}`
                        : "Select Policy"}
                </Button>

                {hash && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium">Transaction Hash:</p>
                    <p className="text-xs font-mono break-all">{hash}</p>
                    {isConfirming && <p className="text-sm text-blue-600 mt-1">Waiting for confirmation...</p>}
                    {isConfirmed && <p className="text-sm text-green-600 mt-1">Payment confirmed!</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies.map((policy) => {
                  const status = getPaymentStatus(policy)
                  return (
                    <div key={policy.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{policy.stationName}</p>
                        <p className="text-xs text-muted-foreground">
                          Last paid: {new Date(policy.lastPremiumPaid).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          status.color === "destructive"
                            ? "destructive"
                            : status.color === "warning"
                              ? "secondary"
                              : "default"
                        }
                        className="text-xs"
                      >
                        {status.status}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${policies.reduce((sum, p) => sum + p.totalPremiumsPaid, 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Premiums Paid</p>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-xl font-semibold">${policies.reduce((sum, p) => sum + p.premiumAmount, 0)}</div>
                  <p className="text-sm text-muted-foreground">Monthly Premium</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          {paymentHistory.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentHistory.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">${payment.amount}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Confirmed
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
