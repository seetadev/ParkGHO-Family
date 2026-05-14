import { PeerMap } from '@libp2p/peer-collections';
import { PriorityQueue } from '@libp2p/utils';
import type { AddressSorter, ComponentLogger, Connection, ConnectionGater, Metrics, PeerId, PeerStore, PeerRouting, IsDialableOptions, OpenConnectionProgressEvents, MultiaddrResolver, DialTarget } from '@libp2p/interface';
import type { OpenConnectionOptions, TransportManager } from '@libp2p/interface-internal';
import type { PriorityQueueJobOptions } from '@libp2p/utils';
import type { DNS } from '@multiformats/dns';
import type { Multiaddr } from '@multiformats/multiaddr';
import type { ProgressOptions } from 'progress-events';
export interface PendingDialTarget {
    resolve(value: any): void;
    reject(err: Error): void;
}
interface DialQueueJobOptions extends PriorityQueueJobOptions, ProgressOptions<OpenConnectionProgressEvents> {
    peerId?: PeerId;
    multiaddrs: Set<string>;
}
interface DialerInit {
    addressSorter?: AddressSorter;
    maxParallelDials?: number;
    maxDialQueueLength?: number;
    maxPeerAddrsToDial?: number;
    dialTimeout?: number;
    addressDialTimeout?: number;
    resolvers?: Record<string, MultiaddrResolver>;
    connections?: PeerMap<Connection[]>;
}
interface DialQueueComponents {
    peerId: PeerId;
    metrics?: Metrics;
    peerStore: PeerStore;
    peerRouting: PeerRouting;
    transportManager: TransportManager;
    connectionGater: ConnectionGater;
    logger: ComponentLogger;
    dns?: DNS;
}
export declare class DialQueue {
    queue: PriorityQueue<Connection, DialQueueJobOptions>;
    private readonly components;
    private readonly addressSorter?;
    private readonly maxPeerAddrsToDial;
    private readonly maxDialQueueLength;
    private readonly dialTimeout;
    private readonly addressDialTimeout;
    private shutDownController;
    private readonly connections;
    private readonly log;
    private readonly resolvers;
    constructor(components: DialQueueComponents, init?: DialerInit);
    start(): void;
    /**
     * Clears any pending dials
     */
    stop(): void;
    /**
     * Connects to a given peer, multiaddr or list of multiaddrs.
     *
     * If a peer is passed, all known multiaddrs will be tried. If a multiaddr or
     * multiaddrs are passed only those will be dialled.
     *
     * Where a list of multiaddrs is passed, if any contain a peer id then all
     * multiaddrs in the list must contain the same peer id.
     *
     * The dial to the first address that is successfully able to upgrade a
     * connection will be used, all other dials will be aborted when that happens.
     */
    dial(peerIdOrMultiaddr: DialTarget, options?: OpenConnectionOptions): Promise<Connection>;
    private dialPeer;
    private calculateMultiaddrs;
    isDialable(multiaddr: Multiaddr | Multiaddr[], options?: IsDialableOptions): Promise<boolean>;
}
export {};
//# sourceMappingURL=dial-queue.d.ts.map