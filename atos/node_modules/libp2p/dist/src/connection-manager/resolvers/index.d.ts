import type { MultiaddrResolveOptions, MultiaddrResolver } from '@libp2p/interface';
import type { Multiaddr } from '@multiformats/multiaddr';
export interface ResolveOptions extends MultiaddrResolveOptions {
    /**
     * When resolving DNSADDR Multiaddrs that resolve to other DNSADDR Multiaddrs,
     * limit how many times we will recursively resolve them.
     *
     * @default 32
     */
    maxRecursiveDepth?: number;
    /**
     * The current recursive depth
     *
     * @default 0
     */
    depth?: number;
}
/**
 * Recursively resolve multiaddrs
 */
export declare function resolveMultiaddr(address: Multiaddr, resolvers: Record<string, MultiaddrResolver>, options: ResolveOptions): Promise<Multiaddr[]>;
export { dnsaddrResolver } from './dnsaddr.ts';
//# sourceMappingURL=index.d.ts.map