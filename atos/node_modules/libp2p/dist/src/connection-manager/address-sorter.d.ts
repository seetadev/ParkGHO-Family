import type { Address } from '@libp2p/interface';
/**
 * Compare function for array.sort() that moves certified addresses to the start
 * of the array.
 */
export declare function certifiedAddressesFirst(a: Address, b: Address): -1 | 0 | 1;
export declare function defaultAddressSorter(addresses: Address[]): Address[];
//# sourceMappingURL=address-sorter.d.ts.map