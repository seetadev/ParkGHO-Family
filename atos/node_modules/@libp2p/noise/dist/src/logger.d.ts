import type { CipherState } from './protocol.js';
import type { KeyPair } from './types.js';
import type { Logger } from '@libp2p/interface';
import type { Uint8ArrayList } from 'uint8arraylist';
export declare function logLocalStaticKeys(s: KeyPair | undefined, keyLogger: Logger): void;
export declare function logLocalEphemeralKeys(e: KeyPair | undefined, keyLogger: Logger): void;
export declare function logRemoteStaticKey(rs: Uint8Array | Uint8ArrayList | undefined, keyLogger: Logger): void;
export declare function logRemoteEphemeralKey(re: Uint8Array | Uint8ArrayList | undefined, keyLogger: Logger): void;
export declare function logCipherState(cs1: CipherState, cs2: CipherState, keyLogger: Logger): void;
//# sourceMappingURL=logger.d.ts.map