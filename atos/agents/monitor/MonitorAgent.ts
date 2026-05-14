import { ethers } from "ethers";
import { BaseAgent } from "../shared/BaseAgent";
import { TaskNode, TaskType } from "../../ipld/schemas/index";
import { encode, cidToString } from "../../ipld/codecs/codec";
import { publish, TOPICS } from "../../libp2p/discovery/node";

const WHALE_THRESHOLD = ethers.parseEther("1000000");

export class MonitorAgent extends BaseAgent {
  private activeMonitors = new Map<string, () => void>();

  constructor(port = 9003) {
    super({ role: "monitor", port, bootstrapPeers: process.env.BOOTSTRAP_PEERS ? [process.env.BOOTSTRAP_PEERS] : [] });
  }

  protected getCapabilities(): TaskType[] { return ["monitor_contract"]; }

  protected async onStart() {
    const addr = process.env.TOKEN_ADDRESS_SEPOLIA;
    const key  = process.env.INFURA_API_KEY;
    if (addr && key) {
      await this.startMonitoring(addr, `https://sepolia.infura.io/v3/${key}`, "sepolia");
    } else {
      this.logger.warn("TOKEN_ADDRESS_SEPOLIA or INFURA_API_KEY not set — monitoring disabled");
    }
  }

  protected async executeTask(task: TaskNode): Promise<string> {
    const r = { taskId: task.taskId, status: "monitoring_active", startedAt: Date.now() };
    const { cid, bytes } = await encode(r as unknown as Record<string, unknown>);
    await this.blockStore.put(cid, bytes);
    return cidToString(cid);
  }

  async startMonitoring(contractAddress: string, rpcUrl: string, network: string) {
    if (this.activeMonitors.has(contractAddress)) return;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const abi = [
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Paused(address account)",
      "event Unpaused(address account)",
    ];
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const onTransfer = async (from: string, to: string, value: bigint, event: any) => {
      if (value >= WHALE_THRESHOLD) {
        const alert = {
          type: "whale_transfer",
          contractAddress,
          network,
          txHash: event.log.transactionHash,
          from,
          to,
          amount: ethers.formatEther(value),
          timestamp: Date.now(),
        };
        const { bytes } = await encode(alert as unknown as Record<string, unknown>);
        await publish(this.node, TOPICS.MONITORING_ALERT, bytes);
        this.logger.warn(`WHALE TRANSFER: ${ethers.formatEther(value)} ATOS from ${from} to ${to}`);
      }
    };

    const onPaused = async (account: string, event: any) => {
      const alert = {
        type: "pause",
        contractAddress,
        network,
        txHash: event.log.transactionHash,
        pausedBy: account,
        timestamp: Date.now(),
      };
      const { bytes } = await encode(alert as unknown as Record<string, unknown>);
      await publish(this.node, TOPICS.MONITORING_ALERT, bytes);
      this.logger.warn(`TOKEN PAUSED by ${account}`);
    };

    contract.on("Transfer", onTransfer);
    contract.on("Paused", onPaused);

    this.activeMonitors.set(contractAddress, () => {
      contract.off("Transfer", onTransfer);
      contract.off("Paused", onPaused);
      provider.destroy();
    });
    this.logger.info(`Monitoring ${contractAddress} on ${network}`);
  }

  stopMonitoring(contractAddress: string) {
    const cleanup = this.activeMonitors.get(contractAddress);
    if (cleanup) { cleanup(); this.activeMonitors.delete(contractAddress); }
  }
}
