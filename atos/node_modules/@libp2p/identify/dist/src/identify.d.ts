import { serviceCapabilities } from '@libp2p/interface';
import { Identify as IdentifyMessage } from './pb/message.ts';
import { AbstractIdentify } from './utils.ts';
import type { Identify as IdentifyInterface, IdentifyComponents, IdentifyInit } from './index.ts';
import type { IdentifyResult, AbortOptions, Connection, Stream, Startable, NewStreamOptions } from '@libp2p/interface';
export declare class Identify extends AbstractIdentify implements Startable, IdentifyInterface {
    constructor(components: IdentifyComponents, init?: IdentifyInit);
    [serviceCapabilities]: string[];
    _identify(connection: Connection, options?: AbortOptions): Promise<IdentifyMessage>;
    identify(connection: Connection, options?: NewStreamOptions): Promise<IdentifyResult>;
    private maybeAddObservedAddress;
    /**
     * Sends the `Identify` response with the Signed Peer Record
     * to the requesting peer over the given `connection`
     */
    handleProtocol(stream: Stream, connection: Connection): Promise<void>;
}
//# sourceMappingURL=identify.d.ts.map