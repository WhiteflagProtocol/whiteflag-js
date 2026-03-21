'use strict';
export { WfErrorCode, WfProtocolError, WfRuntimeError, handleError };
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
class WfProtocolError extends Error {
    code;
    causes = [];
    constructor(message, reasons, code = WfErrorCode.GENERIC) {
        if (reasons && reasons instanceof Error) {
            super(message, { cause: reasons });
        }
        else {
            super(message);
        }
        this.name = this.constructor.name;
        this.code = code;
        if (Array.isArray(reasons))
            this.causes = reasons;
        if (reasons instanceof Error)
            this.causes = [reasons.message];
        if (typeof reasons === 'string')
            this.causes = [reasons];
    }
}
class WfRuntimeError extends Error {
    constructor(message, reason) {
        if (reason && reason instanceof Error) {
            super(message, { cause: reason });
        }
        else {
            super(message);
        }
        this.name = this.constructor.name;
    }
}
function handleError(err, msg, code) {
    let message;
    if (msg) {
        message = `${msg}: ${err?.message}`;
    }
    else {
        message = err?.message || 'Unspecified error occured';
    }
    switch (true) {
        case err instanceof EvalError:
        case err instanceof ReferenceError:
        case err instanceof SyntaxError: {
            throw err;
        }
        case err instanceof WfProtocolError: {
            let reasons = err.causes;
            if (msg)
                reasons.push(err.message);
            if (!code)
                code = err.code;
            throw new WfProtocolError(message, reasons, code);
        }
        case err instanceof Error: {
            throw new WfRuntimeError(message, err);
        }
        default: {
            if (!message)
                message = 'Unspecified error occured';
            throw new WfRuntimeError(message);
        }
    }
}
