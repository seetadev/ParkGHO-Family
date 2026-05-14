import { connectionSymbol, LimitedConnectionError, ConnectionClosedError, TooManyOutboundProtocolStreamsError, TooManyInboundProtocolStreamsError, StreamCloseEvent } from '@libp2p/interface';
import * as mss from '@libp2p/multistream-select';
import { CODE_P2P } from '@multiformats/multiaddr';
import { setMaxListeners, TypedEventEmitter } from 'main-event';
import { CustomProgressEvent } from 'progress-events';
import { CONNECTION_CLOSE_TIMEOUT, PROTOCOL_NEGOTIATION_TIMEOUT } from "./connection-manager/constants.defaults.js";
import { isDirect } from "./connection-manager/utils.js";
import { MuxerUnavailableError } from "./errors.js";
import { DEFAULT_MAX_INBOUND_STREAMS, DEFAULT_MAX_OUTBOUND_STREAMS } from "./registrar.js";
/**
 * An implementation of the js-libp2p connection.
 * Any libp2p transport should use an upgrader to return this connection.
 */
export class Connection extends TypedEventEmitter {
    id;
    remoteAddr;
    remotePeer;
    direction;
    timeline;
    direct;
    multiplexer;
    encryption;
    limits;
    log;
    maConn;
    muxer;
    components;
    outboundStreamProtocolNegotiationTimeout;
    inboundStreamProtocolNegotiationTimeout;
    closeTimeout;
    constructor(components, init) {
        super();
        this.components = components;
        this.id = init.id;
        this.remoteAddr = init.maConn.remoteAddr;
        this.remotePeer = init.remotePeer;
        this.direction = init.direction ?? 'outbound';
        this.timeline = init.maConn.timeline;
        this.encryption = init.cryptoProtocol;
        this.limits = init.limits;
        this.maConn = init.maConn;
        this.log = init.maConn.log;
        this.outboundStreamProtocolNegotiationTimeout = init.outboundStreamProtocolNegotiationTimeout ?? PROTOCOL_NEGOTIATION_TIMEOUT;
        this.inboundStreamProtocolNegotiationTimeout = init.inboundStreamProtocolNegotiationTimeout ?? PROTOCOL_NEGOTIATION_TIMEOUT;
        this.closeTimeout = init.closeTimeout ?? CONNECTION_CLOSE_TIMEOUT;
        this.direct = isDirect(init.maConn.remoteAddr);
        this.onIncomingStream = this.onIncomingStream.bind(this);
        if (this.remoteAddr.getComponents().find(component => component.code === CODE_P2P) == null) {
            this.remoteAddr = this.remoteAddr.encapsulate(`/p2p/${this.remotePeer}`);
        }
        if (init.muxer != null) {
            this.multiplexer = init.muxer.protocol;
            this.muxer = init.muxer;
            this.muxer.addEventListener('stream', this.onIncomingStream);
        }
        this.maConn.addEventListener('close', (evt) => {
            this.dispatchEvent(new StreamCloseEvent(evt.local, evt.error));
        });
    }
    [Symbol.toStringTag] = 'Connection';
    [connectionSymbol] = true;
    get streams() {
        return this.muxer?.streams ?? [];
    }
    get status() {
        return this.maConn.status;
    }
    /**
     * Create a new stream over this connection
     */
    newStream = async (protocols, options = {}) => {
        if (this.muxer == null) {
            throw new MuxerUnavailableError('Connection is not multiplexed');
        }
        if (this.muxer.status !== 'open') {
            throw new ConnectionClosedError(`The connection muxer is "${this.muxer.status}" and not "open"`);
        }
        if (this.maConn.status !== 'open') {
            throw new ConnectionClosedError(`The connection is "${this.status}" and not "open"`);
        }
        if (this.limits != null && options?.runOnLimitedConnection !== true) {
            throw new LimitedConnectionError('Cannot open protocol stream on limited connection');
        }
        if (!Array.isArray(protocols)) {
            protocols = [protocols];
        }
        options.onProgress?.(new CustomProgressEvent('connection:open-stream', {
            connection: this,
            protocols
        }));
        this.log.trace('starting new stream for protocols %s', protocols);
        const muxedStream = await this.muxer.createStream({
            ...options,
            // most underlying transports only support negotiating a single protocol
            // so only pass the early protocol if a single protocol has been requested
            // otherwise fall back to mss
            protocol: protocols.length === 1 ? protocols[0] : undefined
        });
        this.log.trace('started new stream %s for protocols %s', muxedStream.id, protocols);
        try {
            if (options.signal == null) {
                muxedStream.log('no abort signal was passed while trying to negotiate protocols %s falling back to default timeout', protocols);
                const signal = AbortSignal.timeout(this.outboundStreamProtocolNegotiationTimeout);
                setMaxListeners(Infinity, signal);
                options = {
                    ...options,
                    signal
                };
            }
            if (muxedStream.protocol === '') {
                muxedStream.log.trace('selecting protocol from protocols %s', protocols);
                muxedStream.protocol = await mss.select(muxedStream, protocols, options);
                muxedStream.log('negotiated protocol %s', muxedStream.protocol);
            }
            else {
                muxedStream.log('pre-negotiated protocol %s', muxedStream.protocol);
            }
            const outgoingLimit = findOutgoingStreamLimit(muxedStream.protocol, this.components.registrar, options);
            const streamCount = countStreams(muxedStream.protocol, 'outbound', this);
            if (streamCount > outgoingLimit) {
                const err = new TooManyOutboundProtocolStreamsError(`Too many outbound protocol streams for protocol "${muxedStream.protocol}" - ${streamCount}/${outgoingLimit}`);
                muxedStream.abort(err);
                throw err;
            }
            // If a protocol stream has been successfully negotiated and is to be passed to the application,
            // the peer store should ensure that the peer is registered with that protocol
            await this.components.peerStore.merge(this.remotePeer, {
                protocols: [muxedStream.protocol]
            });
            this.components.metrics?.trackProtocolStream(muxedStream);
            const middleware = this.components.registrar.getMiddleware(muxedStream.protocol);
            const stream = await this.runMiddlewareChain(muxedStream, this, middleware);
            options.onProgress?.(new CustomProgressEvent('connection:opened-stream', {
                connection: this,
                stream
            }));
            return stream;
        }
        catch (err) {
            if (muxedStream.status === 'open') {
                muxedStream.abort(err);
            }
            else {
                this.log.error('could not create new outbound stream on connection %s %a for protocols %s - %e', this.direction === 'inbound' ? 'from' : 'to', this.remoteAddr, protocols, err);
            }
            throw err;
        }
    };
    async onIncomingStream(evt) {
        const muxedStream = evt.detail;
        const signal = AbortSignal.timeout(this.inboundStreamProtocolNegotiationTimeout);
        setMaxListeners(Infinity, signal);
        muxedStream.log('start protocol negotiation, timing out after %dms', this.inboundStreamProtocolNegotiationTimeout);
        try {
            if (muxedStream.protocol === '') {
                const protocols = this.components.registrar.getProtocols();
                muxedStream.log.trace('selecting protocol from protocols %s', protocols);
                muxedStream.protocol = await mss.handle(muxedStream, protocols, {
                    signal
                });
                muxedStream.log('negotiated protocol %s', muxedStream.protocol);
            }
            else {
                muxedStream.log('pre-negotiated protocol %s', muxedStream.protocol);
            }
            const incomingLimit = findIncomingStreamLimit(muxedStream.protocol, this.components.registrar);
            const streamCount = countStreams(muxedStream.protocol, 'inbound', this);
            if (streamCount > incomingLimit) {
                throw new TooManyInboundProtocolStreamsError(`Too many inbound protocol streams for protocol "${muxedStream.protocol}" - limit ${incomingLimit}`);
            }
            // If a protocol stream has been successfully negotiated and is to be passed to the application,
            // the peer store should ensure that the peer is registered with that protocol
            await this.components.peerStore.merge(this.remotePeer, {
                protocols: [muxedStream.protocol]
            }, {
                signal
            });
            this.components.metrics?.trackProtocolStream(muxedStream);
            const { handler, options } = this.components.registrar.getHandler(muxedStream.protocol);
            if (this.limits != null && options.runOnLimitedConnection !== true) {
                throw new LimitedConnectionError('Cannot open protocol stream on limited connection');
            }
            const middleware = this.components.registrar.getMiddleware(muxedStream.protocol);
            middleware.push(async (stream, connection, next) => {
                await handler(stream, connection);
                next(stream, connection);
            });
            await this.runMiddlewareChain(muxedStream, this, middleware);
        }
        catch (err) {
            muxedStream.abort(err);
        }
    }
    async runMiddlewareChain(stream, connection, middleware) {
        for (let i = 0; i < middleware.length; i++) {
            const mw = middleware[i];
            stream.log.trace('running middleware', i, mw);
            // eslint-disable-next-line no-loop-func
            await new Promise((resolve, reject) => {
                try {
                    const result = mw(stream, connection, (s, c) => {
                        stream = s;
                        connection = c;
                        resolve();
                    });
                    if (result instanceof Promise) {
                        result.catch(reject);
                    }
                }
                catch (err) {
                    reject(err);
                }
            });
            stream.log.trace('ran middleware', i, mw);
        }
        return stream;
    }
    /**
     * Close the connection
     */
    async close(options = {}) {
        this.log('closing connection to %a', this.remoteAddr);
        if (options.signal == null) {
            const signal = AbortSignal.timeout(this.closeTimeout);
            setMaxListeners(Infinity, signal);
            options = {
                ...options,
                signal
            };
        }
        await this.muxer?.close(options);
        await this.maConn.close(options);
    }
    abort(err) {
        this.muxer?.abort(err);
        this.maConn.abort(err);
    }
}
export function createConnection(components, init) {
    return new Connection(components, init);
}
function findIncomingStreamLimit(protocol, registrar) {
    try {
        const { options } = registrar.getHandler(protocol);
        if (options.maxInboundStreams != null) {
            return options.maxInboundStreams;
        }
    }
    catch (err) {
        if (err.name !== 'UnhandledProtocolError') {
            throw err;
        }
    }
    return DEFAULT_MAX_INBOUND_STREAMS;
}
function findOutgoingStreamLimit(protocol, registrar, options = {}) {
    try {
        const { options } = registrar.getHandler(protocol);
        if (options.maxOutboundStreams != null) {
            return options.maxOutboundStreams;
        }
    }
    catch (err) {
        if (err.name !== 'UnhandledProtocolError') {
            throw err;
        }
    }
    return options.maxOutboundStreams ?? DEFAULT_MAX_OUTBOUND_STREAMS;
}
function countStreams(protocol, direction, connection) {
    let streamCount = 0;
    connection.streams.forEach(stream => {
        if (stream.direction === direction && stream.protocol === protocol) {
            streamCount++;
        }
    });
    return streamCount;
}
//# sourceMappingURL=connection.js.map