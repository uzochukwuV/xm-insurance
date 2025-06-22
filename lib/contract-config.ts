export const INSURANCE_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_INSURANCE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"

export const WEATHER_STATION_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_WEATHER_STATION_CONTRACT_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

export const USD_DECIMALS = 8

export const INSURANCE_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_weatherStationContractAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "farmer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "stationId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "coverageAmount",
        type: "uint256",
      },
    ],
    name: "PolicyCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "farmer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "PremiumPaid",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_farmer",
        type: "address",
      },
      {
        internalType: "string",
        name: "_stationId",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_coverageAmount",
        type: "uint256",
      },
    ],
    name: "createPolicy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_policyId",
        type: "uint256",
      },
    ],
    name: "getPolicyDetails",
    outputs: [
      {
        internalType: "address",
        name: "farmer",
        type: "address",
      },
      {
        internalType: "string",
        name: "stationId",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "coverageAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "premium",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "lastPremiumPayment",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_policyId",
        type: "uint256",
      },
    ],
    name: "getNextPremiumDue",
    outputs: [
      {
        internalType: "uint256",
        name: "dueDate",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_policyId",
        type: "uint256",
      },
    ],
    name: "payPremium",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "policies",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "policyIdToPolicy",
    outputs: [
      {
        internalType: "address",
        name: "farmer",
        type: "address",
      },
      {
        internalType: "string",
        name: "stationId",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "coverageAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "premium",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "lastPremiumPayment",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "premiumInterval",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "weatherStationContract",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]

export interface PolicyStruct {
  farmer: `0x${string}`
  stationId: string
  coverageAmount: bigint
  premium: bigint
  isActive: boolean
  lastPremiumPayment: bigint
}

export interface EnhancedPolicyData extends PolicyStruct {
  nextPremiumDue: bigint
  daysSinceLastPayment: number
  isOverdue: boolean
  stationName: string
  coverageTypeString: string
}
