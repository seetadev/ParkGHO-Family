import type { Codec, DecodeOptions } from 'protons-runtime';
import type { Uint8ArrayList } from 'uint8arraylist';
export interface NoiseExtensions {
    webtransportCerthashes: Uint8Array[];
    streamMuxers: string[];
}
export declare namespace NoiseExtensions {
    const codec: () => Codec<NoiseExtensions>;
    const encode: (obj: Partial<NoiseExtensions>) => Uint8Array;
    const decode: (buf: Uint8Array | Uint8ArrayList, opts?: DecodeOptions<NoiseExtensions>) => NoiseExtensions;
}
export interface NoiseHandshakePayload {
    identityKey: Uint8Array;
    identitySig: Uint8Array;
    extensions?: NoiseExtensions;
}
export declare namespace NoiseHandshakePayload {
    const codec: () => Codec<NoiseHandshakePayload>;
    const encode: (obj: Partial<NoiseHandshakePayload>) => Uint8Array;
    const decode: (buf: Uint8Array | Uint8ArrayList, opts?: DecodeOptions<NoiseHandshakePayload>) => NoiseHandshakePayload;
}
//# sourceMappingURL=payload.d.ts.map