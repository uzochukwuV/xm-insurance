"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import { formatEther, parseEther } from "viem"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  FileText,
  RefreshCw,
  Plus,
  Zap,
} from "lucide-react"
import { GradientCard } from "@/components/ui/gradient-card"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { useInsuranceContract } from "@/hooks/use-insurance-contract"
import { useToast } from "@/hooks/use-toast"
import { CoverageType, type ThresholdConfig, type PolicyStruct } from "@/lib/contract-config"
import { getAllStations } from "@/lib/weather-api"
import { WalletConnectionBanner } from "@/components/wallet-connection-banner"
import { PolicyManagement } from "@/components/policy-management"

export function FarmerDashboard() {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const [stations, setStations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [policies, setPolicies] = useState<PolicyStruct[]>([])
  const [payingPremium, setPayingPremium] = useState<string | null>(null)
  const [policyDetailsLoading, setPolicyDetailsLoading] = useState(false)
  const { useGetPolicy } = useInsuranceContract()

  // Contract hooks
  const {
    useGetUserPolicies,
    useCalculatePremium,
    useGetETHPrice,
    useGetContractBalance,
    createPolicy,
    processClaimsForStation,
    payPremium,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useInsuranceContract()

  // Get user policies
  const { data: userPolicyIds, refetch: refetchPolicies } = useGetUserPolicies(address)
  const { data: ethPrice } = useGetETHPrice()
  const { data: contractBalance } = useGetContractBalance()

  // New policy form state
  const [newPolicy, setNewPolicy] = useState({
    stationId: "",
    coverageType: CoverageType.MULTI_PERIL,
    coverageAmount: "",
    deductible: "",
    thresholds: {
      droughtDays: "7",
      floodThreshold: "50",
      windThreshold: "25",
      hailThreshold: "10",
    },
  })

  const { data: calculatedPremium } = useCalculatePremium(
    newPolicy.coverageAmount ? parseEther(newPolicy.coverageAmount) : undefined,
  )

  useEffect(() => {
    loadStations()
  }, [])

  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: "Transaction Confirmed!",
        description: "Your transaction has been successfully processed.",
      })
      refetchPolicies()
    }
  }, [isConfirmed, refetchPolicies, toast])

  useEffect(() => {
    if (error) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [error, toast])

  const loadStations = async () => {
    try {
      setLoading(true)
      const stationsData = await getAllStations()
      setStations(stationsData)
    } catch (error) {
      console.error("Error loading stations:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([loadStations(), refetchPolicies()])
    setRefreshing(false)
    toast({
      title: "Success",
      description: "Data refreshed successfully",
    })
  }

  const handleCreatePolicy = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    try {
      const thresholds: ThresholdConfig = {
        droughtDays: BigInt(newPolicy.thresholds.droughtDays),
        floodThreshold: BigInt(newPolicy.thresholds.floodThreshold),
        windThreshold: BigInt(newPolicy.thresholds.windThreshold),
        hailThreshold: BigInt(newPolicy.thresholds.hailThreshold),
      }

      await createPolicy(
        newPolicy.stationId,
        newPolicy.coverageType,
        newPolicy.coverageAmount,
        newPolicy.deductible,
        thresholds,
      )
    } catch (error) {
      console.error("Error creating policy:", error)
    }
  }

  const handleProcessClaims = async (stationId: string) => {
    try {
      await processClaimsForStation(stationId)
      toast({
        title: "Claims Processing",
        description: "Claims processing has been initiated for this station.",
      })
    } catch (error) {
      console.error("Error processing claims:", error)
    }
  }

  const handlePayPremium = async (policyId: bigint, amount: string) => {
    setPayingPremium(policyId.toString())
    try {
      await payPremium(policyId, amount)
      toast({
        title: "Premium Payment Initiated",
        description: "Your premium payment transaction has been submitted.",
      })
    } catch (error) {
      console.error("Error paying premium:", error)
    } finally {
      setPayingPremium(null)
    }
  }

  const getPolicyDetails = useCallback(
    async (policyId: bigint) => {
      const { data: policy } = useGetPolicy(policyId)
      return policy
    },
    [useGetPolicy],
  )

  // Get policy details for each policy ID
  useEffect(() => {
    if (userPolicyIds) {
      const fetchPolicies = async () => {
        setPolicyDetailsLoading(true)
        try {
          const policyDetails = await Promise.all(
            userPolicyIds.map(async (policyId) => {
              return await getPolicyDetails(policyId)
            }),
          )
          setPolicies(policyDetails.filter(Boolean) as PolicyStruct[])
        } finally {
          setPolicyDetailsLoading(false)
        }
      }

      fetchPolicies()
    }
  }, [userPolicyIds, getPolicyDetails])

  const activePolicies = policies.filter((p) => p?.isActive)
  const totalCoverage = policies.reduce((sum, p) => sum + Number(formatEther(p.coverageAmount)), 0)
  const overduePolicies = policies.filter((p) => p?.isOverdue)
  const totalPremiumsPaid = policies.reduce((sum, p) => sum + Number(formatEther(p.premium)), 0)

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Farmer Dashboard
        </h2>
        <p className="text-lg text-muted-foreground mt-2">
          Manage your weather insurance policies and interact with smart contracts
        </p>
      </motion.div>

      <WalletConnectionBanner />

      {isConnected && (
        <>
          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <GradientCard title="Active Policies" gradient="from-blue-500/20 to-cyan-500/20" delay={0.1}>
              <div className="flex items-center justify-between">
                <div>
                  <AnimatedCounter value={activePolicies.length} className="text-3xl font-bold text-blue-600" />
                  <p className="text-sm text-muted-foreground mt-1">Currently active</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </GradientCard>

            <GradientCard title="Total Coverage" gradient="from-green-500/20 to-emerald-500/20" delay={0.2}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600">{totalCoverage.toFixed(2)} ETH</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    ${ethPrice ? ((totalCoverage * Number(ethPrice)) / 1e8).toFixed(0) : "0"}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </GradientCard>

            <GradientCard title="Overdue Payments" gradient="from-orange-500/20 to-red-500/20" delay={0.4}>
              <div className="flex items-center justify-between">
                <div>
                  <AnimatedCounter value={overduePolicies.length} className="text-3xl font-bold text-orange-600" />
                  <p className="text-sm text-muted-foreground mt-1">Need attention</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </GradientCard>

            <GradientCard title="Premiums Paid" gradient="from-purple-500/20 to-pink-500/20" delay={0.3}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-600">{totalPremiumsPaid.toFixed(4)} ETH</div>
                  <p className="text-sm text-muted-foreground mt-1">Total paid</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </GradientCard>

            <GradientCard title="Contract Balance" gradient="from-orange-500/20 to-red-500/20" delay={0.4}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-orange-600">
                    {contractBalance ? formatEther(contractBalance).slice(0, 6) : "0"} ETH
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Pool balance</p>
                </div>
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
            </GradientCard>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="policies" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 h-14">
              <TabsTrigger value="policies" className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5" />
                My Policies
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2 text-base">
                <Plus className="h-5 w-5" />
                Create Policy
              </TabsTrigger>
              <TabsTrigger value="claims" className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5" />
                Process Claims
              </TabsTrigger>
            </TabsList>

            <TabsContent value="policies">
              <PolicyManagement />
            </TabsContent>

            <TabsContent value="create">
              <Card className="border-0 shadow-xl max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-blue-600" />
                    Create New Policy
                  </CardTitle>
                  <CardDescription>Create a new weather insurance policy on the blockchain</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="stationId">Weather Station</Label>
                      <Select
                        value={newPolicy.stationId}
                        onValueChange={(value) => setNewPolicy({ ...newPolicy, stationId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select station" />
                        </SelectTrigger>
                        <SelectContent>
                          {stations.map((station) => (
                            <SelectItem key={station.id} value={station.id}>
                              {station.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coverageType">Coverage Type</Label>
                      <Select
                        value={newPolicy.coverageType.toString()}
                        onValueChange={(value) =>
                          setNewPolicy({ ...newPolicy, coverageType: Number(value) as CoverageType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Flood</SelectItem>
                          <SelectItem value="1">Drought</SelectItem>
                          <SelectItem value="2">Wind</SelectItem>
                          <SelectItem value="3">Hail</SelectItem>
                          <SelectItem value="4">Multi-Peril</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coverageAmount">Coverage Amount (ETH)</Label>
                      <Input
                        id="coverageAmount"
                        type="number"
                        step="0.01"
                        value={newPolicy.coverageAmount}
                        onChange={(e) => setNewPolicy({ ...newPolicy, coverageAmount: e.target.value })}
                        placeholder="1.0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deductible">Deductible (ETH)</Label>
                      <Input
                        id="deductible"
                        type="number"
                        step="0.01"
                        value={newPolicy.deductible}
                        onChange={(e) => setNewPolicy({ ...newPolicy, deductible: e.target.value })}
                        placeholder="0.1"
                      />
                    </div>
                  </div>

                  {calculatedPremium && (
                    <Alert>
                      <DollarSign className="h-4 w-4" />
                      <AlertDescription>
                        Calculated Premium: {formatEther(calculatedPremium)} ETH
                        {ethPrice &&
                          ` (~$${((Number(formatEther(calculatedPremium)) * Number(ethPrice)) / 1e8).toFixed(2)})`}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleCreatePolicy}
                    disabled={isPending || isConfirming || !newPolicy.stationId || !newPolicy.coverageAmount}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {isPending || isConfirming ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {isPending ? "Confirming..." : "Processing..."}
                      </>
                    ) : (
                      "Create Policy"
                    )}
                  </Button>

                  {hash && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Transaction submitted: {hash.slice(0, 10)}...
                        {isConfirmed && " ✅ Confirmed!"}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="claims">
              <div className="space-y-6">
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      Process Claims
                    </CardTitle>
                    <CardDescription>Trigger claims processing for weather stations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {stations.slice(0, 6).map((station) => (
                        <Card key={station.id} className="border">
                          <CardContent className="p-4">
                            <h3 className="font-semibold">{station.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{station.id}</p>
                            <Button
                              onClick={() => handleProcessClaims(station.id)}
                              disabled={isPending || isConfirming}
                              className="w-full"
                              variant="outline"
                            >
                              Process Claims
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
