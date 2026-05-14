import { PeerMap } from '@libp2p/peer-collections';
import type { Libp2pEvents, ComponentLogger, PeerStore, Connection } from '@libp2p/interface';
import type { ConnectionManager } from '@libp2p/interface-internal';
import type { Multiaddr } from '@multiformats/multiaddr';
import type { TypedEventTarget } from 'main-event';
interface ConnectionPrunerInit {
    allow?: Multiaddr[];
}
interface ConnectionPrunerComponents {
    connectionManager: ConnectionManager;
    peerStore: PeerStore;
    events: TypedEventTarget<Libp2pEvents>;
    logger: ComponentLogger;
}
/**
 * If we go over the max connections limit, choose some connections to close
 */
export declare class ConnectionPruner {
    private readonly connectionManager;
    private readonly peerStore;
    private readonly allow;
    private readonly events;
    private readonly log;
    constructor(components: ConnectionPrunerComponents, init?: ConnectionPrunerInit);
    start(): void;
    stop(): void;
    maybePruneConnections(): void;
    /**
     * If we have more connections than our maximum, select some excess connections
     * to prune based on peer value
     */
    private _maybePruneConnections;
    sortConnections(connections: Connection[], peerValues: PeerMap<number>): Connection[];
}
export {};
//# sourceMappingURL=connection-pruner.d.ts.map