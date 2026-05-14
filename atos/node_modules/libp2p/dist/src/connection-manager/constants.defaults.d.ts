/**
 * @see https://libp2p.github.io/js-libp2p/interfaces/libp2p.index.ConnectionManagerInit.html#dialTimeout
 */
export declare const DIAL_TIMEOUT = 10000;
/**
 * @see https://libp2p.github.io/js-libp2p/interfaces/libp2p.index.ConnectionManagerInit.html#addressDialTimeout
 */
export declare const ADDRESS_DIAL_TIMEOUT = 6000;
/**
 * @see https://libp2p.github.io/js-libp2p/interfaces/libp2p.index.ConnectionManagerInit.html#connectionCloseTimeout
 */
export declare const CONNECTION_CLOSE_TIMEOUT = 1000;
/**
 * @see https://libp2p.github.io/js-libp2p/interfaces/libp2p.index.ConnectionManagerInit.html#inboundUpgradeTimeout
 */
export declare const INBOUND_UPGRADE_TIMEOUT = 10000;
/**
 * @see https://libp2p.github.io/js-libp2p/interfaces/libp2p.index.ConnectionManagerInit.html#inboundStreamProtocolNegotiationTimeout
 * @see https://libp2p.github.io/js-libp2p/interfaces/libp2p.index.ConnectionManagerInit.html#outboundStreamProtocolNegotiationTimeout
 */
export declare const PROTOCOL_NEGOTIATION_TIMEOUT = 10000;
/**
 * @see https://libp2p.github.io/js-libp2p/interfaces/libp2p.index.ConnectionManagerInit.html#maxPeerAddrsToDial
 */
export declare const MAX_PEER_ADDRS_TO_DIAL = 25;
/**
 * @see https://libp2p.github.io/js-libp2p/interfaces/libp2p.index.ConnectionManagerInit.html#inboundConnectionThreshold
 */
export declare const INBOUND_CONNECTION_THRESHOLD = 5;
/**
 * @see https://libp2p.github.io/js-libp2p/interfaces/libp2p.index.ConnectionManagerInit.html#maxIncomingPendingConnections
 */
export declare const MAX_INCOMING_PENDING_CONNECTIONS = 10;
/**
 * @see https://libp2p.github.io/js-libp2p/interfaces/libp2p.index.ConnectionManagerInit.html#maxParallelReconnects
 */
export declare const MAX_PARALLEL_RECONNECTS = 5;
/**
 * Store as part of the peer store metadata for a given peer, the value for this
 * key is a timestamp of the last time a dial attempt failed with the timestamp
 * stored as a string.
 *
 * Used to insure we do not endlessly try to auto dial peers we have recently
 * failed to dial.
 */
export declare const LAST_DIAL_FAILURE_KEY = "last-dial-failure";
/**
 * Store as part of the peer store metadata for a given peer, the value for this
 * key is a timestamp of the last time a dial attempt succeeded with the
 * timestamp stored as a string.
 */
export declare const LAST_DIAL_SUCCESS_KEY = "last-dial-success";
/**
 * @see https://libp2p.github.io/js-libp2p/interfaces/libp2p.index.ConnectionManagerInit.html#maxDialQueueLength
 */
export declare const MAX_DIAL_QUEUE_LENGTH = 500;
/**
 * @see https://github.com/libp2p/js-libp2p/blob/main/packages/libp2p/src/connection-manager/resolvers/index.ts
 */
export declare const MAX_RECURSIVE_DEPTH = 32;
//# sourceMappingURL=constants.defaults.d.ts.map