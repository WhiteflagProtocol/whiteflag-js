'use strict';
export { WfMessage };
import { WfCoreMessage } from '@whiteflag/core';
class WfMessage extends WfCoreMessage {
    meta = {};
    constructor(type, version = '1') {
        super(type, version);
    }
    static async fromJSON(message) {
        const wfMessage = await this.fromObject(JSON.parse(message));
        return wfMessage;
    }
    getMeta(fieldName) {
        for (const field of Object.keys(this.meta)) {
            if (field === fieldName)
                return this.meta[field];
        }
        return null;
    }
    setMeta(fieldName, value) {
        this.meta[fieldName] = value;
        return true;
    }
    toObject() {
        let message = super.toObject();
        message.MetaHeader = this.meta;
        return message;
    }
    toJSON() {
        return JSON.stringify(this.toObject());
    }
}
