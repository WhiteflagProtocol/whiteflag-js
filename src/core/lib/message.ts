'use strict';
/**
 * @module core/message
 * @summary Whiteflag JS message class
 */
export {
    WfMsgType,
    WfCoreMessage,
    isValidMessage,
    validateMessage,
    encryptMessage,
    decryptMessage
};

/* Dependencies */
import { WfCryptoMethod, encrypt, decrypt, deriveKey } from '@whiteflag/crypto';
import { BinaryBuffer, hexToU8a, isString } from '@whiteflag/util';

/* Module imports */
import { WfVersion } from './versions.ts';
import { WfProtocolError, WfErrorCode } from './errors.ts';
import { WfCodec, decodeField, encodeField, isValidValue } from './codec.ts';

/* Whiteflag specification */
import msgSpec_v1 from '../static/v1/wf-msg-structure.json' with { type: 'json' };

/* Constants */
const EMPTYPSTRING = '';
const MSG_PREFIX = 'WF';
const MSG_NOENCRYPT = '0';

/* MODULE DECLARATIONS */
/**
 * Whiteflag message types
 * @enum WfFieldType
 * @wfver v1-draft.7
 */
enum WfMsgType {
    A = 'A',
    K = 'K',
    T = 'T',
    P = 'P',
    D = 'D',
    S = 'S',
    E = 'E',
    I = 'I',
    M = 'M',
    Q = 'Q',
    R = 'R',
    F = 'F'
}
/**
 * Whiteflag message specification each message type
 */
const MSGSPEC = compileMsgSpec();

/**
 * Whiteflag Message
 * @class WfCoreMessage
 * @wfver v1-draft.7
 * @todo Finish and test encryption and decryption
 * @todo Add a proper description of the functionality
 */
class WfCoreMessage {
    /* CLASS PROPERTIES */
    /** 
     * @property the message type
     */
    private type: WfMsgType;
    /** 
     * @property the Whiteflag protocol version
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
     * @param binary the binary encoded message, if available at creation
     */
    constructor(type: WfMsgType, version = WfVersion.v1, binary?: BinaryBuffer) {
        this.type = type;
        this.version = version;
        this.header = this.generateHeader();
        this.body = this.generateBody();
        if (binary instanceof BinaryBuffer) this.binary = binary;
    }

