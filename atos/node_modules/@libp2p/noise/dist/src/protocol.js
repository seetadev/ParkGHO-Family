import { Uint8ArrayList } from 'uint8arraylist';
import { fromString as uint8ArrayFromString } from 'uint8arrays';
import { alloc as uint8ArrayAlloc } from 'uint8arrays/alloc';
import { InvalidCryptoExchangeError } from './errors.js';
import { Nonce } from './nonce.js';
// Code in this file is a direct translation of a subset of the noise protocol https://noiseprotocol.org/noise.html,
// agnostic to libp2p's usage of noise
export const ZEROLEN = uint8ArrayAlloc(0);
export class CipherState {
    k;
    n;
    crypto;
    constructor(crypto, k = undefined, n = 0) {
        this.crypto = crypto;
        this.k = k;
        this.n = new Nonce(n);
    }
    hasKey() {
        return Boolean(this.k);
    }
    encryptWithAd(ad, plaintext) {
        if (!this.hasKey()) {
            return plaintext;
        }
        this.n.assertValue();
        const e = this.crypto.encrypt(plaintext, this.n.getBytes(), ad, this.k);
        this.n.increment();
        return e;
    }
    decryptWithAd(ad, ciphertext, dst) {
        if (!this.hasKey()) {
            return ciphertext;
        }
        this.n.assertValue();
        const plaintext = this.crypto.decrypt(ciphertext, this.n.getBytes(), ad, this.k, dst);
        this.n.increment();
        return plaintext;
    }
}
export class SymmetricState {
    cs;
    ck;
    h;
    crypto;
    constructor(crypto, protocolName) {
        this.crypto = crypto;
        const protocolNameBytes = uint8ArrayFromString(protocolName, 'utf-8');
        this.h = hashProtocolName(crypto, protocolNameBytes);
        this.ck = this.h;
        this.cs = new CipherState(crypto);
    }
    mixKey(ikm) {
        const [ck, tempK] = this.crypto.hkdf(this.ck, ikm);
        this.ck = ck;
        this.cs = new CipherState(this.crypto, tempK);
    }
    mixHash(data) {
        this.h = this.crypto.hash(new Uint8ArrayList(this.h, data));
    }
    encryptAndHash(plaintext) {
        const ciphertext = this.cs.encryptWithAd(this.h, plaintext);
        this.mixHash(ciphertext);
        return ciphertext;
    }
    decryptAndHash(ciphertext) {
        const plaintext = this.cs.decryptWithAd(this.h, ciphertext);
        this.mixHash(ciphertext);
        return plaintext;
    }
    split() {
        const [tempK1, tempK2] = this.crypto.hkdf(this.ck, ZEROLEN);
        return [new CipherState(this.crypto, tempK1), new CipherState(this.crypto, tempK2)];
    }
}
export class AbstractHandshakeState {
    ss;
    s;
    e;
    rs;
    re;
    initiator;
    crypto;
    constructor(init) {
        const { crypto, protocolName, prologue, initiator, s, e, rs, re } = init;
        this.crypto = crypto;
        this.ss = new SymmetricState(crypto, protocolName);
        this.ss.mixHash(prologue);
        this.initiator = initiator;
        this.s = s;
        this.e = e;
        this.rs = rs;
        this.re = re;
    }
    writeE() {
        if (this.e) {
            throw new Error('ephemeral keypair is already set');
        }
        const e = this.crypto.generateKeypair();
        this.ss.mixHash(e.publicKey);
        this.e = e;
        return e.publicKey;
    }
    writeS() {
        if (!this.s) {
            throw new Error('static keypair is not set');
        }
        return this.ss.encryptAndHash(this.s.publicKey);
    }
    writeEE() {
        if (!this.e) {
            throw new Error('ephemeral keypair is not set');
        }
        if (!this.re) {
            throw new Error('remote ephemeral public key is not set');
        }
        this.ss.mixKey(this.crypto.dh(this.e, this.re));
    }
    writeES() {
        if (this.initiator) {
            if (!this.e) {
                throw new Error('ephemeral keypair is not set');
            }
            if (!this.rs) {
                throw new Error('remote static public key is not set');
            }
            this.ss.mixKey(this.crypto.dh(this.e, this.rs));
        }
        else {
            if (!this.s) {
                throw new Error('static keypair is not set');
            }
            if (!this.re) {
                throw new Error('remote ephemeral public key is not set');
            }
            this.ss.mixKey(this.crypto.dh(this.s, this.re));
        }
    }
    writeSE() {
        if (this.initiator) {
            if (!this.s) {
                throw new Error('static keypair is not set');
            }
            if (!this.re) {
                throw new Error('remote ephemeral public key is not set');
            }
            this.ss.mixKey(this.crypto.dh(this.s, this.re));
        }
        else {
            if (!this.e) {
                throw new Error('ephemeral keypair is not set');
            }
            if (!this.rs) {
                throw new Error('remote static public key is not set');
            }
            this.ss.mixKey(this.crypto.dh(this.e, this.rs));
        }
    }
    readE(message, offset = 0) {
        if (this.re) {
            throw new Error('remote ephemeral public key is already set');
        }
        if (message.byteLength < offset + 32) {
            throw new Error('message is not long enough');
        }
        this.re = message.sublist(offset, offset + 32);
        this.ss.mixHash(this.re);
    }
    readS(message, offset = 0) {
        if (this.rs) {
            throw new Error('remote static public key is already set');
        }
        const cipherLength = 32 + (this.ss.cs.hasKey() ? 16 : 0);
        if (message.byteLength < offset + cipherLength) {
            throw new Error('message is not long enough');
        }
        const temp = message.sublist(offset, offset + cipherLength);
        this.rs = this.ss.decryptAndHash(temp);
        return cipherLength;
    }
    readEE() {
        this.writeEE();
    }
    readES() {
        this.writeES();
    }
    readSE() {
        this.writeSE();
    }
}
/**
 * A IHandshakeState that's optimized for the XX pattern
 */
