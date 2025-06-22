"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Shield, DollarSign, Calendar, Loader2, CheckCircle } from "lucide-react"
import { getAllStations, type Station } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import { INSURANCE_CONTRACT_ADDRESS, INSURANCE_CONTRACT_ABI, type CoverageType } from "@/lib/contract-config"
import { useWeb3 } from "@/hooks/use-web3"
import {
  Shield,
  Wallet,
  TrendingUp,
} from "lucide-react"

const cropTypes = [
  { value: "corn", label: "Corn", riskMultiplier: 1.0 },
  { value: "wheat", label: "Wheat", riskMultiplier: 0.8 },
  { value: "soybeans", label: "Soybeans", riskMultiplier: 0.9 },
  { value: "rice", label: "Rice", riskMultiplier: 1.2 },
  { value: "cotton", label: "Cotton", riskMultiplier: 1.1 },
  { value: "vegetables", label: "Vegetables", riskMultiplier: 1.3 },
  { value: "fruits", label: "Fruits", riskMultiplier: 1.4 },
]

const coverageTypes = [
  { id: "flood", label: "Flood Protection", baseRate: 0.02, icon: "🌊" },
  { id: "wind", label: "Wind/Storm Protection", baseRate: 0.015, icon: "💨" },
  { id: "drought", label: "Drought Protection", baseRate: 0.025, icon: "☀️" },
  { id: "hail", label: "Hail Protection", baseRate: 0.01, icon: "🧊" },
]

