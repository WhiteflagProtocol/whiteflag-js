/**
 * @module common/errors
 * @summary Whiteflag JS common error module
 */
export { WfError, WfErrorCode, handleError };
/**
 * Error class for Whiteflag errors
 * @class WfError
 * @extends Error
 */
declare class WfError extends Error {
    /** The Whiteflag protocol error code */
    code: string;
    /** Underlying causes of the error */
    causes: string[];
    /**
     * Constructor for protocol errors
     * @param message a human readable error message
     * @param causes underlying errors causing this error
     * @param code the code identifying the Whiteflag error type
     */
    constructor(message: string, causes: Error | Array<string> | string | null, code?: WfErrorCode);
}
/**
 * Defines Whiteflag protocol error types
 * @enum WfErrorCode
 */
declare enum WfErrorCode {
    /** Generic Whiteflag error */
    GENERIC = "WF_GENERIC_ERROR",
    /** Generic Whiteflag protocol error */
    PROTOCOL = "WF_PROTOCOL_ERROR",
    /** Whiteflag account error */
    ACCOUNT = "WF_ACCOUNT_ERROR",
    /** Incorrect or missing Whiteflag message meta data */
    METAHEADER = "WF_METAHEADER_ERROR",
    /** Whiteflag message format error */
    FORMAT = "WF_FORMAT_ERROR",
    /** Whiteflag message reference error */
    REFERENCE = "WF_REFERENCE_ERROR",
    /** Whiteflag authentication error */
    AUTHENTICATION = "WF_AUTH_ERROR",
    /** Whiteflag signature error */
    SIGNATURE = "WF_SIGN_ERROR",
    /** Whiteflag encryption error */
    ENCRYPTION = "WF_ENCRYPTION_ERROR"
}
/**
 * Handles a catched error as a Whiteflag error in a type safe manner
 * @param err the catched error to handle
 * @param message a new error message
 * @param code the code identifying the Whiteflag error type
 * @throws a new error object
 */
declare function handleError(err: any, message?: string, code?: WfErrorCode): any;
