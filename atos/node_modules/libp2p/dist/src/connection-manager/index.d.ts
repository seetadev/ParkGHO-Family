import { PeerMap } from '@libp2p/peer-collections';
import { ConnectionPruner } from './connection-pruner.ts';
import { DialQueue } from './dial-queue.ts';
import { ReconnectQueue } from './reconnect-queue.ts';
import type { PendingDial, AddressSorter, Libp2pEvents, AbortOptions, ComponentLogger, Connection, MultiaddrConnection, ConnectionGater, Metrics, PeerId, PeerStore, Startable, PeerRouting, IsDialableOptions, MultiaddrResolver, Stream, NewStreamOptions, DialTarget } from '@libp2p/interface';
import type { ConnectionManager, OpenConnectionOptions, TransportManager } from '@libp2p/interface-internal';
import type { Multiaddr } from '@multiformats/multiaddr';
import type { TypedEventTarget } from 'main-event';
export declare const DEFAULT_DIAL_PRIORITY = 50;
export interface ConnectionManagerInit {
    /**
     * The maximum number of connections libp2p is willing to have before it
     * starts pruning connections to reduce resource usage.
     *
     * @default 300/100
     */
    maxConnections?: number;
    /**
     * Sort the known addresses of a peer before trying to dial, By default public
     * addresses will be dialled before private (e.g. loopback or LAN) addresses.
     */
    addressSorter?: AddressSorter;
    /**
     * The maximum number of dials across all peers to execute in parallel.
     *
     * @default 100/50
     */
    maxParallelDials?: number;
    /**
     * The maximum size the dial queue is allowed to grow to. Promises returned
     * when dialing peers after this limit is reached will not resolve until the
     * queue size falls beneath this size.
     *
     * @default 500
     */
    maxDialQueueLength?: number;
    /**
     * Maximum number of addresses allowed for a given peer before giving up
     *
     * @default 25
     */
    maxPeerAddrsToDial?: number;
    /**
     * How long a dial attempt is allowed to take, including DNS resolution
     * of the multiaddr, opening a socket and upgrading it to a Connection.
     *
     * @default 10_000
     */
    dialTimeout?: number;
    /**
     * How long a single address dial attempt is allowed to take before the
     * dialer moves on to the next address. This prevents a single slow or
     * unreachable address from consuming the entire `dialTimeout` budget when
     * multiple addresses are available for a peer.
     *
     * @default 6_000
     */
    addressDialTimeout?: number;
    /**
     * How many ms to wait when closing a connection if an abort signal is not
     * passed
     *
     * @default 1_000
     */
    connectionCloseTimeout?: number;
    /**
     * When a new incoming connection is opened, the upgrade process (e.g.
     * protect, encrypt, multiplex etc) must complete within this number of ms.
     *
     * @default 10_000
     */
    inboundUpgradeTimeout?: number;
    /**
     * Outbound protocol negotiation must complete within this number of ms.
     *
     * Does not apply if an abort signal is passed to the `.dial` or
     * `.dialProtocol` method of the `ConnectionManager` or the `openStream`
     * method of the `Connection`.
     *
     * @default 10_000
     */
    outboundStreamProtocolNegotiationTimeout?: number;
    /**
     * Inbound protocol negotiation must complete within this number of ms
     *
     * @default 10_000
     */
    inboundStreamProtocolNegotiationTimeout?: number;
    /**
     * Multiaddr resolvers to use when dialling
     */
    resolvers?: Record<string, MultiaddrResolver>;
    /**
     * A list of multiaddrs that will always be allowed (except if they are in the
     * deny list) to open connections to this node even if we've reached
     * maxConnections
     */
    allow?: string[];
    /**
     * A list of multiaddrs that will never be allowed to open connections to
     * this node under any circumstances
     */
    deny?: string[];
    /**
     * If more than this many connections are opened per second by a single
     * host, reject subsequent connections.
     *
     * @default 5
     */
    inboundConnectionThreshold?: number;
    /**
     * The maximum number of parallel incoming connections allowed that have yet
     * to complete the connection upgrade - e.g. choosing connection encryption,
     * muxer, etc.
     *
     * @default 10
     */
    maxIncomingPendingConnections?: number;
    /**
     * When a peer tagged with `KEEP_ALIVE` disconnects, attempt to redial them
     * this many times.
     *
     * @default 5
     */
    reconnectRetries?: number;
    /**
     * When a peer tagged with `KEEP_ALIVE` disconnects, wait this long between
     * each retry. Note this will be multiplied by `reconnectFactor` to create an
     * increasing retry backoff.
     *
     * @default 1000
     */
    reconnectRetryInterval?: number;
    /**
     * When a peer tagged with `KEEP_ALIVE` disconnects, apply this multiplication
     * factor to the time interval between each retry.
     *
     * @default 2
     */
    reconnectBackoffFactor?: number;
    /**
     * When a peers tagged with `KEEP_ALIVE` disconnect, reconnect to this many at
     * once.
     *
     * @default 5
     */
    maxParallelReconnects?: number;
}
export interface DefaultConnectionManagerComponents {
    peerId: PeerId;
    metrics?: Metrics;
    peerStore: PeerStore;
    peerRouting: PeerRouting;
    transportManager: TransportManager;
    connectionGater: ConnectionGater;
    events: TypedEventTarget<Libp2pEvents>;
    logger: ComponentLogger;
}
/**
 * Responsible for managing known connections.
 */
export declare class DefaultConnectionManager implements ConnectionManager, Startable {
    private started;
    private readonly connections;
    private readonly allow;
    private readonly deny;
    private readonly maxIncomingPendingConnections;
    private incomingPendingConnections;
    private outboundPendingConnections;
    private maxConnections;
    readonly dialQueue: DialQueue;
    readonly reconnectQueue: ReconnectQueue;
    readonly connectionPruner: ConnectionPruner;
    private readonly inboundConnectionRateLimiter;
    private readonly peerStore;
    private readonly metrics?;
    private readonly events;
    private readonly log;
    private readonly peerId;
    constructor(components: DefaultConnectionManagerComponents, init?: ConnectionManagerInit);
    readonly [Symbol.toStringTag] = "@libp2p/connection-manager";
    /**
     * Starts the Connection Manager. If Metrics are not enabled on libp2p
     * only event loop and connection limits will be monitored.
     */
    start(): Promise<void>;
    /**
     * Stops the Connection Manager
     */
    stop(): Promise<void>;
    getMaxConnections(): number;
    setMaxConnections(maxConnections: number): void;
    onConnect(evt: CustomEvent<Connection>): void;
    /**
     * Tracks the incoming connection and check the connection limit
     */
    _onConnect(evt: CustomEvent<Connection>): Promise<void>;
    /**
     * Removes the connection from tracking
     */
    onDisconnect(evt: CustomEvent<Connection>): void;
    getConnections(peerId?: PeerId): Connection[];
    getConnectionsMap(): PeerMap<Connection[]>;
    openConnection(peerIdOrMultiaddr: DialTarget, options?: OpenConnectionOptions): Promise<Connection>;
    openStream(peerIdOrMultiaddr: DialTarget, protocol: string | string[], options?: OpenConnectionOptions & NewStreamOptions): Promise<Stream>;
    closeConnections(peerId: PeerId, options?: AbortOptions): Promise<void>;
    acceptIncomingConnection(maConn: MultiaddrConnection): boolean;
    afterUpgradeInbound(): void;
    getDialQueue(): PendingDial[];
    isDialable(multiaddr: Multiaddr | Multiaddr[], options?: IsDialableOptions): Promise<boolean>;
}
//# sourceMappingURL=index.d.ts.map