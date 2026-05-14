import type { IdentifyResult, Libp2pEvents, PeerUpdate, PeerId, PeerStore, Topology, StreamHandler, StreamHandlerRecord, StreamHandlerOptions, AbortOptions, Metrics, StreamMiddleware } from '@libp2p/interface';
import type { Registrar as RegistrarInterface } from '@libp2p/interface-internal';
import type { ComponentLogger } from '@libp2p/logger';
import type { TypedEventTarget } from 'main-event';
export declare const DEFAULT_MAX_INBOUND_STREAMS = 32;
export declare const DEFAULT_MAX_OUTBOUND_STREAMS = 64;
export interface RegistrarComponents {
    peerId: PeerId;
    peerStore: PeerStore;
    events: TypedEventTarget<Libp2pEvents>;
    logger: ComponentLogger;
    metrics?: Metrics;
}
/**
 * Responsible for notifying registered protocols of events in the network.
 */
export declare class Registrar implements RegistrarInterface {
    private readonly log;
    private readonly topologies;
    private readonly handlers;
    private readonly components;
    private readonly middleware;
    constructor(components: RegistrarComponents);
    readonly [Symbol.toStringTag] = "@libp2p/registrar";
    getProtocols(): string[];
    getHandler(protocol: string): StreamHandlerRecord;
    getTopologies(protocol: string): Topology[];
    /**
     * Registers the `handler` for each protocol
     */
    handle(protocol: string, handler: StreamHandler, opts?: StreamHandlerOptions): Promise<void>;
    /**
     * Removes the handler for each protocol. The protocol
     * will no longer be supported on streams.
     */
    unhandle(protocols: string | string[], options?: AbortOptions): Promise<void>;
    /**
     * Register handlers for a set of multicodecs given
     */
    register(protocol: string, topology: Topology): Promise<string>;
    /**
     * Unregister topology
     */
    unregister(id: string): void;
    use(protocol: string, middleware: StreamMiddleware[]): void;
    unuse(protocol: string): void;
    getMiddleware(protocol: string): StreamMiddleware[];
    /**
     * Remove a disconnected peer from the record
     */
    _onDisconnect(evt: CustomEvent<PeerId>): Promise<void>;
    /**
     * When a peer is updated, if they have removed supported protocols notify any
     * topologies interested in the removed protocols.
     */
    _onPeerUpdate(evt: CustomEvent<PeerUpdate>): Promise<void>;
    /**
     * After identify has completed and we have received the list of supported
     * protocols, notify any topologies interested in those protocols.
     */
    _onPeerIdentify(evt: CustomEvent<IdentifyResult>): Promise<void>;
}
//# sourceMappingURL=registrar.d.ts.map