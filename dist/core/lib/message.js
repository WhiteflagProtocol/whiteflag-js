export { WfCoreMessage, isValidMessage, validateMessage };
import { BinaryBuffer } from '@whiteflag/util';
import { WfVersion, WfMsgType } from "./specs.js";
import { WfProtocolError, WfErrorCode } from "./errors.js";
import { decodeField, encodeField, isValidValue } from "./codec.js";
import v1 from '../static/v1/wf-msg-structure.json' with { type: 'json' };
const EMPTYPSTRING = '';
const VSTARTBIT = v1.header.Version.startBit;
const VENDBIT = v1.header.Version.endBit;
const VCODEC = v1.header.Version.encoding;
const TSTARTBIT = v1.header.MessageCode.startBit;
const TENDBIT = v1.header.MessageCode.endBit;
const TCODEC = v1.header.MessageCode.encoding;
const MSGSPEC = compileMsgSpec();
class WfCoreMessage {
    type;
    version = WfVersion.v1;
    header = {};
    body = {};
    binary = BinaryBuffer.empty();
    final = false;
    constructor(type, version = WfVersion.v1) {
        this.type = type;
        this.version = version;
        this.header = this.generateHeader();
        this.body = this.generateBody();
    }
    static fromBinary(message) {
        let type;
        let version;
        try {
            type = WfCoreMessage.checkType(decodeField(message.extract(TSTARTBIT, TENDBIT), TCODEC)),
                version = WfCoreMessage.checkVersion(decodeField(message.extract(VSTARTBIT, VENDBIT), VCODEC));
        }
        catch (err) {
            throw handleError(err, 'Cannot decode message');
        }
        return new WfCoreMessage(type, version).decode(message);
    }
    static fromObject(message) {
        const errors = validateMessage(message);
        if (errors.length > 0)
            throw new WfProtocolError('Invalid message', errors, WfErrorCode.FORMAT);
        ;
        let wfMessage = new WfCoreMessage(message.MessageHeader.MessageCode, message.MessageHeader.Version);
        for (const field of Object.keys(message.MessageHeader)) {
            if (!wfMessage.set(field, message.MessageHeader[field])) {
                throw new WfProtocolError(`Header field ${field} could not be set`, null, WfErrorCode.FORMAT);
            }
        }
        for (const field of Object.keys(message.MessageBody)) {
            if (!wfMessage.set(field, message.MessageBody[field])) {
                throw new WfProtocolError(`Body field ${field} could not be set`, null, WfErrorCode.FORMAT);
            }
        }
        return wfMessage;
    }
    static fromHex(message) {
        return WfCoreMessage.fromBinary(BinaryBuffer.fromHex(message));
    }
    static fronU8a(message) {
        return WfCoreMessage.fromBinary(BinaryBuffer.fromU8a(message));
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
    decode(message) {
        if (!this.final) {
            let errors = [];
            let msgSpec = MSGSPEC[this.type][this.version];
            for (const field of Object.keys(msgSpec.header)) {
                if (!this.set(field, this.decodeHeaderField(field, message))) {
                    errors.push(`Header field ${field} could not be set`);
                }
            }
            let type = this.type;
            let offset = 0;
            if (type === WfMsgType.T) {
                const field = 'PseudoMessageCode';
                if (this.set(field, this.decodeBodyField(field, message))) {
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
                if (!this.set(field, this.decodeBodyField(field, message, type, offset))) {
                    errors.push(`Body field ${field} could not be set`);
                }
            }
            if (errors.length === 0)
                errors = this.validate();
            if (errors.length > 0) {
                throw new WfProtocolError('Cannot decode ${this.type} message', errors, WfErrorCode.FORMAT);
            }
            this.final = true;
        }
        return this;
    }
    encode() {
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
        return this.binary.toHex();
    }
    toU8a() {
        return this.binary.toU8a();
    }
    static checkType(type) {
        if (Object.values(WfMsgType).includes(type)) {
            return type;
        }
        throw new WfProtocolError(`Undefined message type: ${type}`, null, WfErrorCode.FORMAT);
    }
    static checkVersion(version) {
        if (Object.values(WfVersion).includes(version)) {
            return version;
        }
        throw new WfProtocolError(`Undefined protocol version: ${version}`, null, WfErrorCode.FORMAT);
    }
    generateHeader() {
        let header = {};
        for (const field of Object.keys(MSGSPEC[this.type][this.version].header)) {
            header[field] = EMPTYPSTRING;
        }
        header.Version = this.version;
        header.MessageCode = this.type;
        return header;
    }
    decodeHeaderField(field, message) {
        const msgSpec = MSGSPEC[this.type][this.version];
        return decodeField(message.extract(msgSpec.header[field]?.startBit, msgSpec.header[field]?.endBit), msgSpec.header[field]?.encoding);
    }
    generateBody(pseudoType) {
        let body = {};
        let type = this.type;
        if (pseudoType) {
            body['PseudoMessageCode'] = pseudoType;
            type = WfCoreMessage.checkType(pseudoType);
        }
        for (const field of Object.keys(MSGSPEC[type][this.version].body)) {
            body[field] = EMPTYPSTRING;
        }
        return body;
    }
    decodeBodyField(field, message, type = this.type, bitOffset = 0) {
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
function handleError(err, msg = 'Unspecified error occured') {
    let code = WfErrorCode.FORMAT;
    let message = msg;
    let causes = [];
    if (err instanceof Error)
        causes = [err.message];
    if (err instanceof WfProtocolError) {
        msg = err.message;
        causes = err.causes;
        code = err.code;
    }
    return new WfProtocolError(message, causes, code);
}
function checkMsgSegments(header, body) {
    let errors = [];
    if (!header?.Version)
        errors.push('Missing protocol version');
    if (!header?.MessageCode)
        errors.push('Missing message type');
    if (errors.length > 0)
        return errors;
    errors.push(...checkMsgHeader(header, header.MessageCode, header.Version));
    errors.push(...checkMsgBody(body, header.MessageCode, header.Version));
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
function compileMsgSpec() {
    const SIGNSIGNALTYPE = '$signsignal';
    const msgSpec = {};
    const headerSpec_v1 = compileMsgSpecRegex(v1.header);
    const signsignalSpec_v1 = compileMsgSpecRegex(v1.body[SIGNSIGNALTYPE]);
    for (const type of Object.values(WfMsgType)) {
        msgSpec[type] = {};
        msgSpec[type][1] = { header: {}, body: {} };
        msgSpec[type][1].header = headerSpec_v1;
        if (Object.keys(v1.body[type]).includes(SIGNSIGNALTYPE)) {
            msgSpec[type]['1'].body = signsignalSpec_v1;
        }
        else {
            msgSpec[type]['1'].body = compileMsgSpecRegex(v1.body[type]);
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
