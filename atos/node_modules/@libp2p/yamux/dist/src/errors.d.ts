import { GoAwayCode } from './frame.ts';
export declare class ProtocolError extends Error {
    static name: string;
    reason: GoAwayCode;
    constructor(message: string, reason: GoAwayCode);
}
export declare function isProtocolError(err?: any): err is ProtocolError;
export declare class InvalidFrameError extends ProtocolError {
    static name: string;
    constructor(message?: string);
}
export declare class UnRequestedPingError extends ProtocolError {
    static name: string;
    constructor(message?: string);
}
export declare class NotMatchingPingError extends ProtocolError {
    static name: string;
    constructor(message?: string);
}
export declare class InvalidStateError extends Error {
    static name: string;
    constructor(message?: string);
}
export declare class StreamAlreadyExistsError extends ProtocolError {
    static name: string;
    constructor(message?: string);
}
export declare class DecodeInvalidVersionError extends ProtocolError {
    static name: string;
    constructor(message?: string);
}
export declare class BothClientsError extends ProtocolError {
    static name: string;
    constructor(message?: string);
}
export declare class ReceiveWindowExceededError extends ProtocolError {
    static name: string;
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map