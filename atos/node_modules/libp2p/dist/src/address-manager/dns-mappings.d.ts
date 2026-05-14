import type { AddressManagerComponents, AddressManagerInit } from './index.ts';
import type { NodeAddress } from '@libp2p/interface-internal';
import type { Multiaddr } from '@multiformats/multiaddr';
export declare const defaultValues: {
    maxObservedAddresses: number;
};
export declare class DNSMappings {
    private readonly log;
    private readonly mappings;
    constructor(components: AddressManagerComponents, init?: AddressManagerInit);
    has(ma: Multiaddr): boolean;
    add(domain: string, addresses: string[]): void;
    remove(ma: Multiaddr): boolean;
    getAll(addresses: NodeAddress[]): NodeAddress[];
    private maybeAddSNIComponent;
    confirm(ma: Multiaddr, ttl: number): boolean;
    unconfirm(ma: Multiaddr, ttl: number): boolean;
}
//# sourceMappingURL=dns-mappings.d.ts.map