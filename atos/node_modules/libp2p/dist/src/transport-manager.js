import { FaultTolerance, InvalidParametersError, NotStartedError } from '@libp2p/interface';
import { trackedMap } from '@libp2p/utils';
import { IP4, IP6 } from '@multiformats/multiaddr-matcher';
import { CustomProgressEvent } from 'progress-events';
import { TransportUnavailableError, UnsupportedListenAddressError, UnsupportedListenAddressesError } from "./errors.js";
export class DefaultTransportManager {
    log;
    components;
    transports;
    listeners;
    faultTolerance;
    started;
    constructor(components, init = {}) {
        this.log = components.logger.forComponent('libp2p:transports');
        this.components = components;
        this.started = false;
        this.transports = trackedMap({
            name: 'libp2p_transport_manager_transports',
            metrics: this.components.metrics
        });
        this.listeners = trackedMap({
            name: 'libp2p_transport_manager_listeners',
            metrics: this.components.metrics
        });
        this.faultTolerance = init.faultTolerance ?? FaultTolerance.FATAL_ALL;
    }
    [Symbol.toStringTag] = '@libp2p/transport-manager';
    /**
     * Adds a `Transport` to the manager
     */
    add(transport) {
        const tag = transport[Symbol.toStringTag];
        if (tag == null) {
            throw new InvalidParametersError('Transport must have a valid tag');
        }
        if (this.transports.has(tag)) {
            throw new InvalidParametersError(`There is already a transport with the tag ${tag}`);
        }
        this.log('adding transport %s', tag);
        this.transports.set(tag, transport);
        if (!this.listeners.has(tag)) {
            this.listeners.set(tag, []);
        }
    }
    isStarted() {
        return this.started;
    }
    start() {
        this.started = true;
    }
    async afterStart() {
        // Listen on the provided transports for the provided addresses
        const addrs = this.components.addressManager.getListenAddrs();
        await this.listen(addrs);
    }
    /**
     * Stops all listeners
     */
    async stop() {
        const tasks = [];
        for (const [key, listeners] of this.listeners) {
            this.log('closing listeners for %s', key);
            while (listeners.length > 0) {
                const listener = listeners.pop();
                if (listener == null) {
                    continue;
                }
                tasks.push(listener.close());
            }
        }
        await Promise.all(tasks);
        this.log('all listeners closed');
        for (const key of this.listeners.keys()) {
            this.listeners.set(key, []);
        }
        this.started = false;
    }
    /**
     * Dials the given Multiaddr over it's supported transport
     */
    async dial(ma, options) {
        const transport = this.dialTransportForMultiaddr(ma);
        if (transport == null) {
            throw new TransportUnavailableError(`No transport available for address ${String(ma)}`);
        }
        options?.onProgress?.(new CustomProgressEvent('transport-manager:selected-transport', transport[Symbol.toStringTag]));
        // @ts-expect-error the transport has a typed onProgress option but we
        // can't predict what transport implementation we selected so all we can
        // do is pass the onProgress handler in and hope for the best
        return transport.dial(ma, {
            ...options,
            upgrader: this.components.upgrader
        });
    }
    /**
     * Returns all Multiaddr's the listeners are using
     */
    getAddrs() {
        let addrs = [];
        for (const listeners of this.listeners.values()) {
            for (const listener of listeners) {
                addrs = [...addrs, ...listener.getAddrs()];
            }
        }
        return addrs;
    }
    /**
     * Returns all the transports instances
     */
    getTransports() {
        return Array.of(...this.transports.values());
    }
    /**
     * Returns all the listener instances
     */
    getListeners() {
        return Array.of(...this.listeners.values()).flat();
    }
    /**
     * Finds a transport that matches the given Multiaddr
     */
    dialTransportForMultiaddr(ma) {
        for (const transport of this.transports.values()) {
            const addrs = transport.dialFilter([ma]);
            if (addrs.length > 0) {
                return transport;
            }
        }
    }
    /**
     * Finds a transport that matches the given Multiaddr
     */
    listenTransportForMultiaddr(ma) {
        for (const transport of this.transports.values()) {
            const addrs = transport.listenFilter([ma]);
            if (addrs.length > 0) {
                return transport;
            }
        }
    }
    /**
     * Starts listeners for each listen Multiaddr
     */
    async listen(addrs) {
        if (!this.isStarted()) {
            throw new NotStartedError('Not started');
        }
        if (addrs == null || addrs.length === 0) {
            this.log('no addresses were provided for listening, this node is dial only');
            return;
        }
        // track IPv4/IPv6 results - if we succeed on IPv4 but all IPv6 attempts
        // fail then we are probably on a network without IPv6 support
        const listenStats = {
            errors: new Map(),
            ipv4: {
                success: 0,
                attempts: 0
            },
            ipv6: {
                success: 0,
                attempts: 0
            }
        };
        addrs.forEach(ma => {
            listenStats.errors.set(ma.toString(), new UnsupportedListenAddressError());
        });
        const tasks = [];
        for (const [key, transport] of this.transports.entries()) {
            const supportedAddrs = transport.listenFilter(addrs);
            // For each supported multiaddr, create a listener
            for (const addr of supportedAddrs) {
                this.log('creating listener for %s on %a', key, addr);
                const listener = transport.createListener({
                    upgrader: this.components.upgrader
                });
                let listeners = this.listeners.get(key) ?? [];
                if (listeners == null) {
                    listeners = [];
                    this.listeners.set(key, listeners);
                }
                listeners.push(listener);
                // Track listen/close events
                listener.addEventListener('listening', () => {
                    this.components.events.safeDispatchEvent('transport:listening', {
                        detail: listener
                    });
                });
                listener.addEventListener('close', () => {
                    const index = listeners.findIndex(l => l === listener);
                    // remove the listener
                    listeners.splice(index, 1);
                    this.components.events.safeDispatchEvent('transport:close', {
                        detail: listener
                    });
                });
                // track IPv4/IPv6 support
                if (IP4.matches(addr)) {
                    listenStats.ipv4.attempts++;
                }
                else if (IP6.matches(addr)) {
                    listenStats.ipv6.attempts++;
                }
                // We need to attempt to listen on everything
                tasks.push(listener.listen(addr)
                    .then(() => {
                    listenStats.errors.delete(addr.toString());
                    if (IP4.matches(addr)) {
                        listenStats.ipv4.success++;
                    }
                    if (IP6.matches(addr)) {
                        listenStats.ipv6.success++;
                    }
                }, (err) => {
                    this.log.error('transport %s could not listen on address %a - %e', key, addr, err);
                    listenStats.errors.set(addr.toString(), err);
                    throw err;
                }));
            }
        }
        const results = await Promise.allSettled(tasks);
        // listening on all addresses, all good
        if (results.length > 0 && results.every(res => res.status === 'fulfilled')) {
            return;
        }
        // detect lack of IPv6 support on the current network - if we tried to
        // listen on IPv4 and IPv6 addresses, and all IPv4 addresses succeeded but
        // all IPv6 addresses fail, then we can assume there's no IPv6 here
        if (this.ipv6Unsupported(listenStats)) {
            this.log('all IPv4 addresses succeed but all IPv6 failed');
            return;
        }
        if (this.faultTolerance === FaultTolerance.NO_FATAL) {
            // ok to be dial-only
            this.log('failed to listen on any address but fault tolerance allows this');
            return;
        }
        // if a configured address was not able to be listened on, throw an error
        throw new UnsupportedListenAddressesError(`Some configured addresses failed to be listened on, you may need to remove one or more listen addresses from your configuration or set \`transportManager.faultTolerance\` to NO_FATAL:\n${[...listenStats.errors.entries()].map(([addr, err]) => {
            return `
  ${addr}: ${`${getErrorMessage(err)}`.split('\n').join('\n  ')}
`;
        }).join('')}`);
    }
    ipv6Unsupported(listenStats) {
        if (listenStats.ipv4.attempts === 0 || listenStats.ipv6.attempts === 0) {
            return false;
        }
        const allIpv4Succeeded = listenStats.ipv4.attempts === listenStats.ipv4.success;
        const allIpv6Failed = listenStats.ipv6.success === 0;
        return allIpv4Succeeded && allIpv6Failed;
    }
    /**
     * Removes the given transport from the manager.
     * If a transport has any running listeners, they will be closed.
     */
    async remove(key) {
        const listeners = this.listeners.get(key) ?? [];
        this.log.trace('removing transport %s', key);
        // Close any running listeners
        const tasks = [];
        this.log.trace('closing listeners for %s', key);
        while (listeners.length > 0) {
            const listener = listeners.pop();
            if (listener == null) {
                continue;
            }
            tasks.push(listener.close());
        }
        await Promise.all(tasks);
        this.transports.delete(key);
        this.listeners.delete(key);
    }
    /**
     * Removes all transports from the manager.
     * If any listeners are running, they will be closed.
     *
     * @async
     */
    async removeAll() {
        const tasks = [];
        for (const key of this.transports.keys()) {
            tasks.push(this.remove(key));
        }
        await Promise.all(tasks);
    }
}
/**
 * Not every error has useful fields, browsers particularly often have an empty
 * string for the "stack" so try a few different fields here.
 */
function getErrorMessage(err) {
    if (err.stack != null && err.stack.trim() !== '') {
        return err.stack;
    }
    if (err.message != null) {
        return err.message;
    }
    return err.toString();
}
//# sourceMappingURL=transport-manager.js.map