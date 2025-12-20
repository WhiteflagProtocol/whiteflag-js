'use strict';
export { WfMsgType, WfCoreMessage, isValidMessage, validateMessage, encryptMessage, decryptMessage };
import { WfCryptoMethod, encrypt, decrypt, deriveKey } from '@whiteflag/crypto';
import { BinaryBuffer, hexToU8a, isString } from '@whiteflag/util';
import { WfVersion } from "./versions.js";
import { WfProtocolError, WfErrorCode } from "./errors.js";
import { decodeField, encodeField, isValidValue } from "./codec.js";
import msgSpec_v1 from '../static/v1/wf-msg-structure.json' with { type: 'json' };
const EMPTYPSTRING = '';
const MSG_PREFIX = 'WF';
const MSG_NOENCRYPT = '0';
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
const MSGSPEC = compileMsgSpec();
class WfCoreMessage {
    type;
    version = WfVersion.v1;
    header = {};
    body = {};
    binary = BinaryBuffer.empty();
    final = false;
    constructor(type, version = WfVersion.v1, binary) {
        this.type = type;
        this.version = version;
        this.header = this.generateHeader();
        this.body = this.generateBody();
        if (binary instanceof BinaryBuffer)
            this.binary = binary;
    }
    static async fromBinary(message, ikm, address, iv) {
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
            if (!address)
                throw new Error('Missing orginator address');
            buffer = await decryptMessage(message, encryption, ikm, address, iv, version);
        }
        let type = extractHeaderField(buffer, 'MessageCode');
        if (!checkType(type)) {
            throw new WfProtocolError(`Undefined message type: ${type}`, null, WfErrorCode.FORMAT);
        }
        const wfMessage = new this(type, version, message);
        return wfMessage.decode(buffer);
    }
    static async fromObject(message) {
        const errors = validateMessage(message);
        if (errors.length > 0)
            throw new WfProtocolError('Invalid message', errors, WfErrorCode.FORMAT);
        const header = message.MessageHeader;
        const body = message.MessageBody;
        const wfMessage = new this(header['MessageCode'], header['Version']);
        for (const field of Object.keys(header)) {
            if (!wfMessage.set(field, header[field])) {
                throw new WfProtocolError(`Header field ${field} could not be set`, null, WfErrorCode.FORMAT);
            }
        }
        for (const field of Object.keys(body)) {
            if (!wfMessage.set(field, body[field])) {
                throw new WfProtocolError(`Body field ${field} could not be set`, null, WfErrorCode.FORMAT);
            }
        }
        return wfMessage;
    }
    static async fromHex(message, ikm, address, iv) {
        if (ikm && address && iv) {
            return this.fromBinary(BinaryBuffer.fromHex(message), hexToU8a(ikm), hexToU8a(address), hexToU8a(iv));
        }
        return this.fromBinary(BinaryBuffer.fromHex(message));
    }
    static async fromU8a(message, ikm, address, iv) {
        return this.fromBinary(BinaryBuffer.fromU8a(message), ikm, address, iv);
    }
    isEncoded() {
        if (this.final)
            return true;
        return false;
    }
    isValid() {
        if (this.validate().length > 0)
            return false;
        return true;
    }
    validate() {
        return checkMsgSegments(this.header, this.body);
    }
    async decode(message) {
        if (!this.final) {
            let errors = [];
            let msgSpec = MSGSPEC[this.type][this.version];
            for (const field of Object.keys(msgSpec.header)) {
                if (!this.set(field, this.decodeHeaderField(message, field))) {
                    errors.push(`Header field ${field} could not be set`);
                }
            }
            let type = this.type;
            let offset = 0;
            if (type === WfMsgType.T) {
                const field = 'PseudoMessageCode';
                if (this.set(field, this.decodeBodyField(message, field))) {
                    const fieldSpec = MSGSPEC[type][this.version].body[field];
                    offset = fieldSpec.endBit - fieldSpec.startBit;
                    type = this.body[field];
                }
                else {
                    errors.push(`Body field ${field} could not be set`);
                }
            }
            msgSpec = MSGSPEC[type][this.version];
            for (const field of Object.keys(msgSpec.body)) {
                if (!this.set(field, this.decodeBodyField(message, field, type, offset))) {
                    errors.push(`Body field ${field} could not be set`);
                }
            }
            if (errors.length === 0)
                errors = this.validate();
            if (errors.length > 0) {
                throw new WfProtocolError(`Cannot decode ${this.type} message`, errors, WfErrorCode.FORMAT);
            }
            this.final = true;
        }
        return this;
    }
    async encode(ikm, address, iv) {
        if (!this.final) {
            const errors = this.validate();
            if (errors.length > 0) {
                throw new WfProtocolError('Cannot encode message', errors, WfErrorCode.FORMAT);
            }
            for (const field of Object.keys(this.header)) {
                const encoding = MSGSPEC[this.type][this.version].header[field].encoding;
                this.binary.append(encodeField(this.header[field], encoding, this.version));
            }
            let type = this.type;
            for (const field of Object.keys(this.body)) {
                const encoding = MSGSPEC[type][this.version].body[field].encoding;
                this.binary.append(encodeField(this.body[field], encoding, this.version));
                if (field === 'PseudoMessageCode')
                    type = this.body[field];
            }
            if (this.header['EncryptionIndicator'] !== MSG_NOENCRYPT) {
                if (!ikm)
                    throw new Error('Missing encryption key');
                if (!address)
                    throw new Error('Missing orginator address');
                this.binary = await encryptMessage(this.binary, this.header['EncryptionIndicator'], ikm, address, iv, this.header['Version']);
            }
            this.final = true;
        }
        return this;
    }
    get(fieldName) {
        for (const field of Object.keys(this.header)) {
            if (field === fieldName)
                return this.header[field];
        }
        for (const field of Object.keys(this.body)) {
            if (field === fieldName)
                return this.body[field];
        }
        return null;
    }
    set(fieldName, value) {
        if (this.final)
            return false;
        for (const field of Object.keys(this.header)) {
            if (field === fieldName) {
                if (field === 'Prefix' && value !== MSG_PREFIX)
                    return false;
                if (field === 'Version' && value !== this.header[field])
                    return false;
                if (field === 'MessageCode' && value !== this.header[field])
                    return false;
                this.header[field] = value;
                return true;
            }
        }
        for (const field of Object.keys(this.body)) {
            if (field === fieldName) {
                if (field === 'PseudoMessageCode') {
                    this.body = this.generateBody(value);
                }
                else {
                    this.body[field] = value;
                }
                return true;
            }
        }
        return false;
    }
    toObject() {
        return {
            MessageHeader: this.header,
            MessageBody: this.body
        };
    }
    toString() {
        let messageStr = EMPTYPSTRING;
        if (this.isValid()) {
            for (const field of Object.keys(this.header)) {
                messageStr += this.header[field];
            }
            for (const field of Object.keys(this.body)) {
                messageStr += this.body[field];
            }
        }
        return messageStr;
    }
    toHex() {
        if (this.final)
            return this.binary.toHex();
        return EMPTYPSTRING;
    }
    toU8a() {
        if (this.final)
            return this.binary.toU8a();
        return new Uint8Array(0);
    }
    generateHeader() {
        let header = {};
        for (const field of Object.keys(MSGSPEC[this.type][this.version].header)) {
            header[field] = EMPTYPSTRING;
        }
        header['Prefix'] = MSG_PREFIX;
        header['Version'] = this.version;
        header['MessageCode'] = this.type;
        return header;
    }
    decodeHeaderField(message, field) {
        const msgSpec = MSGSPEC[this.type][this.version];
        return decodeField(message.extract(msgSpec.header[field]?.startBit, msgSpec.header[field]?.endBit), msgSpec.header[field]?.encoding);
    }
    generateBody(pseudoType) {
        let body = {};
        let type = this.type;
        if (checkType(pseudoType)) {
            body['PseudoMessageCode'] = pseudoType;
            type = pseudoType;
        }
        for (const field of Object.keys(MSGSPEC[type][this.version].body)) {
            body[field] = EMPTYPSTRING;
        }
        return body;
    }
    decodeBodyField(message, field, type = this.type, bitOffset = 0) {
        const msgSpec = MSGSPEC[type][this.version];
        return decodeField(message.extract(msgSpec.body[field]?.startBit + bitOffset, msgSpec.body[field]?.endBit + bitOffset), msgSpec.body[field]?.encoding);
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
    const encrypted = await encrypt(decrypted, method, key, iv, version);
    return mergeEncryptedMsg(unencrypted, encrypted);
}
async function decryptMessage(message, method, ikm, address, iv, version = WfVersion.v1) {
    const { unencrypted, encrypted } = splitEncryptedMsg(message);
    const key = await deriveKey(ikm, method, address, version);
    const decrypted = await decrypt(encrypted, method, key, iv, version);
    return mergeEncryptedMsg(unencrypted, decrypted);
}
function compileMsgSpec() {
    const SIGNSIGNALTYPE = '$signsignal';
    const msgSpec = {};
    for (const type of Object.values(WfMsgType)) {
        msgSpec[type] = {};
        {
            const version = WfVersion.v1;
            const headerSpec_v1 = compileMsgSpecRegex(msgSpec_v1.header);
            const signsignalSpec_v1 = compileMsgSpecRegex(msgSpec_v1.body[SIGNSIGNALTYPE]);
            msgSpec[type][version] = { header: {}, body: {} };
            msgSpec[type][version].header = headerSpec_v1;
            if (SIGNSIGNALTYPE in msgSpec_v1.body[type]) {
                msgSpec[type][version].body = signsignalSpec_v1;
            }
            else {
                msgSpec[type][version].body = compileMsgSpecRegex(msgSpec_v1.body[type]);
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
function checkMsgHeader(header, type, version = WfVersion.v1) {
    return checkFields(header, MSGSPEC[type][version].header, version);
}
function checkMsgBody(body, type, version = WfVersion.v1) {
    return checkFields(body, MSGSPEC[type][version].body, version);
}
function checkFields(segment, segSpec, version = WfVersion.v1) {
    let errors = [];
    for (const field of Object.keys(segSpec)) {
        if (!Object.hasOwn(segment, field)) {
            errors.push(`Missing ${field} field`);
            continue;
        }
        if (segSpec[field].encoding === EMPTYPSTRING) {
            continue;
        }
        if (segment[field] === EMPTYPSTRING) {
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
function checkType(type) {
    if (type === undefined)
        return false;
    if (isString(type)
        && Object.keys(WfMsgType).includes(type))
        return true;
    if (Object.values(WfMsgType).includes(type))
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
