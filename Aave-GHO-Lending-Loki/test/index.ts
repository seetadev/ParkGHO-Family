import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { getTokens } from "./types";
import ERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { Console } from "console";
import { Signer, utils } from "ethers";
import {
  LENS_HUB,
  WETH,
  DAI,
  AAVE_POOL,
  AAVE_DAI_DEBTTOKEN,
  SUPERFLUID,
  SUPERTOKENDAI,
} from "../test/common";

describe("test on manager contract", function () {
  let neenivOwner = {} as SignerWithAddress;
  let account = {} as SignerWithAddress;

  before(async function () {
    //init of variables
    [neenivOwner, account] = await ethers.getSigners();
  });

  it("Should set score of an address and get the interest", async function () {
    //deploy the manager contract.
    const Manager = await ethers.getContractFactory("Manager");
    const manager = await Manager.connect(neenivOwner).deploy(
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
    await manager.connect(neenivOwner).setScore(account.address, 5);
    const score = await manager
      .connect(account)
      .computeInterest(100, 1668528062000); //this timestamp correspond on 15/11/2022
    expect(score).to.be.equal(5);
  });
});

describe("test on loan contract", function () {
  let neenivOwner = {} as SignerWithAddress;
  let account = {} as SignerWithAddress;

  before(async function () {
    //init of variables
    [neenivOwner, account] = await ethers.getSigners();
  });

  it("Should create the loan contract and post on lenster", async function () {
    //deploy the manager contract.
    const Manager = await ethers.getContractFactory("Manager");
    const manager = await Manager.connect(neenivOwner).deploy(
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
    await manager.connect(neenivOwner).setScore(account.address, 5);
  });

  it("Should do the credit delegation function and the stream", async function () {
    //deploy the manager contract.
    const Manager = await ethers.getContractFactory("Manager");
    const manager = await Manager.connect(neenivOwner).deploy(
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
    await manager.connect(neenivOwner).setScore(account.address, 5);
  });

  it("Should borrower pay the principal", async function () {
    //deploy the manager contract.
    const Manager = await ethers.getContractFactory("Manager");
    const manager = await Manager.connect(neenivOwner).deploy(
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
    await manager.connect(neenivOwner).setScore(account.address, 5);
  });

  it("Should the smart contract repay the lender after the repayment of the borrower", async function () {
    //deploy the manager contract.
    const Manager = await ethers.getContractFactory("Manager");
    const manager = await Manager.connect(neenivOwner).deploy(
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
    await manager.connect(neenivOwner).setScore(account.address, 5);
  });
});
