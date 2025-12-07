/**
 * @module core/message
 * @summary Whiteflag JS message class
 */
export {
    WfCoreMessage,
    isValidMessage,
    validateMessage
};

/* Dependencies */
import { BinaryBuffer } from '@whiteflag/util';

/* Module imports */
import { WfVersion, WfMsgType, WfCodec } from './specs.ts';
import { WfProtocolError, WfErrorCode } from './errors.ts';
import { decodeField, encodeField, isValidValue } from './codec.ts';

/* Whiteflag specification */
import v1 from '../static/v1/wf-msg-structure.json' with { type: 'json' };

/* Constants */
const EMPTYPSTRING = '';
const V_STARTBIT = v1.header.Version.startBit;
const V_ENDBIT = v1.header.Version.endBit;
const V_CODEC = v1.header.Version.encoding as WfCodec;
const T_STARTBIT = v1.header.MessageCode.startBit;
const T_ENDBIT = v1.header.MessageCode.endBit;
const T_CODEC = v1.header.MessageCode.encoding as WfCodec;

/* MODULE DECLARATIONS */
/**
 * Defines Whiteflag fields
 */
const MSGSPEC = compileMsgSpec();

/**
 * Whiteflag Message
 * @class WfCoreMessage
 * @wfver v1-draft.7
 * @todo Add a proper description of the functionality
 */
class WfCoreMessage {
    /* CLASS PROPERTIES */
    /** 
     * @property the message type
     */
    private type: WfMsgType;
    /** 
     * @property the Whiteflag version
     */
    private version: WfVersion = WfVersion.v1;
    /**
     * @property header The message header
     */
    protected header: WfMsgHeader = {};
    /**
     * @property body The message body
     */
    protected body: WfMsgBody = {};
    /**
     * @property binary the binary encoded message
     */
    private binary: BinaryBuffer = BinaryBuffer.empty();
    /** 
     * @property final true if content cannot be altered anymore, else false
     */
    private final: boolean = false;

    /* CONSTRUCTOR */
    /**
     * Constructor for a Whiteflag message
     * @param type the Whiteflag message type
     * @param version the Whiteflag protocol version
     */
    constructor(type: WfMsgType, version = WfVersion.v1) {
        this.type = type;
        this.version = version;
        this.header = this.generateHeader();
        this.body = this.generateBody();
    }

