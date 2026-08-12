/**
 * @module common/errors
 * @summary Whiteflag JS common error module
 */
export { WfErrorCode, WfProtocolError, WfRuntimeError, handleError, noNumber, noString };
/**
 * Defines Whiteflag protocol error types
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
 * Error class for Whiteflag protocol exception
 * @extends Error
 * @remarks This error class is used in cases where the provided data or some
 * other external event does not comply with the Whiteflag specification. This
 * is ususually a situation caused by wrong or missing data, or invalid data
 * from the blockchain. It should be handled by the application.
 */
declare class WfProtocolError extends Error {
    #private;
    /**
     * Constructs Whiteflag protocol errors
     * @param message a human readable error message
     * @param reasons underlying error(s) causing this error
     * @param code the code identifying the Whiteflag error type
     */
    constructor(message: string, reasons?: Error | Array<string> | string | null, code?: WfErrorCode);
    /**
     * Returns the protocol error code as a property
     */
    get code(): string;
    /**
     * Returns causes of the error as a property
     */
    get causes(): string[];
}
/**
 * Error class for Whiteflag JS runtime errors
 * @extends Error
 * @remarks This error class is used in cases where the Whiteflag JS is
 * incorrectly used. This is usually an indication of a programming error
 * that requires further debugging. An example is an underlying `TypeError`
 * or invalid configuration data.
 */
declare class WfRuntimeError extends Error {
    #private;
    /**
     * Constructs Whiteflag JS runtime errors
     * @param message a human readable error message
     * @param reasons underlying error(s) causing this error
     */
    constructor(message: string, reasons?: Error | Array<string> | string | null);
    /**
     * Returns causes of the error as a property
     */
    get causes(): string[];
}
/**
 * Handles a catched error as a Whiteflag error in a type safe manner
 * @param err the catched error to handle
 * @param msg a new error message
 * @param code the code identifying the Whiteflag error type
 * @throws a new error object
 */
declare function handleError(err: unknown, msg?: string, code?: WfErrorCode): any;
/**
 * Throws a reference error for missing a numeric parameter as a result of a coding error
 * @param descr description of the missing parameter
 * @throws a reference error
 * @remarks To be used where a value might be optional in one case,
 * but required in another, e.g.: `let nr = params?.nr || noNumber()`
 */
declare function noNumber(descr?: string): number;
/**
 * Throws a reference error for missing a string parameter as a result of a coding error
 * @param descr description of the missing parameter
 * @throws a reference error
 * @remarks To be used where a value might be optional in one case,
 * but required in another, e.g.: `let str = params?.str || noString()`
 */
declare function noString(descr?: string): string;
