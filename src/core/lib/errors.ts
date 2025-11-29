/**
 * @module core/errors
 * @summary Whiteflag JS error classes
 * @document docs/md/errors.md
 */
export { WfProtocolError };

/* MODULE DECLARATIONS */
/**
 * Error class for Whiteflag protocol and message errors
 * @class ProtocolError
 * @extends {DomainError}
 */
class WfProtocolError extends Error {
    /**
     * @property {string} code The Whiteflag protocol error code
     */
    code: string;

    /**
     * @property {Array} causes Underlying causes of the error
     */
    causes: string[];

    /**
     * Constructor for protocol errors
     * @param {string} message a human readable error message
     * @param {Array} causes underlying errors causing this error
     * @param {WfErrorCode} code constant identifying the error
     */
    constructor(message: string, causes: string[], code: WfErrorCode = WfErrorCode.PROTOCOL) {
        super(message);
        this.name = 'ProtocolError';
        this.code = code;
        if (Array.isArray(causes)) {
            this.causes = causes;
        } else {
            this.causes = [ causes ];
        }
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