'use strict';
/**
 * @module common/errors
 * @summary Whiteflag JS common error module
 */
export {
    WfErrorCode,
    WfProtocolError,
    WfRuntimeError,
    handleError,
    noNumber,
    noString
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
    #code: string;
    /** Underlying causes of the error */
    #causes: string[] = [];

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
        this.#code = code;
        this.#causes = processReasons(reasons);
    }

    /* PUBLIC PROPERTY GETTERS */
    /**
     * Returns the protocol error code as a property
     */
    get code(): string {
        return this.#code;
    }
    /**
     * Returns causes of the error as a property
     */
    get causes(): string[] {
        return [...this.#causes];
    }
}
/**
 * Error class for Whiteflag JS runtime errors
 * @extends Error
 * @remarks This error class is used in cases where the Whiteflag JS is
 * incorrectly used. This is usually an indication of a programming error
 * that requires further debugging. An example is an underlying `TypeError`
 * or invalid configuration data.
 */
class WfRuntimeError extends Error {
    /* CLASS PROPERTIES */
    /** Underlying causes of the error */
    #causes: string[] = [];
    
    /**
     * Constructs Whiteflag JS runtime errors
     * @param message a human readable error message
     * @param reasons underlying error(s) causing this error
     */
    constructor(message: string, reasons?: Error | Array<string> | string | null) {
        /* Call parent constructor and set properties */
        if (reasons && reasons instanceof Error) {
            super(message, { cause: reasons });
        } else {
            super(message);
        }
        this.name = this.constructor.name;
        this.#causes = processReasons(reasons);
    }

    /* PUBLIC PROPERTY GETTERS */
    /**
     * Returns causes of the error as a property
     */
    get causes(): string[] {
        return [...this.#causes];
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
function handleError(err: unknown, msg?: string, code?: WfErrorCode): any {
    /* Check error */
    let message = 'Unspecified error occured';
    if (err instanceof Error) message = err.message
    if (msg) message = `${msg}: ${message}`;

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
            code ??= err.code as WfErrorCode;
            throw new WfProtocolError(message, reasons, code);
        }
        case err instanceof Error: {
            /* Throw new error with updated message */
            throw new WfRuntimeError(message, err);
        }
        default: {
            /* Unspecified error occured */
            throw new WfRuntimeError(message);
        }
    }
}
/**
 * Throws a reference error for missing a numeric parameter as a result of a coding error
 * @param descr description of the missing parameter
 * @throws a reference error
 * @remarks To be used where a value might be optional in one case,
 * but required in another, e.g.: `let nr = params?.nr || noNumber()`
 */
function noNumber(descr?: string): number {
    if (descr) throw new ReferenceError(`Missing parameter of type number: ${descr}`);
    throw new ReferenceError('Missing parameter of type number');
}
/**
 * Throws a reference error for missing a string parameter as a result of a coding error
 * @param descr description of the missing parameter
 * @throws a reference error
 * @remarks To be used where a value might be optional in one case,
 * but required in another, e.g.: `let str = params?.str || noString()`
 */
function noString(descr?: string): string {
    if (descr) throw new ReferenceError(`Missing parameter of type string: ${descr}`);
    throw new ReferenceError('Missing parameter of type string');
}

/* PRIVATE MODULE FUNCTIONS */
/**
 * Puts error reasons in a string array
 * @private
 * @param reasons underlying error(s) causing this error
 * @returns a string array with the reasons
 */
function processReasons(reasons?: Error | Array<string> | string | null) : string[] {
    if (!reasons) return [];
    if (Array.isArray(reasons)) return reasons;
    if (reasons instanceof Error) return [ reasons.message ];
    if (typeof reasons === 'string') return [ reasons ];
    return [];
}
