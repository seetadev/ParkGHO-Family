import { Uint8ArrayList } from 'uint8arraylist';
import type { FrameHeader } from './frame.js';
export interface Frame {
    header: FrameHeader;
    data?: Uint8ArrayList;
}
export interface DataFrame {
    header: FrameHeader;
    data: Uint8ArrayList;
}
export declare function isDataFrame(frame: Frame): frame is DataFrame;
/**
 * Decode a header from the front of a buffer
 *
 * @param data - Assumed to have enough bytes for a header
 */
export declare function decodeHeader(data: Uint8Array): FrameHeader;
/**
 * Decodes yamux frames from a source
 */
export declare class Decoder {
    /** Buffer for in-progress frames */
    private readonly buffer;
    constructor();
    /**
     * Emits frames from the decoder source.
     *
     * Note: If `readData` is emitted, it _must_ be called before the next iteration
     * Otherwise an error is thrown
     */
    emitFrames(buf: Uint8Array | Uint8ArrayList): Generator<Frame>;
    private readFrame;
}
//# sourceMappingURL=decode.d.ts.map