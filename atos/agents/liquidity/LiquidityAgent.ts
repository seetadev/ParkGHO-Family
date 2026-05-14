import { ethers } from "ethers";
import { BaseAgent } from "../shared/BaseAgent";
import { TaskNode, TaskType } from "../../ipld/schemas/index";
import { encode, cidToString } from "../../ipld/codecs/codec";

const FACTORY  = "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";
const ROUTER   = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48";
const POS_MGR  = "0x1238536071E1c677A632429e3655c799b22cDA52";
const WETH     = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const FEE      = 3000;
const TICK_LOW  = -887220;
const TICK_HIGH =  887220;

const FACTORY_ABI = [
  "function getPool(address,address,uint24) external view returns(address)",
  "function createPool(address,address,uint24) external returns(address)",
];
const POOL_ABI = [
  "function initialize(uint160) external",
  "function slot0() external view returns(uint160,int24,uint16,uint16,uint16,uint8,bool)",
];
const POS_ABI = [
  "function mint((address,address,uint24,int24,int24,uint256,uint256,uint256,uint256,address,uint256)) external payable returns(uint256,uint128,uint256,uint256)",
];
const ROUTER_ABI = [
  "function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) external payable returns(uint256)",
];
const ERC20_ABI = [
  "function approve(address,uint256) external returns(bool)",
  "function balanceOf(address) external view returns(uint256)",
];

export class LiquidityAgent extends BaseAgent {
  private wallet!: ethers.Wallet;

  constructor(port = 9002) {
    super({ role: "liquidity_manager", port, bootstrapPeers: process.env.BOOTSTRAP_PEERS ? [process.env.BOOTSTRAP_PEERS] : [] });
  }

  protected getCapabilities(): TaskType[] { return ["provision_liquidity", "remove_liquidity", "swap_tokens"]; }

  protected async onStart() {
    const pk  = process.env.PRIVATE_KEY;
    const key = process.env.INFURA_API_KEY;
    if (!pk || !key) { this.logger.warn("Wallet not configured — liquidity agent in dry-run mode"); return; }
    this.wallet = new ethers.Wallet(pk, new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${key}`));
    this.logger.info(`LiquidityAgent wallet: ${this.wallet.address}`);
  }

  protected async executeTask(task: TaskNode): Promise<string> {
    switch (task.taskType) {
      case "provision_liquidity": return await this.addLiquidity();
      case "remove_liquidity":    return await this.removeLiquidity();
      case "swap_tokens":         return await this.swapTokens();
      default: throw new Error(`Unknown task type: ${task.taskType}`);
    }
  }

  private async addLiquidity(): Promise<string> {
    const token = process.env.TOKEN_ADDRESS_SEPOLIA;
    if (!token) throw new Error("TOKEN_ADDRESS_SEPOLIA not set");
    const factory = new ethers.Contract(FACTORY, FACTORY_ABI, this.wallet);
    let pool = await factory.getPool(token, WETH, FEE);
    if (pool === ethers.ZeroAddress) {
      const tx = await factory.createPool(token, WETH, FEE);
      await tx.wait();
      pool = await factory.getPool(token, WETH, FEE);
      const poolContract = new ethers.Contract(pool, POOL_ABI, this.wallet);
      await (await poolContract.initialize(BigInt("79228162514264337593543950336"))).wait();
      this.logger.info(`Pool created and initialized at ${pool}`);
    }
    const tk = new ethers.Contract(token, ERC20_ABI, this.wallet);
    const wt = new ethers.Contract(WETH,  ERC20_ABI, this.wallet);
    const tAmt = ethers.parseEther("10000");
    const wAmt = ethers.parseEther("10");
    await (await tk.approve(POS_MGR, tAmt)).wait();
    await (await wt.approve(POS_MGR, wAmt)).wait();
    const [t0, t1, a0, a1] = token.toLowerCase() < WETH.toLowerCase()
      ? [token, WETH, tAmt, wAmt] : [WETH, token, wAmt, tAmt];
    const pm = new ethers.Contract(POS_MGR, POS_ABI, this.wallet);
    const tx = await pm.mint({
      token0: t0, token1: t1, fee: FEE,
      tickLower: TICK_LOW, tickUpper: TICK_HIGH,
      amount0Desired: a0, amount1Desired: a1,
      amount0Min: 0n, amount1Min: 0n,
      recipient: this.wallet.address,
      deadline: Math.floor(Date.now() / 1000) + 1200,
    });
    const receipt = await tx.wait();
    this.logger.info(`Liquidity added. Tx: ${receipt.hash}`);
    const result = { action: "add_liquidity", pool, txHash: receipt.hash, timestamp: Date.now() };
    const { cid, bytes } = await encode(result as unknown as Record<string, unknown>);
    await this.blockStore.put(cid, bytes);
    return cidToString(cid);
  }

  private async removeLiquidity(): Promise<string> {
    const result = { action: "remove_liquidity", note: "Provide tokenId via task input", timestamp: Date.now() };
    const { cid, bytes } = await encode(result as unknown as Record<string, unknown>);
    await this.blockStore.put(cid, bytes);
    return cidToString(cid);
  }

  private async swapTokens(): Promise<string> {
    const token = process.env.TOKEN_ADDRESS_SEPOLIA;
    if (!token) throw new Error("TOKEN_ADDRESS_SEPOLIA not set");
    const wt = new ethers.Contract(WETH, ERC20_ABI, this.wallet);
    const amt = ethers.parseEther("0.01");
    await (await wt.approve(ROUTER, amt)).wait();
    const router = new ethers.Contract(ROUTER, ROUTER_ABI, this.wallet);
    const tx = await router.exactInputSingle({
      tokenIn: WETH, tokenOut: token, fee: FEE,
      recipient: this.wallet.address,
      amountIn: amt, amountOutMinimum: 0n, sqrtPriceLimitX96: 0n,
    });
    const receipt = await tx.wait();
    this.logger.info(`Swap done. Tx: ${receipt.hash}`);
    const result = { action: "swap", txHash: receipt.hash, timestamp: Date.now() };
    const { cid, bytes } = await encode(result as unknown as Record<string, unknown>);
    await this.blockStore.put(cid, bytes);
    return cidToString(cid);
  }
}
