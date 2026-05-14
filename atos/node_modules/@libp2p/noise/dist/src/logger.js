import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import { DUMP_SESSION_KEYS } from './constants.js';
export function logLocalStaticKeys(s, keyLogger) {
    if (!keyLogger.enabled || !DUMP_SESSION_KEYS) {
        return;
    }
    if (s) {
        keyLogger(`LOCAL_STATIC_PUBLIC_KEY ${uint8ArrayToString(s.publicKey, 'hex')}`);
        keyLogger(`LOCAL_STATIC_PRIVATE_KEY ${uint8ArrayToString(s.privateKey, 'hex')}`);
    }
    else {
        keyLogger('Missing local static keys.');
    }
}
export function logLocalEphemeralKeys(e, keyLogger) {
    if (!keyLogger.enabled || !DUMP_SESSION_KEYS) {
        return;
    }
    if (e) {
        keyLogger(`LOCAL_PUBLIC_EPHEMERAL_KEY ${uint8ArrayToString(e.publicKey, 'hex')}`);
        keyLogger(`LOCAL_PRIVATE_EPHEMERAL_KEY ${uint8ArrayToString(e.privateKey, 'hex')}`);
    }
    else {
        keyLogger('Missing local ephemeral keys.');
    }
}
export function logRemoteStaticKey(rs, keyLogger) {
    if (!keyLogger.enabled || !DUMP_SESSION_KEYS) {
        return;
    }
    if (rs) {
        keyLogger(`REMOTE_STATIC_PUBLIC_KEY ${uint8ArrayToString(rs.subarray(), 'hex')}`);
    }
    else {
        keyLogger('Missing remote static public key.');
    }
}
export function logRemoteEphemeralKey(re, keyLogger) {
    if (!keyLogger.enabled || !DUMP_SESSION_KEYS) {
        return;
    }
    if (re) {
        keyLogger(`REMOTE_EPHEMERAL_PUBLIC_KEY ${uint8ArrayToString(re.subarray(), 'hex')}`);
    }
    else {
        keyLogger('Missing remote ephemeral keys.');
    }
}
export function logCipherState(cs1, cs2, keyLogger) {
    if (!keyLogger.enabled || !DUMP_SESSION_KEYS) {
        return;
    }
    keyLogger(`CIPHER_STATE_1 ${cs1.n.getUint64()} ${cs1.k && uint8ArrayToString(cs1.k, 'hex')}`);
    keyLogger(`CIPHER_STATE_2 ${cs2.n.getUint64()} ${cs2.k && uint8ArrayToString(cs2.k, 'hex')}`);
}
//# sourceMappingURL=logger.js.map