/**
 * @module core/specs
 * @summary Whiteflag JS protocol specifications
 */
export { WfVersion, WfMsgType, WfCodec };
/**
 * Defines Whiteflag versions
 * @enum WfVersion
 */
declare enum WfVersion {
    v1 = "1"
}
/**
 * Defines Whiteflag message types
 * @enum WfFieldType
 * @wfver v1-draft.7
 */
declare enum WfMsgType {
    A = "A",
    K = "K",
    T = "T",
    P = "P",
    D = "D",
    S = "S",
    E = "E",
    I = "I",
    M = "M",
    Q = "Q",
    R = "R",
    F = "F"
}
/**
 * Defines Whiteflag field codecs
 * @enum WfCodec
 * @wfver v1-draft.7
 */
declare enum WfCodec {
    BIN = "binary",
    DEC = "decimal",
    HEX = "hexadecimal",
    UTF8 = "utf-8",
    DATETIME = "datetime",
    DURATION = "duration",
    LAT = "latitude",
    LONG = "longitude"
}
