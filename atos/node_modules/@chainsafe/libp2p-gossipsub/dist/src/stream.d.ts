import type { Stream } from '@libp2p/interface';
import type { Uint8ArrayList } from 'uint8arraylist';
interface OutboundStreamOpts {
    /** Max size in bytes for pushable buffer. If full, will throw on .push */
    maxBufferSize?: number;
}
interface InboundStreamOpts {
    /** Max size in bytes for reading messages from the stream */
    maxDataLength?: number;
}
export declare class OutboundStream {
    private readonly rawStream;
    private readonly pushable;
    private readonly closeController;
    private readonly maxBufferSize;
    constructor(rawStream: Stream, errCallback: (e: Error) => void, opts: OutboundStreamOpts);
    get protocol(): string;
    push(data: Uint8Array): void;
    /**
     * Same to push() but this is prefixed data so no need to encode length prefixed again
     */
    pushPrefixed(data: Uint8ArrayList): void;
    close(): Promise<void>;
}
export declare class InboundStream {
    readonly source: AsyncIterable<Uint8ArrayList>;
    private readonly rawStream;
    private readonly closeController;
    constructor(rawStream: Stream, opts?: InboundStreamOpts);
    close(): Promise<void>;
}
export {};
//# sourceMappingURL=stream.d.ts.map