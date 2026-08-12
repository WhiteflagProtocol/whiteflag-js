'use strict';
export { WfErrorCode, WfProtocolError, WfRuntimeError, handleError, noNumber, noString };
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
    #code;
    #causes = [];
    constructor(message, reasons, code = WfErrorCode.GENERIC) {
        if (reasons && reasons instanceof Error) {
            super(message, { cause: reasons });
        }
        else {
            super(message);
        }
        this.name = this.constructor.name;
        this.#code = code;
        this.#causes = processReasons(reasons);
    }
    get code() {
        return this.#code;
    }
    get causes() {
        return [...this.#causes];
    }
}
class WfRuntimeError extends Error {
    #causes = [];
    constructor(message, reasons) {
        if (reasons && reasons instanceof Error) {
            super(message, { cause: reasons });
        }
        else {
            super(message);
        }
        this.name = this.constructor.name;
        this.#causes = processReasons(reasons);
    }
    get causes() {
        return [...this.#causes];
    }
}
function handleError(err, msg, code) {
    let message = 'Unspecified error occured';
    if (err instanceof Error)
        message = err.message;
    if (msg)
        message = `${msg}: ${message}`;
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
            code ??= err.code;
            throw new WfProtocolError(message, reasons, code);
        }
        case err instanceof Error: {
            throw new WfRuntimeError(message, err);
        }
        default: {
            throw new WfRuntimeError(message);
        }
    }
}
function noNumber(descr) {
    if (descr)
        throw new ReferenceError(`Missing parameter of type number: ${descr}`);
    throw new ReferenceError('Missing parameter of type number');
}
function noString(descr) {
    if (descr)
        throw new ReferenceError(`Missing parameter of type string: ${descr}`);
    throw new ReferenceError('Missing parameter of type string');
}
function processReasons(reasons) {
    if (!reasons)
        return [];
    if (Array.isArray(reasons))
        return reasons;
    if (reasons instanceof Error)
        return [reasons.message];
    if (typeof reasons === 'string')
        return [reasons];
    return [];
}
