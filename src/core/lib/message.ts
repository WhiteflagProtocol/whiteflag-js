'use strict';
/**
 * @module core/message
 * @summary Whiteflag JS core message module
 */
export {
    WfCoreMessage,
    WfCoreMessageData,
    WfMsgHeader,
    WfMsgBody,
    isValidMessage,
    validateMessage,
    encryptMessage,
    decryptMessage
};

/* Dependencies */
import { WfVersion, WfMsgType, WfCryptoMethod, WfProtocolError, WfErrorCode } from '@whiteflagprotocol/common';
import { ByteArray, BinaryBuffer, DataItem, DataId, Hex, Serializable, isString, serializable } from '@whiteflagprotocol/util';
import { encryptMsg, decryptMsg, deriveKey } from '@whiteflagprotocol/crypto';

/* Module imports */
import { WfAccount } from './account.ts';
import { WfCodec, decodeField, encodeField, isValidValue } from './codec.ts';

/* Whiteflag specification */
import msgSpec_v1 from '../static/v1/wf-msg-structure.json' with { type: 'json' };

/* Constants */
const EMPTYSTR = '';
const MSG_PREFIX = 'WF';
const MSG_NOENCRYPT = '0';

/* MODULE DECLARATIONS */
/**
 * Whiteflag message specification each message type
 */
const MSGSPEC = compileMsgSpec();
/**
 * Whiteflag core message data structure as used by the `WfCoreMessage` class
 */
interface WfCoreMessageData extends Serializable {
    /** The header of the Whiteflag message */
    MessageHeader: WfMsgHeader;
    /** The body of the Whiteflag message */
    MessageBody: WfMsgBody;
}
/**
 * A core Whiteflag message as defined by the Whiteflag specification
 * @wfversion v1-draft.7
 * @wfreference 4 Message Format
 * @remarks Ths class represents a core Whiteflag message as
 * defined by the Whiteflag specification. It has a message header and
 * a message body which contain the message fields as specified for the
 * message type. It performs the encoding/encryption and decoding/decryption
 * to and from binary messages. Since the processing of Whiteflag messges
 * in accordance with the protocol requires additional metadata, the extrended
 * `WfMessage` class of the `@whitelag/protol` package should normallly be
 * used instead of this class.
 */
class WfCoreMessage extends DataItem<WfCoreMessageData> {
    /* CLASS PROPERTIES */
    /** The data stored in this data item */
    readonly #data: WfCoreMessageData;
    /** The message type */
    #type: WfMsgType;
    /** The Whiteflag protocol version */
    #version: WfVersion = WfVersion.v1;
    /** The binary encoded message */
    #binary: BinaryBuffer = BinaryBuffer.empty();
    /** Indicates if message is final and cannot be altered */
    #final: boolean = false;

    /* CONSTRUCTOR */
    /**
     * Constructs a Whiteflag message
     * @param data a plain JavaScript object with message header and body
     * @param id a unique identifier for the data item; automatically generated if not specified
     * @param ddat a data acces stoken for access to the private data property
     */
    constructor(data: WfCoreMessageData, id?: DataId, ddat = Symbol('WfCoreMessage')) {
        super(data, id, ddat);
        this.#data = super.getDataReference(ddat) as WfCoreMessageData;
        this.#type = this.#data?.MessageHeader['MessageCode'] as WfMsgType;
        this.#version = this.#data?.MessageHeader['Version'] as WfVersion;
    }

