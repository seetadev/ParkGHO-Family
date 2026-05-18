import "dotenv/config";
import { AnalyticsAgent } from "./AnalyticsAgent";

const agent = new AnalyticsAgent(Number(process.env.AGENT_PORT) || 9005);

agent.start().catch((err) => { console.error("AnalyticsAgent failed to start:", err); process.exit(1); });

process.on("SIGINT",  async () => { await agent.stop(); process.exit(0); });
process.on("SIGTERM", async () => { await agent.stop(); process.exit(0); });
