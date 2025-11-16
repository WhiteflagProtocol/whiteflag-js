"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WfMessage = void 0;
class WfMessage {
    MetaHeader;
    MessageHeader;
    MessageBody;
    constructor(version) {
        this.MetaHeader = {};
        this.MessageHeader = {};
        this.MessageBody = {};
    }
}
exports.WfMessage = WfMessage;