    /* STATIC FACTORY METHODS */
    /**
     * Creates a new Whiteflag message
     * @param msgType the Whiteflag message type
     * @param version the Whiteflag protocol version
     * @returns a new Whiteflag message of the specified type
     */
    public static create(msgType: WfMsgType, version = WfVersion.v1): WfCoreMessage {
        const data = {
            MessageHeader: generateHeader(msgType, version),
            MessageBody: generateBody(msgType, version)
        }
        return new WfCoreMessage(data);
    }
        /**
     * Creates new Whiteflag message from a plain object
     * @param message a plain JavaScript object with message header and body
     * @returns a new Whiteflag message
     */
    public static override fromObject(message: any): WfCoreMessage {
        /* Check object */
        const errors = validateMessage(message);
        if (errors.length > 0) throw new WfProtocolError('Invalid message', errors, WfErrorCode.FORMAT);

        /* Create new WfCoreMessage object */
        const header = message.MessageHeader;
        const wfMessage = this.create(header['MessageCode'] as WfMsgType, header['Version'] as WfVersion);

        /* Set header fields */
        for (const [field, value] of Object.entries(header)) {
            if (!wfMessage.set(field, value as string)) {
                throw new WfProtocolError(`Header field ${field} could not be set`, null, WfErrorCode.FORMAT);
            }
        }
        /* Set body fields */
        const body = message.MessageBody; 
        for (const [field, value]  of Object.entries(body)) {
            if (!wfMessage.set(field, value as string)) {
                throw new WfProtocolError(`Body field ${field} could not be set`, null, WfErrorCode.FORMAT);
            }
        }
        return wfMessage;
    }
    /**
     * Creates new Whiteflag message from a binary buffer
     * @param message a binary buffer with the encoded message
     * @param account the blockchain account with which the message is sent, required to derive the encryption key if the message is encrypted
     * @param ikm the input key material to derive the encryption key, if the message is encrypted
     * @param iv the initialisation vector, if required for the encryption method
     * @returns a new Whiteflag message with the decoded message
     */
    public static async fromBinary(message: BinaryBuffer, account?: WfAccount, ikm?: ByteArray, iv?: ByteArray): Promise<WfCoreMessage> {
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
            if (!account) throw new Error('Missing originator account');
            const binAddress = await account.getBinAddress();
            buffer = await decryptMessage(
                message as BinaryBuffer,
                encryption as WfCryptoMethod,
                ikm as ByteArray,
                binAddress as ByteArray,
                iv as ByteArray,
                version as WfVersion
            );
        }
        /* Decode message type */
        let msgType = extractHeaderField(buffer, 'MessageCode') as WfMsgType;
        if (!checkType(msgType)) {
            throw new WfProtocolError(`Undefined message type: ${msgType}`, null, WfErrorCode.FORMAT);
        }
        /* Create and decode new message object */
        const wfMessage = this.create(msgType, version as WfVersion);
        return wfMessage.decode(buffer);
    }

    /* PUBLIC CLASS METHODS */
    /**
     * Indicates if the message has already been encoded
     * @returns `true` if message has been encoded, else `false`
     */
    public isEncoded(): boolean {
        if (this.#final) return true;
        return false;
    }
    /**
     * Indicates if the message is valid, i.e. if all fields contain valid values
     * @returns `true` if message is valid, else `false`
     */
    public isValid(): boolean {
        if (this.validate().length > 0) return false;
        return true;
    }
    /**
     * Returns message validation errors
     * @returns an array of validation errors
     */
    public validate(): string[] {
        return checkMsgSegments(this.#data.MessageHeader, this.#data.MessageBody);
    }
    /**
     * Decodes an unencrypted binary encoded message
     * @param message a binary encoded message
     * @returns a new Whiteflag message object
     */
    public async decode(message: BinaryBuffer): Promise<WfCoreMessage> {
        if (!this.#final) {
            /* Get message specification */
            let errors: string[] = [];
            let msgType = this.#type;
            let msgSpec = MSGSPEC[msgType][this.#version];

            /* Store binary message */
            this.#binary = message; 

            /* Decode and set header fields */
            for (const field of Object.keys(msgSpec.header)) {
                if (!this.set(field, decodeHeaderField(message, field, msgType, this.#version))) {
                    errors.push(`Header field ${field} could not be set`);
                }
            }
            /* If test message, add pseudo message body and offset for other fields */
            let offset = 0;
            if (msgType === WfMsgType.T) {
                const field = 'PseudoMessageCode';
                if (this.set(field, decodeBodyField(message, field, msgType, offset, this.#version))) {
                    const fieldSpec = msgSpec.body[field];
                    offset = fieldSpec.endBit - fieldSpec.startBit;
                    msgType = this.#data.MessageBody[field] as WfMsgType;
                } else {
                    errors.push(`Body field ${field} could not be set`);
                }
            }
            /* Decode and set body fields */
            msgSpec = MSGSPEC[msgType][this.#version];
            for (const field of Object.keys(msgSpec.body)) {
                if (!this.set(field, decodeBodyField(message, field, msgType, offset, this.#version))) {
                    errors.push(`Body field ${field} could not be set`);
                }
            }
            /* Final validation check */
            if (errors.length === 0) errors = this.validate();
            if (errors.length > 0) {
                throw new WfProtocolError(`Cannot decode ${this.#type} message`, errors, WfErrorCode.FORMAT);
            }
            this.#final = true;
        }
        return this;
    }
    /**
     * Encodes the message, making the contents final
     * @param account the blockchain account with which the message is sent, required to derive the encryption key if the message is encrypted
     * @param ikm the input key material to derive the encryption key, if the message is to be encrypted
     * @param iv the initialisation vector, if required for the encryption method
     * @returns this Whitedlag message object with the encoded message
     */
    public async encode(account?: WfAccount, ikm?: ByteArray, iv?: ByteArray): Promise<WfCoreMessage> {
        if (!this.#final) {
            /* Validate message before encoding */
            const errors = this.validate();
            if (errors.length > 0) {
                throw new WfProtocolError('Cannot encode message', errors, WfErrorCode.FORMAT);
            }
            /* Encode message header */
            const header = this.#data.MessageHeader;
            for (const field of Object.keys(header)) {
                const encoding = MSGSPEC[this.#type][this.#version].header[field].encoding as WfCodec;
                this.#binary.append(encodeField(header[field] as string, encoding, this.#version));
            }
            /* Encode message body */
            let msgType = this.#type;
            const body = this.#data.MessageBody;
            for (const field of Object.keys(body)) {
                const encoding = MSGSPEC[msgType][this.#version].body[field].encoding as WfCodec;
                this.#binary.append(encodeField(body[field] as string, encoding, this.#version));

                /* If pseudo message code, treat rest of body as pseudo message type */
                if (field === 'PseudoMessageCode') msgType = body[field] as WfMsgType;
            }
            /* Encrypt message if encryption indicator is set */
            if (header['EncryptionIndicator'] !== MSG_NOENCRYPT) {
                if (!ikm) throw new Error('Missing encryption key');
                if (!account) throw new Error('Missing originator account');
                const binAddress = await account.getBinAddress();
                this.#binary = await encryptMessage(
                    this.#binary, 
                    header['EncryptionIndicator'] as WfCryptoMethod,
                    ikm as ByteArray,
                    binAddress as ByteArray,
                    iv as ByteArray,
                    header['Version'] as WfVersion
                );
            }
            this.#final = true;
        }
        return this;
    }
    /**
     * Returns the value of the specified message field
     * @param fieldName the name of the message field
     * @returns the value of the message field
     */
    public get(fieldName: string): string | null {
        /* Look for field in message header */
        const header = this.#data.MessageHeader;
        for (const field of Object.keys(header)) {
            if (field === fieldName) return header[field] as string;
        }
        /* Look for field in message body */
        const body = this.#data.MessageBody;
        for (const field of Object.keys(body)) {
            if (field === fieldName) return body[field] as string;
        }
        /* Specified field not found */
        return null;
    }
    /**
     * Sets the value of the specified message field, if the message has not been encoded
     * @param fieldName the name of the message field
     * @param value the value to set
     * @returns `true` if succesful, else `false`
     */
    public set(fieldName: string, value: string): boolean {
        /* Cannot change data if already encoded */
        if (this.#final) return false;

        /* Look for field to set value in message header */
        const header = this.#data.MessageHeader;
        for (const field of Object.keys(header)) {
            if (field === fieldName) {
                /* Cannot change message prefix, version and type */
                if (field === 'Prefix' && value !== MSG_PREFIX) return false;
                if (field === 'Version' && value !== header[field]) return false;
                if (field === 'MessageCode' && value !== header[field]) return false;

                /* Set field value */
                header[field] = value;
                return true;
            }
        }
        /* Look for field to set value in message body */
        const body = this.#data.MessageBody;
        for (const field of Object.keys(body)) {
            if (field === fieldName) {
                if (field === 'PseudoMessageCode') {
                    /* Create new pseudo message body */
                    this.#data.MessageBody = generateBody(value as WfMsgType, this.#version, true);
                } else {
                    /* Set field value */
                    body[field] = value;
                }
                return true;
            }
        }
        /* Specified field not found */
        return false;
    }
    /**
     * Returns the Whiteflag message as a string
     * @returns a concatinated string of field values 
     */
    public override toString(): string {
        let messageStr: string = EMPTYSTR;
        if (this.isValid()) {
            /* Serialize message header */
            const header = this.#data.MessageHeader;
            for (const field of Object.keys(header)) {
                messageStr += header[field];
            }
            /* Serialize message body */
            const body = this.#data.MessageBody;
            for (const field of Object.keys(body)) {
                messageStr += body[field];
            }
        }
        return messageStr;
    }
    /**
     * Returns the Whiteflag message encoded as a hexadecimal string
     * @returns a hexadecimal string with the encoded message
     */
    public toHex(): Hex {
        if (this.#final) return this.#binary.toHex();
        return EMPTYSTR;
    }
    /**
     * Returns the encoded Whiteflag message as a byte array
     * @returns a UInt8array with the encoded message
     */
    public toU8a(): Uint8Array {
       if (this.#final) return this.#binary.toU8a();
       return new Uint8Array(0);
    }
}

/* MODULE FUNCTIONS */
/**
 * Checks if an object is a valid Whiteflag message
 * @param message the message object to validate
 * @returns `true` if message is valid, else `false`
 */
function isValidMessage(message: any): boolean {
    if (validateMessage(message).length > 0) return false;
    return true;
}
/**
 * Checks a message object for validation errors
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
                              ikm: ByteArray,
                              address: ByteArray,
                              iv?: ByteArray,
                              version = WfVersion.v1
                            ): Promise<BinaryBuffer> {
    /* Split message in unencrypted and encrypted part */
    const { unencrypted, encrypted: decrypted } = splitEncryptedMsg(message);

    /* Derive encryption key */
    const key = await deriveKey(
        ikm as ByteArray,
        method as WfCryptoMethod,
        address as ByteArray,
        version as WfVersion
    );
    /* Encrypt the message part */
    const encrypted = await encryptMsg(
        decrypted as ByteArray,
        method as WfCryptoMethod,
        key as CryptoKey,
        iv as ByteArray,
        version as WfVersion
    );
    /* Merge parts and return result */
    return mergeEncryptedMsg(unencrypted, encrypted);
}
/**
 * Decrypts an encrypted binary message
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
                              ikm: ByteArray,
                              address: ByteArray,
                              iv?: ByteArray,
                              version = WfVersion.v1
                            ): Promise<BinaryBuffer> {
    /* Split message in unencrypted and encrypted part */
    const { unencrypted, encrypted } = splitEncryptedMsg(message);

    /* Derive encryption key */
    const key = await deriveKey(
        ikm as ByteArray,
        method as WfCryptoMethod,
        address as ByteArray,
        version as WfVersion
    );
    /* Decrypt encrypted message part */
    const decrypted = await decryptMsg(
        encrypted as ByteArray,
        method as WfCryptoMethod,
        key as CryptoKey,
        iv as ByteArray,
        version as WfVersion
    );
    /* Merge parts and return result */
    return mergeEncryptedMsg(unencrypted, decrypted);
}

/* PRIVATE MODULE DECLARATIONS */
/**
 * Whiteflag message header as defined by the Whiteflag specification
 * @private
 * @wfversion v1-draft.7
 * @wfreference 4 Message Format
 */
interface WfMsgHeader extends Serializable {
    /* Required for dynamic creation */
    [key: string]: string | undefined;
    /* Defined header fields
     * for all versions */
    Prefix?: string;
    Version?: string;
    EncryptionIndicator?: string;
    DuressIndicator?: string;
    MessageCode?: string;
    ReferenceIndicator?: string;
    ReferencedMessage?: string;
}
/**
 * Whiteflag message body as defined by the Whiteflag specification
 * @private
 * @wfversion v1-draft.7
 * @wfreference 4 Message Format
 */
interface WfMsgBody extends Serializable {
    /* Required for dynamic creation */
    [key: string]: string | undefined;
    /* Defined body fields
     * for all versions and message types */
    VerificationMethod?: string;
    VerificationData?: string;
    CryptoDataType?: string;
    CryptoData?: string;
    PseudoMessageCode?: string;
    SubjectCode?: string;
    DateTime?: string;
    Duration?: string;
    ObjectType?: string;
    ObjectLatitude?: string;
    ObjectLongitude?: string;
    ObjectSizeDim1?: string;
    ObjectSizeDim2?: string;
    ObjectOrientation?: string;
    ReferenceMethod?: string;
    ReferenceData?: string;
    Text?: string;
}
/**
 * Message type definitions of the Whiteflag specification
 * @private
 */
interface WfMsgSpec {
    [key: string]: {    // Message type
        [key: string]: {    // Whiteflag version
            header: {
                [key: string]: {    // Message header field with start bit
                    encoding: string;
                    startBit: number;
                    endBit: number;
                }   
            },
            body: {
                [key: string]: {    // Message body field with start bit
                    encoding: string;
                    startBit: number;
                    endBit: number;
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
    for (const msgType of Object.values(WfMsgType)) {
        msgSpec[msgType] = {};

        /* Whiteflag version 1 */ {
            const version = WfVersion.v1;
            const headerSpec_v1 = compileMsgSpecRegex(msgSpec_v1.header);
            const signsignalSpec_v1 = compileMsgSpecRegex(msgSpec_v1.body[SIGNSIGNALTYPE]);
            msgSpec[msgType][version] = { header: {}, body: {} };
            msgSpec[msgType][version].header = headerSpec_v1;
            if (SIGNSIGNALTYPE in msgSpec_v1.body[msgType]) {
                msgSpec[msgType][version].body = signsignalSpec_v1;
            } else {
                msgSpec[msgType][version].body = compileMsgSpecRegex(msgSpec_v1.body[msgType]);
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
 * Generates message header and sets known values
 * @private
 * @param msgType the message type
 * @param version the Whiteflag protocol version
 * @returns a Whiteflag message header object
 */
function generateHeader(msgType: WfMsgType, version = WfVersion.v1): WfMsgHeader {
    let header: WfMsgHeader = Object.create(null);
    for (const field of Object.keys(MSGSPEC[msgType][version].header)) {
        header[field] = EMPTYSTR;
    }
    header['Prefix'] = MSG_PREFIX;
    header['Version'] = version as string;
    header['MessageCode'] = msgType as string;
    return header;
}
/**
 * Decodes a field from a binary encoded message header
 * @param message the binary encoded message
 * @param field the header field to decode
 * @param msgType the message type
 * @param version the Whiteflag protocol version
 * @returns the field value
 */
function decodeHeaderField(message: BinaryBuffer, field: string, msgType: WfMsgType, version = WfVersion.v1): string {
    const msgSpec = MSGSPEC[msgType][version];
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
 * @param msgType the message type, or pseudo type for a test message
 * @param version the Whiteflag protocol version
 * @param testMsg if test message; defaults to `false`
 * @returns a Whiteflag message body object
 */
function generateBody(msgType: WfMsgType, version = WfVersion.v1, testMsg = false): WfMsgBody {
    let body: WfMsgBody = Object.create(null);
    if (testMsg) body['PseudoMessageCode'] = msgType as string;
    for (const field of Object.keys(MSGSPEC[msgType][version].body)) {
        body[field] = EMPTYSTR;
    }
    return body;
}
/**
 * Decodes a field from a binary encoded message body
 * @param message the binary encoded message
 * @param field the body field to decode
 * @param msgType the message type to override, e.g. for pseudo message body
 * @param bitOffset the bit offset for dynamic fields
 * @param version the Whiteflag protocol version
 * @returns the field value
 */
function decodeBodyField(message: BinaryBuffer, field: string, msgType: WfMsgType, bitOffset: number = 0, version = WfVersion.v1): string {
    const msgSpec = MSGSPEC[msgType][version];
    return decodeField(message.extract(
        msgSpec.body[field]?.startBit + bitOffset,
        msgSpec.body[field]?.endBit + bitOffset
    ), msgSpec.body[field]?.encoding as WfCodec);
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
    if (!('Version' in header)) errors.push('Missing protocol version');
    if (!('MessageCode' in header)) errors.push('Missing message type code');
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
 * @param msgType the message type
 * @param version the Whiteflag protocol version
 * @returns an array of validation errors
 */
function checkMsgHeader(header: WfMsgHeader, msgType: WfMsgType, version = WfVersion.v1): string[] {
    return checkFields(header, MSGSPEC[msgType][version].header, version);
}
/**
 * Checks the message body
 * @private
 * @param body the message body
 * @param msgType the message type
 * @param version the Whiteflag protocol version
 * @returns an array of validation errors
 */
function checkMsgBody(body: WfMsgBody, msgType: WfMsgType, version = WfVersion.v1): string[] {
    return checkFields(body, MSGSPEC[msgType][version].body, version);
}
/**
 * Checks the fields of a message segment (header or body)
 * @private
 * @param segment the message header or body
 * @param segSpec the message segment specification
 * @param version the Whiteflag protocol version
 * @returns an array of validation errors
 */
function checkFields(segment: WfMsgHeader | WfMsgBody, segSpec: any, version = WfVersion.v1): string[] {
    let errors: string[] = [];
    for (const field of Object.keys(segSpec)) {
        /* Check if field exists */
        if (!Object.hasOwn(segment, field)) {
            errors.push(`Missing ${field} field`);
            continue;
        }
        /* Check field value */
        if (segSpec[field].encoding === EMPTYSTR) {
            continue;
        }
        if (segment[field] === EMPTYSTR) {
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
 * @returns `true` if encryption method is valid, else `false`
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
 * @returns `true` if prefix is valid, else `false`
 */
function checkPrefix(prefix: string | undefined): boolean {
    if (prefix === undefined) return false;
    if (prefix === MSG_PREFIX) return true;
    return false;
}
/**
 * Check if mesage type is valid
 * @private
 * @param msgType the message type to check
 * @returns `true` if message type is valid, else `false`
 */
function checkType(msgType: WfMsgType | string | undefined): boolean {
    if (msgType === undefined) return false;
    if (isString(msgType)
        && Object.keys(WfMsgType).includes(msgType as string)) return true;
    if (Object.values(WfMsgType).includes(msgType as WfMsgType)) return true;
    return false;
}
/**
 * Check if protocol version is valid
 * @private
 * @param version the protocol version to check
 * @returns `true` if protocol version is valid, else `false`
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
