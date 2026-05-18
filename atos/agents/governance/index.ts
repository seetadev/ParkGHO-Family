import "dotenv/config";
import { GovernanceAgent } from "./GovernanceAgent";

const agent = new GovernanceAgent(Number(process.env.AGENT_PORT) || 9004);

agent.start().catch((err) => { console.error("GovernanceAgent failed to start:", err); process.exit(1); });

process.on("SIGINT",  async () => { await agent.stop(); process.exit(0); });
process.on("SIGTERM", async () => { await agent.stop(); process.exit(0); });
