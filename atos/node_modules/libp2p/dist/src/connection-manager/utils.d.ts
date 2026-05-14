import { IpNet } from '@chainsafe/netmask';
import type { Connection, AbortOptions, PeerId } from '@libp2p/interface';
import type { Multiaddr } from '@multiformats/multiaddr';
export interface SafelyCloseConnectionOptions extends AbortOptions {
    /**
     * Only close the stream if it either has no protocol streams open or only
     * ones in this list.
     *
     * @default ['/ipfs/id/1.0.0']
     */
    closableProtocols?: string[];
}
/**
 * Close the passed connection if it has no streams, or only closable protocol
 * streams, falling back to aborting the connection if closing it cleanly fails.
 */
export declare function safelyCloseConnectionIfUnused(connection?: Connection, options?: SafelyCloseConnectionOptions): Promise<void>;
/**
 * Converts a multiaddr string or object to an IpNet object.
 * If the multiaddr doesn't include /ipcidr, it will encapsulate with the appropriate CIDR:
 * - /ipcidr/32 for IPv4
 * - /ipcidr/128 for IPv6
 *
 * @param {string | Multiaddr} ma - The multiaddr object to convert.
 * @returns {IpNet} The converted IpNet object.
 * @throws {Error} Throws an error if the multiaddr is not valid.
 */
export declare function multiaddrToIpNet(ma: Multiaddr): IpNet;
/**
 * Returns true if the passed multiaddr would result in a direct connection to
 * the peer.
 *
 * Currently only circuit relay addresses are supported as indirect connections.
 */
export declare function isDirect(ma: Multiaddr): boolean;
/**
 * If there is an existing non-limited connection to the remote peer return it,
 * unless it is indirect and at least one of the passed dial addresses would
 * result in a direct connection
 */
export declare function findExistingConnection(peerId?: PeerId, connections?: Connection[], dialAddresses?: Multiaddr[]): Connection | undefined;
//# sourceMappingURL=utils.d.ts.map