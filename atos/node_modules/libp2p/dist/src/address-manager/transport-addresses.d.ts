import type { AddressManagerComponents, AddressManagerInit } from './index.ts';
import type { NodeAddress } from '@libp2p/interface-internal';
import type { Multiaddr } from '@multiformats/multiaddr';
export declare const defaultValues: {
    maxObservedAddresses: number;
};
export declare class TransportAddresses {
    private readonly log;
    private readonly addresses;
    private readonly maxObservedAddresses;
    constructor(components: AddressManagerComponents, init?: AddressManagerInit);
    get(multiaddr: Multiaddr, ttl: number): NodeAddress;
    has(ma: Multiaddr): boolean;
    remove(ma: Multiaddr): boolean;
    confirm(ma: Multiaddr, ttl: number): boolean;
    unconfirm(ma: Multiaddr, ttl: number): boolean;
    private toKey;
}
//# sourceMappingURL=transport-addresses.d.ts.map