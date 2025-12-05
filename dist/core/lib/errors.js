export { WfProtocolError, WfErrorCode };
class WfProtocolError extends Error {
    code;
    causes;
    constructor(message, causes, code = WfErrorCode.PROTOCOL) {
        super(message);
        this.name = 'ProtocolError';
        this.code = code;
        if (Array.isArray(causes)) {
            this.causes = causes;
        }
        else {
            this.causes = [causes];
        }
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