    /* STATIC FACTORY METHODS */
    /**
     * Creates new Whiteflag message from a binary buffer
     * @function fromBinary
     * @param message a binary buffer with the encoded message
     * @param ikm the input key material to derive the encryption key, if the message is encrypted
     * @param address the binary encoded originator address, if the message is encrypted
     * @param iv the initialisation vector, if required for the encryption method
     * @returns a new Whiteflag message object with the decoded message
     */
    public static async fromBinary(message: BinaryBuffer, ikm?: Uint8Array, address?: Uint8Array, iv?: Uint8Array): Promise<WfCoreMessage> {
        let buffer = message;

        /* Decode and check unencrypted header */
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
        /* Decrypt binary message if necessary */
        if (encryption !== MSG_NOENCRYPT) {
            if (!ikm) throw new Error('Missing encryption key');
            if (!address) throw new Error('Missing orginator address');
            buffer = await decryptMessage(message, encryption as WfCryptoMethod, ikm, address, iv, version as WfVersion);
        }
        /* Decode message type */
        let type = extractHeaderField(buffer, 'MessageCode') as WfMsgType;
        if (!checkType(type)) {
            throw new WfProtocolError(`Undefined message type: ${type}`, null, WfErrorCode.FORMAT);
        }
        /* Create and decode new message object */
        const wfMessage = new this(type, version as WfVersion, message);
        return wfMessage.decode(buffer);
    }
    /**
     * Creates new Whiteflag message from a plain object
     * @function fromObject
     * @param message a plain JavaScript object with message header and body
     * @returns a new Whiteflag message object
     */
    public static async fromObject(message: any): Promise<WfCoreMessage> {
        /* Check object */
        const errors = validateMessage(message);
        if (errors.length > 0) throw new WfProtocolError('Invalid message', errors, WfErrorCode.FORMAT);

        /* Create new WfCoreMessage object */
        const header = message.MessageHeader;
        const body = message.MessageBody;
        const wfMessage = new this(header['MessageCode'], header['Version']);

        /* Set header fields */
        for (const field of Object.keys(header)) {
            if (!wfMessage.set(field, header[field])) {
                throw new WfProtocolError(`Header field ${field} could not be set`, null, WfErrorCode.FORMAT);
            }
        }
        /* Set body fields */
        for (const field of Object.keys(body)) {
            if (!wfMessage.set(field, body[field])) {
                throw new WfProtocolError(`Body field ${field} could not be set`, null, WfErrorCode.FORMAT);
            }
        }
        return wfMessage;
    }
    /**
     * Creates new Whiteflag message from a hexadecimal encoded string
     * @param message  atring with the hexadecimal encoded message
     * @param ikm the hexadecimalinput key material to derive the encryption key, if the message is encrypted
     * @param address the hexadecimal encoded originator address, if the message is encrypted
     * @param iv the hexadecimal initialisation vector, if required for the encryption method
     * @returns a new Whiteflag message object with the decoded message
     */
    public static async fromHex(message: string, ikm?: string, address?: string, iv?: string): Promise<WfCoreMessage> {
        /* Convert hexadecimal encryption paramters if present */
        if (ikm && address && iv) {
            return this.fromBinary(
                BinaryBuffer.fromHex(message),
                hexToU8a(ikm),
                hexToU8a(address),
                hexToU8a(iv)
            );
        }
        /* No encryption paramters */
        return this.fromBinary(
            BinaryBuffer.fromHex(message),
        );
    }
    /**
     * Creates new Whiteflag message from a binary encoded message
     * @param message a Uint8Array with the binary encoded message
     * @param ikm the input key material to derive the encryption key, if the message is encrypted
     * @param address the binary encoded originator address, if the message is encrypted
     * @param iv the initialisation vector, if required for the encryption method
     * @returns a new Whiteflag message object with the decoded message
     */
    public static async fromU8a(message: Uint8Array, ikm?: Uint8Array, address?: Uint8Array, iv?: Uint8Array): Promise<WfCoreMessage> {
        return this.fromBinary(BinaryBuffer.fromU8a(message), ikm, address, iv);
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
     * Decodes an unencrypted binary encoded message
     * @param message a binary encoded message
     * @returns a new Whiteflag message object
     */
    public async decode(message: BinaryBuffer): Promise<WfCoreMessage> {
        if (!this.final) {
            /* Get message specification */
            let errors: string[] = [];
            let msgSpec = MSGSPEC[this.type][this.version];

            /* Decode and set header fields */
            for (const field of Object.keys(msgSpec.header)) {
                if (!this.set(field, this.decodeHeaderField(message, field))) {
                    errors.push(`Header field ${field} could not be set`);
                }
            }
            /* If test message, add pseudo message body */
            let type = this.type;
            let offset = 0;
            if (type === WfMsgType.T) {
                const field = 'PseudoMessageCode';
                if (this.set(field, this.decodeBodyField(message, field))) {
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
                if (!this.set(field, this.decodeBodyField(message, field, type, offset))) {
                    errors.push(`Body field ${field} could not be set`);
                }
            }
            /* Final validation check */
            if (errors.length === 0) errors = this.validate();
            if (errors.length > 0) {
                throw new WfProtocolError(`Cannot decode ${this.type} message`, errors, WfErrorCode.FORMAT);
            }
            this.final = true;
        }
        return this;
    }
    /**
     * Encodes the message, making the contents final
     * @function encode
     * @param ikm the input key material to derive the encryption key, if the message is to be encrypted
     * @param address the binary encoded originator address, if the message is to be encrypted
     * @param iv the initialisation vector, if required for the encryption method
     * @returns this Whitedlag message object with the encoded message
     */
    public async encode(ikm?: Uint8Array, address?: Uint8Array, iv?: Uint8Array): Promise<WfCoreMessage> {
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
            /* Encrypt message if encryption indicator is set */
            if (this.header['EncryptionIndicator'] !== MSG_NOENCRYPT) {
                if (!ikm) throw new Error('Missing encryption key');
                if (!address) throw new Error('Missing orginator address');
                this.binary = await encryptMessage(
                    this.binary, 
                    this.header['EncryptionIndicator'] as WfCryptoMethod,
                    ikm as Uint8Array<ArrayBuffer>,
                    address as Uint8Array<ArrayBuffer>,
                    iv as Uint8Array<ArrayBuffer>,
                    this.header['Version'] as WfVersion
                );
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
                /* Cannot change message prefix, version and type */
                if (field === 'Prefix' && value !== MSG_PREFIX) return false;
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
        if (this.final) return this.binary.toHex();
        return EMPTYPSTRING;
    }
    /**
     * Returns the encoded Whiteflag message as a UInt8array
     * @function toU8a
     * @returns a UInt8array with the encoded message
     */
    public toU8a(): Uint8Array {
       if (this.final) return this.binary.toU8a();
       return new Uint8Array(0);
    }

    /* PRIVATE CLASS METHODS */
    /**
     * Generates message header and sets known values
     * @private
     * @returns a Whiteflag message header object
     */
    private generateHeader(): WfMsgHeader {
        let header: WfMsgHeader = {};
        for (const field of Object.keys(MSGSPEC[this.type][this.version].header)) {
            header[field] = EMPTYPSTRING;
        }
        header['Prefix'] = MSG_PREFIX;
        header['Version'] = this.version as string;
        header['MessageCode'] = this.type as string;
        return header;
    }
    /**
     * Decodes a field from a binary encoded message header
     * @param message the binary encoded message
     * @param field the header field to decode
     * @returns the field value
     */
    private decodeHeaderField(message: BinaryBuffer, field: string): string {
        const msgSpec = MSGSPEC[this.type][this.version];
        return decodeField(
            message.extract(
                msgSpec.header[field]?.startBit,
                msgSpec.header[field]?.endBit
            ),
        msgSpec.header[field]?.encoding as WfCodec);
    }
    /**
     * Generates message body, or if specifed pseudo message body
     * @private
     * @@param type the pseudo message type, if test message body
     * @returns a Whiteflag message body object
     */
    private generateBody(pseudoType?: WfMsgType): WfMsgBody {
        let body: WfMsgBody = {};
        let type = this.type;
        if (checkType(pseudoType)) {
            body['PseudoMessageCode'] = pseudoType as string;
            type = pseudoType as WfMsgType;
        }
        for (const field of Object.keys(MSGSPEC[type][this.version].body)) {
            body[field] = EMPTYPSTRING;
        }
        return body;
    }
    /**
     * Decodes a field from a binary encoded message body
     * @param message the binary encoded message
     * @param field the body field to decode
     * @param type the message type to override, e.g. for pseudo message body
     * @param bitOffset the bit offset for dynamic fields
     * @returns the field value
     */
    private decodeBodyField(message: BinaryBuffer, field: string, type: WfMsgType = this.type, bitOffset: number = 0): string {
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
/**
 * Encrypts a binary encoded message
 * @function encryptMessage
 * @param message a binary buffer with the binary encoded message
 * @param method the Whiteflag encryption method
 * @param ikm the input key material to derive the encryption key
 * @param address the binary encoded originator address
 * @param iv the initialisation vector, if required for the encryption method
 * @param version the Whiteflag protocol version
 * @returns the encrypted message
 */
async function encryptMessage(message: BinaryBuffer,
                              method: WfCryptoMethod,
                              ikm: Uint8Array,
                              address: Uint8Array,
                              iv?: Uint8Array,
                              version = WfVersion.v1
                            ): Promise<BinaryBuffer> {
    /* Split message in unencrypted and encrypted part */
    const { unencrypted, encrypted: decrypted } = splitEncryptedMsg(message);

    /* Derive encryption key */
    const key = await deriveKey(
        ikm as Uint8Array<ArrayBuffer>,
        method as WfCryptoMethod,
        address as Uint8Array<ArrayBuffer>,
        version as WfVersion
    );
    /* Encrypt the message part */
    const encrypted = await encrypt(
        decrypted as Uint8Array<ArrayBuffer>,
        method as WfCryptoMethod,
        key as CryptoKey,
        iv as Uint8Array<ArrayBuffer>,
        version as WfVersion
    );
    /* Merge parts and return result */
    return mergeEncryptedMsg(unencrypted, encrypted);
}
/**
 * Decrypts an encrypted binary message
 * @function decryptMessage
 * @param message a binary buffer with the encrypted message
 * @param method the Whiteflag encryption method
 * @param ikm the input key material to derive the encryption key
 * @param address the binary encoded originator address
 * @param iv the initialisation vector, if required for the encryption method
 * @param version the Whiteflag protocol version
 * @returns the decrypted binary encoded message
 */
async function decryptMessage(message: BinaryBuffer,
                              method: WfCryptoMethod,
                              ikm: Uint8Array,
                              address: Uint8Array,
                              iv?: Uint8Array,
                              version = WfVersion.v1
                            ): Promise<BinaryBuffer> {
    /* Split message in unencrypted and encrypted part */
    const { unencrypted, encrypted } = splitEncryptedMsg(message);

    /* Derive encryption key */
    const key = await deriveKey(
        ikm as Uint8Array<ArrayBuffer>,
        method as WfCryptoMethod,
        address as Uint8Array<ArrayBuffer>,
        version as WfVersion
    );
    /* Decrypt encrypted message part */
    const decrypted = await decrypt(
        encrypted as Uint8Array<ArrayBuffer>,
        method as WfCryptoMethod,
        key as CryptoKey,
        iv as Uint8Array<ArrayBuffer>,
        version as WfVersion
    );
    /* Merge parts and return result */
    return mergeEncryptedMsg(unencrypted, decrypted);
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
    ReferencedMessage?: string
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
 * Compiles an object with all valid field type definitions
 * @private
 * @returns an object with field type definitions
 */
function compileMsgSpec(): WfMsgSpec {
    const SIGNSIGNALTYPE = '$signsignal';
    const msgSpec: WfMsgSpec = {};
    for (const type of Object.values(WfMsgType)) {
        msgSpec[type] = {};

        /* Whiteflag version 1 */ {
            const version = WfVersion.v1;
            const headerSpec_v1 = compileMsgSpecRegex(msgSpec_v1.header);
            const signsignalSpec_v1 = compileMsgSpecRegex(msgSpec_v1.body[SIGNSIGNALTYPE]);
            msgSpec[type][version] = { header: {}, body: {} };
            msgSpec[type][version].header = headerSpec_v1;
            if (SIGNSIGNALTYPE in msgSpec_v1.body[type]) {
                msgSpec[type][version].body = signsignalSpec_v1;
            } else {
                msgSpec[type][version].body = compileMsgSpecRegex(msgSpec_v1.body[type]);
            }
        }
    }
    /* All done */
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
    if (!('Version'in header)) errors.push('Missing protocol version');
    if (!('MessageCode'in header)) errors.push('Missing message type code');
    if (errors.length > 0) return errors;

    /* Validate message header and body */
    errors.push(...checkMsgHeader(
        header, header['MessageCode'] as WfMsgType, header['Version'] as WfVersion
    ));
    errors.push(...checkMsgBody(
        body, header['MessageCode'] as WfMsgType, header['Version'] as WfVersion
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
 * Check if encryption method is valid
 * @private
 * @param method the encryption method to check
 * @returns true if encryption method is valid, else false
 */
function checkEncryption(method: WfCryptoMethod | string | undefined): boolean {
    if (method === undefined) return false;
    if (isString(method)) {
        if (method === MSG_NOENCRYPT) return true;
        if (Object.keys(WfCryptoMethod).includes(method as string)) return true;
    }
    if (Object.values(WfCryptoMethod).includes(method as WfCryptoMethod)) return true;
    return false;
}
/**
 * Checks if message prefix is valid
 * @private
 * @param encryption the message prefix to check
 * @returns true if prefix is valid, else false
 */
function checkPrefix(prefix: string | undefined): boolean {
    if (prefix === undefined) return false;
    if (prefix === MSG_PREFIX) return true;
    return false;
}
/**
 * Check if mesage type is valid
 * @private
 * @param type the message type to check
 * @returns true if message type is valid, else false
 */
function checkType(type: WfMsgType | string | undefined): boolean {
    if (type === undefined) return false;
    if (isString(type)
        && Object.keys(WfMsgType).includes(type as string)) return true;
    if (Object.values(WfMsgType).includes(type as WfMsgType)) return true;
    return false;
}
/**
 * Check if protocol version is valid
 * @private
 * @param version the protocol version to check
 * @returns true if protocol version is valid, else false
 */
function checkVersion(version: WfVersion | string | undefined): boolean {
    if (version === undefined) return false;
    if (isString(version)
        && Object.keys(WfVersion).includes(version as string)) return true;
    if (Object.values(WfVersion).includes(version as WfVersion)) return true;
    return false;
}
/**
 * Extracts the unecrypted header field values from an encoded message
 * @private
 * @param message the binary encoded message
 * @returns a plain object with the prefix, version and encryption values
 */
function extractUnencryptedHeader(message: BinaryBuffer): { prefix: string, version: string, encryption: string } {
    return {
        prefix: extractHeaderField(message, 'Prefix'),
        version: extractHeaderField(message, 'Version'),
        encryption: extractHeaderField(message, 'EncryptionIndicator')
    };
}
/**
 * Extracts a header field value from an encoded unknown message type
 * @private
 * @param message the binary encoded message
 * @param field the header field to decode
 * @returns the field value
 */
function extractHeaderField(message: BinaryBuffer, field: string): string {
    /* Use version 1 of an A message for generic header field specification */
    const fieldSpec = MSGSPEC[WfMsgType.A][WfVersion.v1].header[field];

    /* Decode header field */
    return decodeField(
        message.extract(
            fieldSpec.startBit,
            fieldSpec.endBit
        ),
        fieldSpec.encoding as WfCodec
    );
}
/**
 * Splits a binary encoded message in the unencrypted and encrypted parts
 * @param message the full binary encoded messsage
 * @returns the unencrypted and encrypted message parts
 */
function splitEncryptedMsg(message: BinaryBuffer): { unencrypted: Uint8Array, encrypted: Uint8Array } {
    /* Use version 1 of an A message for generic header unencrypted split */
    const split = MSGSPEC[WfMsgType.A][WfVersion.v1].header['EncryptionIndicator'].endBit;
    return {
        unencrypted: message.extract(0, split).toU8a(),
        encrypted: message.extract(split, message.length).toU8a()
    }
}
/**
 * Merges the unencrypted and encrypted parts of a binary encoded message
 * @param unenecrypted the unencrypted message part
 * @param encrypted the encrypted message part
 * @returns the full binary encoded messsage
 */
function mergeEncryptedMsg(unenecrypted: Uint8Array, encrypted: Uint8Array): BinaryBuffer {
    /* Use version 1 of an A message for generic header unencrypted split */
    const split = MSGSPEC[WfMsgType.A][WfVersion.v1].header['EncryptionIndicator'].endBit;
    return BinaryBuffer
        .fromU8a(unenecrypted, split)
        .appendU8a(encrypted);
}
