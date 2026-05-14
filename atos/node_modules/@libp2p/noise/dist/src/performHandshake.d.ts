import type { HandshakeResult, HandshakeParams } from './types.js';
import type { AbortOptions } from '@libp2p/interface';
export declare function performHandshakeInitiator(init: HandshakeParams, options?: AbortOptions): Promise<HandshakeResult>;
export declare function performHandshakeResponder(init: HandshakeParams, options?: AbortOptions): Promise<HandshakeResult>;
//# sourceMappingURL=performHandshake.d.ts.map