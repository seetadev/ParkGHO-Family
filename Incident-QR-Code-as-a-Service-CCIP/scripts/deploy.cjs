const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 1. Deploy SafeRoadsToken
  const Token = await ethers.getContractFactory("SafeRoadsToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("SafeRoadsToken deployed to:", tokenAddress);

  // 2. Deploy IncidentManager
  const IncidentManager = await ethers.getContractFactory("IncidentManager");
  const manager = await IncidentManager.deploy(tokenAddress);
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("IncidentManager deployed to:", managerAddress);

  // 3. Seed IncidentManager with 5M SRT for rewards
  const seedAmount = ethers.parseEther("5000000");
  await token.transfer(managerAddress, seedAmount);
  console.log(`\nTransferred 5,000,000 SRT to IncidentManager for rewards`);

  console.log("\n--- Update your .env ---");
  console.log(`VITE_TOKEN_CONTRACT_POLYGON=${tokenAddress}`);
  console.log(`VITE_INCIDENT_CONTRACT_POLYGON=${managerAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
