import { TypedEventEmitter } from 'main-event';
import type { Components } from './components.ts';
import type { Libp2p as Libp2pInterface, Libp2pInit } from './index.ts';
import type { PeerRouting, ContentRouting, Libp2pEvents, PendingDial, ServiceMap, AbortOptions, ComponentLogger, Connection, Stream, Metrics, PeerId, PeerStore, Topology, Libp2pStatus, IsDialableOptions, DialOptions, PublicKey, Ed25519PeerId, Secp256k1PeerId, RSAPublicKey, RSAPeerId, URLPeerId, Ed25519PublicKey, Secp256k1PublicKey, StreamHandler, StreamHandlerOptions, StreamMiddleware, DialTarget, DialProtocolOptions } from '@libp2p/interface';
import type { Multiaddr } from '@multiformats/multiaddr';
export declare class Libp2p<T extends ServiceMap = ServiceMap> extends TypedEventEmitter<Libp2pEvents> implements Libp2pInterface<T> {
    #private;
    peerId: PeerId;
    peerStore: PeerStore;
    contentRouting: ContentRouting;
    peerRouting: PeerRouting;
    metrics?: Metrics;
    services: T;
    logger: ComponentLogger;
    status: Libp2pStatus;
    components: Components & T;
    private readonly log;
    constructor(init: Libp2pInit<T> & {
        peerId: PeerId;
    });
    private configureComponent;
    /**
     * Starts the libp2p node and all its subsystems
     */
    start(): Promise<void>;
    /**
     * Stop the libp2p node by closing its listeners and open connections
     */
    stop(): Promise<void>;
    getConnections(peerId?: PeerId): Connection[];
    getDialQueue(): PendingDial[];
    getPeers(): PeerId[];
    dial(peer: DialTarget, options?: DialOptions): Promise<Connection>;
    dialProtocol(peer: DialTarget, protocols: string | string[], options?: DialProtocolOptions): Promise<Stream>;
    getMultiaddrs(): Multiaddr[];
    getProtocols(): string[];
    hangUp(peer: PeerId | Multiaddr, options?: AbortOptions): Promise<void>;
    /**
     * Get the public key for the given peer id
     */
    getPublicKey(peer: Ed25519PeerId, options?: AbortOptions): Promise<Ed25519PublicKey>;
    getPublicKey(peer: Secp256k1PeerId, options?: AbortOptions): Promise<Secp256k1PublicKey>;
    getPublicKey(peer: RSAPeerId, options?: AbortOptions): Promise<RSAPublicKey>;
    getPublicKey(peer: URLPeerId, options?: AbortOptions): Promise<never>;
    getPublicKey(peer: PeerId, options?: AbortOptions): Promise<PublicKey>;
    handle(protocols: string | string[], handler: StreamHandler, options?: StreamHandlerOptions): Promise<void>;
    unhandle(protocols: string[] | string, options?: AbortOptions): Promise<void>;
    register(protocol: string, topology: Topology, options?: AbortOptions): Promise<string>;
    unregister(id: string): void;
    use(protocol: string, middleware: StreamMiddleware | StreamMiddleware[]): void;
    unuse(protocol: string): void;
    isDialable(multiaddr: Multiaddr, options?: IsDialableOptions): Promise<boolean>;
}
//# sourceMappingURL=libp2p.d.ts.map