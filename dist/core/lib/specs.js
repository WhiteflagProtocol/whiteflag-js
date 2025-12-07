export { WfVersion, WfMsgType, WfCodec };
var WfVersion;
(function (WfVersion) {
    WfVersion["v1"] = "1";
})(WfVersion || (WfVersion = {}));
var WfMsgType;
(function (WfMsgType) {
    WfMsgType["A"] = "A";
    WfMsgType["K"] = "K";
    WfMsgType["T"] = "T";
    WfMsgType["P"] = "P";
    WfMsgType["D"] = "D";
    WfMsgType["S"] = "S";
    WfMsgType["E"] = "E";
    WfMsgType["I"] = "I";
    WfMsgType["M"] = "M";
    WfMsgType["Q"] = "Q";
    WfMsgType["R"] = "R";
    WfMsgType["F"] = "F";
})(WfMsgType || (WfMsgType = {}));
var WfCodec;
(function (WfCodec) {
    WfCodec["BIN"] = "binary";
    WfCodec["DEC"] = "decimal";
    WfCodec["HEX"] = "hexadecimal";
    WfCodec["UTF8"] = "utf-8";
    WfCodec["DATETIME"] = "datetime";
    WfCodec["DURATION"] = "duration";
    WfCodec["LAT"] = "latitude";
    WfCodec["LONG"] = "longitude";
})(WfCodec || (WfCodec = {}));
