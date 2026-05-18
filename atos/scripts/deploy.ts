import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log(`\nDeploying to: ${network.name}`);
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  if (balance === 0n) throw new Error("Deployer has no balance.");

  // Deploy Timelock
  const ATOSTimelock = await ethers.getContractFactory("ATOSTimelock");
  const minDelay = network.name === "hardhat" || network.name === "localhost" ? 0 : 172800;
  const timelock = await ATOSTimelock.deploy(minDelay, [deployer.address], [ethers.ZeroAddress], deployer.address);
  await timelock.waitForDeployment();
  console.log(`ATOSTimelock: ${await timelock.getAddress()}`);

  // Deploy Token
  const metadataCID = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
  const ATOSToken = await ethers.getContractFactory("ATOSToken");
  const token = await ATOSToken.deploy(deployer.address, deployer.address, metadataCID);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`ATOSToken: ${tokenAddress}`);

  // Save deployment info
  const info = {
    network: network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      ATOSToken: { address: tokenAddress, constructorArgs: [deployer.address, deployer.address, metadataCID] },
      ATOSTimelock: { address: await timelock.getAddress(), constructorArgs: [minDelay, [deployer.address], [ethers.ZeroAddress], deployer.address] },
    },
  };
  const dir = path.join(__dirname, "../deployments");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${network.name}.json`), JSON.stringify(info, null, 2));
  console.log(`Saved to deployments/${network.name}.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
