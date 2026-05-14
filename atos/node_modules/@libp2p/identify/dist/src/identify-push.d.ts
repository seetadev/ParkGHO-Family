import { serviceCapabilities } from '@libp2p/interface';
import { AbstractIdentify } from './utils.ts';
import type { IdentifyPush as IdentifyPushInterface, IdentifyPushComponents, IdentifyPushInit } from './index.ts';
import type { Stream, Startable, Connection } from '@libp2p/interface';
export declare class IdentifyPush extends AbstractIdentify implements Startable, IdentifyPushInterface {
    private readonly connectionManager;
    private readonly concurrency;
    private _push;
    constructor(components: IdentifyPushComponents, init?: IdentifyPushInit);
    [serviceCapabilities]: string[];
    /**
     * Calls `push` on all peer connections
     */
    push(): Promise<void>;
    private sendPushMessage;
    /**
     * Reads the Identify Push message from the given `connection`
     */
    handleProtocol(stream: Stream, connection: Connection): Promise<void>;
}
//# sourceMappingURL=identify-push.d.ts.map