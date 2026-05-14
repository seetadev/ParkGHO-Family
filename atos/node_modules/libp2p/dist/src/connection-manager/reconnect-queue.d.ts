import type { ComponentLogger, Libp2pEvents, Metrics, PeerStore, Startable } from '@libp2p/interface';
import type { ConnectionManager } from '@libp2p/interface-internal';
import type { TypedEventTarget } from 'main-event';
export interface ReconnectQueueComponents {
    connectionManager: ConnectionManager;
    events: TypedEventTarget<Libp2pEvents>;
    peerStore: PeerStore;
    logger: ComponentLogger;
    metrics?: Metrics;
}
export interface ReconnectQueueInit {
    retries?: number;
    retryInterval?: number;
    backoffFactor?: number;
    maxParallelReconnects?: number;
}
/**
 * When peers tagged with `KEEP_ALIVE` disconnect, this component attempts to
 * redial them
 */
export declare class ReconnectQueue implements Startable {
    private readonly log;
    private readonly queue;
    private started;
    private readonly peerStore;
    private readonly retries;
    private readonly retryInterval?;
    private readonly backoffFactor?;
    private readonly connectionManager;
    private readonly events;
    constructor(components: ReconnectQueueComponents, init?: ReconnectQueueInit);
    private maybeReconnect;
    start(): void;
    afterStart(): Promise<void>;
    stop(): void;
}
//# sourceMappingURL=reconnect-queue.d.ts.map