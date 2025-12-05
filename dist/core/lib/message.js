export { WfMessage };
import v1 from '../static/v1/wf-msg-structure.json' with { type: 'json' };
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
const MSG = compileMsgStructure();
class WfMessage {
    MetaHeader;
    MessageHeader;
    MessageBody;
    constructor(wfMsgType, wfVersion = 1) {
        this.MetaHeader = {};
        this.MessageHeader = {};
        this.MessageBody = {};
        for (const fieldName of Object.keys(MSG[wfMsgType][wfVersion].header)) {
            this.MessageHeader[fieldName] = '';
        }
        this.MessageHeader.Version = wfVersion.toString();
        this.MessageHeader.MessageCode = wfMsgType;
        for (const fieldName of Object.keys(MSG[wfMsgType][wfVersion].body)) {
            this.MessageBody[fieldName] = '';
        }
    }
    static fromObject(wfMessage) {
        return new WfMessage(wfMessage?.MessageHeader?.MessageCode, wfMessage?.MessageHeader?.Version);
    }
    isValid() { }
    encode() { }
    get() { }
    set() { }
    toObject() { }
    toHex() { }
    toU8a() { }
}
function compileMsgStructure() {
    const SIGNSIGNALTYPE = '$signsignal';
    const msgStructure = {};
    for (const type of Object.values(WfMsgType)) {
        msgStructure[type] = {};
        msgStructure[type][1] = { header: {}, body: {} };
        msgStructure[type][1].header = v1.header;
        if (Object.keys(v1.body[type]).includes(SIGNSIGNALTYPE)) {
            msgStructure[type][1].body = v1.body[SIGNSIGNALTYPE];
        }
        else {
            msgStructure[type][1].body = v1.body[type];
        }
    }
    return msgStructure;
}
