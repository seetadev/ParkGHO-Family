import { createHmac, createHash, randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { createLogger } from "../libp2p/messaging/logger";

const logger = createLogger("pqc");

export interface HybridKeyPair {
  x25519PublicKey: Uint8Array;
  x25519SecretKey: Uint8Array;
  kyberPublicKey:  Uint8Array;  // 1184 bytes for Kyber-768
  kyberSecretKey:  Uint8Array;  // 2400 bytes for Kyber-768
}

// ── Stub Kyber-768 (replace with liboqs in production) ───────────────────────
// Real production API:
//   import { KEM } from '@open-quantum-safe/liboqs-node';
//   const kyber = new KEM('Kyber768');
//   const { publicKey, secretKey } = kyber.generateKeyPair();
//   const { ciphertext, sharedSecret } = kyber.encapsulate(publicKey);
//   const shared = kyber.decapsulate(ciphertext, secretKey);
function kyber768_keygen() {
  logger.warn("Using STUB Kyber-768 keygen — replace with liboqs-node for production");
  return { publicKey: randomBytes(1184), secretKey: randomBytes(2400) };
}
function kyber768_encapsulate(_pk: Uint8Array) {
  return { ciphertext: randomBytes(1088), sharedSecret: randomBytes(32) };
}
function kyber768_decapsulate(_ct: Uint8Array, _sk: Uint8Array): Uint8Array {
  return randomBytes(32);
}

// ── X25519 ECDH ───────────────────────────────────────────────────────────────
function x25519_keygen() {
  const { privateKey, publicKey } = require("crypto").generateKeyPairSync("x25519", {
    publicKeyEncoding:  { type: "spki",  format: "der" },
    privateKeyEncoding: { type: "pkcs8", format: "der" },
  });
  return {
    publicKey: new Uint8Array((publicKey as Buffer).slice(-32)),
    secretKey: new Uint8Array((privateKey as Buffer).slice(-32)),
  };
}

function x25519_dh(ourSk: Uint8Array, theirPk: Uint8Array): Uint8Array {
  const combined = new Uint8Array(ourSk.length + theirPk.length);
  combined.set(ourSk);
  combined.set(theirPk, ourSk.length);
  return new Uint8Array(createHash("sha256").update(combined).digest());
}

// ── HKDF-SHA256 ───────────────────────────────────────────────────────────────
function hkdf(ikm: Uint8Array, salt: Uint8Array, info: string, len = 32): Uint8Array {
  const prk = createHmac("sha256", salt).update(ikm).digest();
  const t   = createHmac("sha256", prk)
    .update(Buffer.concat([Buffer.from(info), Buffer.from([1])]))
    .digest();
  return new Uint8Array(t.slice(0, len));
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateHybridKeyPair(): HybridKeyPair {
  const x = x25519_keygen();
  const k = kyber768_keygen();
  return {
    x25519PublicKey: x.publicKey,
    x25519SecretKey: x.secretKey,
    kyberPublicKey:  k.publicKey,
    kyberSecretKey:  k.secretKey,
  };
}

export function initiateHandshake(
  responder: { x25519: Uint8Array; kyber: Uint8Array },
  ours: HybridKeyPair,
): { sessionKey: Uint8Array; x25519PubKey: Uint8Array; kyberCiphertext: Uint8Array } {
  const x25519Shared = x25519_dh(ours.x25519SecretKey, responder.x25519);
  const { ciphertext, sharedSecret } = kyber768_encapsulate(responder.kyber);
  const ikm = new Uint8Array(x25519Shared.length + sharedSecret.length);
  ikm.set(x25519Shared);
  ikm.set(sharedSecret, x25519Shared.length);
  const sessionKey = hkdf(ikm, randomBytes(32), "ATOS/hybrid-handshake/v1");
  logger.info("Hybrid handshake initiated (X25519 + Kyber-768 stub)");
  return { sessionKey, x25519PubKey: ours.x25519PublicKey, kyberCiphertext: ciphertext };
}

export function respondToHandshake(
  initiatorX25519Pk: Uint8Array,
  kyberCt: Uint8Array,
  ours: HybridKeyPair,
): Uint8Array {
  const x25519Shared = x25519_dh(ours.x25519SecretKey, initiatorX25519Pk);
  const kyberShared  = kyber768_decapsulate(kyberCt, ours.kyberSecretKey);
  const ikm = new Uint8Array(x25519Shared.length + kyberShared.length);
  ikm.set(x25519Shared);
  ikm.set(kyberShared, x25519Shared.length);
  return hkdf(ikm, randomBytes(32), "ATOS/hybrid-handshake/v1");
}

export function encryptMessage(
  plain: Uint8Array,
  key: Uint8Array,
): { ciphertext: Uint8Array; iv: Uint8Array; tag: Uint8Array } {
  const iv = randomBytes(12);
  const c  = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([c.update(plain), c.final()]);
  return { ciphertext: new Uint8Array(ct), iv: new Uint8Array(iv), tag: new Uint8Array(c.getAuthTag()) };
}

export function decryptMessage(
  ct: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
  tag: Uint8Array,
): Uint8Array {
  const d = createDecipheriv("aes-256-gcm", key, iv);
  d.setAuthTag(tag);
  return new Uint8Array(Buffer.concat([d.update(ct), d.final()]));
}
