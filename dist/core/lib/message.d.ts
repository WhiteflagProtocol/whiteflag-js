/**
 * @module core/message
 * @summary Whiteflag JS message class
 */
export { WfCoreMessage, isValidMessage, validateMessage };
import { BinaryBuffer } from '@whiteflag/util';
import { WfVersion, WfMsgType } from './specs.ts';
/**
 * Whiteflag Message
 * @class WfCoreMessage
 * @wfver v1-draft.7
 * @todo Add a proper description of the functionality
 */
declare class WfCoreMessage {
    /**
     * @property the message type
     */
    private type;
    /**
     * @property the Whiteflag version
     */
    private version;
    /**
     * @property header The message header
     */
    protected header: WfMsgHeader;
    /**
     * @property body The message body
     */
    protected body: WfMsgBody;
    /**
     * @property binary the binary encoded message
     */
    private binary;
    /**
     * @property final true if content cannot be altered anymore, else false
     */
    private final;
    /**
     * Constructor for a Whiteflag message
     * @param type the Whiteflag message type
     * @param version the Whiteflag protocol version
     */
    constructor(type: WfMsgType, version?: WfVersion);
    /**
     * Creates new Whiteflag message from a binary buffer
     * @function fromBinary
     * @param message a binary buffer with the encoded message
     * @returns a new Whiteflag message object with the decoded message
     */
    static fromBinary(message: BinaryBuffer): WfCoreMessage;
    /**
     * Creates new Whiteflag message from a plain object
     * @function fromObject
     * @param message a plain JavaScript object with message header and body
     * @returns a new Whiteflag message object
     */
    static fromObject(message: any): WfCoreMessage;
    /**
     * Creates new Whiteflag message from a hexadecimal encoded string
     * @param message  atring with the hexadecimal encoded message
     * @returns a new Whiteflag message object with the decoded message
     */
    static fromHex(message: string): WfCoreMessage;
    /**
     * Creates new Whiteflag message from a binary encoded message
     * @param message a Uint8Array with the binary encoded message
     * @returns a new Whiteflag message object with the decoded message
     */
    static fronU8a(message: Uint8Array): WfCoreMessage;
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
     * Decodes a binary encoded message
     * @param message a bianry encoded message
     * @returns a new Whiteflag message object
     * @todo fix decoding
     */
    decode(message: BinaryBuffer): WfCoreMessage;
    /**
     * Encodes the message, making the contents final
     * @function encode
     * @returns
     */
    encode(): WfCoreMessage;
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
    toU8a(): Uint8Array<ArrayBufferLike>;
    /**
     * Check if mesage type is valid
     * @param type the message type to check
     * @returns the message type, if valid
     * @throws if message type is not valid
     */
    static checkType(type: WfMsgType): WfMsgType;
    /**
     * Check if protocol version is valid
     * @param version the protocol version to check
     * @returns the protocol version, if valid
     * @throws if message type is not valid
     */
    static checkVersion(version: WfVersion): WfVersion;
    /**
     * Generates message header
     * @private
     * @returns a Whiteflag message header object
     */
    private generateHeader;
    /**
     * Decodes a field from a binary encoded message header
     * @param field the header field to decode
     * @param message the binary encoded message
     * @returns the field value
     */
    private decodeHeaderField;
    /**
     * Generates message body
     * @private
     * @@param type the message type to override if test message body
     * @returns a Whiteflag message body object
     */
    private generateBody;
    /**
     * Decodes a field from a binary encoded message body
     * @param field the body field to decode
     * @param message the binary encoded message
     * @param type the message type to override, e.g. for pseudo message body
     * @param bitOffset the bit offset for dynamic fields
     * @returns the field value
     */
    private decodeBodyField;
}
/**
 * Checks if a plain object is a valid Whiteflag message
 * @function isValidMessage
 * @param message the message object to validate
 * @returns true if message is valid, else false
 */
declare function isValidMessage(message: any): boolean;
/**
 * Checks a plain message object for validation errors
 * @function validateMessage
 * @param message the message object to validate
 * @returns an array of validation errors
 */
declare function validateMessage(message: any): string[];
/**
 * Defines a Whiteflag message header object
 * @private
 * @interface WfMsgHeader
 */
interface WfMsgHeader {
    [key: string]: any;
    Prefix?: string;
    Version?: string;
    EncryptionIndicator?: string;
    DuressIndicator?: string;
    MessageCode?: string;
    ReferenceIndicator?: string;
    ReferencedMessage?: string;
}
/**
 * Defines a Whiteflag message header object
 * @private
 * @interface WfMsgHeader
 */
interface WfMsgBody {
    [key: string]: any;
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
