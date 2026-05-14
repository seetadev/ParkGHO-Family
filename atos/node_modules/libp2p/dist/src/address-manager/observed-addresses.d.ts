import type { AddressManagerComponents, AddressManagerInit } from './index.ts';
import type { NodeAddress } from '@libp2p/interface-internal';
import type { Multiaddr } from '@multiformats/multiaddr';
export declare const defaultValues: {
    maxObservedAddresses: number;
};
export declare class ObservedAddresses {
    private readonly log;
    private readonly addresses;
    private readonly maxObservedAddresses;
    constructor(components: AddressManagerComponents, init?: AddressManagerInit);
    has(ma: Multiaddr): boolean;
    removePrefixed(prefix: string): void;
    add(ma: Multiaddr): void;
    getAll(): NodeAddress[];
    remove(ma: Multiaddr): boolean;
    confirm(ma: Multiaddr, ttl: number): boolean;
}
//# sourceMappingURL=observed-addresses.d.ts.map