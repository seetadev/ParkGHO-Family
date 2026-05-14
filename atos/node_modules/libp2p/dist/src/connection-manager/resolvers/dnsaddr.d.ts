import type { MultiaddrResolver, MultiaddrResolveOptions } from '@libp2p/interface';
import type { Multiaddr } from '@multiformats/multiaddr';
declare class DNSAddrResolver implements MultiaddrResolver {
    private dns?;
    canResolve(ma: Multiaddr): boolean;
    resolve(ma: Multiaddr, options: MultiaddrResolveOptions): Promise<Multiaddr[]>;
    private getDNS;
}
export declare const dnsaddrResolver: DNSAddrResolver;
export {};
//# sourceMappingURL=dnsaddr.d.ts.map