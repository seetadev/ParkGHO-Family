/**
 * @packageDocumentation
 *
 * The peer store is where libp2p stores data about the peers it has encountered on the network.
 */
import type { ComponentLogger, Libp2pEvents, PeerId, PeerStore, AbortOptions, Metrics } from '@libp2p/interface';
import type { Multiaddr } from '@multiformats/multiaddr';
import type { Datastore } from 'interface-datastore';
import type { TypedEventTarget } from 'main-event';
export interface PersistentPeerStoreComponents {
    peerId: PeerId;
    datastore: Datastore;
    events: TypedEventTarget<Libp2pEvents>;
    logger: ComponentLogger;
    metrics?: Metrics;
}
/**
 * Return true to allow storing the passed multiaddr for the passed peer
 */
export interface AddressFilter {
    (peerId: PeerId, multiaddr: Multiaddr, options?: AbortOptions): Promise<boolean> | boolean;
}
export interface PersistentPeerStoreInit {
    /**
     * Used to remove multiaddrs of peers before storing them. The default is to
     * store all addresses
     */
    addressFilter?: AddressFilter;
    /**
     * The multiaddrs for a given peer will expire after this number of ms after
     * which they must be re-fetched using the peer routing.
     *
     * Defaults to one hour.
     *
     * @default 3_600_000
     */
    maxAddressAge?: number;
    /**
     * Any peer without multiaddrs that has not been updated after this number of
     * ms will be evicted from the peer store.
     *
     * Defaults to six hours.
     *
     * @default 21_600_000
     */
    maxPeerAge?: number;
}
export declare function persistentPeerStore(components: PersistentPeerStoreComponents, init?: PersistentPeerStoreInit): PeerStore;
//# sourceMappingURL=index.d.ts.map