import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

async function deployTokenFixture() {
  const [admin, minter, pauser, burner, user1, user2, attacker] = await ethers.getSigners();
  const ATOSToken = await ethers.getContractFactory("ATOSToken");
  const token = await ATOSToken.deploy(admin.address, minter.address, "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi");
  await token.waitForDeployment();
  const MINTER_ROLE        = await token.MINTER_ROLE();
  const PAUSER_ROLE        = await token.PAUSER_ROLE();
  const BURNER_ROLE        = await token.BURNER_ROLE();
  const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
  await token.connect(admin).grantRole(PAUSER_ROLE, pauser.address);
  await token.connect(admin).grantRole(BURNER_ROLE, burner.address);
  return { token, admin, minter, pauser, burner, user1, user2, attacker, MINTER_ROLE, PAUSER_ROLE, BURNER_ROLE, DEFAULT_ADMIN_ROLE };
}

describe("ATOSToken", () => {

  describe("Deployment", () => {
    it("sets correct name and symbol", async () => {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.name()).to.equal("ATOS Token");
      expect(await token.symbol()).to.equal("ATOS");
    });
    it("mints INITIAL_SUPPLY to admin", async () => {
      const { token, admin } = await loadFixture(deployTokenFixture);
      expect(await token.balanceOf(admin.address)).to.equal(await token.INITIAL_SUPPLY());
    });
    it("stores metadata CID", async () => {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.metadataCID()).to.equal("bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi");
    });
    it("reverts if admin is zero address", async () => {
      const [_, minter] = await ethers.getSigners();
      const F = await ethers.getContractFactory("ATOSToken");
      await expect(F.deploy(ethers.ZeroAddress, minter.address, "cid")).to.be.revertedWith("ATOSToken: admin is zero address");
    });
    it("reverts if minter is zero address", async () => {
      const [admin] = await ethers.getSigners();
      const F = await ethers.getContractFactory("ATOSToken");
      await expect(F.deploy(admin.address, ethers.ZeroAddress, "cid")).to.be.revertedWith("ATOSToken: minter is zero address");
    });
  });

  describe("Minting", () => {
    it("minter can mint tokens", async () => {
      const { token, minter, user1 } = await loadFixture(deployTokenFixture);
      const amount = ethers.parseEther("1000");
      await token.connect(minter).mint(user1.address, amount);
      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });
    it("attacker cannot mint", async () => {
      const { token, attacker, user1, MINTER_ROLE } = await loadFixture(deployTokenFixture);
      await expect(token.connect(attacker).mint(user1.address, 1n))
        .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
        .withArgs(attacker.address, MINTER_ROLE);
    });
    it("cannot exceed MAX_SUPPLY", async () => {
      const { token, minter, user1 } = await loadFixture(deployTokenFixture);
      const over = (await token.MAX_SUPPLY()) - (await token.totalSupply()) + 1n;
      await expect(token.connect(minter).mint(user1.address, over)).to.be.revertedWith("ATOSToken: exceeds max supply");
    });
  });

  describe("Transfers", () => {
    it("user can transfer tokens", async () => {
      const { token, admin, user1 } = await loadFixture(deployTokenFixture);
      const amount = ethers.parseEther("100");
      await token.connect(admin).transfer(user1.address, amount);
      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });
    it("cannot transfer more than balance", async () => {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      await expect(token.connect(user1).transfer(user2.address, 1n))
        .to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });
  });

  describe("Burning", () => {
    it("user can burn their own tokens", async () => {
      const { token, admin } = await loadFixture(deployTokenFixture);
      const amount = ethers.parseEther("1000");
      const before = await token.balanceOf(admin.address);
      await token.connect(admin).burn(amount);
      expect(await token.balanceOf(admin.address)).to.equal(before - amount);
    });
    it("BURNER_ROLE can burn from any address without allowance", async () => {
      const { token, burner, user1, minter } = await loadFixture(deployTokenFixture);
      const amount = ethers.parseEther("500");
      await token.connect(minter).mint(user1.address, amount);
      await token.connect(burner).burnFrom(user1.address, amount);
      expect(await token.balanceOf(user1.address)).to.equal(0);
    });
  });

  describe("Pausing", () => {
    it("pauser can pause and transfers revert", async () => {
      const { token, admin, user1, pauser } = await loadFixture(deployTokenFixture);
      await token.connect(pauser).pause();
      await expect(token.connect(admin).transfer(user1.address, 1n))
        .to.be.revertedWithCustomError(token, "EnforcedPause");
    });
    it("pauser can unpause", async () => {
      const { token, admin, user1, pauser } = await loadFixture(deployTokenFixture);
      await token.connect(pauser).pause();
      await token.connect(pauser).unpause();
      await expect(token.connect(admin).transfer(user1.address, 1n)).to.not.be.reverted;
    });
    it("non-pauser cannot pause", async () => {
      const { token, attacker, PAUSER_ROLE } = await loadFixture(deployTokenFixture);
      await expect(token.connect(attacker).pause())
        .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
        .withArgs(attacker.address, PAUSER_ROLE);
    });
  });

  describe("Metadata CID", () => {
    it("admin can update CID", async () => {
      const { token, admin } = await loadFixture(deployTokenFixture);
      await token.connect(admin).setMetadataCID("newcid123");
      expect(await token.metadataCID()).to.equal("newcid123");
    });
    it("non-admin cannot update CID", async () => {
      const { token, attacker } = await loadFixture(deployTokenFixture);
      await expect(token.connect(attacker).setMetadataCID("hack"))
        .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    });
    it("empty CID is rejected", async () => {
      const { token, admin } = await loadFixture(deployTokenFixture);
      await expect(token.connect(admin).setMetadataCID("")).to.be.revertedWith("ATOSToken: empty CID");
    });
  });

  describe("Governance votes", () => {
    it("token holder can delegate and get votes", async () => {
      const { token, admin } = await loadFixture(deployTokenFixture);
      await token.connect(admin).delegate(admin.address);
      expect(await token.getVotes(admin.address)).to.equal(await token.balanceOf(admin.address));
    });
  });
});
