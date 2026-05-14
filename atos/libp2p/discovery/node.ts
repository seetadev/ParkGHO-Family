import { createLibp2p, Libp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { noise } from "@libp2p/noise";
import { yamux } from "@libp2p/yamux";
import { kadDHT } from "@libp2p/kad-dht";
import { mdns } from "@libp2p/mdns";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { identify } from "@libp2p/identify";
import { bootstrap } from "@libp2p/bootstrap";

export type ATOSNode = Libp2p;

export const TOPICS = {
  TASKS_NEW:           "atos/tasks/new",
  TASKS_UPDATE:        "atos/tasks/update",
  AGENTS_DISCOVERY:    "atos/agents/discovery",
  AGENTS_HEARTBEAT:    "atos/agents/heartbeat",
  GOVERNANCE_PROPOSAL: "atos/governance/proposal",
  GOVERNANCE_VOTE:     "atos/governance/vote",
  MONITORING_ALERT:    "atos/monitoring/alert",
};

export async function createATOSNode(config: {
  port: number;
  bootstrapPeers?: string[];
  enableMDNS?: boolean;
  enableDHT?: boolean;
}): Promise<ATOSNode> {
  const { port, bootstrapPeers = [], enableMDNS = true, enableDHT = true } = config;
  const peerDiscovery: any[] = [];
  if (enableMDNS) peerDiscovery.push(mdns());
  if (bootstrapPeers.length > 0) peerDiscovery.push(bootstrap({ list: bootstrapPeers }));

  const node = await createLibp2p({
    addresses: { listen: [`/ip4/0.0.0.0/tcp/${port}`] },
    transports: [tcp()],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    peerDiscovery,
    services: {
      identify: identify(),
      ...(enableDHT ? { dht: kadDHT({ clientMode: false }) } : {}),
      pubsub: gossipsub({ allowPublishToZeroPeers: true, emitSelf: false }),
    },
  });

  await node.start();
  return node;
}

export function subscribe(node: ATOSNode, topic: string, handler: (data: Uint8Array, from: string) => void) {
  (node.services.pubsub as any).subscribe(topic);
  (node.services.pubsub as any).addEventListener("message", (evt: any) => {
    if (evt.detail.topic === topic) handler(evt.detail.data, evt.detail.from?.toString() ?? "");
  });
}

export async function publish(node: ATOSNode, topic: string, data: Uint8Array) {
  await (node.services.pubsub as any).publish(topic, data);
}

export function getConnectedPeers(node: ATOSNode): string[] {
  return node.getPeers().map(p => p.toString());
}
