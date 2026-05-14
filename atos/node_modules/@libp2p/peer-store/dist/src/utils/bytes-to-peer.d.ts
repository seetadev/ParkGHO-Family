import { Peer as PeerPB } from '../pb/peer.js';
import type { PeerId, Peer } from '@libp2p/interface';
export declare function bytesToPeer(peerId: PeerId, buf: Uint8Array, maxAddressAge: number): Peer;
export declare function pbToPeer(peerId: PeerId, peer: PeerPB, maxAddressAge: number): Peer;
//# sourceMappingURL=bytes-to-peer.d.ts.map