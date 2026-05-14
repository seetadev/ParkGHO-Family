import type { ComponentLogger, Libp2pEvents, PeerId, PeerStore, Metrics } from '@libp2p/interface';
import type { AddressManager as AddressManagerInterface, TransportManager, NodeAddress, ConfirmAddressOptions } from '@libp2p/interface-internal';
import type { Multiaddr } from '@multiformats/multiaddr';
import type { TypedEventTarget } from 'main-event';
export declare const defaultValues: {
    maxObservedAddresses: number;
    addressVerificationTTL: number;
    addressVerificationRetry: number;
};
export interface AddressManagerInit {
    /**
     * Pass an function in this field to override the list of addresses
     * that are announced to the network
     */
    announceFilter?: AddressFilter;
    /**
     * A list of string multiaddrs to listen on
     */
    listen?: string[];
    /**
     * A list of string multiaddrs to use instead of those reported by transports
     */
    announce?: string[];
    /**
     * A list of string multiaddrs string to never announce
     */
    noAnnounce?: string[];
    /**
     * A list of string multiaddrs to add to the list of announced addresses
     */
    appendAnnounce?: string[];
    /**
     * Limits the number of observed addresses we will store
     */
    maxObservedAddresses?: number;
    /**
     * How long before each public address should be reverified in ms.
     *
     * Requires `@libp2p/autonat` or some other verification method to be
     * configured.
     *
     * @default 600_000
     */
    addressVerificationTTL?: number;
    /**
     * After a transport or mapped address has failed to verify, how long to wait
     * before retrying it in ms
     *
     * Requires `@libp2p/autonat` or some other verification method to be
     * configured.
     *
     * @default 300_000
     */
    addressVerificationRetry?: number;
}
export interface AddressManagerComponents {
    peerId: PeerId;
    transportManager: TransportManager;
    peerStore: PeerStore;
    events: TypedEventTarget<Libp2pEvents>;
    logger: ComponentLogger;
    metrics?: Metrics;
}
/**
 * A function that takes a list of multiaddrs and returns a list
 * to announce
 */
export interface AddressFilter {
    (addrs: Multiaddr[]): Multiaddr[];
}
export declare class AddressManager implements AddressManagerInterface {
    private readonly log;
    private readonly components;
    private readonly listen;
    private readonly announce;
    private readonly appendAnnounce;
    private readonly announceFilter;
    private readonly observed;
    private readonly dnsMappings;
    private readonly ipMappings;
    private readonly transportAddresses;
    private readonly observedAddressFilter;
    private readonly addressVerificationTTL;
    private readonly addressVerificationRetry;
    /**
     * Responsible for managing the peer addresses.
     * Peers can specify their listen and announce addresses.
     * The listen addresses will be used by the libp2p transports to listen for new connections,
     * while the announce addresses will be used for the peer addresses' to other peers in the network.
     */
    constructor(components: AddressManagerComponents, init?: AddressManagerInit);
    readonly [Symbol.toStringTag] = "@libp2p/address-manager";
    _updatePeerStoreAddresses(): void;
    /**
     * Get peer listen multiaddrs
     */
    getListenAddrs(): Multiaddr[];
    /**
     * Get peer announcing multiaddrs
     */
    getAnnounceAddrs(): Multiaddr[];
    /**
     * Get peer announcing multiaddrs
     */
    getAppendAnnounceAddrs(): Multiaddr[];
    /**
     * Get observed multiaddrs
     */
    getObservedAddrs(): Multiaddr[];
    /**
     * Add peer observed addresses
     */
    addObservedAddr(addr: Multiaddr): void;
    confirmObservedAddr(addr: Multiaddr, options?: ConfirmAddressOptions): void;
    removeObservedAddr(addr: Multiaddr, options?: ConfirmAddressOptions): void;
    getAddresses(): Multiaddr[];
    getAddressesWithMetadata(): NodeAddress[];
    addDNSMapping(domain: string, addresses: string[]): void;
    removeDNSMapping(domain: string): void;
    addPublicAddressMapping(internalIp: string, internalPort: number, externalIp: string, externalPort?: number, protocol?: 'tcp' | 'udp'): void;
    removePublicAddressMapping(internalIp: string, internalPort: number, externalIp: string, externalPort?: number, protocol?: 'tcp' | 'udp'): void;
    /**
     * Where an external service (router, gateway, etc) is forwarding traffic to
     * us, attempt to add an IP mapping for the external address - this will
     * include the observed mapping in the address list where we also have a DNS
     * mapping for the external IP.
     *
     * Returns true if we added a new mapping
     */
    private maybeUpgradeToIPMapping;
}
//# sourceMappingURL=index.d.ts.map