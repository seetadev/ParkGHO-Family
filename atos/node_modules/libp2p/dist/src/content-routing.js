import { NotStartedError } from '@libp2p/interface';
import { PeerSet } from '@libp2p/peer-collections';
import merge from 'it-merge';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import { NoContentRoutersError } from "./errors.js";
export class CompoundContentRouting {
    routers;
    started;
    components;
    constructor(components, init) {
        this.routers = init.routers ?? [];
        this.started = false;
        this.components = components;
        this.findProviders = components.metrics?.traceFunction('libp2p.contentRouting.findProviders', this.findProviders.bind(this), {
            optionsIndex: 1,
            getAttributesFromArgs: ([cid], attrs) => {
                return {
                    ...attrs,
                    cid: cid.toString()
                };
            },
            getAttributesFromYieldedValue: (value, attrs) => {
                return {
                    ...attrs,
                    providers: [...(Array.isArray(attrs.providers) ? attrs.providers : []), value.id.toString()]
                };
            }
        }) ?? this.findProviders;
        this.provide = components.metrics?.traceFunction('libp2p.contentRouting.provide', this.provide.bind(this), {
            optionsIndex: 1,
            getAttributesFromArgs: ([cid], attrs) => {
                return {
                    ...attrs,
                    cid: cid.toString()
                };
            }
        }) ?? this.provide;
        this.cancelReprovide = components.metrics?.traceFunction('libp2p.contentRouting.cancelReprovide', this.cancelReprovide.bind(this), {
            optionsIndex: 1,
            getAttributesFromArgs: ([cid], attrs) => {
                return {
                    ...attrs,
                    cid: cid.toString()
                };
            }
        }) ?? this.cancelReprovide;
        this.put = components.metrics?.traceFunction('libp2p.contentRouting.put', this.put.bind(this), {
            optionsIndex: 2,
            getAttributesFromArgs: ([key]) => {
                return {
                    key: uint8ArrayToString(key, 'base36')
                };
            }
        }) ?? this.put;
        this.get = components.metrics?.traceFunction('libp2p.contentRouting.get', this.get.bind(this), {
            optionsIndex: 1,
            getAttributesFromArgs: ([key]) => {
                return {
                    key: uint8ArrayToString(key, 'base36')
                };
            }
        }) ?? this.get;
    }
    [Symbol.toStringTag] = '@libp2p/content-routing';
    isStarted() {
        return this.started;
    }
    async start() {
        this.started = true;
    }
    async stop() {
        this.started = false;
    }
    /**
     * Iterates over all content routers in parallel to find providers of the given key
     */
    async *findProviders(key, options = {}) {
        if (this.routers.length === 0) {
            throw new NoContentRoutersError('No content routers available');
        }
        const self = this;
        const seen = new PeerSet();
        for await (const peer of merge(...self.routers
            .filter(router => router.findProviders instanceof Function)
            .map(router => router.findProviders(key, options)))) {
            // the peer was yielded by a content router without multiaddrs and we
            // failed to load them
            if (peer == null) {
                continue;
            }
            // store the addresses for the peer if found
            if (peer.multiaddrs.length > 0) {
                await this.components.peerStore.merge(peer.id, {
                    multiaddrs: peer.multiaddrs
                }, options);
            }
            // deduplicate peers
            if (seen.has(peer.id)) {
                continue;
            }
            seen.add(peer.id);
            yield peer;
        }
    }
    /**
     * Iterates over all content routers in parallel to notify it is
     * a provider of the given key
     */
    async provide(key, options = {}) {
        if (this.routers.length === 0) {
            throw new NoContentRoutersError('No content routers available');
        }
        await Promise.all(this.routers
            .filter(router => router.provide instanceof Function)
            .map(async (router) => {
            await router.provide(key, options);
        }));
    }
    async cancelReprovide(key, options = {}) {
        if (this.routers.length === 0) {
            throw new NoContentRoutersError('No content routers available');
        }
        await Promise.all(this.routers
            .filter(router => router.cancelReprovide instanceof Function)
            .map(async (router) => {
            await router.cancelReprovide(key, options);
        }));
    }
    /**
     * Store the given key/value pair in the available content routings
     */
    async put(key, value, options) {
        if (!this.isStarted()) {
            throw new NotStartedError();
        }
        await Promise.all(this.routers
            .filter(router => router.put instanceof Function)
            .map(async (router) => {
            await router.put(key, value, options);
        }));
    }
    /**
     * Get the value to the given key.
     * Times out after 1 minute by default.
     */
    async get(key, options) {
        if (!this.isStarted()) {
            throw new NotStartedError();
        }
        return Promise.any(this.routers
            .filter(router => router.get instanceof Function)
            .map(async (router) => {
            return router.get(key, options);
        }));
    }
}
//# sourceMappingURL=content-routing.js.map