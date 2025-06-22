"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  ExternalLink,
  RefreshCw,
} from "lucide-react"
import { GradientCard } from "@/components/ui/gradient-card"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { useToast } from "@/hooks/use-toast"
import { useWeb3 } from "@/hooks/use-web3"
import { useAccount, useReadContract } from "wagmi"
import { INSURANCE_CONTRACT_ADDRESS, INSURANCE_CONTRACT_ABI } from "@/lib/contract-config"

// Mock contract address
// const INSURANCE_CONTRACT_ADDRESS = "0xC7B2776E53caAc66eB0725aF2Dd8B1F54EbFdB94"

interface PolicyData {
  id: string
  farmerId: string
  stationId: string
  stationName: string
  coverageAmount: number
  premiumAmount: number
  coverageTypes: string[]
  status: "active" | "expired" | "claimed" | "pending"
  startDate: string
  endDate: string
  totalPremiumsPaid: number
  claimsHistory: ClaimData[]
  riskLevel: "low" | "medium" | "high"
  nextPremiumDue: string
}

interface ClaimData {
  id: string
  type: "flood" | "drought" | "wind" | "hail"
  amount: number
  status: "pending" | "approved" | "paid" | "rejected"
  date: string
  transactionHash?: string
}

export function MyPoliciesDashboard() {
  const [policies, setPolicies] = useState<PolicyData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()
  const { account, isConnected: isWeb3Connected, connectWallet, getContractData } = useWeb3()
  

  const { address, isConnected } = useAccount()

  // Contract read hooks
  const { data: userPolicyIds, isLoading: loadingPolicyIds } = useReadContract({
    address: INSURANCE_CONTRACT_ADDRESS,
    abi: INSURANCE_CONTRACT_ABI,
    functionName: "getUserPolicies",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  })

  const { data: contractBalance } = useReadContract({
    address: INSURANCE_CONTRACT_ADDRESS,
    abi: INSURANCE_CONTRACT_ABI,
    functionName: "getContractBalance",
  })

  const { data: ethPrice } = useReadContract({
    address: INSURANCE_CONTRACT_ADDRESS,
    abi: INSURANCE_CONTRACT_ABI,
    functionName: "getETHPriceUSD",
  })

  // Load individual policy data
  const loadPoliciesData = async () => {
    if (!userPolicyIds || !isConnected) {
      setPolicies(getMockPolicies())
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const policyPromises = (userPolicyIds as bigint[]).map(async (policyId) => {
        // In a real implementation, you'd call getPolicy for each ID
        // For now, we'll use mock data but with real structure
        return {
          id: `POL-${policyId.toString()}`,
          farmerId: address || "",
          stationId: `station_${policyId}`,
          stationName: `Weather Station ${policyId}`,
          coverageAmount: 50000,
          premiumAmount: 250,
          coverageTypes: ["flood", "drought"],
          status: "active" as const,
          startDate: "2024-01-15",
          endDate: "2024-12-15",
          totalPremiumsPaid: 2750,
          riskLevel: "medium" as const,
          nextPremiumDue: "2024-02-15",
          claimsHistory: [],
        }
      })

      const policiesData = await Promise.all(policyPromises)
      setPolicies(policiesData)
    } catch (error) {
      console.error("Error loading policies:", error)
      setPolicies(getMockPolicies())
      toast({
        title: "Error",
        description: "Failed to load policies from contract. Using demo data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPoliciesData()
  }, [userPolicyIds, isConnected, address])

  const refreshData = async () => {
    setRefreshing(true)
    await loadPoliciesData()
    setRefreshing(false)
    toast({
      title: "Success",
      description: "Policies data refreshed successfully",
    })
  }

  const getMockPolicies = (): PolicyData[] => [
    {
      id: "POL-001",
      farmerId: account || "0x1234...5678",
      stationId: "station_001",
      stationName: "Athens Central",
      coverageAmount: 50000,
      premiumAmount: 250,
      coverageTypes: ["flood", "drought", "wind"],
      status: "active",
      startDate: "2024-01-15",
      endDate: "2024-12-15",
      totalPremiumsPaid: 2750,
      riskLevel: "medium",
      nextPremiumDue: "2024-02-15",
      claimsHistory: [
        {
          id: "CLM-001",
          type: "flood",
          amount: 5000,
          status: "paid",
          date: "2024-01-20",
          transactionHash: "0xabc123...def456",
        },
      ],
    },
    {
      id: "POL-002",
      farmerId: account || "0x1234...5678",
      stationId: "station_003",
      stationName: "Patras Marina",
      coverageAmount: 75000,
      premiumAmount: 375,
      coverageTypes: ["drought", "hail"],
      status: "active",
      startDate: "2024-02-01",
      endDate: "2025-01-31",
      totalPremiumsPaid: 1125,
      riskLevel: "low",
      nextPremiumDue: "2024-03-01",
      claimsHistory: [],
    },
    {
      id: "POL-003",
      farmerId: account || "0x1234...5678",
      stationId: "station_005",
      stationName: "Rhodes Harbor",
      coverageAmount: 30000,
      premiumAmount: 180,
      coverageTypes: ["wind", "flood"],
      status: "claimed",
      startDate: "2023-06-01",
      endDate: "2024-05-31",
      totalPremiumsPaid: 1980,
      riskLevel: "high",
      nextPremiumDue: "2024-06-01",
      claimsHistory: [
        {
          id: "CLM-002",
          type: "wind",
          amount: 12000,
          status: "approved",
          date: "2024-01-10",
        },
      ],
    },
  ]

  const activePolicies = policies.filter((p) => p.status === "active")
  const totalCoverage = policies.reduce((sum, p) => sum + p.coverageAmount, 0)
  const totalPremiumsPaid = policies.reduce((sum, p) => sum + p.totalPremiumsPaid, 0)
  const pendingClaims = policies.flatMap((p) => p.claimsHistory).filter((c) => c.status === "pending")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-gray-100 text-gray-800"
      case "claimed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "high":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              My Insurance Policies
            </h2>
            <p className="text-lg text-muted-foreground mt-2">
              Manage your weather insurance policies and track claims
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!isConnected ? (
              <Button onClick={connectWallet} className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-green-500 text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
                <Button variant="outline" onClick={refreshData} disabled={refreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Wallet Connection Alert */}
      {!isConnected && (
        <Alert className="mb-6">
          <Wallet className="h-4 w-4" />
          <AlertDescription>
            Connect your wallet to view your actual policies from the blockchain. Currently showing demo data.
          </AlertDescription>
        </Alert>
      )}

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
              <div className="text-3xl font-bold text-green-600">${(totalCoverage / 1000).toFixed(0)}K</div>
              <p className="text-sm text-muted-foreground mt-1">Insurance coverage</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </GradientCard>

        <GradientCard title="Premiums Paid" gradient="from-purple-500/20 to-pink-500/20" delay={0.3}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-600">${totalPremiumsPaid.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">Total paid</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </GradientCard>

        <GradientCard title="Pending Claims" gradient="from-orange-500/20 to-red-500/20" delay={0.4}>
          <div className="flex items-center justify-between">
            <div>
              <AnimatedCounter value={pendingClaims.length} className="text-3xl font-bold text-orange-600" />
              <p className="text-sm text-muted-foreground mt-1">Awaiting processing</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
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
          <TabsTrigger value="claims" className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5" />
            Claims History
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {policies.map((policy, index) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{policy.id}</CardTitle>
                      <Badge className={getStatusColor(policy.status)}>{policy.status}</Badge>
                    </div>
                    <CardDescription>{policy.stationName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Coverage</p>
                        <p className="font-semibold">${policy.coverageAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Premium</p>
                        <p className="font-semibold">${policy.premiumAmount}/month</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Risk Level</p>
                        <p className={`font-semibold capitalize ${getRiskColor(policy.riskLevel)}`}>
                          {policy.riskLevel}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Next Due</p>
                        <p className="font-semibold">{new Date(policy.nextPremiumDue).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Coverage Types</p>
                      <div className="flex flex-wrap gap-1">
                        {policy.coverageTypes.map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Policy Period</span>
                        <span>
                          {Math.round(
                            ((new Date().getTime() - new Date(policy.startDate).getTime()) /
                              (new Date(policy.endDate).getTime() - new Date(policy.startDate).getTime())) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={Math.round(
                          ((new Date().getTime() - new Date(policy.startDate).getTime()) /
                            (new Date(policy.endDate).getTime() - new Date(policy.startDate).getTime())) *
                            100,
                        )}
                        className="h-2"
                      />
                    </div>

                    <Button variant="outline" className="w-full">
                      View Details
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="claims">
          <div className="space-y-4">
            {policies
              .flatMap((policy) =>
                policy.claimsHistory.map((claim) => ({
                  ...claim,
                  policyId: policy.id,
                  stationName: policy.stationName,
                })),
              )
              .map((claim, index) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {claim.type.charAt(0).toUpperCase() + claim.type.slice(1)} Claim
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {claim.stationName} • {new Date(claim.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${claim.amount.toLocaleString()}</p>
                          <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                        </div>
                      </div>
                      {claim.transactionHash && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Transaction Hash</p>
                          <p className="font-mono text-sm">{claim.transactionHash}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Premium Payment History</CardTitle>
                <CardDescription>Monthly premium payments over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart visualization would go here
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Current risk levels by coverage type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["flood", "drought", "wind", "hail"].map((risk) => (
                    <div key={risk} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize">{risk} Risk</span>
                        <span>{Math.floor(Math.random() * 100)}%</span>
                      </div>
                      <Progress value={Math.floor(Math.random() * 100)} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
