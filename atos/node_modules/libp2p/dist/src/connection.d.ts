import { connectionSymbol } from '@libp2p/interface';
import { TypedEventEmitter } from 'main-event';
import type { AbortOptions, Logger, MessageStreamDirection, Connection as ConnectionInterface, Stream, NewStreamOptions, PeerId, ConnectionLimits, StreamMuxer, Metrics, PeerStore, MultiaddrConnection, MessageStreamEvents, MultiaddrConnectionTimeline, ConnectionStatus, MessageStream } from '@libp2p/interface';
import type { Registrar } from '@libp2p/interface-internal';
import type { Multiaddr } from '@multiformats/multiaddr';
export interface ConnectionComponents {
    peerStore: PeerStore;
    registrar: Registrar;
    metrics?: Metrics;
}
export interface ConnectionInit {
    id: string;
    maConn: MultiaddrConnection;
    stream: MessageStream;
    remotePeer: PeerId;
    direction?: MessageStreamDirection;
    muxer?: StreamMuxer;
    cryptoProtocol?: string;
    limits?: ConnectionLimits;
    outboundStreamProtocolNegotiationTimeout?: number;
    inboundStreamProtocolNegotiationTimeout?: number;
    closeTimeout?: number;
}
/**
 * An implementation of the js-libp2p connection.
 * Any libp2p transport should use an upgrader to return this connection.
 */
export declare class Connection extends TypedEventEmitter<MessageStreamEvents> implements ConnectionInterface {
    readonly id: string;
    readonly remoteAddr: Multiaddr;
    readonly remotePeer: PeerId;
    direction: MessageStreamDirection;
    timeline: MultiaddrConnectionTimeline;
    direct: boolean;
    multiplexer?: string;
    encryption?: string;
    limits?: ConnectionLimits;
    readonly log: Logger;
    private readonly maConn;
    private readonly muxer?;
    private readonly components;
    private readonly outboundStreamProtocolNegotiationTimeout;
    private readonly inboundStreamProtocolNegotiationTimeout;
    private readonly closeTimeout;
    constructor(components: ConnectionComponents, init: ConnectionInit);
    readonly [Symbol.toStringTag] = "Connection";
    readonly [connectionSymbol] = true;
    get streams(): Stream[];
    get status(): ConnectionStatus;
    /**
     * Create a new stream over this connection
     */
    newStream: (protocols: string[], options?: NewStreamOptions) => Promise<Stream>;
    private onIncomingStream;
    private runMiddlewareChain;
    /**
     * Close the connection
     */
    close(options?: AbortOptions): Promise<void>;
    abort(err: Error): void;
}
export declare function createConnection(components: ConnectionComponents, init: ConnectionInit): ConnectionInterface;
//# sourceMappingURL=connection.d.ts.map