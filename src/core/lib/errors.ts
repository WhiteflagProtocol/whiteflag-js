/**
 * @module core/errors
 * @summary Whiteflag JS error classes
 * @document docs/md/errors.md
 */
export {
    WfProtocolError,
    WfErrorCode
};

/* MODULE DECLARATIONS */
/**
 * Error class for Whiteflag protocol and message errors
 * @class ProtocolError
 * @extends {DomainError}
 */
class WfProtocolError extends Error {
    /**
     * @property code The Whiteflag protocol error code
     */
    public code: string;

    /**
     * @property causes Underlying causes of the error
     */
    public causes: string[];

    /**
     * Constructor for protocol errors
     * @param message a human readable error message
     * @param causes underlying errors causing this error
     * @param code constant identifying the error
     */
    constructor(message: string, causes: any, code: WfErrorCode = WfErrorCode.PROTOCOL) {
        super(message);
        this.name = 'WfProtocolError';
        this.code = code;

        /* Process causes */
        this.causes = [];
        if (Array.isArray(causes)) this.causes = causes;
        if (causes instanceof Error) this.causes = [ causes.message ];
        if (typeof causes === 'string') this.causes = [ causes ];
    }
}
/**
 * Defines Whiteflag protocol errors
 * @enum WfErrorCode
 */
enum WfErrorCode {
    /**
     * Generic Whiteflag protocol error
     */
    PROTOCOL = 'WF_PROTOCOL_ERROR',
    /**
     * Incorrect or missingWhiteflag message meta data
     */
    METAHEADER = 'WF_METAHEADER_ERROR',
    /**
     * Whiteflag message format error
     */
    FORMAT = 'WF_FORMAT_ERROR',
    /**
     * Whiteflag message reference error
     */
    REFERENCE = 'WF_REFERENCE_ERROR',
    /**
     * Whiteflag message authentication error
     */
    AUTHENTICATION =  'WF_AUTH_ERROR',
    /**
     * Whiteflag signature error
     */
    SIGNATURE =   'WF_SIGN_ERROR',
    /**
     * Whiteflag encryption error
     */
    ENCRYPTION = 'WF_ENCRYPTION_ERROR'
}
