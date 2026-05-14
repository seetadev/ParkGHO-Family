import type { ConnectionGater } from '@libp2p/interface';
/**
 * Returns a connection gater that disallows dialling private addresses or
 * insecure websockets by default.
 *
 * Browsers are severely limited in their resource usage so don't waste time
 * trying to dial undialable addresses, and they also print verbose error
 * messages when making connections over insecure transports which causes
 * confusion.
 */
export declare function connectionGater(gater?: ConnectionGater): ConnectionGater;
//# sourceMappingURL=connection-gater.browser.d.ts.map