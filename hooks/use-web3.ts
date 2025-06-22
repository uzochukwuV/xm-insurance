"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"

export function useWeb3() {
  const { address, isConnected, chainId } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()

  const connectWallet = async () => {
    try {
    alert("trying to connect")
      const metamaskConnector = connectors.find((connector) => connector.name === "MetaMask")
      if (metamaskConnector) {
        connect({ connector: metamaskConnector })
      } else {
        connect({ connector: connectors[1] })
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      throw error
    }
  }

  return {
    account: address,
    isConnected,
    chainId,
    connectWallet,
    disconnect,
    connectors,
  }
}
