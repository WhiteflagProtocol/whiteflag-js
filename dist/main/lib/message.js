'use strict';
export { WfMessage };
import { WfCoreMessage } from '@whiteflagprotocol/core';
import { u8aToHex } from '@whiteflagprotocol/util';
class WfMessage extends WfCoreMessage {
    meta = {};
    constructor(type, version = '1') {
        super(type, version);
    }
    static async fromJSON(message) {
        const wfMessage = await this.fromObject(JSON.parse(message));
        return wfMessage;
    }
    static async fromHex(message, address, ikm, iv) {
        const wfMessage = await super.fromHex(message, address, ikm, iv);
        if (address)
            wfMessage.setMeta('originatorAddress', address);
        if (iv)
            wfMessage.setMeta('encryptionInitVector', iv);
        return wfMessage;
    }
    static async fromU8a(message, address, ikm, iv) {
        const wfMessage = await super.fromU8a(message, address, ikm, iv);
        if (address)
            wfMessage.setMeta('originatorAddress', u8aToHex(address));
        if (iv)
            wfMessage.setMeta('encryptionInitVector', u8aToHex(iv));
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
