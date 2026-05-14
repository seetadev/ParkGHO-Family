export function wrapCrypto(crypto) {
    return {
        generateKeypair: crypto.generateX25519KeyPair,
        dh: (keypair, publicKey) => crypto.generateX25519SharedKey(keypair.privateKey, publicKey).subarray(0, 32),
        encrypt: crypto.chaCha20Poly1305Encrypt,
        decrypt: crypto.chaCha20Poly1305Decrypt,
        hash: crypto.hashSHA256,
        hkdf: crypto.getHKDF
    };
}
//# sourceMappingURL=crypto.js.map