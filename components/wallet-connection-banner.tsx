"use client"

import { useState } from "react"
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Wallet, CheckCircle, AlertTriangle, ExternalLink, Copy, Shield, Zap, Network } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export function WalletConnectionBanner() {
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { chains, switchChain } = useSwitchChain()
  const { toast } = useToast()
  const [showDetails, setShowDetails] = useState(false)

  const currentChain = chains.find((c) => c.id === chainId)
  const isCorrectNetwork = chainId === 1 || chainId === 11155111 || chainId === 137 || chainId === 80001

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector })
      toast({
        title: "Wallet Connected!",
        description: "Your wallet has been successfully connected.",
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isConnected) {
    return (
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Connect Your Wallet</h3>
                  <p className="text-gray-600">Connect your wallet to access insurance features and manage policies</p>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Wallet className="mr-2 h-5 w-5" />
                    Connect Wallet
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-blue-600" />
                      Connect Your Wallet
                    </DialogTitle>
                    <DialogDescription>
                      Choose your preferred wallet to connect to the insurance platform
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {connectors.map((connector) => (
                      <motion.div key={connector.uid} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => handleConnect(connector)}
                          disabled={isPending}
                          className="w-full h-14 text-left justify-start bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-900"
                          variant="outline"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                              <Wallet className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold">{connector.name}</div>
                              <div className="text-sm text-gray-500">
                                {isPending ? "Connecting..." : "Connect using browser extension"}
                              </div>
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Make sure you have MetaMask installed and are on a supported network (Ethereum, Polygon, or
                        testnets).
                      </AlertDescription>
                    </Alert>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <Card
        className={`border-2 ${isCorrectNetwork ? "border-green-300 bg-gradient-to-r from-green-50 to-blue-50" : "border-red-300 bg-gradient-to-r from-red-50 to-orange-50"}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${isCorrectNetwork ? "bg-gradient-to-r from-green-500 to-blue-500" : "bg-gradient-to-r from-red-500 to-orange-500"}`}
              >
                {isCorrectNetwork ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <Button variant="ghost" size="sm" onClick={copyAddress}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant={isCorrectNetwork ? "default" : "destructive"} className="text-xs">
                    <Network className="h-3 w-3 mr-1" />
                    {currentChain?.name || "Unknown"}
                  </Badge>
                  {isCorrectNetwork && (
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      <Zap className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isCorrectNetwork && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => switchChain({ chainId: 11155111 })} // Sepolia testnet
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Switch Network
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
                Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => disconnect()}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Disconnect
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Full Address:</span>
                    <p className="font-mono text-xs break-all">{address}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Network:</span>
                    <p>
                      {currentChain?.name} (Chain ID: {chainId})
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://etherscan.io/address/${address}`, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View on Explorer
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isCorrectNetwork && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please switch to a supported network (Ethereum Mainnet, Sepolia, Polygon, or Mumbai) to use all
                features.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
