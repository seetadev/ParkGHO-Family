import type { Libp2pEvents, AbortOptions, ComponentLogger, MultiaddrConnection, Connection, ConnectionProtector, ConnectionEncrypter, ConnectionGater, Metrics, PeerId, PeerStore, StreamMuxerFactory, Upgrader as UpgraderInterface, UpgraderOptions, ConnectionLimits, ClearableSignal, MessageStream, SecuredConnection, StreamMuxer, UpgraderWithoutEncryptionOptions, SecureConnectionOptions } from '@libp2p/interface';
import type { ConnectionManager, Registrar } from '@libp2p/interface-internal';
import type { TypedEventTarget } from 'main-event';
interface CreateConnectionOptions {
    id: string;
    cryptoProtocol: string;
    direction: 'inbound' | 'outbound';
    /**
     * The raw underlying connection
     */
    maConn: MultiaddrConnection;
    /**
     * The encrypted, multiplexed connection
     */
    stream: MessageStream;
    remotePeer: PeerId;
    muxer?: StreamMuxer;
    limits?: ConnectionLimits;
    closeTimeout?: number;
}
export interface UpgraderInit {
    connectionEncrypters: ConnectionEncrypter[];
    streamMuxers: StreamMuxerFactory[];
    /**
     * An amount of ms by which an inbound connection upgrade must complete
     *
     * @default 3000
     */
    inboundUpgradeTimeout?: number;
    /**
     * When a new incoming stream is opened on a multiplexed connection, protocol
     * negotiation on that stream must complete within this many ms
     *
     * @default 2000
     */
    inboundStreamProtocolNegotiationTimeout?: number;
    /**
     * When a new incoming stream is opened on a multiplexed connection, protocol
     * negotiation on that stream must complete within this many ms
     *
     * @default 2000
     */
    outboundStreamProtocolNegotiationTimeout?: number;
    /**
     * How long to wait before closing a connection
     *
     * @default 1_000
     */
    connectionCloseTimeout?: number;
}
export interface UpgraderComponents {
    peerId: PeerId;
    metrics?: Metrics;
    connectionManager: ConnectionManager;
    connectionGater: ConnectionGater;
    connectionProtector?: ConnectionProtector;
    registrar: Registrar;
    peerStore: PeerStore;
    events: TypedEventTarget<Libp2pEvents>;
    logger: ComponentLogger;
}
interface EncryptedConnection extends SecuredConnection {
    protocol: string;
}
type ConnectionDeniedType = keyof Pick<ConnectionGater, 'denyOutboundConnection' | 'denyInboundEncryptedConnection' | 'denyOutboundEncryptedConnection' | 'denyInboundUpgradedConnection' | 'denyOutboundUpgradedConnection'>;
export declare class Upgrader implements UpgraderInterface {
    private readonly components;
    private readonly connectionEncrypters;
    private readonly streamMuxers;
    private readonly inboundUpgradeTimeout;
    private readonly inboundStreamProtocolNegotiationTimeout;
    private readonly outboundStreamProtocolNegotiationTimeout;
    private readonly events;
    private readonly metrics;
    private readonly connectionCloseTimeout?;
    constructor(components: UpgraderComponents, init: UpgraderInit);
    readonly [Symbol.toStringTag] = "@libp2p/upgrader";
    shouldBlockConnection(connectionType: 'denyInboundConnection', maConn: MultiaddrConnection): Promise<void>;
    shouldBlockConnection(connectionType: ConnectionDeniedType, remotePeer: PeerId, maConn: MultiaddrConnection): Promise<void>;
    createInboundAbortSignal(signal: AbortSignal): ClearableSignal;
    /**
     * Upgrades an inbound connection
     */
    upgradeInbound(maConn: MultiaddrConnection, opts: UpgraderOptions): Promise<void>;
    upgradeInbound(maConn: MultiaddrConnection, opts: UpgraderWithoutEncryptionOptions): Promise<void>;
    /**
     * Upgrades an outbound connection
     */
    upgradeOutbound(maConn: MultiaddrConnection, opts: UpgraderOptions): Promise<Connection>;
    upgradeOutbound(maConn: MultiaddrConnection, opts: UpgraderWithoutEncryptionOptions): Promise<Connection>;
    private _performUpgrade;
    /**
     * A convenience method for generating a new `Connection`
     */
    _createConnection(opts: CreateConnectionOptions): Connection;
    /**
     * Attempts to encrypt the incoming `connection` with the provided `cryptos`
     */
    _encryptInbound(connection: MessageStream, options?: SecureConnectionOptions): Promise<EncryptedConnection>;
    /**
     * Attempts to encrypt the given `connection` with the provided connection encrypters.
     * The first `ConnectionEncrypter` module to succeed will be used
     */
    _encryptOutbound(connection: MessageStream, options?: SecureConnectionOptions): Promise<EncryptedConnection>;
    /**
     * Selects one of the given muxers via multistream-select. That
     * muxer will be used for all future streams on the connection.
     */
    _multiplexOutbound(maConn: MessageStream, muxers: Map<string, StreamMuxerFactory>, options: AbortOptions): Promise<StreamMuxerFactory>;
    /**
     * Registers support for one of the given muxers via multistream-select. The
     * selected muxer will be used for all future streams on the connection.
     */
    _multiplexInbound(maConn: MessageStream, muxers: Map<string, StreamMuxerFactory>, options: AbortOptions): Promise<StreamMuxerFactory>;
    getConnectionEncrypters(): Map<string, ConnectionEncrypter<unknown>>;
    getStreamMuxers(): Map<string, StreamMuxerFactory>;
}
export {};
//# sourceMappingURL=upgrader.d.ts.map