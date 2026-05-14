/**
 * @packageDocumentation
 *
 * The configured bootstrap peers will be discovered after the configured timeout. This will ensure there are some peers in the peer store for the node to use to discover other peers.
 *
 * They will be tagged with a tag with the name `'bootstrap'` tag, the value `50` and it will expire after two minutes which means the nodes connections may be closed if the maximum number of connections is reached.
 *
 * Clients that need constant connections to bootstrap nodes (e.g. browsers) can set the TTL to `Infinity`.
 *
 * @example Configuring a list of bootstrap nodes
 *
 * ```TypeScript
 * import { createLibp2p } from 'libp2p'
 * import { bootstrap } from '@libp2p/bootstrap'
 *
 * const libp2p = await createLibp2p({
 *   peerDiscovery: [
 *     bootstrap({
 *       list: [
 *         // a list of bootstrap peer multiaddrs to connect to on node startup
 *         '/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
 *         '/dnsaddr/bootstrap.libp2p.io/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
 *         '/dnsaddr/bootstrap.libp2p.io/ipfs/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa'
 *       ]
 *     })
 *   ]
 * })
 *
 * libp2p.addEventListener('peer:discovery', (evt) => {
 *   console.log('found peer: ', evt.detail.toString())
 * })
 * ```
 */
import type { ComponentLogger, PeerDiscovery, PeerStore } from '@libp2p/interface';
import type { ConnectionManager } from '@libp2p/interface-internal';
export interface BootstrapInit {
    /**
     * The list of peer addresses in multi-address format
     */
    list: string[];
    /**
     * How long to wait before discovering bootstrap nodes
     */
    timeout?: number;
    /**
     * Tag a bootstrap peer with this name before "discovering" it
     *
     * @default 'bootstrap'
     */
    tagName?: string;
    /**
     * The bootstrap peer tag will have this value
     *
     * @default 50
     */
    tagValue?: number;
    /**
     * Cause the bootstrap peer tag to be removed after this number of ms
     */
    tagTTL?: number;
}
export interface BootstrapComponents {
    peerStore: PeerStore;
    logger: ComponentLogger;
    connectionManager: ConnectionManager;
}
export declare function bootstrap(init: BootstrapInit): (components: BootstrapComponents) => PeerDiscovery;
//# sourceMappingURL=index.d.ts.map