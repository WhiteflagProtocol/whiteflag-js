'use strict';
var _a;
export { WfCoreMessage, isValidMessage, validateMessage, encryptMessage, decryptMessage };
import { WfVersion, WfMsgType, WfCryptoMethod, WfProtocolError, WfErrorCode, WfRuntimeError } from '@whiteflagprotocol/common';
import { BinaryBuffer, DataItem, isObject, isString, objectHasNot, deepCopy } from '@whiteflagprotocol/util';
import { encryptMsg, decryptMsg, deriveKey } from '@whiteflagprotocol/crypto';
import { decodeField, encodeField, isValidValue } from "./codec.js";
import msgSpec_v1 from '../static/v1/wf-msg-structure.json' with { type: 'json' };
const EMPTYSTR = '';
export const WFMSG_PREFIX = 'WF';
export const WFMSG_NOENCRYPT = '0';
const MSGSPEC = compileMsgSpec();
class WfCoreMessage extends DataItem {
    #data;
    #header;
    #body;
    #version = WfVersion.v1;
    #type;
    #binary = BinaryBuffer.empty();
    #final = false;
    constructor(data, binary, id, ddat = Symbol('WfCoreMessage')) {
        super(data, id, ddat);
        this.#data = super.getDataReference(ddat);
        if (binary)
            this.#binary = binary;
        this.#header = this.#data.MessageHeader;
        this.#body = this.#data.MessageBody;
        this.#type = this.#data.MessageHeader['MessageCode'];
        this.#version = this.#data.MessageHeader['Version'];
    }
    static create(msgType, version = WfVersion.v1) {
        const data = {
            MessageHeader: this.generateHeader(msgType, version),
            MessageBody: this.generateBody(msgType, version)
        };
        return new this(data);
    }
    static fromObject(message) {
        const errors = validateMessage(message);
        if (errors.length > 0)
            throw new WfProtocolError('Invalid message', errors, WfErrorCode.FORMAT);
        const wfMessage = this.create(message.MessageHeader['MessageCode'], message.MessageHeader['Version']);
        wfMessage.setHeader(message.MessageHeader);
        wfMessage.setBody(message.MessageBody);
        return wfMessage;
    }
    static fromBinary(message) {
        const header = this.extractHeader(message);
        const data = {
            MessageHeader: header,
            MessageBody: this.generateBody(WfMsgType.unknown, header['version'])
        };
        return new this(data, message);
    }
    static extractHeader(message) {
        const { prefix, version, encryption } = extractUnencryptedHeader(message);
        if (!checkPrefix(prefix)) {
            throw new WfProtocolError(`Message has no ${WFMSG_PREFIX} prefix`, null, WfErrorCode.FORMAT);
        }
        if (!checkVersion(version)) {
            throw new WfProtocolError(`Undefined protocol version: ${version}`, null, WfErrorCode.FORMAT);
        }
        if (!checkEncryption(encryption)) {
            throw new WfProtocolError(`Undefined encryption method: ${encryption}`, null, WfErrorCode.ENCRYPTION);
        }
        const header = this.generateHeader(WfMsgType.unknown, version);
        header['Prefix'] = prefix;
        header['Version'] = version;
        header['EncryptionIndicator'] = encryption;
        return header;
    }
    static generateHeader(msgType, version = WfVersion.v1) {
        let header = Object.create(null);
        for (const field of Object.keys(MSGSPEC[msgType][version].header)) {
            header[field] = EMPTYSTR;
        }
        header['Prefix'] = WFMSG_PREFIX;
        header['Version'] = version;
        header['MessageCode'] = msgType;
        return header;
    }
    static generateBody(msgType, version = WfVersion.v1, testMsg = false) {
        let body = Object.create(null);
        if (testMsg)
            body['PseudoMessageCode'] = msgType;
        for (const field of Object.keys(MSGSPEC[msgType][version].body)) {
            body[field] = EMPTYSTR;
        }
        return body;
    }
    isFinal() {
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
        return checkMsgSegments(this.#header, this.#body);
    }
    async encode(account, ikm, iv) {
        if (!this.#final) {
            const errors = this.validate();
            if (errors.length > 0) {
                throw new WfProtocolError('Cannot encode message', errors, WfErrorCode.FORMAT);
            }
            await this.#encodeHeader();
            await this.#encodeBody();
            if (this.#header['EncryptionIndicator'] !== WFMSG_NOENCRYPT) {
                if (!ikm)
                    throw new WfRuntimeError('Missing encryption key');
                if (!account)
                    throw new WfRuntimeError('Missing originator account');
                await this.#encrypt(account, ikm, iv);
            }
            this.#final = true;
        }
        return this;
    }
    async decode(account, ikm, iv) {
        if (this.#final)
            return this;
        if (this.#binary.length === 0)
            throw new WfRuntimeError(`No binary message to decode`);
        let buffer;
        if (this.#header['EncryptionIndicator'] === WFMSG_NOENCRYPT) {
            buffer = this.#binary;
        }
        else {
            if (!ikm)
                throw new WfRuntimeError('Missing encryption key');
            if (!account)
                throw new WfRuntimeError('Missing originator account');
            buffer = await this.#decrypt(account, ikm, iv);
        }
        let errors = [];
        errors.push(...await this.#decodeHeader(buffer));
        errors.push(...await this.#decodeBody(buffer));
        if (errors.length === 0)
            errors = this.validate();
        if (errors.length > 0) {
            throw new WfProtocolError(`Cannot decode ${this.#type} message`, errors, WfErrorCode.FORMAT);
        }
        this.#final = true;
        return this;
    }
    get(fieldName) {
        return this.getHeaderField(fieldName) || this.getBodyField(fieldName) || null;
    }
    set(fieldName, value) {
        if (this.#final)
            return false;
        if (this.setHeaderField(fieldName, value))
            return true;
        if (this.setBodyField(fieldName, value))
            return true;
        return false;
    }
    getHeader() {
        return deepCopy(this.#header);
    }
    setHeader(header) {
        for (const [field, value] of Object.entries(header)) {
            if (!this.setHeaderField(field, value)) {
                throw new WfProtocolError(`Header field ${field} could not be set`, null, WfErrorCode.FORMAT);
            }
        }
        return true;
    }
    getBody() {
        return deepCopy(this.#body);
    }
    setBody(body) {
        for (const [field, value] of Object.entries(body)) {
            if (!this.setBodyField(field, value)) {
                throw new WfProtocolError(`Body field ${field} could not be set`, null, WfErrorCode.FORMAT);
            }
        }
        return true;
    }
    getHeaderField(fieldName) {
        for (const field of Object.keys(this.#header)) {
            if (field === fieldName)
                return this.#header[field];
        }
        return null;
    }
    setHeaderField(fieldName, value) {
        if (this.#final)
            return false;
        for (const field of Object.keys(this.#header)) {
            if (field === fieldName) {
                if (field === 'Prefix' && value !== WFMSG_PREFIX)
                    return false;
                if (field === 'Version' && value !== this.#header[field])
                    return false;
                if (field === 'MessageCode') {
                    if (this.#type === WfMsgType.unknown) {
                        this.#setType(value);
                    }
                    else if (value !== this.#header[field])
                        return false;
                }
                this.#header[field] = value;
                return true;
            }
        }
        return false;
    }
    getBodyField(fieldName) {
        for (const field of Object.keys(this.#body)) {
            if (field === fieldName)
                return this.#body[field];
        }
        return null;
    }
    setBodyField(fieldName, value) {
        if (this.#final)
            return false;
        for (const field of Object.keys(this.#body)) {
            if (field === fieldName) {
                if (field === 'PseudoMessageCode') {
                    this.#replaceBody(value, true);
                }
                else {
                    this.#body[field] = value;
                }
                return true;
            }
        }
        return false;
    }
    toString() {
        let messageStr = EMPTYSTR;
        if (this.isValid()) {
            for (const field of Object.keys(this.#header)) {
                messageStr += this.#header[field];
            }
            for (const field of Object.keys(this.#body)) {
                messageStr += this.#body[field];
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
    #setType(type) {
        if (this.#type !== WfMsgType.unknown) {
            throw new WfRuntimeError('Message type already set');
        }
        this.#type = type;
        this.#replaceBody(type, false);
    }
    async #encodeHeader() {
        for (const field of Object.keys(this.#header)) {
            const encoding = MSGSPEC[this.#type][this.#version].header[field].encoding;
            this.#binary.append(encodeField(this.#header[field], encoding, this.#version));
        }
    }
    async #decodeHeader(buffer) {
        let errors = [];
        for (const field of Object.keys(MSGSPEC[this.#type][this.#version].header)) {
            if (!this.setHeaderField(field, decodeHeaderField(buffer, field, this.#type, this.#version))) {
                errors.push(`Header field ${field} could not be set`);
            }
        }
        return errors;
    }
    async #encodeBody() {
        let msgType = this.#type;
        const body = this.#body;
        for (const field of Object.keys(body)) {
            const encoding = MSGSPEC[msgType][this.#version].body[field].encoding;
            this.#binary.append(encodeField(body[field], encoding, this.#version));
            if (field === 'PseudoMessageCode')
                msgType = body[field];
        }
    }
    async #decodeBody(buffer) {
        let errors = [];
        let msgType = this.#type;
        let msgSpec = MSGSPEC[this.#type][this.#version];
        let offset = 0;
        if (msgType === WfMsgType.T) {
            const field = 'PseudoMessageCode';
            if (this.setBodyField(field, decodeBodyField(buffer, field, msgType, offset, this.#version))) {
                const fieldSpec = msgSpec.body[field];
                offset = fieldSpec.endBit - fieldSpec.startBit;
                msgType = this.#body[field];
            }
            else {
                errors.push(`Body field ${field} could not be decoded`);
            }
        }
        msgSpec = MSGSPEC[msgType][this.#version];
        for (const field of Object.keys(msgSpec.body)) {
            if (!this.setBodyField(field, decodeBodyField(buffer, field, msgType, offset, this.#version))) {
                errors.push(`Body field ${field} could not be decoded`);
            }
        }
        return errors;
    }
    #replaceBody(type, testMsg = false) {
        Object.keys(this.#body).forEach(field => delete this.#body[field]);
        Object.assign(this.#body, _a.generateBody(type, this.#version, testMsg));
    }
    async #encrypt(account, ikm, iv) {
        this.#binary = await encryptMessage(this.#binary, this.#header['EncryptionIndicator'], ikm, account.getBinAddress(), iv, this.#header['Version']);
    }
    async #decrypt(account, ikm, iv) {
        return decryptMessage(this.#binary, this.#header['EncryptionIndicator'], ikm, account.getBinAddress(), iv, this.#header['Version']);
    }
}
_a = WfCoreMessage;
function isValidMessage(message) {
    if (validateMessage(message).length > 0)
        return false;
    return true;
}
function validateMessage(message) {
    if (!isObject(message))
        throw new TypeError('Invalid message object');
    if (message instanceof WfCoreMessage)
        return message.validate();
    let errors = [];
    if (!isObject(message.MessageHeader)) {
        errors.push('Missing or invalid message header');
    }
    if (!isObject(message.MessageBody)) {
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
        if (segSpec[field].pattern) {
            segSpec[field].regex = new RegExp(segSpec[field].pattern);
        }
    }
    return segSpec;
}
function decodeHeaderField(message, field, msgType, version = WfVersion.v1) {
    const msgSpec = MSGSPEC[msgType][version];
    return decodeField(message.extract(msgSpec.header[field].startBit, msgSpec.header[field].endBit), msgSpec.header[field].encoding);
}
function decodeBodyField(message, field, msgType, bitOffset = 0, version = WfVersion.v1) {
    const msgSpec = MSGSPEC[msgType][version];
    return decodeField(message.extract(msgSpec.body[field].startBit + bitOffset, msgSpec.body[field].endBit + bitOffset), msgSpec.body[field].encoding);
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
        if (objectHasNot(segment, field)) {
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
        if (segSpec[field].regex instanceof RegExp) {
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
        if (method === WFMSG_NOENCRYPT)
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
    if (prefix === WFMSG_PREFIX)
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
