import { Uint8ArrayList } from 'uint8arraylist';
import { Nonce } from './nonce.js';
import type { ICipherState, ISymmetricState, IHandshakeState, KeyPair, ICrypto } from './types.js';
export declare const ZEROLEN: Uint8Array<ArrayBufferLike>;
interface ICipherStateWithKey extends ICipherState {
    k: Uint8Array;
}
export declare class CipherState implements ICipherState {
    k?: Uint8Array;
    n: Nonce;
    private readonly crypto;
    constructor(crypto: ICrypto, k?: Uint8Array | undefined, n?: number);
    hasKey(): this is ICipherStateWithKey;
    encryptWithAd(ad: Uint8Array, plaintext: Uint8Array | Uint8ArrayList): Uint8Array | Uint8ArrayList;
    decryptWithAd(ad: Uint8Array, ciphertext: Uint8Array | Uint8ArrayList, dst?: Uint8Array): Uint8Array | Uint8ArrayList;
}
export declare class SymmetricState implements ISymmetricState {
    cs: CipherState;
    ck: Uint8Array;
    h: Uint8Array;
    private readonly crypto;
    constructor(crypto: ICrypto, protocolName: string);
    mixKey(ikm: Uint8Array): void;
    mixHash(data: Uint8Array | Uint8ArrayList): void;
    encryptAndHash(plaintext: Uint8Array | Uint8ArrayList): Uint8Array | Uint8ArrayList;
    decryptAndHash(ciphertext: Uint8Array | Uint8ArrayList): Uint8Array | Uint8ArrayList;
    split(): [CipherState, CipherState];
}
export interface HandshakeStateInit {
    crypto: ICrypto;
    protocolName: string;
    initiator: boolean;
    prologue: Uint8Array;
    s?: KeyPair;
    e?: KeyPair;
    rs?: Uint8Array | Uint8ArrayList;
    re?: Uint8Array | Uint8ArrayList;
}
export declare abstract class AbstractHandshakeState implements IHandshakeState {
    ss: SymmetricState;
    s?: KeyPair;
    e?: KeyPair;
    rs?: Uint8Array | Uint8ArrayList;
    re?: Uint8Array | Uint8ArrayList;
    initiator: boolean;
    protected readonly crypto: ICrypto;
    constructor(init: HandshakeStateInit);
    protected writeE(): Uint8Array;
    protected writeS(): Uint8Array | Uint8ArrayList;
    protected writeEE(): void;
    protected writeES(): void;
    protected writeSE(): void;
    protected readE(message: Uint8ArrayList, offset?: number): void;
    protected readS(message: Uint8ArrayList, offset?: number): number;
    protected readEE(): void;
    protected readES(): void;
    protected readSE(): void;
}
/**
 * A IHandshakeState that's optimized for the XX pattern
 */
export declare class XXHandshakeState extends AbstractHandshakeState {
    writeMessageA(payload: Uint8Array | Uint8ArrayList): Uint8Array | Uint8ArrayList;
    writeMessageB(payload: Uint8Array | Uint8ArrayList): Uint8Array | Uint8ArrayList;
    writeMessageC(payload: Uint8Array | Uint8ArrayList): Uint8Array | Uint8ArrayList;
    readMessageA(message: Uint8ArrayList): Uint8Array | Uint8ArrayList;
    readMessageB(message: Uint8ArrayList): Uint8Array | Uint8ArrayList;
    readMessageC(message: Uint8ArrayList): Uint8Array | Uint8ArrayList;
}
export {};
//# sourceMappingURL=protocol.d.ts.map