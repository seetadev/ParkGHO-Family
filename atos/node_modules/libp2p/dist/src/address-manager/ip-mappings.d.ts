import type { AddressManagerComponents, AddressManagerInit } from './index.ts';
import type { NodeAddress } from '@libp2p/interface-internal';
import type { Multiaddr } from '@multiformats/multiaddr';
export declare const defaultValues: {
    maxObservedAddresses: number;
};
export declare class IPMappings {
    private readonly log;
    private readonly mappings;
    constructor(components: AddressManagerComponents, init?: AddressManagerInit);
    has(ma: Multiaddr): boolean;
    add(internalIp: string, internalPort: number, externalIp: string, externalPort?: number, protocol?: 'tcp' | 'udp'): void;
    remove(ma: Multiaddr): boolean;
    getAll(addresses: NodeAddress[]): NodeAddress[];
    private maybeOverrideIp;
    confirm(ma: Multiaddr, ttl: number): boolean;
    unconfirm(ma: Multiaddr, ttl: number): boolean;
}
//# sourceMappingURL=ip-mappings.d.ts.map