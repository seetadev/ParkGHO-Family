import { InvalidParametersError } from '@libp2p/interface';
import { trackedMap } from '@libp2p/utils';
import { DuplicateProtocolHandlerError, UnhandledProtocolError } from "./errors.js";
export const DEFAULT_MAX_INBOUND_STREAMS = 32;
export const DEFAULT_MAX_OUTBOUND_STREAMS = 64;
/**
 * Responsible for notifying registered protocols of events in the network.
 */
export class Registrar {
    log;
    topologies;
    handlers;
    components;
    middleware;
    constructor(components) {
        this.components = components;
        this.log = components.logger.forComponent('libp2p:registrar');
        this.middleware = new Map();
        this.topologies = new Map();
        components.metrics?.registerMetricGroup('libp2p_registrar_topologies', {
            calculate: () => {
                const output = {};
                for (const [key, value] of this.topologies) {
                    output[key] = value.size;
                }
                return output;
            }
        });
        this.handlers = trackedMap({
            name: 'libp2p_registrar_protocol_handlers',
            metrics: components.metrics
        });
        this._onDisconnect = this._onDisconnect.bind(this);
        this._onPeerUpdate = this._onPeerUpdate.bind(this);
        this._onPeerIdentify = this._onPeerIdentify.bind(this);
        this.components.events.addEventListener('peer:disconnect', this._onDisconnect);
        this.components.events.addEventListener('peer:update', this._onPeerUpdate);
        this.components.events.addEventListener('peer:identify', this._onPeerIdentify);
    }
    [Symbol.toStringTag] = '@libp2p/registrar';
    getProtocols() {
        return Array.from(new Set([
            ...this.handlers.keys()
        ])).sort();
    }
    getHandler(protocol) {
        const handler = this.handlers.get(protocol);
        if (handler == null) {
            throw new UnhandledProtocolError(`No handler registered for protocol ${protocol}`);
        }
        return handler;
    }
    getTopologies(protocol) {
        const topologies = this.topologies.get(protocol);
        if (topologies == null) {
            return [];
        }
        return [
            ...topologies.values()
        ];
    }
    /**
     * Registers the `handler` for each protocol
     */
    async handle(protocol, handler, opts) {
        if (this.handlers.has(protocol) && opts?.force !== true) {
            throw new DuplicateProtocolHandlerError(`Handler already registered for protocol ${protocol}`);
        }
        this.handlers.set(protocol, {
            handler,
            options: {
                maxInboundStreams: DEFAULT_MAX_INBOUND_STREAMS,
                maxOutboundStreams: DEFAULT_MAX_OUTBOUND_STREAMS,
                ...opts
            }
        });
        // Add new protocol to self protocols in the peer store
        await this.components.peerStore.merge(this.components.peerId, {
            protocols: [protocol]
        }, opts);
    }
    /**
     * Removes the handler for each protocol. The protocol
     * will no longer be supported on streams.
     */
    async unhandle(protocols, options) {
        const protocolList = Array.isArray(protocols) ? protocols : [protocols];
        protocolList.forEach(protocol => {
            this.handlers.delete(protocol);
        });
        // Update self protocols in the peer store
        await this.components.peerStore.patch(this.components.peerId, {
            protocols: this.getProtocols()
        }, options);
    }
    /**
     * Register handlers for a set of multicodecs given
     */
    async register(protocol, topology) {
        if (topology == null) {
            throw new InvalidParametersError('invalid topology');
        }
        // Create topology
        const id = `${(Math.random() * 1e9).toString(36)}${Date.now()}`;
        let topologies = this.topologies.get(protocol);
        if (topologies == null) {
            topologies = new Map();
            this.topologies.set(protocol, topologies);
        }
        topologies.set(id, topology);
        return id;
    }
    /**
     * Unregister topology
     */
    unregister(id) {
        for (const [protocol, topologies] of this.topologies.entries()) {
            if (topologies.has(id)) {
                topologies.delete(id);
                if (topologies.size === 0) {
                    this.topologies.delete(protocol);
                }
            }
        }
    }
    use(protocol, middleware) {
        this.middleware.set(protocol, middleware);
    }
    unuse(protocol) {
        this.middleware.delete(protocol);
    }
    getMiddleware(protocol) {
        return this.middleware.get(protocol) ?? [];
    }
    /**
     * Remove a disconnected peer from the record
     */
    async _onDisconnect(evt) {
        const remotePeer = evt.detail;
        const options = {
            signal: AbortSignal.timeout(5_000)
        };
        try {
            const peer = await this.components.peerStore.get(remotePeer, options);
            for (const protocol of peer.protocols) {
                const topologies = this.topologies.get(protocol);
                if (topologies == null) {
                    // no topologies are interested in this protocol
                    continue;
                }
                await Promise.all([...topologies.values()].map(async (topology) => {
                    // If the topology has a filter, only call onDisconnect if the peer
                    // was previously added to the filter (which happens on onConnect).
                    // This ensures limited connections that were never notified via
                    // onConnect don't trigger onDisconnect.
                    if (topology.filter != null && topology.filter.has(remotePeer) !== true) {
                        return;
                    }
                    topology.filter?.remove(remotePeer);
                    await topology.onDisconnect?.(remotePeer);
                }));
            }
        }
        catch (err) {
            if (err.name === 'NotFoundError') {
                // peer has not completed identify so they are not in the peer store
                return;
            }
            this.log.error('could not inform topologies of disconnecting peer %p - %e', remotePeer, err);
        }
    }
    /**
     * When a peer is updated, if they have removed supported protocols notify any
     * topologies interested in the removed protocols.
     */
    async _onPeerUpdate(evt) {
        const { peer, previous } = evt.detail;
        const removed = (previous?.protocols ?? []).filter(protocol => !peer.protocols.includes(protocol));
        try {
            for (const protocol of removed) {
                const topologies = this.topologies.get(protocol);
                if (topologies == null) {
                    // no topologies are interested in this protocol
                    continue;
                }
                await Promise.all([...topologies.values()].map(async (topology) => {
                    // If the topology has a filter, only call onDisconnect if the peer
                    // was previously added to the filter (which happens on onConnect).
                    // This ensures limited connections that were never notified via
                    // onConnect don't trigger onDisconnect.
                    if (topology.filter != null && topology.filter.has(peer.id) !== true) {
                        return;
                    }
                    topology.filter?.remove(peer.id);
                    await topology.onDisconnect?.(peer.id);
                }));
            }
        }
        catch (err) {
            this.log.error('could not inform topologies of updated peer %p - %e', peer.id, err);
        }
    }
    /**
     * After identify has completed and we have received the list of supported
     * protocols, notify any topologies interested in those protocols.
     */
    async _onPeerIdentify(evt) {
        const protocols = evt.detail.protocols;
        const connection = evt.detail.connection;
        const peerId = evt.detail.peerId;
        try {
            for (const protocol of protocols) {
                const topologies = this.topologies.get(protocol);
                if (topologies == null) {
                    // no topologies are interested in this protocol
                    continue;
                }
                await Promise.all([...topologies.values()].map(async (topology) => {
                    if (connection.limits != null && topology.notifyOnLimitedConnection !== true) {
                        return;
                    }
                    if (topology.filter?.has(peerId) === true) {
                        return;
                    }
                    topology.filter?.add(peerId);
                    await topology.onConnect?.(peerId, connection);
                }));
            }
        }
        catch (err) {
            this.log.error('could not inform topologies of updated peer after identify %p - %e', peerId, err);
        }
    }
}
//# sourceMappingURL=registrar.js.map