/**
 * @module core/errors
 * @summary Whiteflag JS core error classes
 * @document docs/md/errors.md
 */
export { WfProtocolError, WfErrorCode, catchedError };
/**
 * Error class for Whiteflag protocol and message errors
 * @class ProtocolError
 * @extends {DomainError}
 */
declare class WfProtocolError extends Error {
    /** The Whiteflag protocol error code */
    code: string;
    /** Underlying causes of the error */
    causes: string[];
    /**
     * Constructor for protocol errors
     * @param message a human readable error message
     * @param causes underlying errors causing this error
     * @param code constant identifying the error
     */
    constructor(message: string, causes: any, code?: WfErrorCode);
}
/**
 * Defines Whiteflag protocol errors
 * @enum WfErrorCode
 */
declare enum WfErrorCode {
    /** Generic Whiteflag protocol error */
    PROTOCOL = "WF_PROTOCOL_ERROR",
    /** Incorrect or missingWhiteflag message meta data */
    METAHEADER = "WF_METAHEADER_ERROR",
    /** Whiteflag message format error */
    FORMAT = "WF_FORMAT_ERROR",
    /** Whiteflag message reference error */
    REFERENCE = "WF_REFERENCE_ERROR",
    /** Whiteflag message authentication error */
    AUTHENTICATION = "WF_AUTH_ERROR",
    /** Whiteflag signature error */
    SIGNATURE = "WF_SIGN_ERROR",
    /** Whiteflag encryption error */
    ENCRYPTION = "WF_ENCRYPTION_ERROR"
}
/**
 * Processes a catched error in a type safe manner
 * @param msg a generic message to use if no specific error message
 * @param err the error to handle
 * @returns a new error object
 */
declare function catchedError(msg?: string, err?: any): WfProtocolError;
