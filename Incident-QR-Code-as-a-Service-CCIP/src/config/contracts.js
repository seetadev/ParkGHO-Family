export const CONTRACTS = {
  polygon: {
    incidentManager: import.meta.env.VITE_INCIDENT_CONTRACT_POLYGON,
    safeRoadsToken: import.meta.env.VITE_TOKEN_CONTRACT_POLYGON,
  },
  filecoin: {
    incidentManager: import.meta.env.VITE_INCIDENT_CONTRACT_FILECOIN,
  },
};

export const INCIDENT_MANAGER_ABI = [
  {
    name: "reportIncident",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_type", type: "string" },
      { name: "_ipfsCID", type: "string" },
      { name: "_location", type: "string" },
      { name: "_severity", type: "uint8" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "verifyIncident",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_id", type: "uint256" }],
    outputs: [],
  },
  {
    name: "claimRewards",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "getUserIncidents",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "incidents",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "reporter", type: "address" },
      { name: "incidentType", type: "string" },
      { name: "ipfsCID", type: "string" },
      { name: "location", type: "string" },
      { name: "timestamp", type: "uint256" },
      { name: "verified", type: "bool" },
      { name: "rewardClaimed", type: "bool" },
      { name: "severity", type: "uint8" },
    ],
  },
  {
    name: "userRewardBalance",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "IncidentReported",
    type: "event",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "reporter", type: "address", indexed: true },
      { name: "incidentType", type: "string", indexed: false },
      { name: "ipfsCID", type: "string", indexed: false },
    ],
  },
];

export const TOKEN_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
];
