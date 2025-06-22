"use client"

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

export function Web3Connect() {
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { chains, switchChain } = useSwitchChain()

  const currentChain = chains.find((c) => c.id === chainId)
  const isCorrectNetwork = chainId === 1 || chainId === 11155111 || chainId === 137 || chainId === 80001 // mainnet, sepolia, polygon, mumbai

  if (isConnected) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Wallet Connected
          </CardTitle>
          <CardDescription>Your MetaMask wallet is connected to the dApp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Address:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Network:</span>
              <Badge variant={isCorrectNetwork ? "default" : "destructive"}>{currentChain?.name || "Unknown"}</Badge>
            </div>
          </div>

          {!isCorrectNetwork && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please switch to a supported network (Ethereum, Polygon, or their testnets)
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => disconnect()} className="flex-1">
              Disconnect
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`https://etherscan.io/address/${address}`, "_blank")}
              size="icon"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-600" />
          Connect Your Wallet
        </CardTitle>
        <CardDescription>Connect your MetaMask wallet to access insurance features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectors.map((connector) => (
          <motion.div key={connector.uid} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isPending ? "Connecting..." : `Connect ${connector.name}`}
            </Button>
          </motion.div>
        ))}

        <Alert>
          <Wallet className="h-4 w-4" />
          <AlertDescription>Make sure you have MetaMask installed and are on a supported network.</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
