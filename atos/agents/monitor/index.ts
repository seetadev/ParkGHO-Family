import "dotenv/config";
import { MonitorAgent } from "./MonitorAgent";

const agent = new MonitorAgent(Number(process.env.AGENT_PORT) || 9003);

agent.start().catch((err) => { console.error("MonitorAgent failed to start:", err); process.exit(1); });

process.on("SIGINT",  async () => { await agent.stop(); process.exit(0); });
process.on("SIGTERM", async () => { await agent.stop(); process.exit(0); });
