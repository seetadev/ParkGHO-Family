import "dotenv/config";
import { DeployerAgent } from "./DeployerAgent";

const agent = new DeployerAgent(Number(process.env.AGENT_PORT) || 9001);

agent.start().catch((err) => { console.error("DeployerAgent failed to start:", err); process.exit(1); });

process.on("SIGINT",  async () => { await agent.stop(); process.exit(0); });
process.on("SIGTERM", async () => { await agent.stop(); process.exit(0); });
