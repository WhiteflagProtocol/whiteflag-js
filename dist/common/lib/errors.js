'use strict';
export { WfProtocolError, WfErrorCode, catchedError };
class WfProtocolError extends Error {
    code;
    causes;
    constructor(message, causes, code = WfErrorCode.PROTOCOL) {
        super(message);
        this.name = 'WfProtocolError';
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
    WfErrorCode["PROTOCOL"] = "WF_PROTOCOL_ERROR";
    WfErrorCode["METAHEADER"] = "WF_METAHEADER_ERROR";
    WfErrorCode["FORMAT"] = "WF_FORMAT_ERROR";
    WfErrorCode["REFERENCE"] = "WF_REFERENCE_ERROR";
    WfErrorCode["AUTHENTICATION"] = "WF_AUTH_ERROR";
    WfErrorCode["SIGNATURE"] = "WF_SIGN_ERROR";
    WfErrorCode["ENCRYPTION"] = "WF_ENCRYPTION_ERROR";
})(WfErrorCode || (WfErrorCode = {}));
function catchedError(msg = 'Unspecified error', err = new Error('Unspecified error')) {
    let code = WfErrorCode.PROTOCOL;
    let message = msg;
    let causes = [];
    if (err instanceof Error)
        causes = [err.message];
    if (err instanceof WfProtocolError) {
        msg = err.message;
        causes = err.causes;
        code = err.code;
    }
    return new WfProtocolError(message, causes, code);
}
