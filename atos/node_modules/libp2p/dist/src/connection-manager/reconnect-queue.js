import { KEEP_ALIVE } from '@libp2p/interface';
import { PeerQueue } from '@libp2p/utils';
import pRetry from 'p-retry';
import { MAX_PARALLEL_RECONNECTS } from "./constants.js";
/**
 * When peers tagged with `KEEP_ALIVE` disconnect, this component attempts to
 * redial them
 */
export class ReconnectQueue {
    log;
    queue;
    started;
    peerStore;
    retries;
    retryInterval;
    backoffFactor;
    connectionManager;
    events;
    constructor(components, init = {}) {
        this.log = components.logger.forComponent('libp2p:reconnect-queue');
        this.peerStore = components.peerStore;
        this.connectionManager = components.connectionManager;
        this.queue = new PeerQueue({
            concurrency: init.maxParallelReconnects ?? MAX_PARALLEL_RECONNECTS,
            metricName: 'libp2p_reconnect_queue',
            metrics: components.metrics
        });
        this.started = false;
        this.retries = init.retries ?? 5;
        this.backoffFactor = init.backoffFactor;
        this.retryInterval = init.retryInterval;
        this.events = components.events;
        components.events.addEventListener('peer:disconnect', (evt) => {
            this.maybeReconnect(evt.detail)
                .catch(err => {
                this.log.error('failed to maybe reconnect to %p - %e', evt.detail, err);
            });
        });
    }
    async maybeReconnect(peerId) {
        if (!this.started) {
            return;
        }
        const peer = await this.peerStore.get(peerId);
        if (!hasKeepAliveTag(peer)) {
            return;
        }
        if (this.queue.has(peerId)) {
            return;
        }
        this.queue.add(async (options) => {
            await pRetry(async (attempt) => {
                if (!this.started) {
                    return;
                }
                try {
                    await this.connectionManager.openConnection(peerId, {
                        signal: options?.signal
                    });
                }
                catch (err) {
                    this.log('reconnecting to %p attempt %d of %d failed - %e', peerId, attempt, this.retries, err);
                    throw err;
                }
            }, {
                signal: options?.signal,
                retries: this.retries,
                factor: this.backoffFactor,
                minTimeout: this.retryInterval
            });
        }, {
            peerId
        })
            .catch(async (err) => {
            this.log.error('failed to reconnect to %p - %e', peerId, err);
            const tags = {};
            [...peer.tags.keys()].forEach(key => {
                if (key.startsWith(KEEP_ALIVE)) {
                    tags[key] = undefined;
                }
            });
            await this.peerStore.merge(peerId, {
                tags
            });
            this.events.safeDispatchEvent('peer:reconnect-failure', {
                detail: peerId
            });
        })
            .catch(async (err) => {
            this.log.error('failed to remove keep-alive tag from %p - %e', peerId, err);
        });
    }
    start() {
        this.started = true;
    }
    async afterStart() {
        // re-connect to any peers with the KEEP_ALIVE tag
        void Promise.resolve()
            .then(async () => {
            const keepAlivePeers = await this.peerStore.all({
                filters: [
                    (peer) => hasKeepAliveTag(peer)
                ]
            });
            await Promise.all(keepAlivePeers.map(async (peer) => {
                await this.connectionManager.openConnection(peer.id)
                    .catch(err => {
                    this.log.error('could not open connection to keepalive peer - %e', err);
                });
            }));
        })
            .catch(err => {
            this.log.error('error reconnect to peers after start - %e', err);
        });
    }
    stop() {
        this.started = false;
        this.queue.abort();
    }
}
function hasKeepAliveTag(peer) {
    for (const tag of peer.tags.keys()) {
        if (tag.startsWith(KEEP_ALIVE)) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=reconnect-queue.js.map