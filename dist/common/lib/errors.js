'use strict';
export { WfError, WfErrorCode, handleError };
class WfError extends Error {
    code;
    causes;
    constructor(message, causes, code = WfErrorCode.GENERIC) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.causes = [];
        if (Array.isArray(causes))
            this.causes = causes;
        if (causes instanceof Error)
            this.causes = [causes.message];
        if (typeof causes === 'string')
            this.causes = [causes];
    }
}
var WfErrorCode;
(function (WfErrorCode) {
    WfErrorCode["GENERIC"] = "WF_GENERIC_ERROR";
    WfErrorCode["PROTOCOL"] = "WF_PROTOCOL_ERROR";
    WfErrorCode["ACCOUNT"] = "WF_ACCOUNT_ERROR";
    WfErrorCode["METAHEADER"] = "WF_METAHEADER_ERROR";
    WfErrorCode["FORMAT"] = "WF_FORMAT_ERROR";
    WfErrorCode["REFERENCE"] = "WF_REFERENCE_ERROR";
    WfErrorCode["AUTHENTICATION"] = "WF_AUTH_ERROR";
    WfErrorCode["SIGNATURE"] = "WF_SIGN_ERROR";
    WfErrorCode["ENCRYPTION"] = "WF_ENCRYPTION_ERROR";
})(WfErrorCode || (WfErrorCode = {}));
function handleError(err, message, code) {
    let causes = [];
    switch (true) {
        case err instanceof EvalError:
        case err instanceof ReferenceError:
        case err instanceof SyntaxError: {
            throw err;
        }
        case err instanceof AggregateError: {
            if (!message)
                message = err.message;
            err.errors.forEach(error => {
                causes.push(error.message);
            });
            break;
        }
        case err instanceof WfError: {
            causes = err.causes;
            if (!code)
                code = err.code;
        }
        case err instanceof Error:
            if (message) {
                causes.push(err.message);
                message = `${message}: ${err.message}`;
            }
            else {
                message = err.message;
            }
            break;
        default:
            if (!message)
                message = 'Invalid Error object thrown';
            throw new Error(message);
    }
    throw new WfError(message, causes, code);
}
