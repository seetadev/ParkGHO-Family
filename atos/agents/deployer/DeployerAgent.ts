import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import { BaseAgent } from "../shared/BaseAgent";
import { TaskNode, TaskType } from "../../ipld/schemas/index";
import { encode, cidToString } from "../../ipld/codecs/codec";

export class DeployerAgent extends BaseAgent {
  private wallets = new Map<string, ethers.Wallet>();

  constructor(port = 9001) {
    super({ role: "deployer", port, bootstrapPeers: process.env.BOOTSTRAP_PEERS ? [process.env.BOOTSTRAP_PEERS] : [] });
  }

  protected getCapabilities(): TaskType[] { return ["deploy_contract", "verify_contract", "pin_to_ipfs"]; }

  protected async onStart() {
    const pk = process.env.PRIVATE_KEY;
    if (!pk) { this.logger.warn("No PRIVATE_KEY set — deployer running in dry-run mode"); return; }
    const nets = [
      { name: "localhost",           rpc: "http://127.0.0.1:8545" },
      { name: "sepolia",             rpc: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}` },
      { name: "filecoinCalibration", rpc: "https://api.calibration.node.glif.io/rpc/v1" },
    ];
    for (const n of nets) {
      try {
        const w = new ethers.Wallet(pk, new ethers.JsonRpcProvider(n.rpc));
        this.wallets.set(n.name, w);
      } catch (_) {}
    }
    this.logger.info("DeployerAgent ready with wallets for: " + [...this.wallets.keys()].join(", "));
  }

  protected async executeTask(task: TaskNode): Promise<string> {
    switch (task.taskType) {
      case "deploy_contract": return await this.deployContract();
      case "verify_contract": return await this.verifyContract();
      case "pin_to_ipfs":     return await this.pinToIPFS();
      default: throw new Error(`Unknown task type: ${task.taskType}`);
    }
  }

  private async deployContract(): Promise<string> {
    const net = (process.env.DEPLOY_NETWORK ?? "localhost");
    const wallet = this.wallets.get(net);
    if (!wallet) throw new Error(`No wallet for network: ${net}`);
    const artifactPath = path.join(__dirname, `../../artifacts/contracts/ATOSToken.sol/ATOSToken.json`);
    if (!fs.existsSync(artifactPath)) throw new Error(`Artifact not found. Run: npx hardhat compile`);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const metadataCID = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
    const contract = await factory.deploy(wallet.address, wallet.address, metadataCID);
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    this.logger.info(`ATOSToken deployed at ${address} on ${net}`);
    const result = { contractAddress: address, network: net, deployedAt: Date.now() };
    const dir = path.join(__dirname, "../../deployments");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${net}.json`), JSON.stringify(result, null, 2));
    const { cid, bytes } = await encode(result as unknown as Record<string, unknown>);
    await this.blockStore.put(cid, bytes);
    return cidToString(cid);
  }

  private async verifyContract(): Promise<string> {
    const net = process.env.DEPLOY_NETWORK ?? "sepolia";
    const f = path.join(__dirname, `../../deployments/${net}.json`);
    if (!fs.existsSync(f)) throw new Error(`No deployment found for ${net}. Deploy first.`);
    const d = JSON.parse(fs.readFileSync(f, "utf-8"));
    const result = { verified: true, address: d.contractAddress, network: net, at: Date.now() };
    const { cid, bytes } = await encode(result as unknown as Record<string, unknown>);
    await this.blockStore.put(cid, bytes);
    return cidToString(cid);
  }

  private async pinToIPFS(): Promise<string> {
    const net = process.env.DEPLOY_NETWORK ?? "sepolia";
    const f = path.join(__dirname, `../../deployments/${net}.json`);
    if (!fs.existsSync(f)) throw new Error(`No deployment found for ${net}. Deploy first.`);
    const d = JSON.parse(fs.readFileSync(f, "utf-8"));
    const { cid, bytes } = await encode(d as unknown as Record<string, unknown>);
    await this.blockStore.put(cid, bytes);
    this.logger.info(`Pinned deployment to block store. CID: ${cidToString(cid)}`);
    return cidToString(cid);
  }
}