export function BuyInsuranceForm() {
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const { toast } = useToast()

  // Wagmi hooks
  const { address, isConnected } = useAccount()
  const {connectWallet} = useWeb3()
  const { writeContract, data: hash, error: contractError, isPending } = useWriteContract()

  

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Form data
  const [formData, setFormData] = useState({
    farmerName: "",
    farmerEmail: "",
    stationId: "",
    farmSize: "",
    cropType: "",
    coverageAmount: "",
    selectedCoverages: [] as string[],
    duration: "12", // months
  })

  // Calculate premium in ETH
  const calculatePremiumETH = () => {
    const coverageAmount = Number.parseFloat(formData.coverageAmount) || 0
    const basePremiumUSD = calculatePremium() // Your existing calculation
    // Convert USD to ETH (mock rate - in real app, get from contract)
    const ethPriceUSD = 2000 // Mock ETH price
    return (basePremiumUSD / ethPriceUSD).toFixed(6)
  }

  const handleSubmit = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a policy.",
        variant: "destructive",
      })
      return
    }

    try {
      const coverageAmountWei = parseEther(formData.coverageAmount)
      const deductibleWei = parseEther("1000") // 1000 ETH deductible (adjust as needed)
      const premiumWei = parseEther(calculatePremiumETH())

      // Map coverage types to enum
      const coverageType: CoverageType = formData.selectedCoverages.includes("flood")
        ? 0
        : formData.selectedCoverages.includes("drought")
          ? 1
          : formData.selectedCoverages.includes("wind")
            ? 2
            : formData.selectedCoverages.includes("hail")
              ? 3
              : 4

      // Threshold configuration (adjust based on your needs)
      const thresholds = {
        minTemp: -10,
        maxTemp: 45,
        minHumidity: 20,
        maxHumidity: 90,
        maxWindSpeed: 100,
        maxPrecipitation: 200,
      }

      writeContract({
        address: INSURANCE_CONTRACT_ADDRESS,
        abi: INSURANCE_CONTRACT_ABI,
        functionName: "createPolicy",
        args: [formData.stationId, coverageType, coverageAmountWei, deductibleWei, thresholds],
        value: premiumWei, // Pay the premium
      })
    } catch (error) {
      console.error("Error creating policy:", error)
      toast({
        title: "Error",
        description: "Failed to create insurance policy. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: "Policy Created Successfully!",
        description: `Your insurance policy has been created. Transaction: ${hash}`,
      })
      setStep(4) // Success step
    }
  }, [isConfirmed, hash, toast])

  // Handle transaction error
  useEffect(() => {
    if (contractError) {
      toast({
        title: "Transaction Failed",
        description: contractError.message,
        variant: "destructive",
      })
    }
  }, [contractError, toast])

  useEffect(() => {
    loadStations()
  }, [])

  const loadStations = async () => {
    try {
      const stationsData = await getAllStations()
      setStations(stationsData.slice(0, 50)) // Limit for demo
    } catch (error) {
      console.error("Error loading stations:", error)
      toast({
        title: "Error",
        description: "Failed to load weather stations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculatePremium = () => {
    const farmSize = Number.parseFloat(formData.farmSize) || 0
    const coverageAmount = Number.parseFloat(formData.coverageAmount) || 0
    const crop = cropTypes.find((c) => c.value === formData.cropType)
    const riskMultiplier = crop?.riskMultiplier || 1.0

    let totalRate = 0
    formData.selectedCoverages.forEach((coverageId) => {
      const coverage = coverageTypes.find((c) => c.id === coverageId)
      if (coverage) {
        totalRate += coverage.baseRate
      }
    })

    const basePremium = (coverageAmount * totalRate * riskMultiplier) / 12 // Monthly
    const sizeFactor = Math.min(farmSize / 100, 2) // Larger farms get better rates
    const finalPremium = basePremium * (1 + sizeFactor * 0.1)

    return Math.round(finalPremium * 100) / 100
  }

  const selectedStation = stations.find((s) => s.id === formData.stationId)
  console.log(selectedStation)
  const monthlyPremium = calculatePremium()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Buy Crop Insurance
        </h2>
        <p className="text-lg text-muted-foreground mt-2">
          Protect your farm with weather-based crop insurance powered by blockchain
        </p>
      </motion.div>
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
              </div>
            )}
          </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3, 4].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step >= stepNum ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {step > stepNum ? <CheckCircle className="h-5 w-5" /> : stepNum}
            </div>
            {stepNum < 4 && (
              <div className={`w-16 h-1 mx-2 transition-colors ${step > stepNum ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Form */}
        <div className="md:col-span-2">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                {step === 1 && "Farm Information"}
                {step === 2 && "Coverage Selection"}
                {step === 3 && "Review & Payment"}
                {step === 4 && "Policy Created"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Tell us about your farm and select a weather station"}
                {step === 2 && "Choose your coverage types and amounts"}
                {step === 3 && "Review your policy details and confirm"}
                {step === 4 && "Your insurance policy is now active"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="farmerName">Farmer Name</Label>
                      <Input
                        id="farmerName"
                        value={formData.farmerName}
                        onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="farmerEmail">Email Address</Label>
                      <Input
                        id="farmerEmail"
                        type="email"
                        value={formData.farmerEmail}
                        onChange={(e) => setFormData({ ...formData, farmerEmail: e.target.value })}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stationId">Weather Station</Label>
                    <Select
                      value={formData.stationId}
                      onValueChange={(value) => setFormData({ ...formData, stationId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select nearest weather station" />
                      </SelectTrigger>
                      <SelectContent>
                        {stations.map((station) => (
                          <SelectItem key={station.id} value={station.id}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {station.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="farmSize">Farm Size (hectares)</Label>
                      <Input
                        id="farmSize"
                        type="number"
                        value={formData.farmSize}
                        onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                        placeholder="Enter farm size"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cropType">Crop Type</Label>
                      <Select
                        value={formData.cropType}
                        onValueChange={(value) => setFormData({ ...formData, cropType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select crop type" />
                        </SelectTrigger>
                        <SelectContent>
                          {cropTypes.map((crop) => (
                            <SelectItem key={crop.value} value={crop.value}>
                              {crop.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={
                      !formData.farmerName ||
                      !formData.farmerEmail ||
                      !formData.stationId ||
                      !formData.farmSize ||
                      !formData.cropType
                    }
                    className="w-full"
                  >
                    Next: Select Coverage
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="coverageAmount">Coverage Amount (USD)</Label>
                    <Input
                      id="coverageAmount"
                      type="number"
                      value={formData.coverageAmount}
                      onChange={(e) => setFormData({ ...formData, coverageAmount: e.target.value })}
                      placeholder="Enter coverage amount"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Coverage Types</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      {coverageTypes.map((coverage) => (
                        <div key={coverage.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                          <Checkbox
                            id={coverage.id}
                            checked={formData.selectedCoverages.includes(coverage.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  selectedCoverages: [...formData.selectedCoverages, coverage.id],
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  selectedCoverages: formData.selectedCoverages.filter((id) => id !== coverage.id),
                                })
                              }
                            }}
                          />
                          <div className="flex-1">
                            <label htmlFor={coverage.id} className="text-sm font-medium cursor-pointer">
                              {coverage.icon} {coverage.label}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              Base rate: {(coverage.baseRate * 100).toFixed(1)}% annually
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!formData.coverageAmount || formData.selectedCoverages.length === 0}
                      className="flex-1"
                    >
                      Next: Review
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Policy Summary</h3>
                    <div className="grid gap-4 text-sm">
                      <div className="flex justify-between">
                        <span>Farmer:</span>
                        <span className="font-medium">{formData.farmerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Farm Size:</span>
                        <span className="font-medium">{formData.farmSize} hectares</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Crop Type:</span>
                        <span className="font-medium">
                          {cropTypes.find((c) => c.value === formData.cropType)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weather Station:</span>
                        <span className="font-medium">{selectedStation?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coverage Amount:</span>
                        <span className="font-medium">
                          ${Number.parseFloat(formData.coverageAmount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coverage Types:</span>
                        <div className="flex flex-wrap gap-1">
                          {formData.selectedCoverages.map((id) => {
                            const coverage = coverageTypes.find((c) => c.id === id)
                            return (
                              <Badge key={id} variant="secondary" className="text-xs">
                                {coverage?.icon} {coverage?.label}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Monthly Premium:</span>
                      <span className="text-blue-600">${monthlyPremium}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Premium will be automatically deducted monthly from your connected wallet
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isPending || isConfirming || !isConnected}
                      className="flex-1"
                    >
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isPending
                        ? "Confirming Transaction..."
                        : isConfirming
                          ? "Waiting for Confirmation..."
                          : "Create Policy"}
                    </Button>
                  </div>
                  {hash && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium">Transaction Hash:</p>
                      <p className="text-xs font-mono break-all">{hash}</p>
                      {isConfirming && <p className="text-sm text-blue-600 mt-1">Waiting for confirmation...</p>}
                      {isConfirmed && <p className="text-sm text-green-600 mt-1">Transaction confirmed!</p>}
                    </div>
                  )}
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-green-600">Policy Created Successfully!</h3>
                    <p className="text-muted-foreground mt-2">
                      Your crop insurance policy is now active and protected by smart contracts.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Policy ID:</strong> INS-{Date.now()}
                    </p>
                    <p className="text-sm">
                      <strong>Monthly Premium:</strong> ${monthlyPremium}
                    </p>
                  </div>
                  <Button onClick={() => (window.location.href = "/insurance/dashboard")} className="w-full">
                    Go to Dashboard
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          {selectedStation && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Selected Station
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h3 className="font-semibold">{selectedStation.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>Lat: {selectedStation.lat.toFixed(4)}</p>
                    <p>Lon: {selectedStation.lon.toFixed(4)}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Active Station
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {monthlyPremium > 0 && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Premium Calculation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-green-600">${monthlyPremium}/month</div>
                  <div className="text-sm space-y-1">
                    <p>Coverage: ${Number.parseFloat(formData.coverageAmount || "0").toLocaleString()}</p>
                    <p>Farm Size: {formData.farmSize} hectares</p>
                    <p>Coverages: {formData.selectedCoverages.length} types</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    12 month policy
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
