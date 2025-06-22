"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { formatEther } from "viem"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Shield, DollarSign, Calendar, AlertTriangle, CheckCircle, RefreshCw, ExternalLink } from "lucide-react"
import { useInsuranceContract } from "@/hooks/use-insurance-contract"
import { useToast } from "@/hooks/use-toast"
import type { EnhancedPolicyData } from "@/lib/contract-config"

export function PolicyManagement() {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const [policies, setPolicies] = useState<EnhancedPolicyData[]>([])
  const [loading, setLoading] = useState(true)
  const [payingPremium, setPayingPremium] = useState<string | null>(null)

  const { useGetUserPolicies, getEnhancedPolicyData, payPremium, hash, isPending, isConfirming, isConfirmed, error } =
    useInsuranceContract()

  const { data: userPolicyIds, isLoading: policiesLoading, refetch } = useGetUserPolicies(address)

  useEffect(() => {
    if (userPolicyIds && userPolicyIds.length > 0) {
      loadPolicyDetails()
    } else {
      setLoading(false)
    }
  }, [userPolicyIds])

  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: "Transaction Confirmed!",
        description: "Your premium payment has been processed successfully.",
      })
      refetch()
      setPayingPremium(null)
    }
  }, [isConfirmed, refetch, toast])

  useEffect(() => {
    if (error) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      })
      setPayingPremium(null)
    }
  }, [error, toast])

  const loadPolicyDetails = async () => {
    if (!userPolicyIds) return

    setLoading(true)
    try {
      const enhancedPolicies = await Promise.all(
        userPolicyIds.map(async (policyId) => {
          return await getEnhancedPolicyData(policyId)
        }),
      )

      setPolicies(enhancedPolicies.filter(Boolean) as EnhancedPolicyData[])
    } catch (error) {
      console.error("Error loading policy details:", error)
      toast({
        title: "Error",
        description: "Failed to load policy details from the blockchain.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePayPremium = async (policyId: bigint, premiumAmount: string) => {
    setPayingPremium(policyId.toString())
    try {
      await payPremium(policyId, premiumAmount)
    } catch (error) {
      console.error("Error paying premium:", error)
      setPayingPremium(null)
    }
  }

  const getPolicyStatusColor = (policy: EnhancedPolicyData) => {
    if (!policy.isActive) return "bg-gray-100 text-gray-800"
    if (policy.isOverdue) return "bg-red-100 text-red-800"
    return "bg-green-100 text-green-800"
  }

  const getPolicyStatusText = (policy: EnhancedPolicyData) => {
    if (!policy.isActive) return "Inactive"
    if (policy.isOverdue) return "Overdue"
    return "Active"
  }

  if (!isConnected) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>Please connect your wallet to view your insurance policies.</AlertDescription>
      </Alert>
    )
  }

  if (loading || policiesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-xl">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!policies.length) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-12 text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Policies Found</h3>
          <p className="text-gray-600 mb-6">
            You don't have any insurance policies yet. Create your first policy to get started.
          </p>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">Create Your First Policy</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">My Insurance Policies</h3>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {policies.map((policy, index) => (
          <motion.div
            key={policy.id.toString()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Policy #{policy.id.toString()}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getPolicyStatusColor(policy)}>{getPolicyStatusText(policy)}</Badge>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <span>{policy.stationName}</span>
                  <Badge variant="outline" className="text-xs">
                    {policy.coverageTypeString}
                  </Badge>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Policy Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Coverage Amount</p>
                    <p className="font-semibold text-lg">{formatEther(policy.coverageAmount)} ETH</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Monthly Premium</p>
                    <p className="font-semibold text-lg">{formatEther(policy.premium)} ETH</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Deductible</p>
                    <p className="font-semibold">{formatEther(policy.deductible)} ETH</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Claims Paid</p>
                    <p className="font-semibold">{formatEther(policy.claimsPaid)} ETH</p>
                  </div>
                </div>

                {/* Premium Due Information */}
                {policy.isActive && (
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Next Premium Due
                      </span>
                      <span
                        className={`text-sm ${policy.isOverdue ? "text-red-600 font-semibold" : "text-muted-foreground"}`}
                      >
                        {new Date(Number(policy.nextPremiumDue) * 1000).toLocaleDateString()}
                      </span>
                    </div>

                    {policy.isOverdue && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          Premium payment is overdue. Pay now to maintain coverage.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      onClick={() => handlePayPremium(policy.id, formatEther(policy.premium))}
                      disabled={payingPremium === policy.id.toString() || isPending}
                      className={`w-full ${policy.isOverdue ? "bg-red-600 hover:bg-red-700" : "bg-gradient-to-r from-blue-600 to-purple-600"}`}
                    >
                      {payingPremium === policy.id.toString() ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Pay Premium ({formatEther(policy.premium)} ETH)
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Policy Timeline */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Policy Period Progress</span>
                    <span>
                      {Math.round(
                        ((Date.now() / 1000 - Number(policy.startTime)) /
                          (Number(policy.endTime) - Number(policy.startTime))) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={Math.round(
                      ((Date.now() / 1000 - Number(policy.startTime)) /
                        (Number(policy.endTime) - Number(policy.startTime))) *
                        100,
                    )}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{new Date(Number(policy.startTime) * 1000).toLocaleDateString()}</span>
                    <span>{new Date(Number(policy.endTime) * 1000).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Policy #{policy.id.toString()} Details</DialogTitle>
                        <DialogDescription>Complete policy information</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Policy ID:</span>
                            <p className="font-mono">{policy.id.toString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Station ID:</span>
                            <p className="font-mono">{policy.stationId}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Coverage Type:</span>
                            <p>{policy.coverageTypeString}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Days Since Last Payment:</span>
                            <p>{policy.daysSinceLastPayment} days</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Transaction Status */}
      {hash && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Transaction submitted: {hash.slice(0, 10)}...
            {isConfirming && " ⏳ Confirming..."}
            {isConfirmed && " ✅ Confirmed!"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
