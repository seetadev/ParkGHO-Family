import { equals as uint8ArrayEquals } from 'uint8arrays/equals';
export function peerEquals(peerA, peerB) {
    return addressesEqual(peerA.addresses, peerB.addresses) &&
        protocolsEqual(peerA.protocols, peerB.protocols) &&
        publicKeyEqual(peerA.publicKey, peerB.publicKey) &&
        peerRecordEnvelope(peerA.peerRecordEnvelope, peerB.peerRecordEnvelope) &&
        metadataEqual(peerA.metadata, peerB.metadata) &&
        tagsEqual(peerA.tags, peerB.tags);
}
function addressesEqual(addressesA, addressesB) {
    return compareArrays(addressesA, addressesB, (a, b) => {
        if (a.isCertified !== b.isCertified) {
            return false;
        }
        if (!uint8ArrayEquals(a.multiaddr, b.multiaddr)) {
            return false;
        }
        return true;
    });
}
function protocolsEqual(protocolsA, protocolsB) {
    return compareArrays(protocolsA, protocolsB, (a, b) => a === b);
}
function publicKeyEqual(publicKeyA, publicKeyB) {
    return compareOptionalUint8Arrays(publicKeyA, publicKeyB);
}
function peerRecordEnvelope(envelopeA, envelopeB) {
    return compareOptionalUint8Arrays(envelopeA, envelopeB);
}
function metadataEqual(metadataA, metadataB) {
    return compareMaps(metadataA, metadataB, (a, b) => uint8ArrayEquals(a, b));
}
function tagsEqual(metadataA, metadataB) {
    return compareMaps(metadataA, metadataB, (a, b) => a.value === b.value && a.expiry === b.expiry);
}
function compareOptionalUint8Arrays(arrA, arrB) {
    if (arrA == null && arrB == null) {
        return true;
    }
    if (arrA != null && arrB != null) {
        return uint8ArrayEquals(arrA, arrB);
    }
    return false;
}
function compareArrays(arrA, arrB, compare) {
    if (arrA.length !== arrB.length) {
        return false;
    }
    for (let i = 0; i < arrA.length; i++) {
        if (!compare(arrA[i], arrB[i])) {
            return false;
        }
    }
    return true;
}
function compareMaps(mapA, mapB, compare) {
    if (mapA.size !== mapB.size) {
        return false;
    }
    for (const [key, value] of mapA.entries()) {
        const valueB = mapB.get(key);
        if (valueB == null) {
            return false;
        }
        if (!compare(value, valueB)) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=peer-equals.js.map