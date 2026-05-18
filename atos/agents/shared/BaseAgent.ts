import { v4 as uuidv4 } from "uuid";
import { ATOSNode, createATOSNode, subscribe, publish, TOPICS } from "../../libp2p/discovery/node";
import { RoleManager } from "../../libp2p/roles/roles";
import { createLogger } from "../../libp2p/messaging/logger";
import { AgentIdentity, AgentRole, TaskNode, ExecutionLog, LogEvent, TaskType } from "../../ipld/schemas/index";
import { encodeAgentIdentity, encodeTaskNode, encodeExecutionLog, decode, cidToString, MemoryBlockStore } from "../../ipld/codecs/codec";

export abstract class BaseAgent {
  protected node!: ATOSNode;
  protected roleManager!: RoleManager;
  protected identity!: AgentIdentity;
  protected agentCID!: string;
  protected blockStore = new MemoryBlockStore();
  protected logger = createLogger(this.constructor.name);
  private retryQueue = new Map<string, number>();
  private readonly MAX_RETRIES = 3;
  private lastLogCID: string | undefined;

  constructor(protected config: { role: AgentRole; port: number; bootstrapPeers?: string[]; version?: string }) {}

  async start() {
    this.node = await createATOSNode({ port: this.config.port, bootstrapPeers: this.config.bootstrapPeers });
    const peerId = this.node.peerId.toString();
    this.identity = {
      peerId,
      role: this.config.role,
      publicKey: peerId,
      capabilities: this.getCapabilities(),
      createdAt: Date.now(),
      version: this.config.version ?? "1.0.0",
    };
    const { cid, bytes } = await encodeAgentIdentity(this.identity);
    this.agentCID = cidToString(cid);
    await this.blockStore.put(cid, bytes);
    this.roleManager = new RoleManager(this.node, this.identity, this.agentCID);
    await this.roleManager.start();
    subscribe(this.node, TOPICS.TASKS_NEW, async (data) => { await this.handleIncomingTask(data); });
    await this.onStart();
    this.logger.info(`${this.config.role} agent started. PeerID: ${peerId}, CID: ${this.agentCID}`);
  }

  async stop() {
    await this.roleManager.stop();
    await this.node.stop();
  }

  private async handleIncomingTask(data: Uint8Array) {
    let task: TaskNode;
    try { task = decode<TaskNode>(data); } catch { return; }
    if (!this.identity.capabilities.includes(task.taskType)) return;
    if (task.status !== "pending") return;
    task.status = "assigned";
    task.assignedAgentCID = this.agentCID;
    task.startedAt = Date.now();
    await this.broadcastTaskUpdate(task);
    await this.executeWithRetry(task);
  }

  private async executeWithRetry(task: TaskNode) {
    const retries = this.retryQueue.get(task.taskId) ?? 0;
    try {
      task.status = "running";
      await this.writeLog(task, "task_started", `Starting ${task.taskType}`);
      await this.broadcastTaskUpdate(task);
      const resultCID = await this.executeTask(task);
      task.status = "completed"; task.outputCID = resultCID; task.completedAt = Date.now();
      this.retryQueue.delete(task.taskId);
      await this.writeLog(task, "task_completed", `Done. Result: ${resultCID}`);
      await this.broadcastTaskUpdate(task);
    } catch (err: any) {
      if (retries < this.MAX_RETRIES) {
        const backoff = Math.pow(2, retries) * 1000;
        this.retryQueue.set(task.taskId, retries + 1);
        task.status = "retrying"; task.retryCount = retries + 1;
        await this.writeLog(task, "task_retrying", `Retry ${retries + 1}/${this.MAX_RETRIES} in ${backoff}ms`);
        await this.broadcastTaskUpdate(task);
        await new Promise(r => setTimeout(r, backoff));
        await this.executeWithRetry(task);
      } else {
        task.status = "failed";
        this.retryQueue.delete(task.taskId);
        await this.writeLog(task, "task_failed", `Failed after ${this.MAX_RETRIES} retries: ${err.message}`);
        await this.broadcastTaskUpdate(task);
        // Re-broadcast as pending so another agent can pick it up
        task.status = "pending"; task.assignedAgentCID = ""; task.retryCount = 0;
        await this.broadcastNewTask(task);
        this.logger.error(`Task ${task.taskId} permanently failed, re-broadcast for reassignment`);
      }
    }
  }

  protected async writeLog(task: TaskNode, event: LogEvent, message: string, data?: Record<string, unknown>): Promise<string> {
    const log: ExecutionLog = {
      logId: uuidv4(),
      taskCID: task.taskId,
      agentCID: this.agentCID,
      previousLogCID: this.lastLogCID,
      event,
      message,
      data,
      timestamp: Date.now(),
    };
    const { cid, bytes } = await encodeExecutionLog(log);
    const s = cidToString(cid);
    await this.blockStore.put(cid, bytes);
    this.lastLogCID = s;
    return s;
  }

  protected async broadcastTaskUpdate(task: TaskNode) {
    const { bytes } = await encodeTaskNode(task);
    await publish(this.node, TOPICS.TASKS_UPDATE, bytes);
  }

  protected async broadcastNewTask(task: TaskNode) {
    const { bytes } = await encodeTaskNode(task);
    await publish(this.node, TOPICS.TASKS_NEW, bytes);
  }

  getAgentCID() { return this.agentCID; }
  getPeerId()   { return this.node?.peerId.toString() ?? "not started"; }

  protected abstract getCapabilities(): TaskType[];
  protected abstract executeTask(task: TaskNode): Promise<string>;
  protected abstract onStart(): Promise<void>;
}
