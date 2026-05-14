import { Uint8ArrayList } from 'uint8arraylist';
import { NoiseHandshakePayload } from './proto/payload.js';
import type { MetricsRegistry } from './metrics.ts';
import type { NoiseExtensions } from './proto/payload.js';
import type { HandshakeResult } from './types.ts';
import type { MessageStream, PrivateKey, PublicKey } from '@libp2p/interface';
export declare function createHandshakePayload(privateKey: PrivateKey, staticPublicKey: Uint8Array | Uint8ArrayList, extensions?: NoiseExtensions): Promise<Uint8Array | Uint8ArrayList>;
export declare function decodeHandshakePayload(payloadBytes: Uint8Array | Uint8ArrayList, remoteStaticKey?: Uint8Array | Uint8ArrayList, remoteIdentityKey?: PublicKey): Promise<NoiseHandshakePayload>;
export declare function getSignaturePayload(publicKey: Uint8Array | Uint8ArrayList): Uint8Array | Uint8ArrayList;
export declare function toMessageStream(connection: MessageStream, handshake: HandshakeResult, metrics?: MetricsRegistry): MessageStream;
//# sourceMappingURL=utils.d.ts.map