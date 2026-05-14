import { encode, decode } from 'it-length-prefixed';
import { pipe } from 'it-pipe';
import { pushable } from 'it-pushable';
export class OutboundStream {
    rawStream;
    pushable;
    closeController;
    maxBufferSize;
    constructor(rawStream, errCallback, opts) {
        this.rawStream = rawStream;
        this.pushable = pushable();
        this.closeController = new AbortController();
        this.maxBufferSize = opts.maxBufferSize ?? Infinity;
        this.closeController.signal.addEventListener('abort', () => {
            rawStream.close()
                .catch(err => {
                rawStream.abort(err);
            });
        });
        pipe(this.pushable, this.rawStream).catch(errCallback);
    }
    get protocol() {
        // TODO remove this non-nullish assertion after https://github.com/libp2p/js-libp2p-interfaces/pull/265 is incorporated
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.rawStream.protocol;
    }
    push(data) {
        if (this.pushable.readableLength > this.maxBufferSize) {
            throw Error(`OutboundStream buffer full, size > ${this.maxBufferSize}`);
        }
        this.pushable.push(encode.single(data));
    }
    /**
     * Same to push() but this is prefixed data so no need to encode length prefixed again
     */
    pushPrefixed(data) {
        if (this.pushable.readableLength > this.maxBufferSize) {
            throw Error(`OutboundStream buffer full, size > ${this.maxBufferSize}`);
        }
        this.pushable.push(data);
    }
    async close() {
        this.closeController.abort();
        // similar to pushable.end() but clear the internal buffer
        await this.pushable.return();
    }
}
export class InboundStream {
    source;
    rawStream;
    closeController;
    constructor(rawStream, opts = {}) {
        this.rawStream = rawStream;
        this.closeController = new AbortController();
        this.closeController.signal.addEventListener('abort', () => {
            rawStream.close()
                .catch(err => {
                rawStream.abort(err);
            });
        });
        this.source = pipe(this.rawStream, (source) => decode(source, opts));
    }
    async close() {
        this.closeController.abort();
    }
}
//# sourceMappingURL=stream.js.map