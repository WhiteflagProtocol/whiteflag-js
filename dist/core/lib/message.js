'use strict';
export { WfCoreMessage, isValidMessage, validateMessage, encryptMessage, decryptMessage };
import { WfVersion, WfMsgType, WfCryptoMethod, WfProtocolError, WfErrorCode } from '@whiteflagprotocol/common';
import { BinaryBuffer, DataItem, isString } from '@whiteflagprotocol/util';
import { encryptMsg, decryptMsg, deriveKey } from '@whiteflagprotocol/crypto';
import { decodeField, encodeField, isValidValue } from "./codec.js";
import msgSpec_v1 from '../static/v1/wf-msg-structure.json' with { type: 'json' };
const EMPTYSTR = '';
const MSG_PREFIX = 'WF';
const MSG_NOENCRYPT = '0';
const MSGSPEC = compileMsgSpec();
class WfCoreMessage extends DataItem {
    #data;
    #type;
    #version = WfVersion.v1;
    #binary = BinaryBuffer.empty();
    #final = false;
    constructor(data, id, ddat = Symbol('WfCoreMessage')) {
        super(data, id, ddat);
        this.#data = super.getDataReference(ddat);
        this.#type = this.#data?.MessageHeader['MessageCode'];
        this.#version = this.#data?.MessageHeader['Version'];
    }
    static create(msgType, version = WfVersion.v1) {
        const data = {
            MessageHeader: generateHeader(msgType, version),
            MessageBody: generateBody(msgType, version)
        };
        return new WfCoreMessage(data);
    }
    static fromObject(message) {
        const errors = validateMessage(message);
        if (errors.length > 0)
            throw new WfProtocolError('Invalid message', errors, WfErrorCode.FORMAT);
        const header = message.MessageHeader;
        const wfMessage = this.create(header['MessageCode'], header['Version']);
        for (const [field, value] of Object.entries(header)) {
            if (!wfMessage.set(field, value)) {
                throw new WfProtocolError(`Header field ${field} could not be set`, null, WfErrorCode.FORMAT);
            }
        }
        const body = message.MessageBody;
        for (const [field, value] of Object.entries(body)) {
            if (!wfMessage.set(field, value)) {
                throw new WfProtocolError(`Body field ${field} could not be set`, null, WfErrorCode.FORMAT);
            }
        }
        return wfMessage;
    }
    static async fromBinary(message, account, ikm, iv) {
        let buffer = message;
        const { prefix, version, encryption } = extractUnencryptedHeader(buffer);
        if (!checkPrefix(prefix)) {
            throw new WfProtocolError(`Message has no ${MSG_PREFIX} prefix`, null, WfErrorCode.FORMAT);
        }
        if (!checkVersion(version)) {
            throw new WfProtocolError(`Undefined protocol version: ${version}`, null, WfErrorCode.FORMAT);
        }
        if (!checkEncryption(encryption)) {
            throw new WfProtocolError(`Undefined encryption method: ${encryption}`, null, WfErrorCode.ENCRYPTION);
        }
        if (encryption !== MSG_NOENCRYPT) {
            if (!ikm)
                throw new Error('Missing encryption key');
            if (!account)
                throw new Error('Missing originator account');
            const binAddress = await account.getBinAddress();
            buffer = await decryptMessage(message, encryption, ikm, binAddress, iv, version);
        }
        let msgType = extractHeaderField(buffer, 'MessageCode');
        if (!checkType(msgType)) {
            throw new WfProtocolError(`Undefined message type: ${msgType}`, null, WfErrorCode.FORMAT);
        }
        const wfMessage = this.create(msgType, version);
        return wfMessage.decode(buffer);
    }
    isEncoded() {
        if (this.#final)
            return true;
        return false;
    }
    isValid() {
        if (this.validate().length > 0)
            return false;
        return true;
    }
    validate() {
        return checkMsgSegments(this.#data.MessageHeader, this.#data.MessageBody);
    }
    async decode(message) {
        if (!this.#final) {
            let errors = [];
            let msgType = this.#type;
            let msgSpec = MSGSPEC[msgType][this.#version];
            this.#binary = message;
            for (const field of Object.keys(msgSpec.header)) {
                if (!this.set(field, decodeHeaderField(message, field, msgType, this.#version))) {
                    errors.push(`Header field ${field} could not be set`);
                }
            }
            let offset = 0;
            if (msgType === WfMsgType.T) {
                const field = 'PseudoMessageCode';
                if (this.set(field, decodeBodyField(message, field, msgType, offset, this.#version))) {
                    const fieldSpec = msgSpec.body[field];
                    offset = fieldSpec.endBit - fieldSpec.startBit;
                    msgType = this.#data.MessageBody[field];
                }
                else {
                    errors.push(`Body field ${field} could not be set`);
                }
            }
            msgSpec = MSGSPEC[msgType][this.#version];
            for (const field of Object.keys(msgSpec.body)) {
                if (!this.set(field, decodeBodyField(message, field, msgType, offset, this.#version))) {
                    errors.push(`Body field ${field} could not be set`);
                }
            }
            if (errors.length === 0)
                errors = this.validate();
            if (errors.length > 0) {
                throw new WfProtocolError(`Cannot decode ${this.#type} message`, errors, WfErrorCode.FORMAT);
            }
            this.#final = true;
        }
        return this;
    }
    async encode(account, ikm, iv) {
        if (!this.#final) {
            const errors = this.validate();
            if (errors.length > 0) {
                throw new WfProtocolError('Cannot encode message', errors, WfErrorCode.FORMAT);
            }
            const header = this.#data.MessageHeader;
            for (const field of Object.keys(header)) {
                const encoding = MSGSPEC[this.#type][this.#version].header[field].encoding;
                this.#binary.append(encodeField(header[field], encoding, this.#version));
            }
            let msgType = this.#type;
            const body = this.#data.MessageBody;
            for (const field of Object.keys(body)) {
                const encoding = MSGSPEC[msgType][this.#version].body[field].encoding;
                this.#binary.append(encodeField(body[field], encoding, this.#version));
                if (field === 'PseudoMessageCode')
                    msgType = body[field];
            }
            if (header['EncryptionIndicator'] !== MSG_NOENCRYPT) {
                if (!ikm)
                    throw new Error('Missing encryption key');
                if (!account)
                    throw new Error('Missing originator account');
                const binAddress = await account.getBinAddress();
                this.#binary = await encryptMessage(this.#binary, header['EncryptionIndicator'], ikm, binAddress, iv, header['Version']);
            }
            this.#final = true;
        }
        return this;
    }
    get(fieldName) {
        const header = this.#data.MessageHeader;
        for (const field of Object.keys(header)) {
            if (field === fieldName)
                return header[field];
        }
        const body = this.#data.MessageBody;
        for (const field of Object.keys(body)) {
            if (field === fieldName)
                return body[field];
        }
        return null;
    }
    set(fieldName, value) {
        if (this.#final)
            return false;
        const header = this.#data.MessageHeader;
        for (const field of Object.keys(header)) {
            if (field === fieldName) {
                if (field === 'Prefix' && value !== MSG_PREFIX)
                    return false;
                if (field === 'Version' && value !== header[field])
                    return false;
                if (field === 'MessageCode' && value !== header[field])
                    return false;
                header[field] = value;
                return true;
            }
        }
        const body = this.#data.MessageBody;
        for (const field of Object.keys(body)) {
            if (field === fieldName) {
                if (field === 'PseudoMessageCode') {
                    this.#data.MessageBody = generateBody(value, this.#version, true);
                }
                else {
                    body[field] = value;
                }
                return true;
            }
        }
        return false;
    }
    toString() {
        let messageStr = EMPTYSTR;
        if (this.isValid()) {
            const header = this.#data.MessageHeader;
            for (const field of Object.keys(header)) {
                messageStr += header[field];
            }
            const body = this.#data.MessageBody;
            for (const field of Object.keys(body)) {
                messageStr += body[field];
            }
        }
        return messageStr;
    }
    toHex() {
        if (this.#final)
            return this.#binary.toHex();
        return EMPTYSTR;
    }
    toU8a() {
        if (this.#final)
            return this.#binary.toU8a();
        return new Uint8Array(0);
    }
}
function isValidMessage(message) {
    if (validateMessage(message).length > 0)
        return false;
    return true;
}
function validateMessage(message) {
    if (!(message instanceof Object))
        throw new TypeError('Not an object');
    if (message instanceof WfCoreMessage)
        return message.validate();
    let errors = [];
    if (!message?.MessageHeader || !(message?.MessageHeader instanceof Object)) {
        errors.push('Missing or invalid message header');
    }
    if (!message?.MessageBody || !(message?.MessageBody instanceof Object)) {
        errors.push('Missing or invalid message body');
    }
    if (errors.length > 0)
        return errors;
    errors.push(...checkMsgSegments(message.MessageHeader, message.MessageBody));
    return errors;
}
async function encryptMessage(message, method, ikm, address, iv, version = WfVersion.v1) {
    const { unencrypted, encrypted: decrypted } = splitEncryptedMsg(message);
    const key = await deriveKey(ikm, method, address, version);
    const encrypted = await encryptMsg(decrypted, method, key, iv, version);
    return mergeEncryptedMsg(unencrypted, encrypted);
}
async function decryptMessage(message, method, ikm, address, iv, version = WfVersion.v1) {
    const { unencrypted, encrypted } = splitEncryptedMsg(message);
    const key = await deriveKey(ikm, method, address, version);
    const decrypted = await decryptMsg(encrypted, method, key, iv, version);
    return mergeEncryptedMsg(unencrypted, decrypted);
}
function compileMsgSpec() {
    const SIGNSIGNALTYPE = '$signsignal';
    const msgSpec = {};
    for (const msgType of Object.values(WfMsgType)) {
        msgSpec[msgType] = {};
        {
            const version = WfVersion.v1;
            const headerSpec_v1 = compileMsgSpecRegex(msgSpec_v1.header);
            const signsignalSpec_v1 = compileMsgSpecRegex(msgSpec_v1.body[SIGNSIGNALTYPE]);
            msgSpec[msgType][version] = { header: {}, body: {} };
            msgSpec[msgType][version].header = headerSpec_v1;
            if (SIGNSIGNALTYPE in msgSpec_v1.body[msgType]) {
                msgSpec[msgType][version].body = signsignalSpec_v1;
            }
            else {
                msgSpec[msgType][version].body = compileMsgSpecRegex(msgSpec_v1.body[msgType]);
            }
        }
    }
    return msgSpec;
}
function compileMsgSpecRegex(segSpec) {
    for (const field of Object.keys(segSpec)) {
        if (segSpec[field]?.pattern) {
            segSpec[field].regex = new RegExp(segSpec[field].pattern);
        }
    }
    return segSpec;
}
function generateHeader(msgType, version = WfVersion.v1) {
    let header = Object.create(null);
    for (const field of Object.keys(MSGSPEC[msgType][version].header)) {
        header[field] = EMPTYSTR;
    }
    header['Prefix'] = MSG_PREFIX;
    header['Version'] = version;
    header['MessageCode'] = msgType;
    return header;
}
function decodeHeaderField(message, field, msgType, version = WfVersion.v1) {
    const msgSpec = MSGSPEC[msgType][version];
    return decodeField(message.extract(msgSpec.header[field]?.startBit, msgSpec.header[field]?.endBit), msgSpec.header[field]?.encoding);
}
function generateBody(msgType, version = WfVersion.v1, testMsg = false) {
    let body = Object.create(null);
    if (testMsg)
        body['PseudoMessageCode'] = msgType;
    for (const field of Object.keys(MSGSPEC[msgType][version].body)) {
        body[field] = EMPTYSTR;
    }
    return body;
}
function decodeBodyField(message, field, msgType, bitOffset = 0, version = WfVersion.v1) {
    const msgSpec = MSGSPEC[msgType][version];
    return decodeField(message.extract(msgSpec.body[field]?.startBit + bitOffset, msgSpec.body[field]?.endBit + bitOffset), msgSpec.body[field]?.encoding);
}
function checkMsgSegments(header, body) {
    let errors = [];
    if (!('Version' in header))
        errors.push('Missing protocol version');
    if (!('MessageCode' in header))
        errors.push('Missing message type code');
    if (errors.length > 0)
        return errors;
    errors.push(...checkMsgHeader(header, header['MessageCode'], header['Version']));
    errors.push(...checkMsgBody(body, header['MessageCode'], header['Version']));
    return errors;
}
function checkMsgHeader(header, msgType, version = WfVersion.v1) {
    return checkFields(header, MSGSPEC[msgType][version].header, version);
}
function checkMsgBody(body, msgType, version = WfVersion.v1) {
    return checkFields(body, MSGSPEC[msgType][version].body, version);
}
function checkFields(segment, segSpec, version = WfVersion.v1) {
    let errors = [];
    for (const field of Object.keys(segSpec)) {
        if (!Object.hasOwn(segment, field)) {
            errors.push(`Missing ${field} field`);
            continue;
        }
        if (segSpec[field].encoding === EMPTYSTR) {
            continue;
        }
        if (segment[field] === EMPTYSTR) {
            errors.push(`${field} field has no value`);
            continue;
        }
        if (segSpec[field]?.regex instanceof RegExp) {
            if (!segSpec[field].regex.test(segment[field])) {
                errors.push(`Value of ${field} field does not match ${segSpec[field].pattern} pattern`);
            }
            continue;
        }
        const encoding = segSpec[field].encoding;
        if (!isValidValue(segment[field], encoding, version)) {
            errors.push(`Value of ${field} field is not valid for ${encoding} encoding`);
        }
    }
    return errors;
}
function checkEncryption(method) {
    if (method === undefined)
        return false;
    if (isString(method)) {
        if (method === MSG_NOENCRYPT)
            return true;
        if (Object.keys(WfCryptoMethod).includes(method))
            return true;
    }
    if (Object.values(WfCryptoMethod).includes(method))
        return true;
    return false;
}
function checkPrefix(prefix) {
    if (prefix === undefined)
        return false;
    if (prefix === MSG_PREFIX)
        return true;
    return false;
}
function checkType(msgType) {
    if (msgType === undefined)
        return false;
    if (isString(msgType)
        && Object.keys(WfMsgType).includes(msgType))
        return true;
    if (Object.values(WfMsgType).includes(msgType))
        return true;
    return false;
}
function checkVersion(version) {
    if (version === undefined)
        return false;
    if (isString(version)
        && Object.keys(WfVersion).includes(version))
        return true;
    if (Object.values(WfVersion).includes(version))
        return true;
    return false;
}
function extractUnencryptedHeader(message) {
    return {
        prefix: extractHeaderField(message, 'Prefix'),
        version: extractHeaderField(message, 'Version'),
        encryption: extractHeaderField(message, 'EncryptionIndicator')
    };
}
function extractHeaderField(message, field) {
    const fieldSpec = MSGSPEC[WfMsgType.A][WfVersion.v1].header[field];
    return decodeField(message.extract(fieldSpec.startBit, fieldSpec.endBit), fieldSpec.encoding);
}
function splitEncryptedMsg(message) {
    const split = MSGSPEC[WfMsgType.A][WfVersion.v1].header['EncryptionIndicator'].endBit;
    return {
        unencrypted: message.extract(0, split).toU8a(),
        encrypted: message.extract(split, message.length).toU8a()
    };
}
function mergeEncryptedMsg(unenecrypted, encrypted) {
    const split = MSGSPEC[WfMsgType.A][WfVersion.v1].header['EncryptionIndicator'].endBit;
    return BinaryBuffer
        .fromU8a(unenecrypted, split)
        .appendU8a(encrypted);
}
