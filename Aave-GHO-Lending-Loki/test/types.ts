import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";
import ERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { BigNumber } from "ethers";

//import type { Strategy } from "../src/types/Strategy";

/*declare module "mocha" {
  export interface Context {
    strategy: Strategy;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}*/

export const getTokens = async (
  user: string,
  token: any,
  whale: string,
  amount: BigNumber
) => {
  const contract = await ethers.getContractAt(ERC20.abi, token);

  await ethers.provider.send("hardhat_impersonateAccount", [whale]);

  const impersonatedAccount = await ethers.provider.getSigner(whale);
  const soldi = await ethers.provider.getBalance(whale);

  await contract.connect(impersonatedAccount).transfer(user, amount);
};
