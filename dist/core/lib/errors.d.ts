export { WfProtocolError };
declare class WfProtocolError extends Error {
    code: string;
    causes: string[];
    constructor(message: string, causes: string[], code?: WfErrorCode);
}
declare enum WfErrorCode {
    PROTOCOL = "WF_PROTOCOL_ERROR",
    METAHEADER = "WF_METAHEADER_ERROR",
    FORMAT = "WF_FORMAT_ERROR",
    REFERENCE = "WF_REFERENCE_ERROR",
    AUTHENTICATION = "WF_AUTH_ERROR",
    SIGNATURE = "WF_SIGN_ERROR",
    ENCRYPTION = "WF_ENCRYPTION_ERROR"
}
