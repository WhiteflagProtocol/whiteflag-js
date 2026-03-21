'use strict';
/**
 * @module common/errors
 * @summary Whiteflag JS common error module
 */
export {
    WfErrorCode,
    WfProtocolError,
    WfRuntimeError,
    handleError
};

/* MODULE DECLARATIONS */
/**
 * Defines Whiteflag protocol error types
 */
enum WfErrorCode {
    /** Generic Whiteflag error */
    GENERIC = 'WF_GENERIC_ERROR',
    /** Generic Whiteflag protocol error */
    PROTOCOL = 'WF_PROTOCOL_ERROR',
    /** Whiteflag account error */
    ACCOUNT = 'WF_ACCOUNT_ERROR',
    /** Incorrect or missing Whiteflag message meta data */
    METAHEADER = 'WF_METAHEADER_ERROR',
    /** Whiteflag message format error */
    FORMAT = 'WF_FORMAT_ERROR',
    /** Whiteflag message reference error */
    REFERENCE = 'WF_REFERENCE_ERROR',
    /** Whiteflag authentication error */
    AUTHENTICATION =  'WF_AUTH_ERROR',
    /** Whiteflag signature error */
    SIGNATURE =   'WF_SIGN_ERROR',
    /** Whiteflag encryption error */
    ENCRYPTION = 'WF_ENCRYPTION_ERROR'
}
/**
 * Error class for Whiteflag protocol exception
 * @extends Error
 * @remarks This error class is used in cases where the provided data or some
 * other external event does not comply with the Whiteflag specification. This
 * is ususually a situation caused by wrong or missing data, or invalid data
 * from the blockchain. It should be handled by the application.
 */
class WfProtocolError extends Error {
    /* CLASS PROPERTIES */
    /** The Whiteflag protocol error code */
    public code: string;
    /** Underlying causes of the error */
    public causes: string[] = [];

    /**
     * Constructs Whiteflag protocol errors
     * @param message a human readable error message
     * @param reasons underlying error(s) causing this error
     * @param code the code identifying the Whiteflag error type
     */
    constructor(message: string, reasons?: Error | Array<string> | string | null, code: WfErrorCode = WfErrorCode.GENERIC) {
        /* Call parent constructor and set properties */
        if (reasons && reasons instanceof Error) {
            super(message, { cause: reasons });
        } else {
            super(message);
        }
        this.name = this.constructor.name;
        this.code = code;

        /* Process reasons */
        if (Array.isArray(reasons)) this.causes = reasons;
        if (reasons instanceof Error) this.causes = [ reasons.message ];
        if (typeof reasons === 'string') this.causes = [ reasons ];
    }
}
/**
 * Error class for Whiteflag JS runtime errors
 * @extends Error
 * @remarks This error class is used in cases where the Whiteflag JS is
 * incorrectly used. This is usually an indication of a programming error
 * that requires further debugging. An example is an underlying `TypeError`.
 */
class WfRuntimeError extends Error {
    /**
     * Constructs Whiteflag JS runtime errors
     * @param message a human readable error message
     * @param reason underlying error causing this error
     */
    constructor(message: string, reason?: Error) {
        /* Call parent constructor and set properties */
        if (reason && reason instanceof Error) {
            super(message, { cause: reason });
        } else {
            super(message);
        }
        this.name = this.constructor.name;
    }
}

/* MODULE FUNCTIONS */
/**
 * Handles a catched error as a Whiteflag error in a type safe manner
 * @param err the catched error to handle
 * @param msg a new error message
 * @param code the code identifying the Whiteflag error type
 * @throws a new error object
 */
function handleError(err: any, msg?: string, code?: WfErrorCode): any {
    /* Create new error message */
    let message: string;
    if (msg) {
        message = `${msg}: ${err?.message}`
    } else {
        message = err?.message || 'Unspecified error occured';
    }
    /* Handle error according to type */
    switch (true) {
        case err instanceof EvalError:
        case err instanceof ReferenceError:
        case err instanceof SyntaxError: {
            /* Fundamental errors are thrown as is */
            throw err;
        }
        case err instanceof WfProtocolError: {
            /* Throw new error with updated details*/
            let reasons: string[] = err.causes;
            if (msg) reasons.push(err.message);
            if (!code) code = err.code as WfErrorCode;
            throw new WfProtocolError(message, reasons, code);
        }
        case err instanceof Error: {
            /* Throw new error with updated message */
            throw new WfRuntimeError(message, err);
        }
        default: {
            if (!message) message = 'Unspecified error occured';
            throw new WfRuntimeError(message);
        }
    }
}
