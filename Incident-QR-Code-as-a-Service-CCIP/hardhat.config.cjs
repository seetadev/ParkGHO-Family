require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const raw = process.env.DEPLOYER_PRIVATE_KEY || "0".repeat(64);
const PRIVATE_KEY = raw.startsWith("0x") ? raw : "0x" + raw;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: "cancun" },
  },
  networks: {
    // Polygon Amoy testnet (chain ID 80002)
    polygonAmoy: {
      url: process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology",
      accounts: [PRIVATE_KEY],
      chainId: 80002,
    },
    // Filecoin Calibration testnet (chain ID 314159)
    filecoinCalibration: {
      url: "https://api.calibration.node.glif.io/rpc/v1",
      accounts: [PRIVATE_KEY],
      chainId: 314159,
    },
    // Sepolia (for CCIP testing)
    sepolia: {
      url: process.env.SEPOLIA_RPC || "https://rpc.sepolia.org",
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
};
