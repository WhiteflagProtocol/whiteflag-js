/**
 * @module core/message
 * @summary Whiteflag JS message class
 */
export { WfMsgType, WfCoreMessage, isValidMessage, validateMessage, encryptMessage, decryptMessage };
import { WfCryptoMethod } from '@whiteflag/crypto';
import { BinaryBuffer } from '@whiteflag/util';
import { WfVersion } from './versions.ts';
/**
 * Whiteflag message types, defining the types of Whiteflag message
 * as specified by the Whiteflag standard
 * @enum WfFieldType
 * @wfversion v1-draft.7
 * @wfreference 2.4.2.1 Functional Messages, 2.4.2.2 Management Messages
 *
 */
declare enum WfMsgType {
    /** Authentication message */
    A = "A",
    /** Cryptographic support message */
    K = "K",
    /** Test message */
    T = "T",
    /** Protection sign */
    P = "P",
    /** Protection sign */
    D = "D",
    /** Status signal */
    S = "S",
    /** Emergency signal */
    E = "E",
    /** Infrstructure sign */
    I = "I",
    /** Mission signal */
    M = "M",
    /** Request signal */
    Q = "Q",
    /** Reference message */
    R = "R",
    /** Free text message */
    F = "F"
}
/**
 * A core Whiteflag message as defined by the Whiteflag specification
 * @class WfCoreMessage
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
declare class WfCoreMessage {
    /** The message type */
    private type;
    /** The Whiteflag protocol version */
    private version;
    /** The message header containing the generic header fields */
    private header;
    /** The message body containing the message type specific body fields */
    private body;
    /** The binary encoded message */
    private binary;
    /** Indicates if message is final and cannot be altered */
    private final;
    /**
     * Constructor for a Whiteflag message
     * @param type the Whiteflag message type
     * @param version the Whiteflag protocol version
     * @param binary the binary encoded message, if available at creation
     */
    constructor(type: WfMsgType, version?: WfVersion, binary?: BinaryBuffer);
    /**
     * Creates new Whiteflag message from a binary buffer
     * @function fromBinary
     * @param message a binary buffer with the encoded message
     * @param ikm the input key material to derive the encryption key, if the message is encrypted
     * @param address the binary encoded originator address, if the message is encrypted
     * @param iv the initialisation vector, if required for the encryption method
     * @returns a new Whiteflag message object with the decoded message
     */
    static fromBinary(message: BinaryBuffer, ikm?: Uint8Array, address?: Uint8Array, iv?: Uint8Array): Promise<WfCoreMessage>;
    /**
     * Creates new Whiteflag message from a plain object
     * @function fromObject
     * @param message a plain JavaScript object with message header and body
     * @returns a new Whiteflag message object
     */
    static fromObject(message: any): Promise<WfCoreMessage>;
    /**
     * Creates new Whiteflag message from a hexadecimal encoded string
     * @param message  atring with the hexadecimal encoded message
     * @param ikm the hexadecimalinput key material to derive the encryption key, if the message is encrypted
     * @param address the hexadecimal encoded originator address, if the message is encrypted
     * @param iv the hexadecimal initialisation vector, if required for the encryption method
     * @returns a new Whiteflag message object with the decoded message
     */
    static fromHex(message: string, ikm?: string, address?: string, iv?: string): Promise<WfCoreMessage>;
    /**
     * Creates new Whiteflag message from a binary encoded message
     * @param message a Uint8Array with the binary encoded message
     * @param ikm the input key material to derive the encryption key, if the message is encrypted
     * @param address the binary encoded originator address, if the message is encrypted
     * @param iv the initialisation vector, if required for the encryption method
     * @returns a new Whiteflag message object with the decoded message
     */
    static fromU8a(message: Uint8Array, ikm?: Uint8Array, address?: Uint8Array, iv?: Uint8Array): Promise<WfCoreMessage>;
    /**
     * Indicates if the message has already been encoded
     * @function isEncoded
     * @returns true if message has been encoded, else false
     */
    isEncoded(): boolean;
    /**
     * Indicates if the message is valid, i.e. if all fields contain valid values
     * @function isValid
     * @returns true if message is valid, else false
     */
    isValid(): boolean;
    /**
     * Returns message validation errors
     * @function validate
     * @returns an array of validation errors
     */
    validate(): string[];
    /**
     * Decodes an unencrypted binary encoded message
     * @param message a binary encoded message
     * @returns a new Whiteflag message object
     */
    decode(message: BinaryBuffer): Promise<WfCoreMessage>;
    /**
     * Encodes the message, making the contents final
     * @function encode
     * @param ikm the input key material to derive the encryption key, if the message is to be encrypted
     * @param address the binary encoded originator address, if the message is to be encrypted
     * @param iv the initialisation vector, if required for the encryption method
     * @returns this Whitedlag message object with the encoded message
     */
    encode(ikm?: Uint8Array, address?: Uint8Array, iv?: Uint8Array): Promise<WfCoreMessage>;
    /**
     * Returns the value of the specified message field
     * @function get
     * @param fieldName the name of the message field
     * @returns the value of the message field
     */
    get(fieldName: string): string | null;
    /**
     * Sets the value of the specified message field, if the message has not been encoded
     * @function set
     * @param fieldName the name of the message field
     * @param value the value to set
     * @return true if succesful, else false
     */
    set(fieldName: string, value: string): boolean;
    /**
     * Returns the Whiteflag message as a plain object
     * @function toObject
     * @returns the message as a plain object
     */
    toObject(): Object;
    /**
     * Returns the Whiteflag message as a string
     * @function toString
     * @returns a concatinated string of field values
     */
    toString(): string;
    /**
     * Returns the Whiteflag message encoded as a hexadecimal string
     * @function toHex
     * @returns a hexadecimal string with the encoded message
     */
    toHex(): string;
    /**
     * Returns the encoded Whiteflag message as a UInt8array
     * @function toU8a
     * @returns a UInt8array with the encoded message
     */
    toU8a(): Uint8Array;
    /**
     * Generates message header and sets known values
     * @private
     * @returns a Whiteflag message header object
     */
    private generateHeader;
    /**
     * Decodes a field from a binary encoded message header
     * @param message the binary encoded message
     * @param field the header field to decode
     * @returns the field value
     */
    private decodeHeaderField;
    /**
     * Generates message body, or if specifed pseudo message body
     * @private
     * @@param type the pseudo message type, if test message body
     * @returns a Whiteflag message body object
     */
    private generateBody;
    /**
     * Decodes a field from a binary encoded message body
     * @param message the binary encoded message
     * @param field the body field to decode
     * @param type the message type to override, e.g. for pseudo message body
     * @param bitOffset the bit offset for dynamic fields
     * @returns the field value
     */
    private decodeBodyField;
}
/**
 * Checks if an object is a valid Whiteflag message
 * @function isValidMessage
 * @param message the message object to validate
 * @returns true if message is valid, else false
 */
declare function isValidMessage(message: any): boolean;
/**
 * Checks a message object for validation errors
 * @function validateMessage
 * @param message the message object to validate
 * @returns an array of validation errors
 */
declare function validateMessage(message: any): string[];
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
declare function encryptMessage(message: BinaryBuffer, method: WfCryptoMethod, ikm: Uint8Array, address: Uint8Array, iv?: Uint8Array, version?: WfVersion): Promise<BinaryBuffer>;
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
declare function decryptMessage(message: BinaryBuffer, method: WfCryptoMethod, ikm: Uint8Array, address: Uint8Array, iv?: Uint8Array, version?: WfVersion): Promise<BinaryBuffer>;