    /* STATIC FACTORY METHODS */
    /**
     * Creates new Whiteflag message from a binary buffer
     * @function fromBinary
     * @param message a binary buffer with the encoded message
     * @returns a new Whiteflag message object with the decoded message
     */
    public static fromBinary(message: BinaryBuffer): WfCoreMessage {
        /* Decode version and type */
        let type: WfMsgType;
        let version: WfVersion;
        try {
            type = WfCoreMessage.checkType(
                decodeField(message.extract(T_STARTBIT, T_ENDBIT), T_CODEC) as WfMsgType),
            version = WfCoreMessage.checkVersion(
                decodeField(message.extract(V_STARTBIT, V_ENDBIT), V_CODEC) as WfVersion)
        } catch(err) {
            throw handleError(err, 'Cannot decode message');
        }
        /* create new message object */
        return new WfCoreMessage(type, version).decode(message);
    }
    /**
     * Creates new Whiteflag message from a plain object
     * @function fromObject
     * @param message a plain JavaScript object with message header and body
     * @returns a new Whiteflag message object
     */
    public static fromObject(message: any): WfCoreMessage {
        /* Check object and create new WfCoreMessage object */
        const errors = validateMessage(message);
        if (errors.length > 0) throw new WfProtocolError('Invalid message', errors, WfErrorCode.FORMAT);;
        let wfMessage = new WfCoreMessage(message.MessageHeader.MessageCode, message.MessageHeader.Version);

        /* Set header fields */
        for (const field of Object.keys(message.MessageHeader)) {
            if (!wfMessage.set(field, message.MessageHeader[field])) {
                throw new WfProtocolError(`Header field ${field} could not be set`, null, WfErrorCode.FORMAT);
            }
        }
        /* Set body fields */
        for (const field of Object.keys(message.MessageBody)) {
            if (!wfMessage.set(field, message.MessageBody[field])) {
                throw new WfProtocolError(`Body field ${field} could not be set`, null, WfErrorCode.FORMAT);
            }
        }
        return wfMessage;
    }
    /**
     * Creates new Whiteflag message from a hexadecimal encoded string
     * @param message  atring with the hexadecimal encoded message
     * @returns a new Whiteflag message object with the decoded message
     */
    public static fromHex(message: string): WfCoreMessage {
        return WfCoreMessage.fromBinary(BinaryBuffer.fromHex(message));
    }
    /**
     * Creates new Whiteflag message from a binary encoded message
     * @param message a Uint8Array with the binary encoded message
     * @returns a new Whiteflag message object with the decoded message
     */
    public static fronU8a(message: Uint8Array): WfCoreMessage {
        return WfCoreMessage.fromBinary(BinaryBuffer.fromU8a(message));
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Indicates if the message has already been encoded
     * @function isEncoded
     * @returns true if message has been encoded, else false
     */
    public isEncoded(): boolean {
        if (this.final) return true;
        return false;
    }
    /**
     * Indicates if the message is valid, i.e. if all fields contain valid values
     * @function isValid
     * @returns true if message is valid, else false
     */
    public isValid(): boolean {
        if (this.validate().length > 0) return false;
        return true;
    }
    /**
     * Returns message validation errors
     * @function validate
     * @returns an array of validation errors
     */
    public validate(): string[] {
        return checkMsgSegments(this.header, this.body);
    }
    /**
     * Decodes a binary encoded message
     * @param message a bianry encoded message
     * @returns a new Whiteflag message object
     * @todo fix decoding
     */
    public decode(message: BinaryBuffer): WfCoreMessage {
        if (!this.final) {
            /* Get message specification */
            let errors: string[] = [];
            let msgSpec = MSGSPEC[this.type][this.version];

            /* Decode and set header fields */
            for (const field of Object.keys(msgSpec.header)) {
                if (!this.set(field, this.decodeHeaderField(field, message))) {
                    errors.push(`Header field ${field} could not be set`);
                }
            }
            /* If test message, add pseudo message body */
            let type = this.type;
            let offset = 0;
            if (type === WfMsgType.T) {
                const field = 'PseudoMessageCode';
                if (this.set(field, this.decodeBodyField(field, message))) {
                    const fieldSpec = MSGSPEC[type][this.version].body[field];
                    offset = fieldSpec.endBit - fieldSpec.startBit;
                    type = this.body[field] as WfMsgType;
                } else {
                    errors.push(`Body field ${field} could not be set`);
                }
            }
            /* Decode and set body fields */
            msgSpec = MSGSPEC[type][this.version];
            for (const field of Object.keys(msgSpec.body)) {
                if (!this.set(field, this.decodeBodyField(field, message, type, offset))) {
                    errors.push(`Body field ${field} could not be set`);
                }
            }
            /* Final validation check */
            if (errors.length === 0) errors = this.validate();
            if (errors.length > 0) {
                throw new WfProtocolError('Cannot decode ${this.type} message', errors, WfErrorCode.FORMAT);
            }
            this.final = true;
        }
        return this;
    }
    /**
     * Encodes the message, making the contents final
     * @function encode
     * @returns 
     */
    public encode(): WfCoreMessage {
        if (!this.final) {
            /* Validate message before encoding */
            const errors = this.validate();
            if (errors.length > 0) {
                throw new WfProtocolError('Cannot encode message', errors, WfErrorCode.FORMAT);
            }
            /* Encode message header */
            for (const field of Object.keys(this.header)) {
                const encoding = MSGSPEC[this.type][this.version].header[field].encoding as WfCodec;
                this.binary.append(encodeField(this.header[field], encoding, this.version));
            }
            /* Encode message body */
            let type = this.type;
            for (const field of Object.keys(this.body)) {
                const encoding = MSGSPEC[type][this.version].body[field].encoding as WfCodec;
                this.binary.append(encodeField(this.body[field], encoding, this.version));

                /* If pseudo message code, treat rest of body as pseudo message type */
                if (field === 'PseudoMessageCode') type = this.body[field] as WfMsgType;
            }
            this.final = true;
        }
        return this;
    }
    /**
     * Returns the value of the specified message field
     * @function get
     * @param fieldName the name of the message field
     * @returns the value of the message field
     */
    public get(fieldName: string): string | null {
        /* Look for field in message header */
        for (const field of Object.keys(this.header)) {
            if (field === fieldName) return this.header[field];
        }
        /* Look for field in message body */
        for (const field of Object.keys(this.body)) {
            if (field === fieldName) return this.body[field];
        }
        /* Specified field not found */
        return null;
    }
    /**
     * Sets the value of the specified message field, if the message has not been encoded
     * @function set
     * @param fieldName the name of the message field
     * @param value the value to set
     * @return true if succesful, else false
     */
    public set(fieldName: string, value: string): boolean {
        /* Cannot change data if already encoded */
        if (this.final) return false;

        /* Look for field to set value in message header */
        for (const field of Object.keys(this.header)) {
            if (field === fieldName) {
                /* Cannot change message version and type */
                if (field === 'Version' && value !== this.header[field]) return false;
                if (field === 'MessageCode' && value !== this.header[field]) return false;

                /* Set field value */
                this.header[field] = value;
                return true;
            }
        }
        /* Look for field to set value in message body */
        for (const field of Object.keys(this.body)) {
            if (field === fieldName) {
                if (field === 'PseudoMessageCode') {
                    /* Create new pseudo message body */
                    this.body = this.generateBody(value as WfMsgType);
                } else {
                    /* Set field value */
                    this.body[field] = value;
                }
                return true;
            }
        }
        /* Specified field not found */
        return false;
    }
    /**
     * Returns the Whiteflag message as a plain object
     * @function toObject
     * @returns the message as a plain object
     */
    public toObject(): Object {
        return {
            MessageHeader: this.header,
            MessageBody: this.body
        }
    }
    /**
     * Returns the Whiteflag message as a string
     * @function toString
     * @returns a concatinated string of field values 
     */
    public toString(): string {
        let messageStr: string = EMPTYPSTRING;
        if (this.isValid()) {
            /* Serialise message header */
            for (const field of Object.keys(this.header)) {
                messageStr += this.header[field];
            }
            /* Serialise message body */
            for (const field of Object.keys(this.body)) {
                messageStr += this.body[field];
            }
        }
        return messageStr;
    }
    /**
     * Returns the Whiteflag message encoded as a hexadecimal string
     * @function toHex
     * @returns a hexadecimal string with the encoded message
     */
    public toHex(): string {
        return this.binary.toHex();
    }
    /**
     * Returns the encoded Whiteflag message as a UInt8array
     * @function toU8a
     * @returns a UInt8array with the encoded message
     */
    public toU8a() {
        return this.binary.toU8a();
    }
    /**
     * Check if mesage type is valid
     * @param type the message type to check
     * @returns the message type, if valid
     * @throws if message type is not valid
     */
    public static checkType(type: WfMsgType) {
        if (Object.values(WfMsgType).includes(type)) {
            return type;
        }
        throw new WfProtocolError(`Undefined message type: ${type}`, null, WfErrorCode.FORMAT);
    }
    /**
     * Check if protocol version is valid
     * @param version the protocol version to check
     * @returns the protocol version, if valid
     * @throws if message type is not valid
     */
    public static checkVersion(version: WfVersion) {
        if (Object.values(WfVersion).includes(version)) {
            return version;
        }
        throw new WfProtocolError(`Undefined protocol version: ${version}`, null, WfErrorCode.FORMAT);
    }

    /* PRIVATE CLASS METHODS */
    /**
     * Generates message header
     * @private
     * @returns a Whiteflag message header object
     */
    private generateHeader(): WfMsgHeader {
        let header: WfMsgHeader = {};
        for (const field of Object.keys(MSGSPEC[this.type][this.version].header)) {
            header[field] = EMPTYPSTRING;
        }
        header.Version = this.version as string;
        header.MessageCode = this.type as string;
        return header;
    }
    /**
     * Decodes a field from a binary encoded message header
     * @param field the header field to decode
     * @param message the binary encoded message
     * @returns the field value
     */
    private decodeHeaderField(field: string, message: BinaryBuffer): string {
        const msgSpec = MSGSPEC[this.type][this.version];
        return decodeField(
            message.extract(
                msgSpec.header[field]?.startBit,
                msgSpec.header[field]?.endBit
            ),
        msgSpec.header[field]?.encoding as WfCodec);
    }
    /**
     * Generates message body
     * @private
     * @@param type the message type to override if test message body
     * @returns a Whiteflag message body object
     */
    private generateBody(pseudoType?: WfMsgType): WfMsgBody {
        let body: WfMsgBody = {};
        let type = this.type;
        if (pseudoType) {
            body['PseudoMessageCode'] = pseudoType as string;
            type = WfCoreMessage.checkType(pseudoType);
        }
        for (const field of Object.keys(MSGSPEC[type][this.version].body)) {
            body[field] = EMPTYPSTRING;
        }
        return body;
    }
    /**
     * Decodes a field from a binary encoded message body
     * @param field the body field to decode
     * @param message the binary encoded message
     * @param type the message type to override, e.g. for pseudo message body
     * @param bitOffset the bit offset for dynamic fields
     * @returns the field value
     */
    private decodeBodyField(field: string, message: BinaryBuffer, type: WfMsgType = this.type, bitOffset: number = 0): string {
        const msgSpec = MSGSPEC[type][this.version];
        return decodeField(message.extract(
            msgSpec.body[field]?.startBit + bitOffset,
            msgSpec.body[field]?.endBit + bitOffset
        ), msgSpec.body[field]?.encoding as WfCodec);
    }
}

/* MODULE FUNCTIONS */
/**
 * Checks if a plain object is a valid Whiteflag message
 * @function isValidMessage
 * @param message the message object to validate
 * @returns true if message is valid, else false
 */
function isValidMessage(message: any): boolean {
    if (validateMessage(message).length > 0) return false;
    return true;
}
/**
 * Checks a plain message object for validation errors
 * @function validateMessage
 * @param message the message object to validate
 * @returns an array of validation errors
 */
function validateMessage(message: any): string[] {
    /* Check object */
    if (!(message instanceof Object)) throw new TypeError('Not an object');
    if (message instanceof WfCoreMessage) return message.validate();

    /* Check if message header and body exist */
    let errors: string[] = [];
    if (!message?.MessageHeader || !(message?.MessageHeader instanceof Object)) {
        errors.push('Missing or invalid message header');
    }
    if (!message?.MessageBody || !(message?.MessageBody instanceof Object)) {
        errors.push('Missing or invalid message body');
    }
    if (errors.length > 0) return errors;

    /* Check message header and body fields */
    errors.push(...checkMsgSegments(message.MessageHeader, message.MessageBody));
    return errors;
}

/* PRIVATE MODULE DECLARATIONS */
/**
 * Defines a Whiteflag message header object
 * @private
 * @interface WfMsgHeader
 */
interface WfMsgHeader {
    /* Required for dynamic creation */
    [key: string]: any,
    /* Defined header fields
     * for all versions */
    Prefix?: string,
    Version?: string,
    EncryptionIndicator?: string,
    DuressIndicator?: string,
    MessageCode?: string,
    ReferenceIndicator?: string,
    ReferencedMessage?: string,
}
/**
 * Defines a Whiteflag message header object
 * @private
 * @interface WfMsgHeader
 */
interface WfMsgBody {
    /* Required for dynamic creation */
    [key: string]: any,
    /* Defined body fields
     * for all versions and message types */
    VerificationMethod?: string,
    VerificationData?: string,
    CryptoDataType?: string,
    CryptoData?: string,
    PseudoMessageCode?: string,
    SubjectCode?: string,
    DateTime?: string,
    Duration?: string,
    ObjectType?: string,
    ObjectLatitude?: string,
    ObjectLongitude?: string,
    ObjectSizeDim1?: string,
    ObjectSizeDim2?: string,
    ObjectOrientation?: string,
    ReferenceMethod?: string,
    ReferenceData?: string,
    Text?: string
}
/**
 * Defines an object with field type definitions
 * @private
 * @interface WfMsgSpec
 */
interface WfMsgSpec {
    [key: string]: {    // Message type
        [key: string]: {    // Whiteflag version
            header: {
                [key: string]: {    // Message header field with start bit
                    encoding: string,
                    startBit: number,
                    endBit: number
                }   
            },
            body: {
                [key: string]: {    // Message body field with start bit
                    encoding: string,
                    startBit: number,
                    endBit: number
                }
            }
        }
    }
}

/* PRIVATE MODULE FUNCTIONS */
/**
 * Handles a catched error
 * @param err the error to handle
 * @param msg a generic message to use if no specific error message
 * @returns a new error object
 */
function handleError(err: any, msg: string = 'Unspecified error occured') {
    let code: WfErrorCode = WfErrorCode.FORMAT;
    let message: string = msg;
    let causes: string[] = [];
    if (err instanceof Error) causes = [ err.message ];
    if (err instanceof WfProtocolError) {
        msg = err.message;
        causes = err.causes;
        code = err.code as WfErrorCode;
    }
    return new WfProtocolError(message, causes, code);
}
/**
 * Checks the message header and body
 * @private
 * @param header the message header
 * @param body the message body
 * @returns an array of validation errors
 */
function checkMsgSegments(header: WfMsgHeader, body: WfMsgBody): string[] {
    /* Check message version and type */
    let errors: string[] = [];
    if (!header?.Version) errors.push('Missing protocol version');
    if (!header?.MessageCode) errors.push('Missing message type');
    if (errors.length > 0) return errors;

    /* Validate message header and body */
    errors.push(...checkMsgHeader(
        header, header.MessageCode as WfMsgType, header.Version as WfVersion
    ));
    errors.push(...checkMsgBody(
        body, header.MessageCode as WfMsgType, header.Version as WfVersion
    ));
    return errors;
}
/**
 * Checks the message header
 * @private
 * @param header the message header
 * @param type the message type
 * @param version the Whiteflag protocol version
 * @returns an array of validation errors
 */
function checkMsgHeader(header: WfMsgHeader, type: WfMsgType, version = WfVersion.v1): string[] {
    return checkFields(header, MSGSPEC[type][version].header, version);
}
/**
 * Checks the message body
 * @private
 * @param body the message body
 * @param type the message type
 * @param version the Whiteflag protocol version
 * @returns an array of validation errors
 */
function checkMsgBody(body: WfMsgBody, type: WfMsgType, version = WfVersion.v1): string[] {
    return checkFields(body, MSGSPEC[type][version].body, version);
}
/**
 * Checks the fields of a message segment (header or body)
 * @private
 * @param segment the message header or body
 * @param segSpec the message segment specification
 * @param version the Whiteflag protocol version
 * @returns an array of validation errors
 */
function checkFields(segment: (WfMsgHeader | WfMsgBody), segSpec: any, version = WfVersion.v1): string[] {
    let errors: string[] = [];
    for (const field of Object.keys(segSpec)) {
        /* Check if field exists */
        if (!Object.hasOwn(segment, field)) {
            errors.push(`Missing ${field} field`);
            continue;
        }
        /* Check field value */
        if (segSpec[field].encoding === EMPTYPSTRING) {
            continue;
        }
        if (segment[field] === EMPTYPSTRING) {
            errors.push(`${field} field has no value`);
            continue;
        }
        /* Specific pattern for field defined in message specification */
        if (segSpec[field]?.regex instanceof RegExp) {
            if (!segSpec[field].regex.test(segment[field])) {
                errors.push(`Value of ${field} field does not match ${segSpec[field].pattern} pattern`)
            }
            continue;
        }
        /* Generic pattern for field based on field type */
        const encoding = segSpec[field].encoding as WfCodec;
        if (!isValidValue(segment[field], encoding, version)) {
            errors.push(`Value of ${field} field is not valid for ${encoding} encoding`);
        }
    }
    return errors;
}
/**
 * Compiles an object with all valid field type definitions
 * @private
 * @returns an object with field type definitions
 */
function compileMsgSpec(): WfMsgSpec {
    const SIGNSIGNALTYPE = '$signsignal';
    const msgSpec: WfMsgSpec = {};

    /* Currently, there is only one Whiteflag version */
    const headerSpec_v1 = compileMsgSpecRegex(v1.header)
    const signsignalSpec_v1 = compileMsgSpecRegex(v1.body[SIGNSIGNALTYPE])    
    for (const type of Object.values(WfMsgType)) {
        msgSpec[type] = {};
        msgSpec[type][1] = { header: {}, body: {} };
        msgSpec[type][1].header = headerSpec_v1;
        if (Object.keys(v1.body[type]).includes(SIGNSIGNALTYPE)) {
            msgSpec[type]['1'].body = signsignalSpec_v1;
        } else {
            msgSpec[type]['1'].body = compileMsgSpecRegex(v1.body[type]);
        }
    }
    return msgSpec;
}
/**
 * Compiles regular expression if pattern is defined for a field
 * @private
 * @param segSpec the message segment specification
 * @returns the message segment specification with compiled regex
 */
function compileMsgSpecRegex(segSpec: any): any {
    for (const field of Object.keys(segSpec)) {
        if (segSpec[field]?.pattern) {
            segSpec[field].regex = new RegExp(segSpec[field].pattern);
        }
    }
    return segSpec;
}
