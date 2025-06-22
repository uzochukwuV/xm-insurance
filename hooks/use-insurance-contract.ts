"use client"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import {
  INSURANCE_CONTRACT_ADDRESS,
  INSURANCE_CONTRACT_ABI,
  type CoverageType,
  type ThresholdConfig,
} from "@/lib/contract-config"
import { useToast } from "@/hooks/use-toast"

export interface EnhancedPolicyData {
  stationId: string
  coverageType: number
  coverageAmount: bigint
  deductible: bigint
  thresholds: ThresholdConfig
  startTime: bigint
  premium: bigint
  policyHolder: string
  active: boolean
  nextPremiumDue: bigint
  daysSinceLastPayment: number
  isOverdue: boolean
  stationName: string
  coverageTypeString: string
}

export function useInsuranceContract() {
  const { toast } = useToast()
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Read contract functions
  const useGetUserPolicies = (userAddress?: string) => {
    return useReadContract({
      address: INSURANCE_CONTRACT_ADDRESS,
      abi: INSURANCE_CONTRACT_ABI,
      functionName: "getUserPolicies",
      args: userAddress ? [userAddress] : undefined,
      query: {
        enabled: !!userAddress,
      },
    })
  }

  const useGetPolicy = (policyId?: bigint) => {
    return useReadContract({
      address: INSURANCE_CONTRACT_ADDRESS,
      abi: INSURANCE_CONTRACT_ABI,
      functionName: "getPolicy",
      args: policyId ? [policyId] : undefined,
      query: {
        enabled: !!policyId,
      },
    })
  }

  const useCalculatePremium = () => {
    return useReadContract({
      address: INSURANCE_CONTRACT_ADDRESS,
      abi: INSURANCE_CONTRACT_ABI,
      functionName: "calculatePremium",
    })
  }

  const useGetETHPrice = () => {
    return useReadContract({
      address: INSURANCE_CONTRACT_ADDRESS,
      abi: INSURANCE_CONTRACT_ABI,
      functionName: "getETHPriceUSD",
    })
  }

  const useGetStationWeatherHistory = (stationId?: string) => {
    return useReadContract({
      address: INSURANCE_CONTRACT_ADDRESS,
      abi: INSURANCE_CONTRACT_ABI,
      functionName: "getStationWeatherHistory",
      args: stationId ? [stationId] : undefined,
      query: {
        enabled: !!stationId,
      },
    })
  }

  const useGetContractBalance = () => {
    return useReadContract({
      address: INSURANCE_CONTRACT_ADDRESS,
      abi: INSURANCE_CONTRACT_ABI,
      functionName: "getContractBalance",
    })
  }

  const useGetPolicyDetails = (policyId?: bigint) => {
    return useReadContract({
      address: INSURANCE_CONTRACT_ADDRESS,
      abi: INSURANCE_CONTRACT_ABI,
      functionName: "getPolicyDetails",
      args: policyId ? [policyId] : undefined,
      query: {
        enabled: !!policyId,
      },
    })
  }

  const useGetNextPremiumDue = (policyId?: bigint) => {
    return useReadContract({
      address: INSURANCE_CONTRACT_ADDRESS,
      abi: INSURANCE_CONTRACT_ABI,
      functionName: "getNextPremiumDue",
      args: policyId ? [policyId] : undefined,
      query: {
        enabled: !!policyId,
      },
    })
  }

  const calculatePremium = useCalculatePremium()

  // Write contract functions
  const createPolicy = async (
    stationId: string,
    coverageType: CoverageType,
    coverageAmount: string, // in ETH
    deductible: string, // in ETH
    thresholds: ThresholdConfig,
  ) => {
    try {
      const coverageAmountWei = parseEther(coverageAmount)
      const deductibleWei = parseEther(deductible)

      // Calculate premium first
      if (!calculatePremium.data) {
        throw new Error("Failed to calculate premium")
      }

      const premium = await calculatePremium.data(coverageAmountWei)

      writeContract({
        address: INSURANCE_CONTRACT_ADDRESS,
        abi: INSURANCE_CONTRACT_ABI,
        functionName: "createPolicy",
        args: [stationId, coverageType, coverageAmountWei, deductibleWei, thresholds],
        value: premium as bigint, // Pay the premium
      })

      return { hash, isPending, isConfirming, isConfirmed, error }
    } catch (err) {
      console.error("Error creating policy:", err)
      toast({
        title: "Error",
        description: "Failed to create policy. Please try again.",
        variant: "destructive",
      })
      throw err
    }
  }

  const payPremium = async (policyId: bigint, premiumAmount: string) => {
    try {
      const premiumWei = parseEther(premiumAmount)

      writeContract({
        address: INSURANCE_CONTRACT_ADDRESS,
        abi: INSURANCE_CONTRACT_ABI,
        functionName: "payPremium",
        args: [policyId],
        value: premiumWei,
      })

      return { hash, isPending, isConfirming, isConfirmed, error }
    } catch (err) {
      console.error("Error paying premium:", err)
      toast({
        title: "Error",
        description: "Failed to pay premium. Please try again.",
        variant: "destructive",
      })
      throw err
    }
  }

  const processClaimsForStation = async (stationId: string) => {
    try {
      writeContract({
        address: INSURANCE_CONTRACT_ADDRESS,
        abi: INSURANCE_CONTRACT_ABI,
        functionName: "processClaimsForStationExternal",
        args: [stationId],
      })

      return { hash, isPending, isConfirming, isConfirmed, error }
    } catch (err) {
      console.error("Error processing claims:", err)
      toast({
        title: "Error",
        description: "Failed to process claims. Please try again.",
        variant: "destructive",
      })
      throw err
    }
  }

  // Add function to get enhanced policy data
  const getEnhancedPolicyData = async (policyId: bigint): Promise<EnhancedPolicyData | null> => {
    try {
      const [policyData, nextDue] = await Promise.all([useGetPolicy(policyId), useGetNextPremiumDue(policyId)])

      if (!policyData.data || !nextDue.data) return null

      const policy = policyData.data
      const dueDate = nextDue.data
      const now = Math.floor(Date.now() / 1000)
      const daysSinceLastPayment = Math.floor((now - Number(policy.startTime)) / (24 * 60 * 60))

      return {
        ...policy,
        nextPremiumDue: dueDate,
        daysSinceLastPayment,
        isOverdue: now > Number(dueDate),
        stationName: `Station ${policy.stationId}`, // You can enhance this with actual station names
        coverageTypeString: getCoverageTypeString(policy.coverageType),
      }
    } catch (error) {
      console.error("Error getting enhanced policy data:", error)
      return null
    }
  }

  const getCoverageTypeString = (coverageType: number): string => {
    const types = ["Flood", "Drought", "Wind", "Hail", "Multi-Peril"]
    return types[coverageType] || "Unknown"
  }

  return {
    // Read hooks
    useGetUserPolicies,
    useGetPolicy,
    useGetPolicyDetails,
    useGetNextPremiumDue,
    useCalculatePremium: calculatePremium,
    useGetETHPrice,
    useGetStationWeatherHistory,
    useGetContractBalance,

    // Write functions
    createPolicy,
    payPremium,
    processClaimsForStation,

    // Enhanced functions
    getEnhancedPolicyData,
    getCoverageTypeString,

    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}
