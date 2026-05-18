import { BaseAgent } from "../shared/BaseAgent";
import { TaskNode, TaskType } from "../../ipld/schemas/index";
import { encode, decode, cidToString } from "../../ipld/codecs/codec";
import { subscribe, TOPICS } from "../../libp2p/discovery/node";

export class AnalyticsAgent extends BaseAgent {
  private taskLogs: unknown[] = [];

  constructor(port = 9005) {
    super({ role: "analytics", port, bootstrapPeers: process.env.BOOTSTRAP_PEERS ? [process.env.BOOTSTRAP_PEERS] : [] });
  }

  protected getCapabilities(): TaskType[] { return ["generate_report"]; }

  protected async onStart() {
    subscribe(this.node, TOPICS.TASKS_UPDATE, async (data) => {
      try {
        const task = decode<TaskNode>(data);
        this.taskLogs.push({
          taskId: task.taskId,
          type: task.taskType,
          status: task.status,
          agent: task.assignedAgentCID,
          at: Date.now(),
        });
      } catch (_) {}
    });
    this.logger.info("AnalyticsAgent collecting task events");
  }

  protected async executeTask(_task: TaskNode): Promise<string> {
    const statusCounts: Record<string, number> = {};
    const typeCounts:   Record<string, number> = {};
    for (const l of this.taskLogs as any[]) {
      statusCounts[l.status] = (statusCounts[l.status] ?? 0) + 1;
      typeCounts[l.type]     = (typeCounts[l.type]     ?? 0) + 1;
    }
    const report = {
      reportId: crypto.randomUUID(),
      generatedBy: this.agentCID,
      generatedAt: Date.now(),
      totalTasksObserved: this.taskLogs.length,
      tasksByStatus: statusCounts,
      tasksByType: typeCounts,
      blockStoreSize: this.blockStore.size(),
      connectedPeers: this.node.getPeers().length,
    };
    const { cid, bytes } = await encode(report as unknown as Record<string, unknown>);
    await this.blockStore.put(cid, bytes);
    this.logger.info(`Analytics report generated. CID: ${cidToString(cid)}`);
    return cidToString(cid);
  }
}
