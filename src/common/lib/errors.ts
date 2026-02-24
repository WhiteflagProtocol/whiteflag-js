'use strict';
/**
 * @module common/errors
 * @summary Whiteflag JS common error module
 */
export {
    WfError,
    WfErrorCode,
    handleError
};

/* MODULE DECLARATIONS */
/**
 * Error class for Whiteflag errors
 * @class WfError
 * @extends Error
 */
class WfError extends Error {
    /* CLASS PROPERTIES */
    
    /** The Whiteflag protocol error code */
    public code: string;
    /** Underlying causes of the error */
    public causes: string[];

    /**
     * Constructor for protocol errors
     * @param message a human readable error message
     * @param causes underlying errors causing this error
     * @param code the code identifying the Whiteflag error type
     */
    constructor(message: string, causes: Error | Array<string> | string | null, code: WfErrorCode = WfErrorCode.GENERIC) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;

        /* Process causes */
        this.causes = [];
        if (Array.isArray(causes)) this.causes = causes;
        if (causes instanceof Error) this.causes = [ causes.message ];
        if (typeof causes === 'string') this.causes = [ causes ];
    }
}
/**
 * Defines Whiteflag protocol error types
 * @enum WfErrorCode
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

/* MODULE FUNCTIONS */
/**
 * Handles a catched error as a Whiteflag error in a type safe manner
 * @param err the catched error to handle
 * @param message a new error message
 * @param code the code identifying the Whiteflag error type
 * @throws a new error object
 */
function handleError(err: any, message?: string, code?: WfErrorCode): any {
    let causes: string[] = [];

    switch (true) {
        case err instanceof EvalError:
        case err instanceof ReferenceError:
        case err instanceof SyntaxError: {
            /* Fundamental errors are thrown as is */
            throw err;
        }
        case err instanceof AggregateError: {
            /* Each error is added as a cause */
            if (!message) message = err.message;
            err.errors.forEach(error => {
                causes.push(error.message);
            });
            break;
        }
        case err instanceof WfError: {
            /* Just take over causes and code if none specified */
            causes = err.causes;
            if (!code) code = err.code as WfErrorCode;
            /* Fallthrough */
        }
        case err instanceof Error:
            /* If error message specified, add old one to causes */
            if (message) {
                causes.push(err.message);
                message = `${message}: ${err.message}`
            } else {
                message = err.message;
            }
            break;
        default:
            if (!message) message = 'Invalid Error object thrown';
            throw new Error(message);
    }
    throw new WfError(message, causes, code);
}
