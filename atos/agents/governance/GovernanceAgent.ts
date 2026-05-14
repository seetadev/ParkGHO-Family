import { ethers } from "ethers";
import { BaseAgent } from "../shared/BaseAgent";
import { TaskNode, TaskType } from "../../ipld/schemas/index";
import { encode, cidToString } from "../../ipld/codecs/codec";
import { publish, TOPICS } from "../../libp2p/discovery/node";

export class GovernanceAgent extends BaseAgent {
  private wallet!: ethers.Wallet;

  constructor(port = 9004) {
    super({ role: "governance", port, bootstrapPeers: process.env.BOOTSTRAP_PEERS ? [process.env.BOOTSTRAP_PEERS] : [] });
  }

  protected getCapabilities(): TaskType[] { return ["cast_vote", "create_proposal"]; }

  protected async onStart() {
    const pk = process.env.PRIVATE_KEY;
    if (!pk) { this.logger.warn("No PRIVATE_KEY — governance agent in dry-run mode"); return; }
    this.wallet = new ethers.Wallet(pk, new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`));
    this.logger.info(`GovernanceAgent ready. Wallet: ${this.wallet.address}`);
  }

  protected async executeTask(task: TaskNode): Promise<string> {
    if (task.taskType === "cast_vote")       return this.castVote();
    if (task.taskType === "create_proposal") return this.createProposal();
    throw new Error(`Unknown task type: ${task.taskType}`);
  }

  private async castVote(): Promise<string> {
    const addr = process.env.TOKEN_ADDRESS_SEPOLIA;
    if (!addr) throw new Error("TOKEN_ADDRESS_SEPOLIA not set");
    const token = new ethers.Contract(addr, [
      "function delegate(address) external",
      "function delegates(address) external view returns(address)",
    ], this.wallet);
    const current = await token.delegates(this.wallet.address);
    if (current === ethers.ZeroAddress) {
      await (await token.delegate(this.wallet.address)).wait();
      this.logger.info(`Self-delegated voting power for ${this.wallet.address}`);
    }
    const record = { action: "cast_vote", voter: this.wallet.address, timestamp: Date.now() };
    const { cid, bytes } = await encode(record as unknown as Record<string, unknown>);
    await this.blockStore.put(cid, bytes);
    await publish(this.node, TOPICS.GOVERNANCE_VOTE, bytes);
    return cidToString(cid);
  }

  private async createProposal(): Promise<string> {
    const proposal = {
      action: "create_proposal",
      proposer: this.agentCID,
      description: "Update ATOS token metadata CID to latest IPFS pin",
      createdAt: Date.now(),
    };
    const { cid, bytes } = await encode(proposal as unknown as Record<string, unknown>);
    await this.blockStore.put(cid, bytes);
    await publish(this.node, TOPICS.GOVERNANCE_PROPOSAL, bytes);
    this.logger.info(`Proposal broadcast. CID: ${cidToString(cid)}`);
    return cidToString(cid);
  }
}
