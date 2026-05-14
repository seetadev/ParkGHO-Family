import type { DialTarget, PeerId } from '@libp2p/interface';
import type { Multiaddr } from '@multiformats/multiaddr';
export interface PeerAddress {
    peerId?: PeerId;
    multiaddrs: Multiaddr[];
}
/**
 * Extracts a PeerId and/or multiaddr from the passed PeerId or Multiaddr or an
 * array of Multiaddrs
 */
export declare function getPeerAddress(peer: DialTarget): PeerAddress;
//# sourceMappingURL=get-peer.d.ts.map