export class XXHandshakeState extends AbstractHandshakeState {
    // e
    writeMessageA(payload) {
        return new Uint8ArrayList(this.writeE(), this.ss.encryptAndHash(payload));
    }
    // e, ee, s, es
    writeMessageB(payload) {
        const e = this.writeE();
        this.writeEE();
        const encS = this.writeS();
        this.writeES();
        return new Uint8ArrayList(e, encS, this.ss.encryptAndHash(payload));
    }
    // s, se
    writeMessageC(payload) {
        const encS = this.writeS();
        this.writeSE();
        return new Uint8ArrayList(encS, this.ss.encryptAndHash(payload));
    }
    // e
    readMessageA(message) {
        try {
            this.readE(message);
            return this.ss.decryptAndHash(message.sublist(32));
        }
        catch (e) {
            throw new InvalidCryptoExchangeError(`handshake stage 0 validation fail: ${e.message}`);
        }
    }
    // e, ee, s, es
    readMessageB(message) {
        try {
            this.readE(message);
            this.readEE();
            const consumed = this.readS(message, 32);
            this.readES();
            return this.ss.decryptAndHash(message.sublist(32 + consumed));
        }
        catch (e) {
            throw new InvalidCryptoExchangeError(`handshake stage 1 validation fail: ${e.message}`);
        }
    }
    // s, se
    readMessageC(message) {
        try {
            const consumed = this.readS(message);
            this.readSE();
            return this.ss.decryptAndHash(message.sublist(consumed));
        }
        catch (e) {
            throw new InvalidCryptoExchangeError(`handshake stage 2 validation fail: ${e.message}`);
        }
    }
}
function hashProtocolName(crypto, protocolName) {
    if (protocolName.length <= 32) {
        const h = uint8ArrayAlloc(32);
        h.set(protocolName);
        return h;
    }
    else {
        return crypto.hash(protocolName);
    }
}
//# sourceMappingURL=protocol.js.map