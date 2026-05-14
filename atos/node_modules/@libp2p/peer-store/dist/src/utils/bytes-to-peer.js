import { publicKeyFromProtobuf } from '@libp2p/crypto/keys';
import { peerIdFromPublicKey } from '@libp2p/peer-id';
import { multiaddr } from '@multiformats/multiaddr';
import { Peer as PeerPB } from '../pb/peer.js';
function populatePublicKey(peerId, protobuf) {
    if (peerId.publicKey != null || protobuf.publicKey == null) {
        return peerId;
    }
    let digest;
    if (peerId.type === 'RSA') {
        // avoid hashing public key
        digest = peerId.toMultihash();
    }
    const publicKey = publicKeyFromProtobuf(protobuf.publicKey, digest);
    return peerIdFromPublicKey(publicKey);
}
export function bytesToPeer(peerId, buf, maxAddressAge) {
    const peer = PeerPB.decode(buf);
    return pbToPeer(peerId, peer, maxAddressAge);
}
export function pbToPeer(peerId, peer, maxAddressAge) {
    const tags = new Map();
    // remove any expired tags
    const now = BigInt(Date.now());
    for (const [key, tag] of peer.tags.entries()) {
        if (tag.expiry != null && tag.expiry < now) {
            continue;
        }
        tags.set(key, tag);
    }
    return {
        ...peer,
        id: populatePublicKey(peerId, peer),
        addresses: peer.addresses
            // remove any expired multiaddrs
            .filter(({ observed }) => observed != null && observed > (Date.now() - maxAddressAge))
            .map(({ multiaddr: ma, isCertified }) => {
            return {
                multiaddr: multiaddr(ma),
                isCertified: isCertified ?? false
            };
        }),
        metadata: peer.metadata,
        peerRecordEnvelope: peer.peerRecordEnvelope ?? undefined,
        tags
    };
}
//# sourceMappingURL=bytes-to-peer.js.map