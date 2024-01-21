import { ethers } from "hardhat";
import {
  LENS_HUB,
  WETH,
  DAI,
  AAVE_POOL,
  AAVE_DAI_DEBTTOKEN,
  SUPERFLUID,
  SUPERTOKENDAI,
} from "../test/common";

async function main() {
  //deploy the manager contract.
  const Manager = await ethers.getContractFactory("Manager");
  const manager = await Manager.deploy(
    LENS_HUB,
    AAVE_POOL,
    AAVE_DAI_DEBTTOKEN,
    SUPERFLUID,
    SUPERTOKENDAI,
    WETH,
    DAI
  );
  await manager.deployed();
  console.log(`Manager deployed to ${manager.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
