import type { Codec, DecodeOptions } from 'protons-runtime';
import type { Uint8ArrayList } from 'uint8arraylist';
export interface Identify {
    protocolVersion?: string;
    agentVersion?: string;
    publicKey?: Uint8Array;
    listenAddrs: Uint8Array[];
    observedAddr?: Uint8Array;
    protocols: string[];
    signedPeerRecord?: Uint8Array;
}
export declare namespace Identify {
    const codec: () => Codec<Identify>;
    interface IdentifyProtocolVersionFieldEvent {
        field: '$.protocolVersion';
        value: string;
    }
    interface IdentifyAgentVersionFieldEvent {
        field: '$.agentVersion';
        value: string;
    }
    interface IdentifyPublicKeyFieldEvent {
        field: '$.publicKey';
        value: Uint8Array;
    }
    interface IdentifyListenAddrsFieldEvent {
        field: '$.listenAddrs[]';
        index: number;
        value: Uint8Array;
    }
    interface IdentifyObservedAddrFieldEvent {
        field: '$.observedAddr';
        value: Uint8Array;
    }
    interface IdentifyProtocolsFieldEvent {
        field: '$.protocols[]';
        index: number;
        value: string;
    }
    interface IdentifySignedPeerRecordFieldEvent {
        field: '$.signedPeerRecord';
        value: Uint8Array;
    }
    function encode(obj: Partial<Identify>): Uint8Array;
    function decode(buf: Uint8Array | Uint8ArrayList, opts?: DecodeOptions<Identify>): Identify;
    function stream(buf: Uint8Array | Uint8ArrayList, opts?: DecodeOptions<Identify>): Generator<IdentifyProtocolVersionFieldEvent | IdentifyAgentVersionFieldEvent | IdentifyPublicKeyFieldEvent | IdentifyListenAddrsFieldEvent | IdentifyObservedAddrFieldEvent | IdentifyProtocolsFieldEvent | IdentifySignedPeerRecordFieldEvent>;
}
//# sourceMappingURL=message.d.ts.map