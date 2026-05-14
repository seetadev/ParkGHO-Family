export interface AgentIdentity {
  peerId: string;
  role: AgentRole;
  publicKey: string;
  capabilities: string[];
  createdAt: number;
  version: string;
  metadataCID?: string;
}

export interface TaskNode {
  taskId: string;
  taskType: TaskType;
  status: TaskStatus;
  assignedAgentCID: string;
  inputCID: string;
  outputCID?: string;
  dependencyCIDs: string[];
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  retryCount: number;
  maxRetries: number;
}

export interface ExecutionLog {
  logId: string;
  taskCID: string;
  agentCID: string;
  previousLogCID?: string;
  event: LogEvent;
  message: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface AgentMessage {
  messageId: string;
  fromAgentCID: string;
  toAgentCID?: string;
  topic: MessageTopic;
  payloadCID: string;
  signature: string;
  timestamp: number;
}

export type AgentRole = "deployer" | "liquidity_manager" | "monitor" | "governance" | "analytics";
export type TaskType = "deploy_contract" | "provision_liquidity" | "remove_liquidity" | "swap_tokens" | "monitor_contract" | "cast_vote" | "create_proposal" | "generate_report" | "pin_to_ipfs" | "verify_contract";
export type TaskStatus = "pending" | "assigned" | "running" | "completed" | "failed" | "retrying";
export type LogEvent = "task_created" | "task_assigned" | "task_started" | "task_completed" | "task_failed" | "task_retrying" | "agent_joined" | "agent_left" | "heartbeat";
export type MessageTopic = "atos/tasks/new" | "atos/tasks/update" | "atos/agents/discovery" | "atos/agents/heartbeat" | "atos/governance/proposal" | "atos/governance/vote" | "atos/monitoring/alert";

export const ROLE_CAPABILITIES: Record<AgentRole, TaskType[]> = {
  deployer:          ["deploy_contract", "verify_contract", "pin_to_ipfs"],
  liquidity_manager: ["provision_liquidity", "remove_liquidity", "swap_tokens"],
  monitor:           ["monitor_contract"],
  governance:        ["cast_vote", "create_proposal"],
  analytics:         ["generate_report"],
};
