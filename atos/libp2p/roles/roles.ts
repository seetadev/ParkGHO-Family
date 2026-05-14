import { AgentIdentity, AgentRole } from "../../ipld/schemas/index";
import { encode, encodeAgentIdentity, cidToString } from "../../ipld/codecs/codec";
import { ATOSNode, publish, subscribe, TOPICS } from "../discovery/node";
import { createLogger } from "../messaging/logger";

const logger = createLogger("roles");

export interface PeerRecord {
  agentCID: string;
  identity: AgentIdentity;
  lastSeen: number;
  online: boolean;
}

export class PeerRegistry {
  private peers = new Map<string, PeerRecord>();

  register(peerId: string, identity: AgentIdentity, agentCID: string) {
    this.peers.set(peerId, { agentCID, identity, lastSeen: Date.now(), online: true });
    logger.info(`Registered peer ${peerId} as ${identity.role}`);
  }

  heartbeat(peerId: string) {
    const r = this.peers.get(peerId);
    if (r) { r.lastSeen = Date.now(); r.online = true; }
  }

  markOffline(peerId: string) {
    const r = this.peers.get(peerId);
    if (r) r.online = false;
  }

  getAgentForRole(role: AgentRole): PeerRecord | undefined {
    return [...this.peers.values()]
      .filter(p => p.online && p.identity.role === role)
      .sort((a, b) => a.identity.peerId.localeCompare(b.identity.peerId))[0];
  }

  pruneStale(timeoutMs = 30_000) {
    const now = Date.now();
    for (const [id, r] of this.peers) {
      if (now - r.lastSeen > timeoutMs) { r.online = false; logger.warn(`Peer ${id} timed out`); }
    }
  }

  getAll() { return [...this.peers.values()]; }
  getOnlineCount() { return [...this.peers.values()].filter(p => p.online).length; }
}

export class RoleManager {
  private registry: PeerRegistry;
  private heartbeatInterval?: ReturnType<typeof setInterval>;

  constructor(private node: ATOSNode, private myIdentity: AgentIdentity, private myAgentCID: string) {
    this.registry = new PeerRegistry();
    this.registry.register(myIdentity.peerId, myIdentity, myAgentCID);
  }

  async start() {
    subscribe(this.node, TOPICS.AGENTS_HEARTBEAT, async (data) => {
      try {
        const { decode } = await import("../../ipld/codecs/codec");
        const hb = decode<{ peerId: string }>(data);
        this.registry.heartbeat(hb.peerId);
      } catch (_) {}
    });

    subscribe(this.node, TOPICS.AGENTS_DISCOVERY, async (data) => {
      try {
        const { decode } = await import("../../ipld/codecs/codec");
        const identity = decode<AgentIdentity>(data);
        if (identity.peerId && identity.role) {
          this.registry.register(identity.peerId, identity, identity.peerId);
        }
      } catch (_) {}
    });

    await this.announceIdentity();
    this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), 10_000);
    setInterval(() => this.registry.pruneStale(), 15_000);
    logger.info(`RoleManager started. Role: ${this.myIdentity.role}`);
  }

  async stop() { if (this.heartbeatInterval) clearInterval(this.heartbeatInterval); }

  private async announceIdentity() {
    const { bytes } = await encodeAgentIdentity(this.myIdentity);
    await publish(this.node, TOPICS.AGENTS_DISCOVERY, bytes);
  }

  private async sendHeartbeat() {
    const { bytes } = await encode({
      type: "heartbeat",
      agentCID: this.myAgentCID,
      peerId: this.myIdentity.peerId,
      timestamp: Date.now(),
    } as unknown as Record<string, unknown>);
    await publish(this.node, TOPICS.AGENTS_HEARTBEAT, bytes);
  }

  getRegistry() { return this.registry; }
}
