import "dotenv/config";
import { LiquidityAgent } from "./LiquidityAgent";

const agent = new LiquidityAgent(Number(process.env.AGENT_PORT) || 9002);

agent.start().catch((err) => { console.error("LiquidityAgent failed to start:", err); process.exit(1); });

process.on("SIGINT",  async () => { await agent.stop(); process.exit(0); });
process.on("SIGTERM", async () => { await agent.stop(); process.exit(0); });
