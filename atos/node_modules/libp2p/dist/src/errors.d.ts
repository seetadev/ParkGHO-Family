export declare enum messages {
    NOT_STARTED_YET = "The libp2p node is not started yet",
    NOT_FOUND = "Not found"
}
export declare class MissingServiceError extends Error {
    constructor(message?: string);
}
export declare class UnmetServiceDependenciesError extends Error {
    constructor(message?: string);
}
export declare class NoContentRoutersError extends Error {
    constructor(message?: string);
}
export declare class NoPeerRoutersError extends Error {
    constructor(message?: string);
}
export declare class QueriedForSelfError extends Error {
    constructor(message?: string);
}
export declare class UnhandledProtocolError extends Error {
    constructor(message?: string);
}
export declare class DuplicateProtocolHandlerError extends Error {
    constructor(message?: string);
}
export declare class DialDeniedError extends Error {
    constructor(message?: string);
}
export declare class UnsupportedListenAddressError extends Error {
    constructor(message?: string);
}
export declare class UnsupportedListenAddressesError extends Error {
    constructor(message?: string);
}
export declare class NoValidAddressesError extends Error {
    constructor(message?: string);
}
export declare class ConnectionInterceptedError extends Error {
    constructor(message?: string);
}
export declare class ConnectionDeniedError extends Error {
    constructor(message?: string);
}
export declare class MuxerUnavailableError extends Error {
    constructor(message?: string);
}
export declare class EncryptionFailedError extends Error {
    constructor(message?: string);
}
export declare class TransportUnavailableError extends Error {
    constructor(message?: string);
}
export declare class RecursionLimitError extends Error {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map